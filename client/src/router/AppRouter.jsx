import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Main from "../pages/Main/main";
import Login from "../pages/Login/Login";
import { AuthProvider } from "../pages/Admin/context/AuthContext";

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Main />} />

            <Route
                path="/login"
                element={
                    <AuthProvider>
                        <Login />
                    </AuthProvider>
                }
            />
            <Route path="/*" element={<Navigate to={"/404"} />} />
        </Routes>
    );
};

export default AppRouter;
