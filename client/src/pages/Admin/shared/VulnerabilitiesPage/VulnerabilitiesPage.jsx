import React, { useState, useEffect, useRef } from "react";
import api from "../../../../utils/api";
import {
    Table,
    Input,
    Button,
    Space,
    Tag,
    ConfigProvider
} from "antd";
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
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");

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

    // Функция для поиска
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters, confirm) => {
        clearFilters();
        setSearchText("");
        confirm({ closeDropdown: false });
    };

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
                            setSearchText(selectedKeys[0]);
                            setSearchedColumn(dataIndex);
                        }}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Фильтр
                    </Button>
                    <Button
                        onClick={() => handleReset(clearFilters, confirm)}
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
                    highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ""}
                />
            ) : (
                text
            ),
    });

    const columns = [
        {
            title: "Идентификатор",
            dataIndex: "identifiers",
            key: "identifiers",
            ...getColumnSearchProps("identifiers"),
        },
        {
            title: "Уровень ошибки",
            dataIndex: "error_level",
            key: "error_level",
            filters: [
                { text: "Критический", value: "Критический" },
                { text: "Высокий", value: "Высокий" },
                { text: "Средний", value: "Средний" },
                { text: "Низкий", value: "Низкий" },
            ],
            filterIcon: (filtered) => (<FilterOutlined style={{ color: "rgb(64, 150, 255)", fontSize: "20px" }}/>),
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
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => {
                        // console.log(record);
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
                        <span style={{ color: "red" }}>{file}</span>
                    </h2>
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
                                pageSizeOptions: ["10", "15", "20", "50"],
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
