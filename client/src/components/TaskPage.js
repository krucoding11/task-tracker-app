import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TaskControls from "./Task/TaskControls.js";
import TaskBoard from "./Task/TaskBoard.js";
import dummyData from "../dummyData.js";
import AddTaskModal from "./Task/TaskModal.js";
import { useTasks } from "../context/TaskContext.js";
export default function TaskPage() {
  
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    status: "",
    priority: "",
    project_name: "",
    assigned_employees: [],
  });
  
  const navigate = useNavigate();
  const { fetchTasks } = useTasks();

  const employeesList = dummyData.data.flatMap(
    (task) => task.assigned_employees
  );

  const projectList = Array.from(
    new Map(
      dummyData.data
        .filter((task) => task.project_name != null)
        .map((task) => [
          task.project_id,
          { id: task.project_id, name: task.project_name },
        ])
    ).values()
  );

  // --- Effects ---
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setTasks(storedTasks);
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // --- Handlers ---
  
  // 1. HANDLER TO UPDATE AN EXISTING TASK
  const updateTask = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        // Find the task by ID and merge the updates
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task
      )
    );
  };

  // 2. HANDLER TO DELETE A TASK
  const deleteTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  // 3. HANDLER TO ADD A NEW TASK
 const handleSaveTask = async () => { // Make this function ASYNC
 
    if (formData.title.trim()) { 
      
      const newTaskObject = {
        id: Date.now().toString(), 
        title: formData.title, 
        description: formData.description,
        due_date: formData.due_date,
        priority: formData.priority,
        project_name: formData.project_name,
        // Ensure assigned_employees only stores IDs for state consistency
        assigned_employees: formData.assigned_employees.map((id) => id),
        status: "Pending", 
        duration: 0, // Initialize duration for timer
      };
      
      // 1. Add the new task to the local state
      setTasks((prevTasks) => [...prevTasks, newTaskObject]);
      
      // 2. Reset form and close the modal
      setFormData({
        title: "",
        description: "",
        due_date: "",
        status: "",
        priority: "",
        project_name: "",
        assigned_employees: [],
      });
      
      setIsModalOpen(false);

      // 3. CALL THE fetchTasks API from context to refresh the data
      const result = await fetchTasks();
      if (result?.success) {
        console.log("Tasks list successfully refreshed from API.");
      } else {
        console.error("Failed to refresh tasks from API:", result?.error);
      }

    } 
  };

  const handleLogout = () => {
    navigate("/");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveTask();
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // const handleUserClick = () => {
  //   navigate("/users");
  // }

  // --- Filtering ---
 const filteredTasks = tasks.filter((task) => {
    const textToFilter = task.title || task.text;

    if (textToFilter) {
      return textToFilter.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="w-full bg-white shadow-lg rounded-xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Tasks</h1>
          {/* <button 
          onClick={handleUserClick}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md mr-4">
            Users
          </button> */}
          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-150 ease-in-out"
          >
            Logout
          </button>
        </div>

        {/* TaskControls Component */}
        <TaskControls
          selectedDate={selectedDate}
          handleDateChange={handleDateChange}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAddTaskClick={() => setIsModalOpen(true)}
        />

        {/* Add Task Modal */}
        <AddTaskModal
          isOpen={isModalOpen}
          newTask={newTask}
          setNewTask={setNewTask}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTask}
          handleKeyDown={handleKeyDown}
          formData={formData}
          setFormData={setFormData}
          employees={employeesList}
          projects={projectList}
        />

        {/* Task board */}
        <TaskBoard 
          tasks={filteredTasks} 
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask} 
          employees={employeesList}
        />
      </div>
    </div>
  );
}