import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import TaskPage from "./components/TaskPage";
import Users from "./components/UserLogin/UserPage";
import RegisterPage from "./components/RegisterPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/task" element={<TaskPage />} />
      <Route path="/users" element={<Users />} />
    </Routes>
  );
}
