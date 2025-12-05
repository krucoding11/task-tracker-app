import React, { createContext, useContext, useState } from 'react'
import { useAuth } from './AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
    const [task, setTask] = useState([]);
    const [loadingTask, setLoadingTask] = useState(false);

    const { authToken } = useAuth();

    const fetchTasks = async () => {
        if(!authToken) return;

        setLoadingTask(true);
        try {
            const response = await axios.get(`${API_URL}/api/tasks/my-tasks`);
            setTask(response.data.data);
            return { success: true}
        } catch (error) {
            console.error("Error fetching tasks", error);
            return { success: false, error: error.response?.data?.message || 'Failed to fetch tasks'};
        }finally{
            setLoadingTask(false);
        }
    };

    // const addTask = async (taskData) => {
    //     if (!authToken){
    //         return { success: false, error: "User not authenticated"};
    //     }
    //     setLoadingTask(true);
    //     try {
    //         const response = await axios.post(`${API_URL}/api/tasks`, taskData);
    //         const newTask = response.data.data; 
    //         setTask((prevTask) => [...prevTask, newTask]);
    //         return { success: true, task: newTask}
    //     } catch (error) {
    //         const errorMessage = error.response?.data?.message || 'Failed to add task';
    //         console.error("Error adding tasks:", error);
    //         return { success: false, error: errorMessage}
    //     }finally {
    //         setLoadingTask(false);  
    //     }
    // };
    const value = {
        task,
        loadingTask,
        fetchTasks,
    };
  return (
    <TaskContext.Provider value={value}>
      { children }
    </TaskContext.Provider>
  )
};

export const useTasks = () =>{
    return useContext(TaskContext);
}
