import React, { useState } from "react";
import { AppSidebar, AppFooter, AppHeader } from "../components/index";
import { FloatButton } from "antd";
import { BugOutlined } from "@ant-design/icons";
import Notification from "../shared/Notification/Notification";
import BugReportModal from "../shared/BugReportModal/BugReportModal";

const AdminLayout = ({ children }) => {
    const [bugReportModal, setBugReportModal] = useState(false);

    const showBugReportModal = () => {
        // console.log("open");
        setBugReportModal(true);
    };

    const closeBugReportModal = () => {
        // console.log("close");
        setBugReportModal(false);
    };

    return (
        <div>
            <AppSidebar />
            <div className="wrapper d-flex flex-column min-vh-100">
                <AppHeader />
                <div
                    className="body flex-grow-1"
                    style={{ paddingRight: "45px" }}
                >
                    {children}
                    <BugReportModal
                        openModal={bugReportModal}
                        onClose={closeBugReportModal}
                    />
                    <FloatButton.Group shape="circle" style={{ insetInlineEnd: 5 }}>
                        <FloatButton
                            icon={<BugOutlined />}
                            tooltip={<div>Сообщить об ошибке</div>}
                            onClick={showBugReportModal}
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
