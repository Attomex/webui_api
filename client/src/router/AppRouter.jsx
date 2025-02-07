import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Main from "../pages/Main/main";

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/*" element={<Navigate to="/" replace />} />
            <Route path="/" element={<Main />} />
        </Routes>
    );
};

export default AppRouter;