import React from "react";
import { MdOutlineDelete } from "react-icons/md";

function TaskDelete({ isOpen, task, onClose, onConfirm }) {
  if (!isOpen || !task) return null;
  
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div // This is the main white container
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Delete Icon */}
        <div className="flex justify-center mb-4">
            <MdOutlineDelete className="text-red-500 text-5xl" />
        </div>

        {/* Confirmation Text */}
        <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
            Are you sure to Delete task?
        </h2>

    
        <div className="flex justify-end space-x-3">
            <button 
                onClick={onClose} 
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
                CANCEL
            </button>
            <button 
                onClick={onConfirm}
                className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
                DELETE
            </button>
        </div>
      </div>
    </div>
  );
}

export default TaskDelete;