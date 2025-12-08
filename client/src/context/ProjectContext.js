import React, { createContext, useContext, useState } from 'react'
import { useAuth } from './AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
    const { authToken } = useAuth();

    const [projects, setProjects] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetcProjects = async ({
    } = {}) => {
        if(!authToken) return;
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(`${API_URL}/api/projects`, { 
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            setProjects(response.data.data || []);
            setMeta(response.data.meta || []);
        } catch (error) {
            console.error("Project fetch error", error);
            setError(error.response?.data?.message || "Failed to fetch projects");
        } finally {
            setLoading(false);
        }
    };

  return (
    <ProjectContext.Provider value={{ projects, meta, loading, error, fetcProjects}}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useTasks = () => useContext(ProjectContext);
