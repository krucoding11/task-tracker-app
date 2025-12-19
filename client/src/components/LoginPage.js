import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { login, authToken, loading } = useAuth(); 

  // Only redirect if authToken exists AND loading is finished
  useEffect(() => {
    if (!loading && authToken) {
      navigate("/project-task");
    }
  }, [authToken, loading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError(null);

    const result = await login(email, password);

    if (result.success) {
      localStorage.setItem("currentEmail", email);
      navigate("/project-task");
    } else {
      setError(result.error || "Login failed. Please try again");
    }
  };

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-gray-800">Task Tracker App</h1>
        <form className="space-y-4" onSubmit={handleLogin}>
          {error && (
            <div className="p-3 text-sm font-medium text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-1">Work Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              // onChange={(e) => {setEmail(e.target.value); console.log("Email change", e.target.value); e.preventDefault();}}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => {
                console.log("Final Email", email);
              }}
              
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700 block mb-1">Password:</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => {setPassword(e.target.value); e.preventDefault();}}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <IoEyeOffOutline className="h-5 w-5"/> : <IoEyeOutline className="h-5 w-5"/>}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-6 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

