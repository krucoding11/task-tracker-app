import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
    const { authToken } = useAuth();

    const [projects, setProjects] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchProjects = async () => {
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

    const fetchProjectById = async (projectId) => {
        if (!authToken || !projectId) return;

        try {
            setLoading(true);
            setError("");

            const response = await axios.get(`${API_URL}/api/projects/${projectId}`,
                {
                    headers: {Authorization: `Bearer ${authToken}`},
                }
            );
            return response.data.data;
        } catch (error) {
            console.error("Project details fetch error", error);
            setError(error.response?.data?.message || "Failed to fetch project details");
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        if(authToken){
            fetchProjects();
        }
    },[authToken]);

  return (
    <ProjectContext.Provider value={{ projects, meta, loading, error, fetchProjects, fetchProjectById}}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
