import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { authToken, user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isFetchingRef = useRef(false);
  const fetchTasks = async ({ status = "all", assigned_to = "" } = {}) => {
    if (!authToken || isFetchingRef.current) return;

    isFetchingRef.current = true;
    try {
      setLoading(true);
      setError("");

      let allTasks = [];
      let page = 1;
      const limit = 50;
      let hasMore = true;

      while (hasMore) {
        const params = new URLSearchParams({
          page,
          limit,
          status,
          ...(assigned_to && { assigned_to }),
        });

        const response = await axios.get(
          `${API_URL}/api/tasks/my-tasks?${params}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        allTasks.push(...(response.data.data || []));
        if (allTasks.length > 0) {
          console.log("Task structure check:", allTasks[0]);
        }

        const meta = response.data.meta || {};
        hasMore = meta.has_more || false;
        page++;
      }

      const filtered = allTasks.filter(
        t => t.status === "Pending" || t.status === "In-Progress"
      );

      setTasks(filtered);
    } catch (err) {
      setError("Failed to fetch tasks");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };


  useEffect(() => {
    if (!authToken) {
      setTasks([]);
      return;
    }
    fetchTasks();
  }, [authToken]);

  const fetchTaskById = async (taskId) => {
    if (!authToken || !taskId) return;

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_URL}/api/tasks/${taskId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Task detail fetch error", error);
      setError(error.response?.data?.message || "Failed to fetch task details");
    } finally {
      setLoading(false);
    }
  }

  // log time for a task
  const logTime = async ({ taskId, hoursSpent, entryDate, notes = "" }) => {
    if (!authToken) return;
    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        `${API_URL}/api/tasks/log-time`,
        {
          task_id: taskId,
          hours_spent: hoursSpent,
          entry_date: entryDate,
          notes,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Log time error", error);
      setError(error.response?.data?.message || "Failed to log time");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // get time entries
  const getTimeEntriesForTask = useCallback(
    async (taskId) => {
      try {
        const response = await axios.get(
          `${API_URL}/api/tasks/${taskId}/time-entries`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );

        const entries = response.data.data || [];
        // Filter entries for current user only
        return entries.filter(e => e.employee_id === user?.id);
      } catch (error) {
        console.error("Fetch entries failed", error);
        return [];
      }
    },
    [authToken]
  );

  return (
    <TaskContext.Provider
      value={{
        tasks,
        meta,
        loading,
        error,
        fetchTasks,
        logTime,
        getTimeEntriesForTask,
        fetchTaskById
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);