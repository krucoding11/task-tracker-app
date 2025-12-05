import React from "react";
import { FaUserCircle } from "react-icons/fa";
import {  useNavigate } from "react-router-dom";
import { FaAngleLeft } from "react-icons/fa6";
function UserPage() {
  const navigate = useNavigate();
  // const location = useLocation();

  const loggedEmail = localStorage.getItem('currentEmail') || "user@example.com";

  const currentUser = {
    name: "Admin User",
    email: loggedEmail,
  };

  const goToTaskPage = () => {
    navigate("/task");
  }
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <button onClick={goToTaskPage} className="flex items-center text-blue-500 hover:text-blue-700 transition mb-6 font-medium">
        <FaAngleLeft />
      </button>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">User Page</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
        <div className="items-center space-x-4">
          <FaUserCircle className="mr-2" />
          <div>
       
            <p className="text-sm text-gray-500">{currentUser.email}</p>
          </div>
        </div>

        <button className="mt-4 w-full py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700 transition">
          View Profile
        </button>
      </div>
    </div>
  );
}

export default UserPage;
