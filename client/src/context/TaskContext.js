import React, { createContext, useCallback, useContext, useState } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { authToken } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const fetchTasks = async ({ status = "all", assigned_to = "" } = {}) => {
  if (!authToken) return;

  try {
    setLoading(true);
    setError("");

    let allTasks = [];
    let page = 1;
    const limit = 50; // adjust as needed
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
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const baseTasks = response.data.data || [];

      const tasksWithTime = await Promise.all(
        baseTasks.map(async (task) => {
          try {
            const response = await axios.get(
              `${API_URL}/api/tasks/${task.id}/time-entries`,
              { headers: { Authorization: `Bearer ${authToken}` } }
            );
            const entries = response.data || [];
            const totalSeconds = entries.reduce(
              (sum, e) => sum + Math.round(Number(e.hours_spent) * 3600),
              0
            );
            return { ...task, savedTime: totalSeconds };
          } catch {
            return { ...task, savedTime: 0 };
          }
        })
      );

      allTasks = [...allTasks, ...tasksWithTime];

      // check pagination
      const meta = response.data.meta || {};
      hasMore = meta.has_more || false;
      page++;
    }

    const filteredTask = allTasks.filter((task) => (
      task.status === "Pending" || task.status === "In-Progress"
    ))

    setTasks(filteredTask);
    // setTasks(allTasks);
  } catch (error) {
    console.error("Task fetch error", error);
    setError(error.response?.data?.message || "Failed to fetch tasks");
  } finally {
    setLoading(false);
  }
};

  // const fetchTasks = async ({
  //   page = 1,
  //   limit = 50,
  //   status = "all",
  //   assigned_to = "",
  //   // dyvaw@mailinator.com
  //   // movipoku@mailinator.com
  // } = {}) => {
  //   if (!authToken) return;
  //   try {
  //     setLoading(true);
  //     setError("");

  //     const params = new URLSearchParams({
  //       page,
  //       limit,
  //       status,
  //       ...(assigned_to && { assigned_to }),
  //     });

  //     const response = await axios.get(
  //       `${API_URL}/api/tasks/my-tasks?${params}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${authToken}`,
  //         },
  //       }
  //     );

  //     const baseTasks = response.data.data || [];

  //     // load entries for each tasks
  //     const tasksWithTime = await Promise.all(
  //       baseTasks.map(async (task) => {
  //         try {
  //           const response = await axios.get(
  //             `${API_URL}/api/tasks/${task.id}/time-entries`,
  //             {
  //               headers: { Authorization: `Bearer ${authToken}` },
  //             }
  //           );
  //           const entries = response.data || [];

  //           // sum total hours - convert to seconds
  //           const totalSeconds = entries.reduce(
  //             (sum, e) => sum + Math.round(Number(e.hours_spent) * 3600),
  //             0
  //           );
  //           return { ...task, savedTime: totalSeconds };
  //         } catch (error) {
  //           return { ...task, savedTime: 0 };
  //         }
  //       })
  //     );

  //     setTasks(tasksWithTime);
  //     setMeta(response.data.meta || []);
  //   } catch (error) {
  //     console.error("Task fetch error", error);
  //     setError(error.response?.data?.message || "Failed to fetch tasks");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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

        return response.data.data || [];
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
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);