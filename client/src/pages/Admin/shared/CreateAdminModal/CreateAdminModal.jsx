import React, { useState } from "react";
import api from "../../../../utils/api";
import { showErrorNotification, showSuccessNotification } from "../Notification/Notification";
import { Modal, Form, Input, Button } from "antd";

const CreateAdminModal = ({ isModalOpen, handleCancel, getUsers }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await api().post("/api/admin/createadmin", values);
            showSuccessNotification(response.data.message);
            form.resetFields();
            handleCancel();
            getUsers();
        } catch (error) {
            showErrorNotification("Ошибка при создании администратора: " + error.response.data.error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <Modal
            title="Создание администратора"
            open={isModalOpen}
            onCancel={handleCancel}
            footer={null}
            centered
        >
            <div
            // style={{
            //     width: "600px",
            //     border: "1px solid rgb(231, 234, 238)",
            //     padding: "14px",
            //     backgroundColor: "rgb(243, 244, 247)",
            //     borderRadius: "16px",
            // }}
            >
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
        </Modal>
    );
};

export default CreateAdminModal;
