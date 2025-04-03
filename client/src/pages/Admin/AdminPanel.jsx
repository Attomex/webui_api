import React, { lazy } from "react";
import "./scss/style.scss";

import { Route, Routes, Navigate } from "react-router-dom";

import Comparison from "./pages/Comparison";
// import CreateAdmin from './pages/CreateAdmin'
import ViewReports from "./pages/ViewReports";
import Uploading from "./pages/Uploading";
import DownloadReport from "./pages/DownloadReport";
import VulnerabilitiesPage from "./shared/VulnerabilitiesPage/VulnerabilitiesPage";

import AdminLayout from "./layout/adminLayout";
import ProtectedRoute from "./provider/ProtectedRoute";
import Search from "./pages/Search";
import CreateAdmin from "./pages/CreateAdmin";
import ViewLogs from "./pages/ViewLogs";
// import LoginPage from "./pages/LoginPage";
import { AuthProvider } from "./context/AuthContext";
import RoleProtectedRoute from "./provider/RoleProtectedRoute";

const MainAdmin = lazy(() => import("./pages/MainAdmin"));
// import MainAdmin from "./pages/MainAdmin";

const AdminPanel = () => {
    return (
        <AuthProvider>
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
                                        element={
                                            <RoleProtectedRoute
                                                allowedRoles={["SuperAdmin"]}
                                            >
                                                <CreateAdmin />
                                            </RoleProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="/logs"
                                        element={
                                            <RoleProtectedRoute
                                                allowedRoles={["SuperAdmin"]}
                                            >
                                                <ViewLogs />
                                            </RoleProtectedRoute>
                                        }
                                    />
                                </Routes>
                            </AdminLayout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </AuthProvider>
    );
};

export default AdminPanel;
