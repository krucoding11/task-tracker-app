import React, { useEffect, useRef, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import TaskDetail from "./TaskDetail";
import { BsSkipStart, BsStopCircle } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";
import { MdOutlineDelete } from "react-icons/md";

// Import the new modal components
import TaskEdit from "./TaskEdit";
import TaskDelete from "./TaskDelete";

// Note: Assuming employees and projects are passed from the parent component
const TaskBoard = ({ tasks, onUpdateTask, onDeleteTask, employees = [] }) => {
  // State for the TaskDetail modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // New states for Edit and Delete Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [timers, setTimers] = useState({});
  const intervalRefs = useRef({});

  useEffect(() => {
    const initialTimers = {};
    tasks?.forEach((task) => {
      // Ensure initial duration is set from task data or defaults to 0
      initialTimers[task.id] = {
        isRunning: false,
        duration: task.duration || 0,
      };
    });
    setTimers(initialTimers);
    return () => {
      Object.values(intervalRefs.current).forEach(clearInterval);
    };
  }, [tasks]);

  const formateDuration = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (num) => num.toString().padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const startTimer = (taskId) => {
    // Clear any existing interval for safety
    if (intervalRefs.current[taskId]) {
      clearInterval(intervalRefs.current[taskId]);
    }
    setTimers((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        isRunning: true,
      },
    }));

    const interval = setInterval(() => {
      setTimers((prev) => {
        const currentTaskTimer = prev[taskId];
        if (!currentTaskTimer || !currentTaskTimer.isRunning) {
          clearInterval(interval);
          return prev;
        }
        return {
          ...prev,
          [taskId]: {
            ...prev[taskId],
            duration: prev[taskId].duration + 1,
          },
        };
      });
    }, 1000);
    intervalRefs.current[taskId] = interval;
  };

  const stopTimer = (taskId) => {
    if (intervalRefs.current[taskId]) {
      clearInterval(intervalRefs.current[taskId]);
      delete intervalRefs.current[taskId];
    }

    setTimers((prev) => {
      const durationToSave = prev[taskId]?.duration || 0;
      onUpdateTask({ id: taskId, duration: durationToSave });

      return {
        ...prev,
        [taskId]: { ...prev[taskId], isRunning: false },
      };
    });
  };

  const handleTimerToggle = (e, taskId) => {
    e.stopPropagation();
    const isCurrentlyRunning = timers[taskId]?.isRunning;
    if (isCurrentlyRunning) {
      stopTimer(taskId);
    } else {
      startTimer(taskId);
    }
  };

  const openTaskDetailModal = (task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const closeTaskDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTask(null);
  };

  // HANDLERS FOR NEW MODALS
  const handleUpdateClick = (e, task) => {
    e.stopPropagation();
    // Stop the timer if running, before editing the task
    if (timers[task.id]?.isRunning) {
      stopTimer(task.id);
    }
    setTaskToEdit(task);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (e, task) => {
    e.stopPropagation();
    // Stop the timer if running, before deleting the task
    if (timers[task.id]?.isRunning) {
      stopTimer(task.id);
    }
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  // Handlers for closing the new modals
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setTaskToEdit(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  const handleEditSave = (updatedTask) => {
    // Call the parent update function
    onUpdateTask(updatedTask);
    closeEditModal();
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      // Call the parent delete function
      onDeleteTask(taskToDelete.id);
      closeDeleteModal();
    }
  };

  const handleTaskAccept = (task) => {
    const updatedTask = {
      ...task,
      status: "In-Progress",
    };
    onUpdateTask(updatedTask);
    closeTaskDetailModal();
  };

  const handleTaskCompleted = (task) =>{
    const updatedTask = {
      ...task,
      status: "On-Approval",
    };
    onUpdateTask(updatedTask);
    closeTaskDetailModal();
  };

  const handleTaskDone = (task) => {
    const updatedTask = {
      ...task,
      status: "Done",
    };
    onUpdateTask(updatedTask);
    closeTaskDetailModal();
  }

  const grouped = {
    Pending: [],
    "In-Progress": [],
    "On-Approval": [],
    Done: [],
  };

  tasks?.forEach((task) => {
    if (grouped[task.status]) {
      grouped[task.status].push(task);
    }
  });

  const columnBG = {
    Pending: "bg-yellow-50",
    "In-Progress": "bg-blue-50",
    "On-Approval": "bg-green-50",
    Done: "bg-pink-50",
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 items-start">
        {Object.keys(grouped).map((status) => (
          <div
            key={status}
            className={`p-4 rounded-xl ${columnBG[status]} shadow-sm`}
          >
            {/* Column Header */}
            <h2 className="font-bold mb-4 text-gray-700">
              {status.replace("-", " ")} ({grouped[status].length})
            </h2>

            {/* Cards */}
            <div className="max-h-[600px] overflow-y-auto pr-2">
            {grouped[status].map((task) => {
              const timerState = timers[task.id] || {
                isRunning: false,
                duration: task.duration || 0,
              };
              const { isRunning, duration } = timerState;
              return (
                <div
                  key={task.id}
                  onClick={() => openTaskDetailModal(task)}
                  className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition duration-150"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 pr-2">
                      {task.title}
                    </h3>

                    {status === "In-Progress" && (
                      <div className="flex items-center space-x-2">
                        <p
                          className={`text-xs font-mono font-bold ${
                            isRunning ? "text-red-600" : "text-gray-600"
                          }`}
                        >
                          {formateDuration(duration)}
                        </p>

                        <button
                          onClick={(e) => handleTimerToggle(e, task.id)}
                          className="text-sm p-1 rounded-full hover:bg-gray-100 transition duration-150"
                          aria-label={isRunning ? "Pause timer" : "Start timer"}
                        >
                          {isRunning ? (
                            <BsStopCircle className="text-red-500 text-lg" />
                          ) : (
                            <BsSkipStart className="text-green-500 text-lg" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {task.project_name && (
                    <p className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md inline-block mb-2 font-medium">
                      {task.project_name}
                    </p>
                  )}

                  {task.due_date && (
                    <p className="text-xs text-gray-600 mb-1">
                      Due: {task.due_date}
                    </p>
                  )}

                  <p className="text-xs text-gray-800 mb-2">
                    Priority:{" "}
                    <span className="font-medium capitalize">
                      {task.priority}
                    </span>
                  </p>

                  {/* Assigned Users */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                    <div className="flex -space-x-2">
                      {task.assigned_employees?.length ? (
                        task.assigned_employees.map((empId, idx) => {
                          const employee = employees.find(
                            (e) => e.id === empId
                          ) || { first_name: "Unknown", last_name: "User" };
                          const initials =
                            (employee.first_name?.[0] || "") +
                            (employee.last_name?.[0] || "");
                          return (
                            <div
                              key={idx}
                              title={`${employee.first_name} ${employee.last_name}`}
                              className="w-8 h-8 bg-blue-100 text-blue-600 border border-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                            >
                              {initials || <FaUserCircle className="text-lg" />}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-gray-500 italic">
                          No assigned team
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-1">
                      <button
                        // Pass the entire task object to the handler
                        onClick={(e) => handleUpdateClick(e, task)}
                        className="p-1.5 text-blue-500 hover:text-white hover:bg-blue-500 rounded-full transition"
                        title="Edit Task"
                        aria-label="Edit Task"
                      >
                        <FiEdit className="text-md" />
                      </button>
                      <button
                        // Pass the entire task object to the handler
                        onClick={(e) => handleDeleteClick(e, task)}
                        className="p-1.5 text-red-500 hover:text-white hover:bg-red-500 rounded-full transition"
                        title="Delete Task"
                        aria-label="Delete Task"
                      >
                        <MdOutlineDelete className="text-md" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        ))}
      </div>

      {/* Task Detail Modal */}
      <TaskDetail
        isOpen={isDetailModalOpen}
        task={selectedTask}
        onClose={closeTaskDetailModal}
        // These handlers are now slightly changed to open the new modals
        onUpdate={(task) => {
          closeTaskDetailModal();
          setTaskToEdit(task);
          setIsEditModalOpen(true);
        }}
        onDelete={(task) => {
          closeTaskDetailModal();
          setTaskToDelete(task);
          setIsDeleteModalOpen(true);
        }}
        onAccept={handleTaskAccept}
        onComplete={handleTaskCompleted}
        onDone={handleTaskDone}
      />

      {isEditModalOpen && taskToEdit && (
        <TaskEdit
          isOpen={isEditModalOpen}
          task={taskToEdit}
          onClose={closeEditModal}
          onSave={handleEditSave}
          employees={employees}
        />
      )}
      {isDeleteModalOpen && taskToDelete && (
        <TaskDelete
          isOpen={isDeleteModalOpen}
          task={taskToDelete}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
};

export default TaskBoard;
