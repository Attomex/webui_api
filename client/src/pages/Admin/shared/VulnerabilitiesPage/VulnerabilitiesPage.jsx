import React, { useState, useEffect, useRef } from "react";
import api from "../../../../utils/api";
import { Table, Input, Button, Space, Tag, ConfigProvider } from "antd";
import { SearchOutlined, EyeOutlined, FilterOutlined } from "@ant-design/icons";
import ButtonDetails from "../ButtonDetails/ButtonDetails";
import Highlighter from "react-highlight-words";
import "../../scss/style.scss";
import { Link, useLocation } from "react-router-dom";
import {
    showErrorNotification,
    showSuccessNotification,
} from "../Notification/Notification";
import "react-toastify/dist/ReactToastify.css";
import { Alert } from "react-bootstrap";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

const VulnerabilitiesPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const fileId = queryParams.get("fileId");
    const reportId = queryParams.get("reportId");

    const [file, setFile] = useState([]);
    const [selectedVulnerability, setSelectedVulnerability] = useState(null);
    const [visible, setVisible] = useState(false);
    const [vulnerabilities, setVulnerabilities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const searchInput = useRef(null);
    const [searchTexts, setSearchTexts] = useState({}); // Состояние поиска для каждого столбца
    const [searchedColumns, setSearchedColumns] = useState({}); // Состояние подсветки для каждого столбца
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageSize, setCurrentPageSize] = useState(15);

    const openModal = (vulnerability) => {
        setSelectedVulnerability(vulnerability);
        setVisible(true);
    };

    useEffect(() => {
        document.title = "Связные уязвимости";
    }, []);

    useEffect(() => {
        if (!fileId || !reportId) return;

        const fetchVulnerabilities = async () => {
            setIsLoading(true);
            try {
                const response = await api().get(
                    `/api/admin/view/vulnerabilities?fileId=${fileId}&reportId=${reportId}`
                );
                setFile(response.data.file.file_path);
                setVulnerabilities(response.data.vulnerabilities);
                showSuccessNotification("Уязвимости успешно загружены");
                // console.log(response.data.vulnerabilities);
            } catch (error) {
                console.error("Error fetching vulnerabilities:", error);
                showErrorNotification("Ошибка при получении уязвимостей");
            } finally {
                setIsLoading(false);
            }
        };

        fetchVulnerabilities();
    }, [fileId, reportId]);

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <LoadingSpinner
                    text="Загрузка связных уязвимостей..."
                    variant="info"
                    animation="border"
                />
            </div>
        );
    }

    const changeFileTextLength = (text) => {
        if (text.length > 80) {
            return text.slice(0, 80) + "...";
        }
        return text;
    };

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
                        size="small"
                        style={{ width: 90 }}
                    >
                        Фильтр
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
                    <Button type="link" size="small" onClick={() => close()}>
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
            const dataString = record[dataIndex]
                ? record[dataIndex].toString().toLowerCase()
                : "";
            return dataString.includes(value.toLowerCase());
        },
        render: (text) => {
            const dataString = text ? text.toString() : "";
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
            title: "Идентификатор",
            dataIndex: "identifiers",
            key: "identifiers",
            ...getColumnSearchProps("identifiers"),
        },
        {
            title: "CPE",
            dataIndex: "cpe",
            key: "cpe",
            ...getColumnSearchProps("cpe"),
        },
        {
            title: "Уровень ошибки",
            dataIndex: "error_level",
            key: "error_level",
            width: "25%",
            filters: [
                { text: "Критический", value: "Критический" },
                { text: "Высокий", value: "Высокий" },
                { text: "Средний", value: "Средний" },
                { text: "Низкий", value: "Низкий" },
            ],
            filterIcon: (filtered) => (
                <FilterOutlined
                    style={{ color: "rgb(64, 150, 255)", fontSize: "20px" }}
                />
            ),
            onFilter: (value, record) => record.error_level === value,
            render: (errorLevel) => {
                let color = "";
                switch (errorLevel) {
                    case "Критический":
                        color = "red";
                        break;
                    case "Высокий":
                        color = "orange";
                        break;
                    case "Средний":
                        color = "yellow";
                        break;
                    case "Низкий":
                        color = "green";
                        break;
                    default:
                        color = "gray";
                }
                return <Tag color={color}>{errorLevel}</Tag>;
            },
        },
        {
            title: "Действия",
            key: "actions",
            width: "18%",
            render: (_, record) => (
                <Button
                    type="primary"
                    style={{
                        display: "block", // Делаем кнопку блочным элементом
                        margin: "0 auto", // Центрируем её в ячейке
                    }}
                    icon={<EyeOutlined style={{ marginRight: "5px" }} />}
                    onClick={() => {
                        openModal(record);
                    }}
                >
                    Показать подробности
                </Button>
            ),
        },
    ];

    return (
        <div style={{ marginLeft: "10px" }}>
            {reportId === null || fileId === null ? (
                <Alert variant="danger">
                    Ошибка: Отсутствует fileId или reportId в параметрах
                    запроса. Невозможно загрузить связные уязвимости.
                    <br />
                    <Link to="/admin/view">
                        Вернуться на страницу просмотра
                    </Link>
                </Alert>
            ) : (
                <>
                    <h2>
                        Связные уязвимости для файла:{" "}
                        <span style={{ color: "red" }}>{changeFileTextLength(file)}</span>
                    </h2>
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
                            dataSource={vulnerabilities}
                            columns={columns}
                            bordered
                            style={{
                                width: "90%",
                                borderRadius: "10px",
                                border: "1px solid rgb(244, 246, 248)",
                            }}
                            rowKey="id"
                            pagination={{
                                defaultPageSize: 15,
                                showSizeChanger: true,
                                position: ["topRight", "bottomRight"],
                                pageSizeOptions: ["10", "15", "20", "50"],
                                locale: {
                                    items_per_page: "/ на странице",
                                },
                                onChange: (page, pageSize) => {
                                    setCurrentPageSize((prev) => pageSize);
                                    setCurrentPage((prev) => page);
                                    document.documentElement.scrollTop = 0;
                                },
                            }}
                        />
                    </ConfigProvider>
                    {selectedVulnerability ? (
                        <ButtonDetails
                            selectedVulnerability={selectedVulnerability}
                            visible={visible}
                            onClose={() => setVisible(false)}
                        />
                    ) : (
                        <></>
                    )}
                </>
            )}
        </div>
    );
};

export default VulnerabilitiesPage;