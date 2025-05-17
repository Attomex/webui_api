import React, { useState } from "react";
import { AppSidebar, AppFooter, AppHeader } from "../components/index";
import { FloatButton } from "antd";
import { BugOutlined } from "@ant-design/icons";
import Notification from "../shared/Notification/Notification";
import BugReportModal from "../shared/BugReportModal/BugReportModal";

const AdminLayout = ({ children }) => {
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [bugReportModal, setBugReportModal] = useState(false);

    const toggleSidebar = () => {
        setSidebarVisible((prev) => !prev);
    };

    const closeBugReportModal = () => setBugReportModal(false);

    return (
        <div>
            <AppSidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
            <div className="wrapper d-flex flex-column min-vh-100">
                <AppHeader toggleSidebar={toggleSidebar} />
                <div className="body flex-grow-1" style={{ paddingRight: "45px" }}>
                    {children}
                    <BugReportModal openModal={bugReportModal} onClose={closeBugReportModal} />
                    <FloatButton.Group shape="circle" style={{ insetInlineEnd: 5 }}>
                        <FloatButton
                            icon={<BugOutlined />}
                            tooltip={<div>Сообщить об ошибке</div>}
                            onClick={() => setBugReportModal(true)}
                        />
                        <FloatButton.BackTop tooltip={<div>Наверх</div>} style={{ marginBottom: "5px" }} />
                    </FloatButton.Group>
                    <Notification />
                </div>
                <AppFooter />
            </div>
        </div>
    );
};

export default AdminLayout;
