import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
// import TaskPage from "./components/TaskPage";
// import Users from "./components/UserLogin/UserPage";
import ProjectTaskPage from "./components/ProjectTaskPage";
import { useAuth } from "./context/AuthContext";

function RequireAuth({ children }) {
  const { authToken, loading } = useAuth();

  if (loading) return null; // or loader

  if (!authToken) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        path="/project-task"
        element={
          <RequireAuth>
            <ProjectTaskPage />
          </RequireAuth>
        }
      />

      {/* <Route
        path="/task"
        element={
          <RequireAuth>
            <TaskPage />
          </RequireAuth>
        }
      />

      <Route
        path="/users"
        element={
          <RequireAuth>
            <Users />
          </RequireAuth>
        }
      /> */}
    </Routes>
  );
}
