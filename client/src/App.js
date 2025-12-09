import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import TaskPage from "./components/TaskPage";
import Users from "./components/UserLogin/UserPage";
import ProjectTaskPage from "./components/ProjectTaskPage";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { authToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if(authToken){
      navigate("/project-task");
    }else{
      navigate("/");
    }
  },[authToken, navigate]);
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/project-task" element={<ProjectTaskPage />} />
      <Route path="/task" element={<TaskPage />} />
      <Route path="/users" element={<Users />} />
    </Routes>
  );
}
