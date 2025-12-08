import React, { createContext, useContext, useState } from 'react'
import { useAuth } from './AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
    const { authToken } = useAuth();

    const [tasks, setTasks] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchTasks = async ({
        page = 1,
        limit = 10,
        status = "all",
        assigned_to = "",
    } = {}) => {
        if(!authToken) return;
        try {
            setLoading(true);
            setError("");
            
            const params = new URLSearchParams({
                page, limit, status, ...(assigned_to && { assigned_to }),
            });

            const response = await axios.get(`${API_URL}/api/tasks/my-tasks?${params}`, { 
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            setTasks(response.data.data || []);
            setMeta(response.data.meta || []);
        } catch (error) {
            console.error("Task fetch error", error);
            setError(error.response?.data?.message || "Failed to fetch tasks");
        } finally {
            setLoading(false);
        }
    };

  return (
    <TaskContext.Provider value={{ tasks, meta, loading, error, fetchTasks}}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
