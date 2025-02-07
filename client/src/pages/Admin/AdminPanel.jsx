import React, { useEffect } from "react";
import "./scss/style.scss";

import Main_admin from "./pages/Main_Admin";
import { Route, Routes, Navigate } from "react-router-dom";

import Comparison from "./pages/Comparison";
// import CreateAdmin from './pages/CreateAdmin'
import ViewReports from "./pages/ViewReports";
import Uploading from "./pages/Uploading";
import DownloadReport from "./pages/DownloadReport";

import VulnerabilitiesPage from "./shared/VulnerabilitiesPage/VulnerabilitiesPage";

import AdminLayout from "./layout/adminLayout";
// import LoginPage from "./pages/LoginPage";

const AdminPanel = () => {
  return (
    <>
      <Routes>
        <>
          <Route path="/*" element={<Navigate to="/admin" />} />

          {/* <Route path="/login" element={<LoginPage />} /> */}

          <Route
            path="/"
            element={
              <AdminLayout>
                <Main_admin />
              </AdminLayout>
            }
          />

          <Route
            path="/comparison"
            element={
              <AdminLayout>
                <Comparison />
              </AdminLayout>
            }
          ></Route>

          {/* <Route
            path="/createadmin"
            element={
                <AdminLayout>
                  <CreateAdmin />
                </AdminLayout>
            }
          /> */}

          <Route
            path="/view"
            element={
              <AdminLayout>
                <ViewReports />
              </AdminLayout>
            }
          ></Route>

          <Route
            path="/upload"
            element={
              <AdminLayout>
                <Uploading />
              </AdminLayout>
            }
          ></Route>

          <Route
            path="/download"
            element={
              <AdminLayout>
                <DownloadReport />
              </AdminLayout>
            }
          ></Route>

          <Route
            path="/view/vulnerabilities"
            element={
              <AdminLayout>
                <VulnerabilitiesPage />
              </AdminLayout>
            }
          ></Route>
        </>
      </Routes>
    </>
  );
};

export default AdminPanel;
