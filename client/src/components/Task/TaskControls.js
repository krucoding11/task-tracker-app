import React, { forwardRef } from "react";
import { MdOutlineCalendarMonth } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import DatePicker from "react-datepicker";
import { FaUserCircle } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

// --- Custom Date Input Component ---
// This is kept here as it is only used by the DatePicker within this control group.
const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
  <div
    className="flex items-center w-64 justify-center p-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition duration-150"
    onClick={onClick}
    ref={ref}
  >
    <MdOutlineCalendarMonth className="text-xl text-blue-600 mr-2" />
    <span className="text-sm font-medium ">
      {value}
    </span>
  </div>
));

// --- Task Controls Component ---
export default function TaskControls({
  selectedDate,
  handleDateChange,
  searchTerm,
  setSearchTerm,
  onAddTaskClick // Renamed for clarity on what it does
}) {
  const navigate = useNavigate();
  const goToTaskPage = () => {
    navigate("/users");
  }
  return (
    // Date & Search Row
    <div className="flex items-center gap-7 mb-6">
      
      {/* Date Picker */}
      <div className="relative">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="dd MMM, yyyy"
          customInput={<CustomDateInput />}
        />
      </div>
      
      {/* Search Bar */}
      <div className="relative flex-grow">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-[500px] p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
        <CiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
      </div>

      {/* Participants */}
      <div className="flex items-center bg-gray-100 px-2 py-2 rounded-md shadow-sm cursor-pointer" onClick={goToTaskPage}>
        <div className="flex -space-x-2">
          {[1,2,3,4,5].map((id) => (
            <FaUserCircle key={id} className="w-8 h-8 text-blue-500 bg-white rounded-full border-2 border-white"/>
          ))}
        </div>
        <span className="ml-3 text-sm font-semibold text-gray-600">
          +5
        </span>
      </div>
      
      {/* Add Task Button */}
      <button
        onClick={onAddTaskClick}
        className="px-8 w-[200px] py-2 bg-green-300 hover:bg-green-500 text-gray-500 rounded-md"
      >
        + Add Task
      </button>
    </div>
  );
}