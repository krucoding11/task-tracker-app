import React, { createContext, useEffect, useState, useContext } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authToken, setAuthToken] = useState(localStorage.getItem("authToken") || null);

    useEffect(() => {
        if(authToken){
            axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
            localStorage.setItem('authToken', authToken);
            getMe();
        }else{
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('authToken');
            setUser(null);
            setLoading(false);
        }
    },[authToken]);

    const getMe = async ()=>{
        try {
            const response = await axios.get(`${API_URL}/api/auth/me`);
            setUser(response.data.data);
        } catch (error) {
            console.error("logging out", error);
            setAuthToken(null);
        } finally{
            setLoading(false);
        }
    };

    const login = async (work_email, password) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/api/auth/login`, {work_email, password,});
            const { token, user: userData } = response.data;

            setAuthToken(token);
            setUser(userData);
            setLoading(false);

            return{ success: true};
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Login failed due to server error';
            return { success: false, error: errorMessage}
        }
    };

    const logout = async () => {
        setAuthToken(null);
    };

    const value = {
        user,
        authToken,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
};

// --- Custom Hook to use the Auth Context ---
export const useAuth = () => {
  return useContext(AuthContext);
};