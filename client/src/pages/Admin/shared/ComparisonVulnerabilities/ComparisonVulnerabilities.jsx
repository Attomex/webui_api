import React, { useState, useRef } from "react";
import {
    Modal,
    Tabs,
    Table,
    ConfigProvider,
    Button,
    Tag,
    Space,
    Descriptions,
    Typography,
    Input,
} from "antd";
import Highlighter from "react-highlight-words";
import { FilterOutlined, SearchOutlined, EyeOutlined } from "@ant-design/icons";

const { Text, Link } = Typography;

const ERROR_LEVELS = [
    { text: "Критический", value: "Критический" },
    { text: "Высокий", value: "Высокий" },
    { text: "Средний", value: "Средний" },
    { text: "Низкий", value: "Низкий" },
];

const getLevelColor = (level) => {
    switch (level) {
        case "Критический":
            return "red";
        case "Высокий":
            return "orange";
        case "Средний":
            return "yellow";
        case "Низкий":
            return "green";
        default:
            return "gray";
    }
};

const VulnerabilityTable = ({ data, onShowDetails }) => {
    const searchInput = useRef(null);
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageSize, setCurrentPageSize] = useState(15);

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
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.join(", ").toString() : ""}
                />
            ) : (
                text.join(", ")
            ),
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
            title: "Идентификатор уязвимости",
            dataIndex: "identifiers",
            key: "identifiers",
            width: "18%",
            ...getColumnSearchProps("identifiers"),
            // render: (identifiers) => {
            //     return(
            //         <Tag color="gray" style={{fontSize: "18px"}}>{identifiers.join(", ")}</Tag>
            //     )
            // },
        },
        {
            title: "Уровень ошибки",
            dataIndex: "error_level",
            key: "error_level",
            width: "13%",
            filters: ERROR_LEVELS,
            filterIcon: (filtered) => (
                <FilterOutlined
                    style={{
                        color: filtered ? "rgb(64, 150, 255)" : undefined,
                        fontSize: "20px",
                    }}
                />
            ),
            onFilter: (value, record) => record.error_level === value,
            render(level) {
                const color = getLevelColor(level);

                // Отображаем статус как Tag с цветом и читаемым названием
                return <Tag color={color}>{level}</Tag>;
            },
        },
        {
            title: "Название",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Действие",
            key: "action",
            width: "15%",
            render: (_, record) => (
                <Button
                    type="primary"
                    style={{
                        display: "block", // Делаем кнопку блочным элементом
                        margin: "0 auto", // Центрируем её в ячейке
                    }}
                    icon={<EyeOutlined style={{ marginRight: "5px" }} />}
                    onClick={() => onShowDetails(record)}
                >
                    Показать подробности
                </Button>
            ),
        },
    ];

    return (
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
                dataSource={data}
                pagination={{
                    defaultPageSize: 15,
                    showSizeChanger: true,
                    position: ["topRight", "bottomRight"],
                    pageSizeOptions: ["15", "20", "50", "100", "500"],
                    locale: {
                        items_per_page: "/ на странице",
                    },
                    onChange: (page, pageSize) => {
                        // document.body.scrollTop = 0; // For Safari
                        setCurrentPageSize((prev) => pageSize);
                        setCurrentPage((prev) => page);
                        document.documentElement.scrollTop = 0;
                    },
                }}
                rowKey="id"
                bordered
            />
        </ConfigProvider>
    );
};

