import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { useProject } from "../context/ProjectContext";
// import { FaCircleUser } from "react-icons/fa6";
import { CiMenuKebab } from "react-icons/ci";
import { useRef } from "react";
import parse from "html-react-parser";
import { useMemo } from "react";

export default function ProjectTaskPage() {
  const { user, logout, authToken } = useAuth();
  const { tasks, fetchTasks, logTime, getTimeEntriesForTask, fetchTaskById } =
    useTasks();
  const { projects, fetchProjects, fetchProjectById } = useProject();

  const [project, setProject] = useState(null);
  const [task, setTask] = useState(null);
  const [time, setTime] = useState(0);
  const [taskHistory, setTaskHistory] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  // const [projectOwners, setProjectOwners] = useState({});
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  // const [underSelectedProject, setUnderSelectedProject] = useState(false);
  const [taskMenuWidth, setTaskMenuWidth] = useState(0);
  const [lastStoppedTask, setLastStoppedTask] = useState(null);
  // const [description, setDescription] = useState("");

  const userMenuRef = useRef(null);
  const projectMenuRef = useRef(null);
  const taskContainerRef = useRef(null);
  const lastProjectIdRef = useRef(null);

  // const previousTaskIdRef = useRef(new Set());
  // const taskPollingRef = useRef(null);
  const lastTaskIdRef = useRef(null);

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
    // if (authToken) {
    //   fetchTasks();
    //   fetchProjects();
    // }
    if (!authToken) return;
    // fetchTasks();
    fetchProjects();
  }, [authToken]);

  useEffect(() => {
    setProject({ value: "all", label: "All Projects" });
  }, []);

  // useEffect(() => {
  //   if (!project) return;
  //   if(project.value === "all"){
  //     setTask(null);
  //     return;
  //   }
  //   setTask(null);
  //   fetchProjectById(project.value);
  // },[project?.value]);
  useEffect(() => {
    if (!project?.value || project.value === "all") return;
    if (lastProjectIdRef.current === project.value) return;
    lastProjectIdRef.current = project.value;
    fetchProjectById(project.value);
  }, [project?.value]);

  useEffect(() => {
    if (!task?.value) return;
    if (lastTaskIdRef.current === task.value) return;

    lastTaskIdRef.current = task.value;
    fetchTaskById(task.value);
  }, [task?.value]);

  // useEffect(() => {
  //   if(!isRunning || !authToken) return;
  //   const interval = setInterval(() => {
  //     fetchTasks();
  //   }, 60000);

  //   return () => clearInterval(interval);
  // },[isRunning, authToken]);

  // useEffect(() => {
  //   if (!authToken) return;
  //   const interval = setInterval(() => {
  //     fetchTasks();
  //   }, 5000);
  //   return () => clearInterval(interval);
  // },[authToken, fetchTasks]);

  // useEffect(() => {
  //   if (!authToken) return;
  //   if(taskPollingRef.current) return;
  //   const checkForNewTasks = async () => {
  //     const newTasks = await fetchTasks();

  //     if(!newTasks || !Array.isArray(newTasks)) return;

  //     const currentIds = new Set(newTasks.map(t => t.id));
  //     const previousIds = previousTaskIdRef.current;

  //     let hasNewTask = false;

  //     for(const id of currentIds){
  //       if(!previousIds.has(id)){
  //         hasNewTask = true;
  //         break;
  //       }
  //     }
  //     previousTaskIdRef.current = currentIds;

  //     if(hasNewTask){
  //       console.log("New tasks received");
  //     }
  //   };
  //   checkForNewTasks();

  //   const interval = setInterval(checkForNewTasks, 5000);

  //   return () => clearInterval(interval);
  // },[authToken]);

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
    const updateWidth = () => {
      if (taskContainerRef.current) {
        setTaskMenuWidth(taskContainerRef.current.offsetWidth);
      }
    };
    updateWidth(); // initial measurement
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    if (!task?.value) {
      setTimeEntries([]);
      return;
    }

    let active = true;

    (async () => {
      const entries = await getTimeEntriesForTask(task.value);
      if (active) setTimeEntries(entries);
    })();

    return () => {
      active = false;
    };
  }, [task?.value]);

  // useEffect(() => {
  //   if (!task) {
  //     setTimeEntries([]);
  //     return;
  //   }

  //   const loadEntries = async () => {
  //     const entries = await getTimeEntriesForTask(task.value); // getTimeEntriesForTask - retrieves past log
  //     setTimeEntries(entries);
  //   };

  //   loadEntries();
  // }, [task, getTimeEntriesForTask]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (
        projectMenuRef.current &&
        !projectMenuRef.current.contains(e.target)
      ) {
        setShowProjectMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const startTimer = () => {
    if (!window.timer && task) {
      setIsRunning(true);
      setShowProjectMenu(false);
      const key = `timer-${user.id}-${task.value}`;
      window.timer = setInterval(() => {
        setTime((t) => {
          const newTime = t + 1;
          localStorage.setItem(key, newTime);
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

    if (!task) return;

    try {
      const entryDate = new Date().toISOString().split("T")[0];

      await logTime({
        taskId: task.value,
        hoursSpent: time / 3600,
        entryDate,
        notes: "Timer logged via timer",
      });

      await fetchTasks();
      setLastStoppedTask(task.value);

      // setTime(task.savedTime || 0);
    } catch (error) {
      console.error("Failed to log time", error);
    }
  };

  const handleLogout = () => {
    localStorage.setItem("timer-running", isRunning ? "1" : "0");

    if (window.timer) {
      clearInterval(window.timer);
      window.timer = null;
    }
    window.electronAPI.sendStatus("clear");
    logout();
    navigate("/");
  };

  //   const handleLogout = async () => {
  //   localStorage.setItem("timer-running", isRunning ? "1" : "0");
  //   await logout();

  //   if (window.electronAPI?.reloadWindow) {
  //     window.electronAPI.reloadWindow(); // reload main window
  //   } else {
  //     navigate("/", { replace: true });
  //   }
  // };

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

  const taskOption = useMemo(() => {
    return filteredTasks.map((t) => {
      const historyTask = taskHistory.find((ht) => ht.value === t.id);
      // const savedTime = historyTask?.savedTime ?? t.savedTime ?? 0;
      const localTimeRaw = localStorage.getItem(`timer-${user.id}-${t.id}`);
      const localTime = localTimeRaw ? Number(localTimeRaw) : null;

      const savedTime =
        localTime !== null
          ? localTime
          : historyTask?.savedTime ?? t.savedTime ?? 0;

      return {
        value: t.id,
        // label: `${t.title}${savedTime > 0 ? ` - ${formatted}` : ""}`,
        label: t.title,
        savedTime,
        description: t.description,
      };
    });
  }, [filteredTasks, user?.id]);

  useEffect(() => {
    if (!task) return;

    const updated = taskOption.find((opt) => opt.value === task.value);
    if (!updated) return;

    if (updated.savedTime !== task.savedTime) {
      setTask(updated);
    }
  }, [taskOption]);

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
    container: (base) => ({
      ...base,
      width: "100%",
    }),

    control: (base, state) => ({
      ...base,
      width: "100%",
      borderRadius: "8px",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      minHeight: "42px",
      fontSize: "14px",
    }),

    menu: (base) => ({
      ...base,
      width: "100%",
      maxWidth: "90%",
      marginLeft: "19px",
      // marginRight: "18px",
      marginTop: 0,
    }),

    menuList: (base) => ({
      ...base,
      padding: 0,
      maxHeight: "180px",
    }),

    option: (base, state) => ({
      ...base,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      padding: "10px 12px",
      fontSize: "14px",
      backgroundColor: state.isSelected
        ? "#eff6ff"
        : state.isFocused
        ? "#f3f4f6"
        : "white",
      color: "#111827",
    }),
  };

  useEffect(() => {
    const updateWidth = () => {
      if (taskContainerRef.current) {
        setTaskMenuWidth(taskContainerRef.current.offsetWidth); // Update width on resize
      }
    };

    updateWidth(); // initial measurement
    window.addEventListener("resize", updateWidth); // Recalculate width on window resize

    return () => window.removeEventListener("resize", updateWidth); // Clean up listener
  }, []);

  const getInitials = (user) => {
    if (!user) return "";
    const first = user.first_name?.charAt(0) || "";
    const last = user.last_name?.charAt(0) || "";
    return (first + last).toUpperCase();
  };

  const openHRMSLink = async () => {
    const currentUserId = user?.work_email || user?.id || user?.username;

    const lastHRMSUser = localStorage.getItem("hrms_last_user");

    let targetURL = "https://hrms.edeltacorp.com/my-tasks";

    if (lastHRMSUser && lastHRMSUser === currentUserId) {
      targetURL = "https://hrms.edeltacorp.com/my-tasks";
    }
    localStorage.setItem("hrms_last_user", currentUserId);

    if (window?.electronAPI?.hideWindow) {
      await window.electronAPI.hideWindow();
    }

    if (window?.electronAPI?.openExternal) {
      window.electronAPI.openExternal(targetURL);
    } else {
      window.open(targetURL, "_blank", "noopener, noreferrer");
    }
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
            <div className="absolute left-0 top-full mt-1 w-45 bg-white border shadow-lg rounded-md z-50 max-h-60 overflow-y-auto">
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

          <div
            className="flex items-center gap-2 relative"
            ref={projectMenuRef}
          >
            <span className="text-sm font-semibold text-gray-600">
              {project?.label || "All Projects"}
            </span>
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
                <div>
                  <button
                    onClick={() => {
                      setProject({ value: "all", label: "All Projects" });
                      setShowProjectMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex justify-between items-center"
                  >
                    <span>All Projects</span>
                  </button>

                  {/* Divider under All Projects */}
                  <div className="border-b border-gray-200"></div>
                </div>

                {projects.length === 0 ? (
                  <p className="p-2 text-sm text-gray-500">No project found</p>
                ) : (
                  projects.map((p, index) => (
                    <div key={p.id}>
                      <button
                        onClick={() => {
                          // setUnderSelectedProject(true);
                          setProject({ value: p.id, label: p.name || p.title });
                          setShowProjectMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      >
                        <div className="flex w-full justify-between items-center">
                          <span>{p.name || p.title}</span>
                          <span className="text-gray-500 text-xs">
                            {p.creator?.first_name} {p.creator?.last_name}
                          </span>
                        </div>
                      </button>

                      {/* Divider between project items (except last) */}
                      {index !== projects.length - 1 && (
                        <div className="border-b border-gray-200"></div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Task dropdown under the row */}
        <div ref={taskContainerRef} className="w-full">
          <Select
            options={taskOption}
            value={task}
            // onChange={setTask}
            onChange={(selected) => {
              setTask(selected);
              setTime(selected?.savedTime || 0);
            }}
            onMenuOpen={async () => {
              await fetchTasks();
            }}
            placeholder={project ? "Select task" : "Select project first"}
            isSearchable
            menuPlacement="bottom"
            classNamePrefix="react-select"
            isDisabled={isRunning || !project}
            styles={customStyles}
            formatOptionLabel={(option) => (
              <div className="flex justify-between items-center w-full">
                <span className="truncate">{option.label}</span>
                <span className="font-mono text-red-500 ml-3">
                  {formateTime(option.savedTime)}
                </span>
              </div>
            )}
          />
        </div>
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
        <div className="flex justify-between items-center">
          <strong>Description:</strong>
          <span
            onClick={openHRMSLink}
            className="text-blue-600 font-medium hover:underline"
          >
            <p className="cursor-pointer">For More Information...</p>
          </span>
        </div>
        <div className="bg-gray-100 p-3 mt-2 rounded-md text-sm text-gray-700 max-h-40 overflow-y-auto break-words">
          {task && task.description
            ? parse(task.description, {
                replace: (domNode) => {
                  if (domNode.name === "a") {
                    const url = domNode.attribs.href;
                    return (
                      <a
                        href={url}
                        className="text-blue-600 hover:underline"
                        onClick={async (e) => {
                          e.preventDefault();

                          if (window.electronAPI?.hideWindow) {
                            await window.electronAPI.hideWindow();
                          }

                          if (window.electronAPI?.openExternal) {
                            window.electronAPI.openExternal(url);
                          } else {
                            window.open(url, "_blank", "noopener,noreferrer");
                          }
                        }}
                      >
                        {domNode.children[0]?.data || ""}
                      </a>
                    );
                  }
                },
              })
            : "No Description available"}
        </div>
      </div>

      {/* <a
              href="https://hrms.edeltacorp.com/my-tasks"
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-4 right-5 text-blue-600 font-medium hover:underline"
            >
              For More Information...
            </a> */}
    </div>
  );
}
