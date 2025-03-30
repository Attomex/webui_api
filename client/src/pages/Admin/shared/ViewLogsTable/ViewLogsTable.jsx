import React, { useState, useRef } from "react";
import { Table, Input, Button, Space, ConfigProvider, Tag } from "antd";
import { SearchOutlined, EyeOutlined, FilterOutlined, BugOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import "antd/dist/reset.css";
import LogDetailsModal from "../LogDetailsModal/LogDetailsModal";

const ViewLogs = ({ logs }) => {
    const [searchTexts, setSearchTexts] = useState({}); // Состояние поиска для каждого столбца
    const [searchedColumns, setSearchedColumns] = useState({}); // Состояние подсветки для каждого столбца
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedLogData, setSelectedLogData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageSize, setCurrentPageSize] = useState(10);
    const searchInput = useRef(null);

    // Обработчик поиска
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchTexts((prev) => ({ ...prev, [dataIndex]: selectedKeys[0] }));
        setSearchedColumns((prev) => ({ ...prev, [dataIndex]: true }));
    };

    // Обработчик сброса поиска
    const handleReset = (clearFilters, dataIndex, confirm) => {
        clearFilters();
        setSearchTexts((prev) => ({ ...prev, [dataIndex]: "" }));
        setSearchedColumns((prev) => ({ ...prev, [dataIndex]: false }));
        confirm();
    };

    // Функция для получения свойств поиска для столбца
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
            close,
        }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Поиск ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() =>
                        handleSearch(selectedKeys, confirm, dataIndex)
                    }
                    style={{ marginBottom: 8, display: "block" }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() =>
                            handleSearch(selectedKeys, confirm, dataIndex)
                        }
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Поиск
                    </Button>
                    <Button
                        onClick={() =>
                            handleReset(clearFilters, dataIndex, confirm)
                        }
                        size="small"
                        style={{ width: 90 }}
                    >
                        Сброс
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            setSearchTexts((prev) => ({
                                ...prev,
                                [dataIndex]: selectedKeys[0],
                            }));
                            setSearchedColumns((prev) => ({
                                ...prev,
                                [dataIndex]: true,
                            }));
                        }}
                    >
                        Фильтр
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        Закрыть
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? "rgb(64, 150, 255)" : undefined,
                    fontSize: "20px",
                }}
            />
        ),
        onFilter: (value, record) => {
            const dataString =
                typeof record[dataIndex] === "object"
                    ? JSON.stringify(record[dataIndex])
                    : record[dataIndex].toString();
            return dataString.toLowerCase().includes(value.toLowerCase());
        },
        render: (text) => {
            const dataString =
                typeof text === "object" ? JSON.stringify(text) : text;
            return searchedColumns[dataIndex] ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                    searchWords={[searchTexts[dataIndex]]}
                    autoEscape
                    textToHighlight={dataString}
                />
            ) : (
                dataString
            );
        },
    });

    const columns = [
        {
            title: "Номер",
            key: "index",
            width: "5%",
            render: (text, record, index) => {
                const rowNumber =
                    (currentPage - 1) * currentPageSize + index + 1;
                return rowNumber;
            },
        },
        {
            title: "Уровень",
            dataIndex: "level",
            key: "level",
            filters: [
                { text: "Информация", value: "Информация" },
                { text: "Ошибка", value: "Ошибка" },
                { text: "Предупреждение", value: "Предупреждение" },
                { text: "Баг репорт", value: "Баг репорт" },
            ],
            onFilter: (value, record) => record.level === value, // Фильтрация по значению
            render: (level) => {
                switch (level) {
                    case "Информация":
                        return <Tag color="blue">{level}</Tag>;
                    case "Ошибка":
                        return <Tag color="red">{level}</Tag>;
                    case "Предупреждение":
                        return <Tag color="orange">{level}</Tag>;
                    case "Баг репорт":
                        return <Tag icon={<BugOutlined />} color="purple">{level}</Tag>;
                    default:
                        return <Tag color="gray">{level}</Tag>;
                }
            },
        },
        {
            title: "Время",
            dataIndex: "time",
            key: "time",
            width: "12%",
        },
        {
            title: "Почта администратора",
            dataIndex: "user_email",
            key: "user_email",
            ...getColumnSearchProps("user_email"),
        },
        {
            title: "Действие администратора",
            dataIndex: "action",
            key: "action",
            filters: [
                { text: "Авторизация", value: "Авторизация" },
                { text: "Просмотр", value: "Просмотр" },
                { text: "Загрузка", value: "Загрузка" },
            ],
            onFilter: (value, record) => record.action === value, // Строгое сравнение
            filterIcon: (filtered) => (
                <FilterOutlined
                    style={{
                        color: filtered ? "rgb(64, 150, 255)" : undefined,
                        fontSize: "20px",
                    }}
                />
            ),
        },
        {
            title: "Данные",
            dataIndex: "data",
            key: "data",
            ...getColumnSearchProps("data"),
            render: (data) => {
                const dataString =
                    typeof data === "object" ? JSON.stringify(data) : data;
                return searchedColumns["data"] ? (
                    <Highlighter
                        highlightStyle={{
                            backgroundColor: "#ffc069",
                            padding: 0,
                        }}
                        searchWords={[searchTexts["data"]]}
                        autoEscape
                        textToHighlight={dataString}
                    />
                ) : (
                    dataString
                );
            },
        },
        {
            title: "Действие",
            key: "action",
            width: "10%",
            render: (_, record) => (
                <Button
                    style={{
                        display: "block", // Делаем кнопку блочным элементом
                        margin: "0 auto", // Центрируем её в ячейке
                    }}
                    type="primary"
                    icon={<EyeOutlined style={{ marginRight: "5px" }} />}
                    onClick={() => handleViewDetails(record)}
                >
                    Просмотр
                </Button>
            ),
        },
    ];

    const handleViewDetails = (log) => {
        setSelectedLogData(log); // Передаем весь объект лога
        setIsModalVisible(true);
    };

    return (
        <div style={{ marginTop: "20px" }}>
            <ConfigProvider
                theme={{
                    components: {
                        Table: {
                            cellFontSize: "16px",
                            colorBgContainer: "rgb(243, 244, 247)",
                            borderColor: "rgb(204, 204, 204)",
                        },
                    },
                }}
            >
                <Table
                    columns={columns}
                    dataSource={logs} // Используем исходные логи
                    bordered
                    pagination={{
                        defaultPageSize: 10,
                        showSizeChanger: true,
                        position: ["topRight", "bottomRight"],
                        pageSizeOptions: ["10", "15", "25", "50", "100"],
                        locale: {
                            items_per_page: "/ на странице",
                        },
                        onChange: (page, pageSize) => {
                            setCurrentPage((prev) => page);
                            setCurrentPageSize((prev) => pageSize);
                            document.documentElement.scrollTop = 0;
                        },
                    }}
                    style={{
                        borderRadius: "10px",
                        border: "1px solid rgb(244, 246, 248)",
                    }}
                    rowKey={(record, index) => `${record.time}-${index}`} // Уникальный ключ
                />
            </ConfigProvider>

            <LogDetailsModal
                isModalVisible={isModalVisible}
                setIsModalVisible={setIsModalVisible}
                selectedLogData={selectedLogData}
            />
        </div>
    );
};

export default ViewLogs;
