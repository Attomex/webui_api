import React from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "antd";
import { HomeOutlined, MenuOutlined } from "@ant-design/icons";

import { CContainer, CHeader, CHeaderNav, CNavItem } from "@coreui/react";

import { logOut } from "../../../utils/auth";
import { useAuth } from "../context/AuthContext";

const AppHeader = ({ toggleSidebar }) => {
    const { user } = useAuth();
    const name = user?.name;
    const navigate = useNavigate();

    return (
        <CHeader position="sticky" className="mb-4 p-0">
            <CContainer className="border-bottom px-4 d-flex justify-content-between align-items-center" fluid>
                {/* Левая часть */}
                <div className="d-flex align-items-center">
                    <Button
                        icon={<MenuOutlined />}
                        type="text"
                        onClick={toggleSidebar}
                        className="d-lg-none"
                        style={{ fontSize: "20px", marginRight: "10px" }}
                    />
                    <CHeaderNav className="d-none d-md-flex">
                        <CNavItem>
                            <Button
                                onClick={() => navigate("/")}
                                style={{ cursor: "pointer", fontSize: "16px" }}
                                icon={<HomeOutlined />}
                            >
                                Вернуться на сайт
                            </Button>
                            <Button
                                onClick={() => navigate("/admin")}
                                style={{ cursor: "pointer", marginLeft: "10px", fontSize: "16px" }}
                            >
                                Главная
                            </Button>
                        </CNavItem>
                    </CHeaderNav>
                </div>

                {/* Правая часть */}
                <CHeaderNav className="align-items-center">
                    <div style={{ fontSize: "16px" }}>Добро пожаловать, {name}!</div>
                    <li className="nav-item py-1">
                        <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
                    </li>
                    <Button type="primary" onClick={() => logOut()} style={{ fontSize: "16px" }}>
                        Выйти из админ панели
                    </Button>
                </CHeaderNav>
            </CContainer>
        </CHeader>
    );
};

export default AppHeader;
