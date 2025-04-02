import React, { useState, useEffect } from "react";
import { Button, Table, ConfigProvider, Spin, Empty } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import api from "../../../utils/api";
import { showErrorNotification, showSuccessNotification } from "../shared/Notification/Notification";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import CreateAdminModal from "../shared/CreateAdminModal/CreateAdminModal";

const CreateAdmin = () => {
    const [users, setUsers] = useState([]);
    const [modalOpened, setModalOpened] = useState(false);
    const [loading, setLoading] = useState(true);

    const getUsers = async () => {
        try {
            setLoading(true);
            const response = await api().get("/api/admin/createadmin");
            setUsers(response.data);
        } catch (error) {
            showErrorNotification("Ошибка при загрузке пользователей.");
            setUsers([]); // Устанавливаем пустой массив в случае ошибки
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUsers();
    }, []);

    const showModal = () => {
        setModalOpened(true);
    };

    const handleCancel = () => {
        setModalOpened(false);
    };

    const handleDelete = (userId) => {
        confirmAlert({
            title: "Подтверждение удаления",
            message: "Вы уверены, что хотите удалить этого администратора?",
            buttons: [
                {
                    label: "Да",
                    onClick: async () => {
                        await api()
                            .delete(`/api/admin/deleteadmin/${userId}`)
                            .then((response) => {
                                showSuccessNotification(response.data.message);
                            })
                            .catch((error) => {
                                showErrorNotification("Не удалось удалить администратора", error);
                            });
                        getUsers();
                    },
                },
                {
                    label: "Нет",
                    onClick: () => {},
                },
            ],
        });
    };

    const columns = [
        {
            title: "Имя",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Почта",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Роль",
            dataIndex: "role",
            key: "role",
        },
        {
            title: "Возможности",
            key: "action",
            render: (_, record) => (
                <Button
                    type="primary"
                    danger
                    onClick={() => handleDelete(record.id)}
                >
                    Удалить
                </Button>
            ),
        },
    ];

    return (
        <div style={{ marginLeft: "10px" }}>
            <h2>Управление администраторами</h2>
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: 16,
                }}
            >
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showModal}
                >
                    Зарегистрировать нового работника
                </Button>
            </div>

            {loading ? (
                <Spin
                    size="large"
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: 50,
                    }}
                />
            ) : users.length > 0 ? (
                <div>
                    <ConfigProvider
                        theme={{
                            components: {
                                Table: {
                                    cellFontSize: 16,
                                    colorBgContainer: "rgb(243, 244, 247)",
                                    borderColor: "rgb(204, 204, 204)",
                                },
                            },
                        }}
                    >
                        <Table
                            dataSource={users}
                            columns={columns}
                            rowKey="id"
                            pagination={{
                                defaultPageSize: 10,
                                showSizeChanger: true,
                                position: ["bottomRight"],
                                pageSizeOptions: ["10", "15", "20"],
                                locale: {
                                    items_per_page: "/ на странице",
                                },
                                onChange: (page, pageSize) => {
                                    document.documentElement.scrollTop = 0;
                                },
                            }}
                            bordered
                        />
                    </ConfigProvider>
                </div>
            ) : (
                <Empty description="Администраторов не найдено" />
            )}
            <CreateAdminModal
                isModalOpen={modalOpened}
                handleCancel={handleCancel}
                getUsers={getUsers}
            />
        </div>
    );
};

export default CreateAdmin;