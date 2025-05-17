import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    CCloseButton,
    CSidebar,
    CSidebarBrand,
    CSidebarHeader,
} from "@coreui/react";
import { useAuth } from "../context/AuthContext";

const AppSidebar = ({ visible, onClose }) => {
    const { user } = useAuth();
    const role = user?.role;

    const [isMobile, setIsMobile] = useState(window.innerWidth < 992); // lg = 992px

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 992);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const commonItems = [
        { name: "Просмотр отчётов", href: "/admin/view" },
        { name: "Загрузка отчётов", href: "/admin/upload" },
        { name: "Сравнить отчёты", href: "/admin/comparison" },
        { name: "Поиск", href: "/admin/search" },
    ];

    const superAdminItem = [
        { name: "Управление", href: "/admin/createAdmin" },
        { name: "Просмотр логов", href: "/admin/logs" },
    ];

    const items = role === "SuperAdmin" ? [...commonItems, ...superAdminItem] : commonItems;

    return (
        <CSidebar
            className="border-end"
            colorScheme="dark"
            position="fixed"
            visible={visible}
            onVisibleChange={(val) => {
                if (!val) onClose?.();
            }}
        >
            <CSidebarHeader className="border-bottom">
                <CSidebarBrand to="/">
                    <img
                        src="/images/png-clipart-logo-graphic-designer-logos-company-logo.png"
                        alt="Logo"
                        height="30"
                    />
                </CSidebarBrand>
                <CCloseButton className="d-lg-none" dark onClick={() => onClose?.()} />
            </CSidebarHeader>

            {items.map((item, index) => (
                <Link
                    key={index}
                    to={item.href}
                    onClick={() => {
                        if (isMobile) onClose?.();
                    }}
                    style={{
                        textDecoration: "none",
                        color: "rgb(243, 244, 247)",
                        fontSize: "18px",
                        padding: "10px",
                        marginLeft: "10px",
                        marginTop: "10px",
                        width: "90%",
                        borderRadius: "10px",
                        borderColor: "rgb(33, 38, 49)",
                        borderWidth: "3px",
                        borderStyle: "solid",
                        transition: "background-color 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(51, 58, 76, 0.4)";
                        e.currentTarget.style.cursor = "pointer";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "";
                        e.currentTarget.style.cursor = "";
                    }}
                >
                    {item.name}
                </Link>
            ))}
        </CSidebar>
    );
};

export default React.memo(AppSidebar);
