import React, { useRef, useState } from "react";
import { Table, Input, Button, Space, ConfigProvider } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import "antd/dist/reset.css";

const FileTable = ({
    files,
    reportId,
    filesCount,
    selectedComputer,
    selectedDate,
    selectedReportNumber,
}) => {
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef(null);

    // Обработчик для поиска
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    // Обработчик для сброса поиска
    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText("");
    };

    // Функция для получения свойств столбца с поиском
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
            close,
        }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
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
                    style={{
                        marginBottom: 8,
                        display: "block",
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() =>
                            handleSearch(selectedKeys, confirm, dataIndex)
                        }
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Поиск
                    </Button>
                    <Button
                        onClick={() =>
                            clearFilters && handleReset(clearFilters)
                        }
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Сброс
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({
                                closeDropdown: false,
                            });
                            setSearchText(selectedKeys[0]);
                            setSearchedColumn(dataIndex);
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
                    color: "rgb(64, 150, 255)",
                    fontSize: "20px",
                }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase()),
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{
                        backgroundColor: "#ffc069",
                        padding: 0,
                    }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ""}
                />
            ) : (
                text
            ),
    });

    // Колонки для таблицы
    const columns = [
        {
            title: "Ссылка на файл",
            dataIndex: "file_path",
            key: "file_path",
            ...getColumnSearchProps("file_path"),
        },
        {
            title: "Действия",
            key: "actions",
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={() => handleViewVulnerabilities(record.id)}
                >
                    Посмотреть уязвимости
                </Button>
            ),
        },
    ];

    // Обработчик для просмотра уязвимостей
    const handleViewVulnerabilities = (file_id) => {
        const queryParams = new URLSearchParams({
            fileId: file_id,
            reportId: reportId,
        }).toString();
        window.open(`/admin/view/vulnerabilities?${queryParams}`, "_blank");
    };

    // Преобразование данных в массив
    const fileArray = Object.keys(files).map((key) => files[key]);

    return (
        <div style={{ marginLeft: "10px" }}>
            <p>Идентификатор компьютера: <span style={{ fontWeight: "bold" }}>{selectedComputer}</span></p>
            <p>Дата отчёта: <span style={{ fontWeight: "bold" }}>{selectedDate}</span></p>
            <p>Номер отчёта: <span style={{ fontWeight: "bold" }}>{selectedReportNumber}</span></p>
            <h2>Файлы с уязвимостями (было найдено {filesCount} файлов)</h2>
            {/* Таблица Ant Design */}
            <ConfigProvider
                theme={{
                    components: {
                        Table: {
                            cellFontSize: "16px",
                            colorBgContainer: "rgb(243, 244, 247)"
                        },
                    },
                }}
            >
                <Table
                    columns={columns}
                    dataSource={fileArray}
                    bordered
                    pagination={{
                        defaultPageSize: 15,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "15", "20", "50", "100"],
                    }}
                    rowKey="id"
                    style={{
                        width: "90%",
                        borderRadius: "10px",
                        border: "1px solid rgb(244, 246, 248)",
                    }}
                />
            </ConfigProvider>
        </div>
    );
};

export default FileTable;