const VulnerabilityDetailsModal = ({ visible, onClose, record }) => {
    if (!record) return null;
    const renderLinks = (links) => {
        if (!links || links.length === 0) {
            return <Text type="secondary">Нет ссылок</Text>;
        }

        return (
            <ul style={{ paddingLeft: 20, margin: 0 }}>
                {links.map((link, index) => (
                    <li key={index}>
                        <Link
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: "16px" }}
                        >
                            {link.length > 80
                                ? `${link.substring(0, 80)}...`
                                : link}
                        </Link>
                    </li>
                ))}
            </ul>
        );
    };

    const renderErrorLevel = (error_level) => {
            let color = "";
            switch (error_level) {
                case 'Критический':
                    color = 'red';
                    break;
                case 'Высокий':
                    color = 'orange';
                    break;
                case 'Средний':
                    color = 'yellow';
                    break;
                case 'Низкий':
                    color = 'green';
                    break;
                default:
                    color = 'gray';
            }
    
            return <Tag color={color} style={{ color: "black", fontSize: "14px", fontWeight: "480"  }}>{error_level}</Tag>;
        }

    const items = [
        {
            key: "1",
            label: "Уровень уязвимости",
            children: renderErrorLevel(record.error_level),
        },
        {
            key: "2",
            label: "Идентификатор",
            children: record.identifiers,
        },
        {
            key: "3",
            label: "CPE",
            children: record.cpe,
        },
        {
            key: "4",
            label: "Ссылка на файл",
            children: record.source_links,
        },
        {
            key: "5",
            label: "Название",
            children: record.name,
        },
        {
            key: "6",
            label: "Описание",
            children: record.description,
        },
        {
            key: "7",
            label: "Рекомендации",
            children: record.remediation_measures,
        },
        {
            key: "8",
            label: "Ссылки",
            children: renderLinks(record.source_links),
        }
    ];

    return (
        <ConfigProvider
            theme={{
                components: {
                    Descriptions: {
                        labelBg: "rgba(117, 117, 117, 0.2)",
                        colorSplit: "rgba(117, 117, 117, 0.25)",
                        fontSize: 16,
                    },
                },
            }}
        >
            <Modal
                title="Подробная информация об уязвимости"
                open={visible}
                onCancel={onClose}
                width={1100}
                footer={[<Button onClick={onClose}>Закрыть</Button>]}
                centered
                destroyOnClose
            >
                {record && (
                    <Descriptions
                        column={1}
                        bordered
                        size="middle"
                        items={items}
                        style={{
                            borderRadius: "16px",
                            overflow: "hidden",
                        }}
                        labelStyle={{
                            color: "black",
                            width: "18%",
                            padding: "10px",
                        }}
                    />
                )}
            </Modal>
        </ConfigProvider>
    );
};

const ComparisonVulnerabilities = ({ data }) => {
    const [visible, setVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const handleShowDetails = (record) => {
        setSelectedRecord(record);
        setVisible(true);
    };

    const handleCloseModal = () => {
        setVisible(false);
        setSelectedRecord(null);
    };

    // Определяем вкладки с использованием `items`
    const items = [
        {
            key: "1",
            // label: <Tag>Появившиеся уязвимости</Tag>,
            label: "Появившиеся уязвимости",
            children: (
                <VulnerabilityTable
                    data={data.appeared_vulnerabilities}
                    onShowDetails={handleShowDetails}
                />
            ),
        },
        {
            key: "2",
            // label: <Tag>Оставшиеся уязвимости</Tag>,
            label: "Оставшиеся уязвимости",
            children: (
                <VulnerabilityTable
                    data={data.remaining_vulnerabilities}
                    onShowDetails={handleShowDetails}
                />
            ),
        },
        {
            key: "3",
            // label: <Tag>Исправленные уязвимости</Tag>,
            label: "Исправленные уязвимости",
            children: (
                <VulnerabilityTable
                    data={data.fixed_vulnerabilities}
                    onShowDetails={handleShowDetails}
                />
            ),
        },
    ];

    return (
        <>
            {/* Вкладки */}
            <Tabs defaultActiveKey="1" items={items} type="card" />

            {/* Модальное окно с деталями уязвимости */}
            <VulnerabilityDetailsModal
                visible={visible}
                onClose={handleCloseModal}
                record={selectedRecord}
            />
        </>
    );
};

export default ComparisonVulnerabilities;
