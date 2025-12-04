import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { BsCheck2 } from "react-icons/bs";

const AddTaskModal = ({
  isOpen,
  newTask,
  setNewTask,
  onClose,
  onSave,
  handleKeyDown,
  formData,
  setFormData,
  employees,
  projects,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!isOpen) return null;
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmployeeToggle = (employeeId) => {
    setFormData((prev) => {
      const currentAssigned = prev.assigned_employees;

      let newAssigned;
      if (currentAssigned.includes(employeeId)) {
        newAssigned = currentAssigned.filter((id) => id !== employeeId);
      } else {
        newAssigned = [...currentAssigned, employeeId];
      }

      return {
        ...prev,
        assigned_employees: newAssigned,
      };
    });
  };

  const getEmployeeName = (id) => {
    const emp = employees?.find((e) => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : "";
  };

  const inputClass =
    "w-full p-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm text-sm";
  const selectClass =
    "w-full p-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm text-sm bg-white cursor-pointer";

  return (
  
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose} 
    >
      <div 
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100"
        onClick={e => e.stopPropagation()} 
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
          Add New Task
        </h2>

        <input
          type="text"
          placeholder="Task title..."
          name="title"
          value={formData.title}
          onChange={handleOnChange}
          className={inputClass}
        />

        <textarea
          placeholder="Description..."
          name="description"
          value={formData.description}
          onChange={handleOnChange}
          rows="3"
          className={`${inputClass} resize-none`}
        />

        <input
          type="date"
          name="due_date"
          value={formData.due_date}
          onChange={handleOnChange}
          className={inputClass}
        />

        <select
          name="status"
          value={formData.status}
          onChange={handleOnChange}
          className={selectClass}
        >
          <option value="">Select Status</option>
          <option value="pending">Pending</option>
          {/* <option value="in-progress">In-progress</option> */}
          {/* <option value="on-approval">On-Approval</option>
          <option value="done">Done</option> */}
        </select>

        <select
          name="priority"
          value={formData.priority}
          onChange={handleOnChange}
          className={selectClass}
        >
          <option value="">Select Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input
          type="text"
          placeholder="Project Name"
          name="project_name"
          value={formData.project_name}
          onChange={handleOnChange}
          className={inputClass}
        />

        <div className="relative mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Assigned To:
            </span>

            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}

              className="p-1 border border-gray-300 rounded-full hover:bg-blue-50 transition duration-150 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              aria-expanded={isDropdownOpen}
              aria-label="Toggle assigned employees menu"
            >
              <FaUserCircle className="text-blue-600 text-xl" />
            </button>
   
            {formData.assigned_employees.length > 0 ? (
              <span className="text-sm text-gray-700 font-medium truncate max-w-[60%]">
                {formData.assigned_employees
                  .map(getEmployeeName)
                  .filter((name) => name.length > 0)
                  .join(", ")}
              </span>
            ) : (
              <span className="text-sm text-gray-500 italic">
                Select employees...
              </span>
            )}
          </div>

          {isDropdownOpen && (

            <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
              {employees?.map((emp) => {
                const isSelected = formData.assigned_employees.includes(emp.id);
                return (
                  <div
                    key={emp.id}
                    onClick={() => handleEmployeeToggle(emp.id)}
                    className={`flex justify-between items-center p-3 cursor-pointer text-sm transition duration-100 ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    <span>
                      {emp.first_name} {emp.last_name}
                    </span>
                    {isSelected && (
                      <BsCheck2 className="text-blue-500 text-base" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
   
          <button
          
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;
