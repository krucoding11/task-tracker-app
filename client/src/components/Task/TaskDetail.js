import React from "react";

import { FaTimes } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";

export default function TaskDetail({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onAccept,
  onComplete,
  onDone,
}) {
  if (!isOpen || !task) return null;

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "text-red-700 bg-red-100";
      case "medium":
        return "text-yellow-700 bg-yellow-100";
      case "low":
        return "text-green-700 bg-green-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className=" bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-xl font-bold text-gray-800">{task.title}</h2>
          <button onClick={onClose} aria-label="Close task detail">
            <FaTimes className="text-gray-600 hover:text-gray-800" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <p className="text-sm font-medium">
              Status:
              <span className="ml-2 text-blue-600 font-semibold capitalize">
                {task.status.replace("-", " ")}
              </span>
            </p>
            <p className="text-sm font-medium">
              Priority:
              <span
                className={`ml-2 px-3 py-0.5 rounded-full text-xs font-semibold capitalize ${getPriorityClass(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
            </p>
          </div>
          {task.project_name && (
            <p className="text-sm text-gray-600">
              Project:{" "}
              <span className="font-medium text-purple-700">
                {task.project_name}
              </span>
            </p>
          )}

          {task.due_date && (
            <p className="text-sm text-gray-600">
              Due Date:{" "}
              <span className="font-medium text-purple-700">
                {task.due_date}
              </span>
            </p>
          )}

          <div className="pt-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">
              Description
            </h3>
            <p className="text-gray-700 text-sm bg-gray-50 p-2 rounded-md border">
              {task.description || "No description provided."}
            </p>
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Assigned To:
            </h3>
            <div className="flex space-x-3 items-center">
              {task.assigned_employees.length ? (
                task.assigned_employees.map((emp, idx) => (
                  <div
                    key={idx}
                    title={`${emp.first_name} ${emp.last_name}`}
                    className="flex items-center space-x-1"
                  >
                    <FaUserCircle className="text-blue-500 text-2xl" />
                    <span className="text-sm text-gray-700 hidden sm:inline">
                      {emp.first_name} {emp.last_name}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-600">No Assigned Employees</p>
              )}
            </div>
          </div>
        </div>
        {task.status === "Pending" && (
          <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150"
            >
              REJECT
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (typeof onAccept === 'function') {
                    onAccept(task); 
                }
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-150"
            >
              ACCEPT
            </button>
          </div>
        )}

        {task.status === "In-Progress" && (
          <div className="flex justify-end pt-4 border-t mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (typeof onComplete === 'function') {
                  onComplete(task);
                }
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-150"
            >COMPLETED</button>
          </div>
        )}

        {task.status === "On-Approval" && (
          <div className="flex justify-end pt-4 border-t mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if(typeof onDone === 'function'){
                  onDone(task);
                }
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-lg hover:bg-pink-700 transition duration-150"
            >
              DONE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
