import React, { useRef, useState } from "react";
import { Table, Input, Button, Space, ConfigProvider, Modal, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import "antd/dist/reset.css";

const FileTable = ({
    files,
    reportId,
    filesCount,
    errorLevels,
    reportStatus,
    selectedComputer,
    selectedDate,
    selectedReportNumber,
}) => {
    const [searchText, setSearchText] = useState("");
    // const [searchedColumn, setSearchedColumn] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false); // Состояние для модального окна
    const [selectedFileLink, setSelectedFileLink] = useState(""); // Состояние для хранения выбранной ссылки
    const [currentPage, setCurrentPage] = useState(1); // Состояние для текущей страницы
    const [currentPageSize, setCurrentPageSize] = useState(15);
    const searchInput = useRef(null);

    // Обработчик для поиска
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        // setSearchedColumn(dataIndex);
    };

    // Обработчик для сброса поиска
    const handleReset = (clearFilters, confirm) => {
        clearFilters();
        setSearchText("");
        confirm();
    };

    // Функция для обрезки текста с учетом подсветки
    const truncateTextWithHighlight = (text, searchWords, maxLength = 100) => {
        if (text.length <= maxLength) return text;

        const firstPart = text.slice(0, 40); // Первые 40 символов
        const lastPart = text.slice(-60); // Последние 60 символов

        // Ищем совпадения в обрезанном тексте
        const matches = searchWords.flatMap((word) => {
            const regex = new RegExp(word, "gi");
            return [...text.matchAll(regex)].map((match) => match.index);
        });

        // Если есть совпадения, показываем текст вокруг них
        if (matches.length > 0) {
            const matchIndex = matches[0]; // Первое совпадение
            const start = Math.max(matchIndex - 30, 0); // 30 символов до совпадения
            const end = Math.min(matchIndex + 30, text.length); // 30 символов после совпадения
            return `${firstPart}...${text.slice(start, end)}...${lastPart}`;
        }

        // Если совпадений нет, возвращаем стандартный обрезанный текст
        return `${firstPart}...${lastPart}`;
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
                            clearFilters && handleReset(clearFilters, confirm)
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
                            // setSearchedColumn(dataIndex);
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
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase()),
        render: (text) => {
            const truncatedText = truncateTextWithHighlight(text, [searchText]);
            return (
                <span
                    style={{
                        cursor: "pointer",
                        color: "rgb(64, 150, 255)",
                    }}
                    onClick={() => {
                        setSelectedFileLink(text); // Устанавливаем выбранную ссылку
                        setIsModalVisible(true); // Открываем модальное окно
                    }}
                >
                    <Highlighter
                        highlightStyle={{
                            backgroundColor: "#ffc069",
                            padding: 0,
                        }}
                        searchWords={[searchText]}
                        autoEscape
                        textToHighlight={truncatedText}
                    />
                </span>
            );
        },
    });

    // Колонки для таблицы
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
            title: "Ссылка на файл",
            dataIndex: "file_path",
            key: "file_path",
            ...getColumnSearchProps("file_path"),
        },
        {
            title: "Действия",
            key: "actions",
            width: "20%",
            render: (_, record) => (
                <Button
                    style={{
                        display: "block", // Делаем кнопку блочным элементом
                        margin: "0 auto", // Центрируем её в ячейке
                    }}
                    type="primary"
                    icon={<SearchOutlined style={{ marginRight: "5px" }} />}
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

    const toUpperFirstLetter = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return (
        <div style={{ marginLeft: "10px" }}>
            <div
                style={{
                    width: "max-content",
                    border: "1px solid rgb(231, 234, 238)",
                    padding: "14px",
                    backgroundColor: "rgb(243, 244, 247)",
                    borderRadius: "16px",
                }}
            >
                <p>
                    Статус:{" "}
                    {reportStatus === "активный" ? (
                        <Tag color="#55acee">
                            <span style={{ fontSize: "16px" }}>
                                {toUpperFirstLetter(reportStatus)}
                            </span>
                        </Tag>
                    ) : (
                        <Tag color="grey">
                            <span style={{ fontSize: "16px" }}>
                                {toUpperFirstLetter(reportStatus)}
                            </span>
                        </Tag>
                    )}
                </p>
                <p>
                    Идентификатор компьютера:{" "}
                    <span style={{ fontWeight: "bold" }}>
                        {selectedComputer}
                    </span>
                </p>
                <p>
                    Дата отчёта:{" "}
                    <span style={{ fontWeight: "bold" }}>{selectedDate}</span>
                </p>
                <p>
                    Номер отчёта:{" "}
                    <span style={{ fontWeight: "bold" }}>
                        {selectedReportNumber}
                    </span>
                </p>
                <div>
                    Уязвимостей по уровням:{" "}
                    {Object.entries(errorLevels).map(([level, count]) => {
                        let tagColor;
                        switch (level) {
                            case "critical":
                                tagColor = "red";
                                level = "Критических";
                                break;
                            case "high":
                                tagColor = "orange";
                                level = "Высоких";
                                break;
                            case "medium":
                                tagColor = "yellow";
                                level = "Средних";
                                break;
                            case "low":
                                tagColor = "green";
                                level = "Низких";
                                break;
                            default:
                                tagColor = "gray"; // На случай, если уровень неизвестен
                                level = "Непредвиденных";
                        }

                        return (
                            <Tag
                                key={level}
                                color={tagColor}
                                style={{ color: "black" }}
                            >
                                {count} {level}
                            </Tag>
                        );
                    })}
                </div>
            </div>

            <h2>Файлы с уязвимостями (было найдено {filesCount} файлов)</h2>
            {/* Таблица Ant Design */}
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
                    dataSource={fileArray}
                    bordered
                    pagination={{
                        defaultPageSize: 15,
                        showSizeChanger: true,
                        position: ["topRight", "bottomRight"],
                        pageSizeOptions: ["10", "15", "20", "50", "100"],
                        locale: {
                            items_per_page: "/ на странице",
                        },
                        onChange: (page, pageSize) => {
                            setCurrentPageSize((prev) => pageSize);
                            setCurrentPage((prev) => page);
                            window.scrollTo({ top: 0, behavior: "smooth" })
                        },
                    }}
                    rowKey="id"
                    style={{
                        borderRadius: "10px",
                        border: "1px solid rgb(244, 246, 248)",
                    }}
                />
            </ConfigProvider>

            {/* Модальное окно для отображения полной ссылки */}
            <Modal
                title="Ссылка на файл"
                open={isModalVisible}
                width={800}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setIsModalVisible(false)}
                    >
                        Закрыть
                    </Button>,
                ]}
            >
                <p style={{ wordWrap: "break-word" }}>{selectedFileLink}</p>
            </Modal>
        </div>
    );
};

export default FileTable;
