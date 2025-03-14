import React, { useState, useEffect } from "react";
import { Form, Input, Button, Table } from "antd";
import api from "../../../utils/api";
import showErrorNotification from "../shared/Notification/Notification";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const CreateAdmin = () => {
    const [form] = Form.useForm();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getUsers = async () => {
            try {
                const response = await api().get("/api/admin/createadmin");
                setUsers(response.data);
            } catch (error) {
                // console.error("Error loading users", error);
                showErrorNotification("Ошибка при загрузке пользователей.");
            }
        };
        getUsers();
    }, []);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await api().post("/api/admin/createadmin", values);
            alert("Администратор успешно создан.");
            form.resetFields();
            window.location.reload();
        } catch (error) {
            // console.error("Error creating admin", error);
            showErrorNotification("Ошибка при создании администратора.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (userId) => {
        console.log(userId);
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
                                alert(response.data.message);
                            })
                            .catch((error) => {
                                console.error("Error deleting user", error);
                            });
                        window.location.reload(true);
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
            <h2>Создание нового администратора</h2>
            <div style={{ width: "600px", border: "1px solid rgb(231, 234, 238)", padding: "14px", backgroundColor: "rgb(243, 244, 247)", borderRadius: "16px" }}>
                <Form
                    form={form}
                    name="create_admin"
                    onFinish={onFinish}
                    layout="vertical"
                    autoComplete="off"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <Form.Item
                        label="Имя"
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: "Пожалуйста, введите имя!",
                            },
                        ]}
                    >
                        <Input placeholder="Введите имя" />
                    </Form.Item>

                    <Form.Item
                        label="Почта"
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: "Пожалуйста, введите почту!",
                            },
                            {
                                type: "email",
                                message: "Некорректный формат почты!",
                            },
                        ]}
                    >
                        <Input placeholder="Введите почту" />
                    </Form.Item>

                    <Form.Item
                        label="Пароль"
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: "Пожалуйста, введите пароль!",
                            },
                            {
                                min: 8,
                                message:
                                    "Пароль должен содержать не менее 8 символов!",
                            },
                        ]}
                    >
                        <Input.Password placeholder="Введите пароль" />
                    </Form.Item>

                    <Form.Item
                        label="Подтверждение пароля"
                        name="password_confirmation"
                        dependencies={["password"]}
                        rules={[
                            {
                                required: true,
                                message: "Пожалуйста, подтвердите пароль!",
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (
                                        !value ||
                                        getFieldValue("password") === value
                                    ) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(
                                        new Error("Пароли не совпадают!")
                                    );
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Подтвердите пароль" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                        >
                            Зарегистрировать нового администратора
                        </Button>
                    </Form.Item>
                </Form>
            </div>

            {users.length > 0 && (
                <div>
                    <h1>Список администраторов</h1>
                    <Table
                        dataSource={users}
                        columns={columns}
                        rowKey="id"
                        pagination={false}
                        style={{ marginTop: "20px" }}
                    />
                </div>
            )}
        </div>
    );
};

export default CreateAdmin;