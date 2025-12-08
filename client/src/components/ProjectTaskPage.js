import React, { useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

export default function ProjectTaskPage() {
  const [project, setProject] = useState(null);
  const [task, setTask] = useState(null);
  const [time, setTime] = useState(0);
  const [description, setDescription] = useState("");

  const navigate = useNavigate();

  const startTimer = () => {
    if (!window.timer) {
      window.timer = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    }
  };

  const stopTimer = () => {
    clearInterval(window.timer);
    window.timer = null;
  };
  const handleLogout = () => {
    navigate("/");
  };

  const projectOption = [
    { value: "project1", label: "Project 1"},
    { value: "project2", label: "Project 2"},
  ];

  const taskOption = [
    { value: "task1", label: "Task 1"},
    { value: "task2", label: "Task 2"},
  ];

  return (
    <div className="max-w-md mx-auto p-5 space-y-7 font-sans bg-white mt-[40px]">
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="font-semibold">user@example.com</span>
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
        className="text-sm"
        isSearchable
        
        // menuPortalTarget={document.body}
        // controlShouldRenderValue={true}
        // hideSelectedOptions={false}
        // styles={{
        //   menuPortal: base => ({ ...base, zIndex: 9999}),
        // }}
      />

      {/* task selector */}
      <Select 
        options={taskOption}
        value={task}
        onChange={setTask}  
        placeholder="Select task"
        className="text-sm"
        isSearchable
        
        // menuPortalTarget={document.body}
        // controlShouldRenderValue={true}
        // hideSelectedOptions={false}
        // styles={{
        //   menuPortal: base => ({ ...base, zIndex: 9999}),
        // }}
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
      <textarea
        className="w-full border p-2 rounded-md"
        rows="4"
        placeholder="Task description..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
    </div>
  );
}
