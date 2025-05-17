import React, { useState } from "react";
import { Button, Table, Form, Select, InputNumber } from "antd";

const { Option } = Select;

const CreateTaskForm = ({ uniqueFiles, reportNumber, onSubmit, onCancel }) => {
    // console.log(uniqueFiles);
    const [taskItems, setTaskItems] = useState([]);
    const [remainingFiles, setRemainingFiles] = useState([...uniqueFiles]);   
    const [nextId, setNextId] = useState(1);

    const addTaskItem = () => {
        const newItem = {
            id: nextId,
            file: "",
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
        };
        setTaskItems([...taskItems, newItem]);
        setNextId(nextId + 1);
    };

    const updateTaskItem = (id, field, value) => {
        setTaskItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    };

    const handleFileChange = (id, value) => {
        const itemToUpdate = taskItems.find((item) => item.id === id);

        if (itemToUpdate?.file) {
            setRemainingFiles((prev) => [...prev, itemToUpdate.file]);
        }

        updateTaskItem(id, "file", value);
        setRemainingFiles((prev) => prev.filter((f) => f !== value));
    };

    const removeTaskItem = (id) => {
        const itemToRemove = taskItems.find((item) => item.id === id);
        if (itemToRemove?.file) {
            setRemainingFiles((prev) => [...prev, itemToRemove.file]);
        }
        setTaskItems((prev) => prev.filter((item) => item.id !== id));
    };

    const handleSubmit = () => {
        const result = {
            report_number: reportNumber,  // Добавляем номер отчета
            files: taskItems.map((item) => {
                const errorLevels = {};
                
                // Добавляем только те уровни, где значение > 0
                if (item.critical > 0) errorLevels.critical = item.critical;
                if (item.high > 0) errorLevels.high = item.high;
                if (item.medium > 0) errorLevels.medium = item.medium;
                if (item.low > 0) errorLevels.low = item.low;
    
                return {
                    file: item.file,
                    error_levels: errorLevels
                };
            }).filter(item => item.file)  // Фильтруем пустые файлы
        };
        onSubmit(result);
    };

    const columns = [
        {
            title: "Файл",
            dataIndex: "file",
            key: "file",
            width: "40%",
            render: (value, record) => {
                const truncateText = (text) => {
                    if (!text) return "";
                    return text.length > 100 ? `${text.substring(0, 100)}...` : text;
                };
                return (
                    <Form.Item rules={[{ required: true, message: "Выберите файл" }]} style={{ margin: 0 }}>
                        <Select
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                            value={truncateText(value)}
                            onChange={(val) => handleFileChange(record.id, val)}
                            placeholder="Выберите файл"
                            style={{ width: "100%" }}
                        >
                            {remainingFiles.map((file) => (
                                <Option key={file} value={file}>
                                    {file}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                );
            },
        },
        {
            title: "Критические",
            dataIndex: "critical",
            key: "critical",
            width: "8%",
            render: (value, record) => (
                <Form.Item style={{ margin: 0 }}>
                    <InputNumber
                        min={0}
                        value={value}
                        onChange={(val) => updateTaskItem(record.id, "critical", val || 0)}
                        style={{ width: "100%" }}
                    />
                </Form.Item>
            ),
        },
        {
            title: "Высокие",
            dataIndex: "high",
            key: "high",
            width: "8%",
            render: (value, record) => (
                <Form.Item style={{ margin: 0 }}>
                    <InputNumber min={0} value={value} onChange={(val) => updateTaskItem(record.id, "high", val || 0)} style={{ width: "100%" }} />
                </Form.Item>
            ),
        },
        {
            title: "Средние",
            dataIndex: "medium",
            width: "8%",
            key: "medium",
            render: (value, record) => (
                <Form.Item style={{ margin: 0 }}>
                    <InputNumber min={0} value={value} onChange={(val) => updateTaskItem(record.id, "medium", val || 0)} style={{ width: "100%" }} />
                </Form.Item>
            ),
        },
        {
            title: "Низкие",
            dataIndex: "low",
            key: "low",
            width: "8%",
            render: (value, record) => (
                <Form.Item style={{ margin: 0 }}>
                    <InputNumber min={0} value={value} onChange={(val) => updateTaskItem(record.id, "low", val || 0)} style={{ width: "100%" }} />
                </Form.Item>
            ),
        },
        {
            title: "Действия",
            key: "action",
            width: "15%",
            render: (_, record) => (
                <Button danger onClick={() => removeTaskItem(record.id)}>
                    Удалить
                </Button>
            ),
        },
    ];

    return (
        <div style={{ marginTop: 24, border: "1px solid rgb(243, 244, 248)", borderRadius: "5px", padding: "16px"}}>
            <Button type="primary" onClick={addTaskItem} style={{ marginBottom: 16 }}>
                Добавить файл к заданию
            </Button>

            <Table
                dataSource={taskItems}
                bordered
                columns={columns}
                pagination={{
                    pageSize: 10,
                    position: "bottomRight",
                    locale: {
                        items_per_page: "/ на странице",
                    },
                    onChange: () => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    },
                }}
                rowKey="id"
            />

            <div style={{ marginTop: 16, textAlign: "right", marginBottom: 16 }}>
                <Button onClick={onCancel} style={{ marginRight: 8 }}>
                    Отмена
                </Button>
                <Button type="primary" onClick={handleSubmit} disabled={taskItems.length === 0}>
                    Сформировать задание
                </Button>
            </div>
        </div>
    );
};

export default CreateTaskForm;
