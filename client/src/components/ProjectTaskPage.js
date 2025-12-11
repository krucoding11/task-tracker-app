import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { useProject } from "../context/ProjectContext";
// import { FaCircleUser } from "react-icons/fa6";
import { CiMenuKebab } from "react-icons/ci";
import { useRef } from "react";

export default function ProjectTaskPage() {
  const { user, logout, authToken, getEmployeeById } = useAuth();
  const { tasks, fetchTasks, logTime, getTimeEntriesForTask } = useTasks();
  const { projects, fetchProjects } = useProject();

  const [project, setProject] = useState(null);
  const [task, setTask] = useState(null);
  const [time, setTime] = useState(0);
  const [taskHistory, setTaskHistory] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [projectOwners, setProjectOwners] = useState({});
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  // const [description, setDescription] = useState("");

  const userMenuRef = useRef(null);
  const projectMenuRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (window.timer) {
      clearInterval(window.timer);
      window.timer = null;
    }
    localStorage.setItem("timer-running", "0");
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (authToken) {
      fetchTasks();
      fetchProjects();
    }
  }, []);

  useEffect(() => {
    const loadProjectOwners = async () => {
      if (!projects || projects.length === 0) return;

      const owners = {};

      for (const project of projects) {
        // const ownerId = project.employees_id || project.user_id || project.created_by || project.owner_id || project.assigned_to || null;
        const ownerId = project.employees_id;
        if (ownerId) {
          const result = await getEmployeeById(ownerId);
          if (result.success) {
            owners[project.id] =
              result.data.first_name + " " + result.data.last_name;
          }
        }
      }
      setProjectOwners(owners);
    };
    loadProjectOwners();
  }, [projects]);

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
    if (!task) return;
    const wasRunning = localStorage.getItem("timer-running");
    if (wasRunning === "1") {
      startTimer();
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
      const entries = await getTimeEntriesForTask(task.value); // getTimeEntriesForTask - retrieves past log
      setTimeEntries(entries);
    };

    loadEntries();
  }, [task, getTimeEntriesForTask]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if(userMenuRef.current && !userMenuRef.current.contains(e.target)){
        setShowUserMenu(false);
      }
      if(projectMenuRef.current && !projectMenuRef.current.contains(e.target)){
        setShowProjectMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  })

  const startTimer = () => {
    if (!window.timer && task) {
      setIsRunning(true);
      setShowProjectMenu(false);
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
    setIsRunning(false);
    window.electronAPI?.sendStatus("red");

    localStorage.setItem("timer-running", "0");

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
    localStorage.setItem("timer-running", isRunning ? "1" : "0");
    logout();
    navigate("/");
  };

  const filteredTasks =
    project && project.value !== "all"
      ? tasks.filter((t) => Number(t.project_id) === Number(project.value))
      : tasks;

  const formateTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
      return `${String(h).padStart(2, "0")}:${String(m).padStart(
        2,
        "0"
      )}:${String(s).padStart(2, "0")}`;
    } else {
      return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
  };

  const taskOption = filteredTasks.map((t) => {
    const historyTask = taskHistory.find((ht) => ht.value === t.id);
    // const savedTime = historyTask?.savedTime ?? t.savedTime ?? 0;
    const localTime = Number(localStorage.getItem(`timer-${t.id}`));
    const savedTime =
      localTime > 0 ? localTime : historyTask?.savedTime ?? t.savedTime ?? 0;

    return {
      value: t.id,
      // label: `${t.title}${savedTime > 0 ? ` - ${formatted}` : ""}`,
      label: (
        <div className="flex justify-between w-full items-center">
          <span>{t.title || "Untitled Task"}</span>
          {savedTime > 0 && (
            <span className="text-red-500 font-semibold">
              {formateTime(savedTime)}
            </span>
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

  // const projectOption = [
  //   { value: "all", label: "All Projects" },
  //   ...projects?.map((p) => ({
  //     value: p.id,
  //     // label: p.name || p.title,
  //     label: (
  //       <div className="flex justify-between w-full items-center">
  //         <span>{p.name || p.title}</span>
  //         <span className="text-gray-500 text-sm">
  //           {projectOwners[p.id] ? `- ${projectOwners[p.id]}` : ""}
  //         </span>
  //       </div>
  //     ),
  //   })),
  // ];

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
      overflow: "hidden",
      maxHeight: "260px",
    }),

    menuList: (base) => ({
      ...base,
      padding: "0",
      maxHeight: "144px",
      overflowY: "auto",
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

  const getInitials = (user) => {
    if (!user) return "";
    const first = user.first_name?.charAt(0) || "";
    const last = user.last_name?.charAt(0) || "";
    return (first + last).toUpperCase();
  };

  return (
    <div className="max-w-md mx-auto px-4 py-2 space-y-5 font-sans bg-white mt-2 mb-2 overflow-visible">
      {/* Header */}
      <div className="flex justify-between items-center mt-1">
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu((prev) => !prev)}
            className="w-10 h-10 flex items-center justify-center bg-gray-300 text-gray-700 font-semibold rounded-full cursor-pointer select-none"
          >
            {getInitials(user)}
            {/* {user?.profile_picture_url ? (
              <img
                src={`${process.env.REACT_APP_BACKEND_URL}${user.profile_picture_url}`}
                alt={user.first_name}
                className="w-10 h-10 rounded-full object-cover border border-gray-300"
              />
            ) : (
              <FaCircleUser className="text-[30px]" />
            )} */}
            {/* <FaCircleUser className="text-[30px] cursor-pointer" /> */}
          </button>
          {showUserMenu && (
            <div className="fixed top-12 left-1 w-40 bg-white shadow-lg rounded-md border z-50">
              <div className="px-2 py-2 text-sm text-gray-700 border-b">
                {user?.work_email || "No email"}
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-2 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <h2
            className={`text-xl font-bold font-mono w-[70px] text-center ${
              time >= 3600 ? "mr-7" : "mr-1"
            }`}
          >
            {formateTime(time)}
          </h2>

          <button
            onClick={() => (isRunning ? stopTimer() : startTimer())}
            disabled={!task}
            className={`px-4 py-1 rounded text-white font-semibold ${
              !task
                ? "bg-gray-300"
                : isRunning
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-700 hover:bg-green-800"
            }`}
          >
            {isRunning ? "Stop" : "Start"}
          </button>
        </div>
      </div>

      {/* project */}
      {/* <div className="flex flex-col gap-1"> */}
      {/* <span className="text-sm font-medium">Select Project: </span> */}

      {/* <Select
          options={projectOption}
          value={project}
          onChange={setProject}
          placeholder="Select project"
          isSearchable
          menuPosition="fixed"
          menuPortalTarget={document.body}
          styles={customStyles}
          classNamePrefix="react-select"
          menuPlacement="bottom"
          isDisabled={isRunning}
        /> */}

      {/* </div> */}

      {/* task selector */}
      <div className="flex flex-col gap-1">
        {/* Row: Label + Menu Icon */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Select Task:</span>

          <div className="flex items-center gap-2 relative" ref={projectMenuRef}>
            {project && (
              <span className="text-sm font-semibold text-gray-600">
                {project.label}
              </span>
            )}
            <button
              onClick={() => {
                if (!isRunning) setShowProjectMenu((prev) => !prev);
              }}
              disabled={isRunning}
              className={`p-2 border rounded ${
                isRunning
                  ? "bg-gray-200 cursor-not-allowed opacity-50"
                  : "hover:bg-gray-200"
              }`}
            >
              <CiMenuKebab className="text-2xl" />
            </button>

            {showProjectMenu && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border shadow-lg rounded-md z-50 max-h-60 overflow-y-auto">
                <button
                  onClick={() => {
                    setProject({ value: "all", label: "All Projects" });
                    setShowProjectMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex justify-between items-center"
                >
                  <span>All Projects</span>
                </button>
                {projects.length === 0 ? (
                  <p className="p-2 text-sm text-gray-500">No project found</p>
                ) : (
                  projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setProject({ value: p.id, label: p.name || p.title });
                        setShowProjectMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex justify-between items-center"
                    >
                      <span>{p.name || p.title}</span>
                      {projectOwners[p.id] && (
                        <span className="text-gray-400 text-xs">
                          {projectOwners[p.id]}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Task dropdown under the row */}
        <Select
          options={taskOption}
          value={task}
          onChange={(selected) => setTask(selected)}
          placeholder={project ? "Select task" : "Select project first"}
          isSearchable
          menuPosition="fixed"
          menuPortalTarget={document.body}
          styles={customStyles}
          classNamePrefix="react-select"
          menuPlacement="bottom"
          isDisabled={isRunning || !project}
        />
      </div>

      {/* timer */}
      {/* <div className="flex items-center gap-4"> */}

      {/* <button
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
        </button> */}
      {/* </div> */}

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

      <div className="relative cursor-pointer">
        <a
          href="https://hrms.edeltacorp.com/my-tasks"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-5 text-blue-600 font-medium hover:underline"
        >
          For More Information...
        </a>
      </div>
    </div>
  );
}
