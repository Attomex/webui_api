import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Main from "../pages/Main/main";
import Login from "../pages/Login/Login";

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/*" element={<Navigate to="/" replace />} />
            <Route path="/" element={<Main />} />
            <Route path="/login" element={<Login />} />
        </Routes>
    );
};

export default AppRouter;