import React, { useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import api from "../../../../utils/api";
import { showErrorNotification, showSuccessNotification } from "../Notification/Notification";

const BugReportModal = ({ openModal, onClose }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        const formData = new FormData();
        formData.append("message", values.description);
        formData.append("level", "bugReport");
        formData.append("action", "Отправка сообщения об ошибке");
        try {
            const response = await api().post("/api/logs/send", formData);
            showSuccessNotification(response.data.message);
            form.resetFields();
            onClose();
        } catch (error) {
            showErrorNotification("Ошибка при создании администратора: " + error.response.data.error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Сообщить об ошибке"
            open={openModal}
            onCancel={onClose}
            width={600}
            footer={
                <div
                    style={{
                        color: "rgba(0, 0, 0, 0.65)",
                        fontSize: "12px",
                        textAlign: "center",
                    }}
                >
                    <div>
                        Пожалуйста, введите максимально подробное описание
                        ошибки.
                    </div>
                    <div>
                        Вы можете сделать скриншот, видео и загрузить его в
                        любой облачный сервис и прикрепить ссылку к сообщению.
                    </div>
                </div>
            }
            centered
        >
            <Form
                form={form}
                name="bug_report"
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
            >
                <Form.Item
                    label="Описание ошибки"
                    name="description"
                    rules={[
                        {
                            required: true,
                            message: "Пожалуйста, введите описание ошибки!",
                        },
                    ]}
                >
                    <Input.TextArea style={{ height: "100px" }}/>
                </Form.Item>
                <Form.Item style={{ display: "flex", justifyContent: "right", marginBottom: "0px !important" }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                    >
                        {loading ? "Отправка..." : "Отправить"}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default BugReportModal;
