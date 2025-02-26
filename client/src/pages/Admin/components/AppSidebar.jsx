import React from "react";
// import { useRole } from "../hooks/useRole";
import { Link } from 'react-router-dom';

import {
    CCloseButton,
    CSidebar,
    CSidebarBrand,
    CSidebarFooter,
    CSidebarHeader,
    CSidebarToggler,
} from "@coreui/react";

const AppSidebar = () => {
    const role = 'SuperAdmin';

    const commonItems = [
        { name: "Просмотр отчётов", href: '/admin/view' },
        { name: "Загрузка отчётов", href: '/admin/upload' },
        { name: "Сравнить отчёты", href: '/admin/comparison' },
        { name: "Скачать отчёт", href: '/admin/download' },
        { name: "Поиск", href: '/admin/search' },
    ];

    const superAdminItem = {
        name: "Управление",
        href: '/admin/createAdmin',
    };

    const items = role === 'SuperAdmin' ? [...commonItems, superAdminItem] : commonItems;

    return (
        <CSidebar className="border-end" colorScheme="dark" position="fixed">
            <CSidebarHeader className="border-bottom">
                <CSidebarBrand Link="/">
                    <img
                        src="/images/png-clipart-logo-graphic-designer-logos-company-logo.png"
                        alt="Logo"
                        height="30"
                    />
                </CSidebarBrand>
                <CCloseButton className="d-lg-none" dark />
            </CSidebarHeader>
            {items.map((item, index) => (
                <Link
                    key={index}
                    to={item.href}
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
                        transition: "background-color 0.3s ease", // Добавляем плавный переход
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                            "rgba(51, 58, 76, 0.4)"; // Изменяем цвет с прозрачностью
                        e.currentTarget.style.cursor = "pointer"; // Изменяем курсор мыши
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = ""; // Возвращаем исходный цвет
                        e.currentTarget.style.cursor = ""; // Возвращаем исходный курсор мыши
                    }}
                    onClick={(e) => {
                        e.currentTarget.style.backgroundColor = ""; // Возвращаем исходный цвет
                        e.currentTarget.style.cursor = ""; // Возвращаем исходный курсор мыши
                        // handleClick(e, item.href);
                    }}
                >
                    {item.name}
                </Link>
            ))}
        </CSidebar>
    );
};

export default React.memo(AppSidebar);
