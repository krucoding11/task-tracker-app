import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { useProject } from "../context/ProjectContext";

export default function ProjectTaskPage() {
  const { user, logout, authToken } = useAuth();
  const { tasks, fetchTasks, logTime, getTimeEntriesForTask } = useTasks();
  const { projects, fetchProjects } = useProject();

  const [project, setProject] = useState(null);
  const [task, setTask] = useState(null);
  const [time, setTime] = useState(0);
  const [taskHistory, setTaskHistory] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  // const [description, setDescription] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (authToken) {
      fetchTasks();
      fetchProjects();
    }
  }, []);

  useEffect(() => {
    if (!task) return;

    const saved = localStorage.getItem(`timer-${task.value}`);
    if (saved) {
      setTime(Number(saved));
    } else {
      setTime(task.savedTime || 0);
    }
  }, [task]);

  useEffect(() => {
    return () => clearInterval(window.timer);
  }, []);

  useEffect(() => {
    if (!task) {
      setTimeEntries([]);
      return;
    }

    const loadEntries = async () => {
      const entries = await getTimeEntriesForTask(task.value);
      setTimeEntries(entries);
    };

    loadEntries();
  }, [task, getTimeEntriesForTask]);

  const startTimer = () => {
    if (!window.timer && task) {
      window.timer = setInterval(() => {
        setTime((t) => {
          const newTime = t + 1;
          localStorage.setItem(`timer-${task.value}`, newTime);
          return newTime;
        });
      }, 1000);
      window.electronAPI?.sendStatus("green");
    }
  };

  const stopTimer = async () => {
    clearInterval(window.timer);
    window.timer = null;
    window.electronAPI?.sendStatus("red");

    if (!task) return;

    const updatedTask = { ...task, savedTime: Math.floor(time) };

    // update taskHistory
    setTaskHistory((prev) => [
      ...prev.filter((t) => t.value !== task.value),
      updatedTask,
    ]);

    // remove localStorage
    localStorage.removeItem(`timer-${task.value}`);

    setTimeout(() => {
      const newOption = taskOption.find(
        (opt) => opt.value === updatedTask.value
      );
      if (newOption) setTask(newOption);
    }, 50);

    try {
      const entryDate = new Date().toISOString().split("T")[0];
      await logTime({
        taskId: task.value,
        hoursSpent: time / 3600,
        entryDate,
        notes: `Timer logged via timer`,
      });
    } catch (error) {
      console.error("Failed to log time", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const filteredTasks =
    project && project.value !== "all"
      ? tasks.filter((t) => t.project_id === project.value)
      : tasks;

  const taskOption = filteredTasks.map((t) => {
    const historyTask = taskHistory.find((ht) => ht.value === t.id);
    // const savedTime = historyTask?.savedTime ?? t.savedTime ?? 0;
    const localTime = Number(localStorage.getItem(`timer-${t.id}`));
    const savedTime = localTime > 0 ? localTime : historyTask?.savedTime ?? t.savedTime ?? 0;
    const formatted = `${String(Math.floor(savedTime / 60)).padStart(
      2,
      "0"
    )}:${String(savedTime % 60).padStart(2, "0")}`;

    return {
      value: t.id,
      // label: `${t.title}${savedTime > 0 ? ` - ${formatted}` : ""}`,
      label: (
        <div className="flex justify-between w-full items-center">
          <span>{t.title}</span>
          {savedTime > 0 && (
            <span className="text-red-500 font-semibold">{formatted}</span>
          )}
        </div>
      ),
      savedTime,
      description: t.description,
    };
  });

  useEffect(() => {
    setTask(null);
  }, [project]); // clear task when project changes

  const projectOption = [
    { value: "all", label: "All Projects" },
    ...projects?.map((p) => ({
      value: p.id,
      label: p.name || p.title,
    })),
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
  };

  return (
    <div className="max-w-md mx-auto px-1 py-2 space-y-4 font-sans bg-white mt-2 mb-2">
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
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Select Project: </span>

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
        {/* </div> */}
        {/* <button
            onClick={() => setProject({ value: "all", label: "All projects"})}
            className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            All
          </button> */}
        {/* </div> */}
      </div>

      {/* task selector */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Select Task:</span>
        <Select
          options={taskOption}
          value={task}
          onChange={(selected) => setTask(selected)}
          placeholder={project ? "Select task" : "Select project first"}
          isSearchable
          menuPortalTarget={document.body}
          styles={customStyles}
          classNamePrefix="react-select"
          isDisabled={!project}
        />
      </div>

      {/* timer */}
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold font-mono w-[70px] text-center">
          {String(Math.floor(time / 60)).padStart(2, "0")}:
          {String(Math.floor(time % 60)).padStart(2, "0")}
        </h2>

        <button
          onClick={startTimer}
          disabled={!task}
          className={`px-3 py-1 rounded text-white ${
            !task
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          } `}
        >
          Start
        </button>
        <button
          onClick={stopTimer}
          disabled={!task}
          className={`px-3 py-1 rounded text-white ${
            !task
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600"
          } `}
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
      <div className="mt-4">
        <strong>Description:</strong>
        {task ? (
          <div className="p-3 mt-2 border rounded-md bg-gray-50 text-sm text-gray-700">
            {/* <p className="mt-1">{task.description || "No Description available"}</p> */}
            <div
              className="mt-1"
              dangerouslySetInnerHTML={{
                __html: task.description || "No Description available",
              }}
            />
          </div>
        ) : (
          <p className="text-gray-400 text-sm mt-2">No task selected</p>
        )}
      </div>
    </div>
  );
}
//when i clicked on stop button then task update at tasklist on at searchbar
//suppose i select task & i click on start button then timer started after that at 00:46 time, i click on stop button then time printed at searchbar & tasklist successfully. after that i select other task & perform
// timer update at searchbar
