import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import TaskPage from "./components/TaskPage";
import Users from "./components/UserLogin/UserPage";
import ProjectTaskPage from "./components/ProjectTaskPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/project-task" element={<ProjectTaskPage />} />
      <Route path="/task" element={<TaskPage />} />
      <Route path="/users" element={<Users />} />
    </Routes>
  );
}
