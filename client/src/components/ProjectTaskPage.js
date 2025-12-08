import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";

export default function ProjectTaskPage() {
  const { user, logout, authToken } = useAuth();
  const { tasks, fetchTasks } = useTasks();

  const [project, setProject] = useState(null);
  const [task, setTask] = useState(null);
  const [time, setTime] = useState(0);
  // const [description, setDescription] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if(authToken){
      fetchTasks();
    }
  },[authToken, fetchTasks]);

  const startTimer = () => {
    if (!window.timer) {
      window.timer = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
      window.electron?.ipcRenderer.send("tray:set-status","green");
    }
  };

  const stopTimer = () => {
    clearInterval(window.timer);
    window.timer = null;

    window.electron?.ipcRenderer.send("tray:set-status","red");
  };
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const taskOption = tasks?.map((t) => ({
    value: t.id,
    label: t.title,
    description: t.description,
  }))

  const projectOption = [
    { value: "project1", label: "Project 1"},
    { value: "project2", label: "Project 2"},
  ];

  // const taskOption = [
  //   { value: "task1", label: "Task 1"},
  //   { value: "task2", label: "Task 2"},
  // ];

  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "8px",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      padding: "2px",
      minHeight: "42px",
      fontSize: "14px",
    }),

    menu: (base) => ({
      ...base,
      borderRadius: "8px",
      padding: "4px",
      backgroundColor: "white",
      marginTop: "2px",
      zIndex: 9999,
    }),

    menuList: (base) => ({
      ...base,
      padding: "0",
    }),

    option: (base, state) => ({
      ...base,
      padding: "10px 12px",
      fontSize: "14px",
      backgroundColor: state.isSelected
      ? "#eff6ff"
      : state.isFocused
      ? "#f3f4f6"
      : "white",
      color: "#111827",
    }),

    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
    }),

    placeholder: (base) => ({
      ...base,
      fontSize: "14px",
      color: "#9ca3af",
    }),
  }

  return (
    <div className="max-w-md mx-auto p-5 space-y-7 font-sans bg-white mt-[40px]">
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="font-semibold">{user?.work_email}</span>
        <button
          onClick={handleLogout}
          className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-150 ease-in-out"
        >
          Logout
        </button>
      </div>

      {/* project */}
      <Select 
        options={projectOption}
        value={project}
        onChange={setProject}
        placeholder="Select project"
        isSearchable
        menuPortalTarget={document.body}
        styles={customStyles}
        classNamePrefix="react-select"
     
      />

      {/* task selector */}
      <Select 
        options={taskOption}
        value={task}
        onChange={(selected) => setTask(selected)}  
        placeholder="Select task"
        isSearchable
        menuPortalTarget={document.body}
        styles={customStyles}
        classNamePrefix="react-select"
      
      />

      {/* timer */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold">
          {String(Math.floor(time / 60)).padStart(2, "0")}:
          {String(time % 60).padStart(2, "0")}
        </h2>

        <button
          onClick={startTimer}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Start
        </button>
        <button
          onClick={stopTimer}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Stop
        </button>
      </div>

      {/* description */}
      {/* <textarea
        className="w-full border p-2 rounded-md"
        rows="4"
        placeholder="Task description..."
        value={description} 
        onChange={(e) => setDescription(e.target.value)}
      /> */}
      <p>Description:</p>
      {task?.description && (
        <div className="p-3 border rounded-md bg-gray-50 text-sm text-gray-700">
          <strong>Description:</strong>
          <p className="mt-1">{task.description}</p>
        </div>
      )}
    </div>
  );
}
