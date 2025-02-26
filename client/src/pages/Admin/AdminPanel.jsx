import React from "react";
import "./scss/style.scss";

import { Route, Routes, Navigate } from "react-router-dom";

import Comparison from "./pages/Comparison";
// import CreateAdmin from './pages/CreateAdmin'
import ViewReports from "./pages/ViewReports";
import Uploading from "./pages/Uploading";
import DownloadReport from "./pages/DownloadReport";
import MainAdmin from "./pages/MainAdmin";

import VulnerabilitiesPage from "./shared/VulnerabilitiesPage/VulnerabilitiesPage";

import AdminLayout from "./layout/adminLayout";
import ProtectedRoute from "./provider/ProtectedRoute";
import Search from "./pages/Search";
import CreateAdmin from "./pages/CreateAdmin";
// import LoginPage from "./pages/LoginPage";

const AdminPanel = () => {
    return (
        <>
            <Routes>
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <AdminLayout>
                                <Routes>
                                    <Route path="/" element={<MainAdmin />} />
                                    <Route
                                        path="/comparison"
                                        element={<Comparison />}
                                    />
                                    <Route
                                        path="/view"
                                        element={<ViewReports />}
                                    />
                                    <Route
                                        path="/upload"
                                        element={<Uploading />}
                                    />
                                    <Route
                                        path="/download"
                                        element={<DownloadReport />}
                                    />
                                    <Route
                                        path="/view/vulnerabilities"
                                        element={<VulnerabilitiesPage />}
                                    />
                                    <Route
                                        path="/*"
                                        element={<Navigate to="/admin" />}
                                    />
                                    <Route
                                        path="/search"
                                        element={<Search />}
                                    />
                                    <Route
                                        path="/createAdmin"
                                        element={<CreateAdmin />}
                                    />
                                </Routes>
                            </AdminLayout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    );
};

export default AdminPanel;
