import React, { useState, useEffect } from "react";
import { DatePicker, Button, Tabs, Table, Collapse, ConfigProvider, Space, Tooltip } from "antd";
import { Form } from "react-bootstrap";
import locale from "antd/locale/ru_RU";
import { CaretRightOutlined, SearchOutlined, DownloadOutlined, InfoCircleTwoTone } from "@ant-design/icons";
import moment from "moment";
import "../scss/style.scss";
import "./pagesModules/ViewReports.css";
import { handleDeleteReport } from "../utils/deleteReport";
import { useComputerOptions, useDateOptions, useReportNumberOptions } from "../hooks/useReportsData";
import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import api from "../../../utils/api";
import SelectField from "../shared/SelectField/SelectField";
import ButtonDelete from "../shared/ButtonDelete/ButtonDelete";
import FileTable from "../shared/FileTable/FileTable";
import { showErrorNotification, showSuccessNotification } from "../shared/Notification/Notification";
import DownloadModal from "../shared/DownloadModal/DownloadModal";

const { RangePicker } = DatePicker;
const { Panel } = Collapse;

const ViewReports = () => {
    const { user } = useAuth();
    const role = user?.role;
    const [activeTab, setActiveTab] = useState("view");

    const [downloadOption, setDownloadOption] = useState("viewThenDownload");
    const [reportLoaded, setReportLoaded] = useState(false);

    const [visibleModalDwnld, setVisibleModalDwnld] = useState(false);
    const [selectedErrorLevels, setSelectedErrorLevels] = useState(["Критический", "Высокий", "Средний", "Низкий"]);
    const [selectedColumns, setSelectedColumns] = useState([
        "Уровень ошибки",
        "Идентификатор уязвимости",
        "CPE",
        "Название уязвимости",
        "Описание",
        "Возможные меры по устранению",
        "Ссылки на источники",
        "Ссылки на файлы",
    ]);

    // console.log(downloadOption, " --------------------------- ", reportLoaded);

    // Состояния для вкладки просмотра отчета
    const [selectedComputer, setSelectedComputer] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedReportNumber, setSelectedReportNumber] = useState("");

    // Состояния для вкладки поиска по дате отчётов
    const [selectedComputerByDate, setSelectedComputerByDate] = useState("");
    const [selectedDateByDate, setSelectedDateByDate] = useState("");
    const [selectedReportNumberByDate, setSelectedReportNumberByDate] = useState("");

    // Для пагинации таблицы
    const [currentPageSize, setCurrentPageSize] = useState(15); // setCurrentPageSize
    const [currentPage, setCurrentPage] = useState(1); // setCurrentPage

    // Состояния для вкладки поиска по дате
    const [dateRange, setDateRange] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchResultsCollapsed, setIsSearchResultsCollapsed] = useState(true);

    // Общие состояния
    const [loading, setLoading] = useState(false);
    const [loadingByDate, setLoadingByDate] = useState(false);
    const [files, setFiles] = useState({});
    const [filesCount, setFilesCount] = useState(0);
    const [errorLevels, setErrorLevels] = useState([]);
    const [reportStatus, setReportStatus] = useState("");
    const [reportId, setReportId] = useState("");
    const [visibleDelete, setVisibleDelete] = useState(false);
    const [showModalDelete, setShowModalDelete] = useState(false);

    const computerOptions = useComputerOptions();
    const dateOptions = useDateOptions(selectedComputer);
    const reportNumberOptions = useReportNumberOptions(selectedComputer, selectedDate);

    useEffect(() => {
        document.title = "Просмотр отчетов";
    }, []);

    const isReportDataFilled = () => {
        return selectedComputer && selectedDate && selectedReportNumber;
    };

    // Очистка при переключении вкладок
    const handleTabChange = (key) => {
        setActiveTab(key);
        setVisibleDelete(false);
        setFiles({});
        setReportLoaded(false);
    };

    // Обработчики для вкладки просмотра отчета
    const handleComputerChange = (event) => {
        setSelectedComputer(event.target.value);
        setSelectedDate("");
        setSelectedReportNumber("");
        setFiles({});
        setVisibleDelete(false);
        setReportLoaded(false);
    };

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
        setSelectedReportNumber("");
        setFiles({});
        setVisibleDelete(false);
        setReportLoaded(false);
    };

    const handleReportNumberChange = (event) => {
        setSelectedReportNumber(event.target.value);
        setFiles({});
        setVisibleDelete(false);
        setReportLoaded(false);
    };

    const loadReportData = async (computer, date, reportNumber) => {
        try {
            setLoading(true);
            const response = await api().get("/api/admin/view", {
                params: {
                    computer_identifier: computer,
                    report_date: date,
                    report_number: reportNumber,
                },
            });

            setReportId(response.data.report_id);
            setFiles(response.data.files);
            setFilesCount(response.data.filesCount);
            setErrorLevels(response.data.errorLevels);
            setReportStatus(response.data.reportStatus);

            showSuccessNotification(response.data.message);
            setVisibleDelete(true);
            setReportLoaded(true);
        } catch (error) {
            showErrorNotification(error.response?.data?.error || "Ошибка при загрузке отчета");
            setReportLoaded(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        await loadReportData(selectedComputer, selectedDate, selectedReportNumber);
    };

    // Обработчики для вкладки поиска по дате
    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
        setSearchResults([]);
        setFiles({});
    };

    const handleSearchByDate = async () => {
        if (!dateRange || dateRange.length !== 2) {
            showErrorNotification("Пожалуйста, выберите диапазон дат");
            return;
        }

        try {
            setLoadingByDate(true);
            const response = await api().get("/api/admin/search-by-date", {
                params: {
                    start_date: dateRange[0].format("YYYY-MM-DD"),
                    end_date: dateRange[1].format("YYYY-MM-DD"),
                },
            });
            setFiles({});
            setSearchResults(response.data.reports);
            setIsSearchResultsCollapsed(false);
        } catch (error) {
            showErrorNotification(error.response?.data?.error || "Ошибка при поиске отчетов");
        } finally {
            setLoadingByDate(false);
        }
    };

    const handleSelectReport = (report) => {
        setSelectedComputerByDate(report.computer.identifier);
        setSelectedDateByDate(report.report_date);
        setSelectedReportNumberByDate(report.report_number);
    };

    const handleSelectReportAndLoad = async (report) => {
        handleSelectReport(report);
        setIsSearchResultsCollapsed(true);
        await loadReportData(report.computer.identifier, report.report_date, report.report_number);
    };

    const toggleSearchResults = () => {
        setIsSearchResultsCollapsed(!isSearchResultsCollapsed);
    };

    // Колонки для таблицы результатов поиска
    const searchColumns = [
        {
            title: "Номер",
            key: "index",
            width: "5%",
            render: (text, record, index) => {
                const rowNumber = (currentPage - 1) * currentPageSize + index + 1;
                return rowNumber;
            },
        },
        {
            title: "Идентификатор компьютера",
            dataIndex: ["computer", "identifier"],
            key: "computer_identifier",
        },
        {
            title: "Номер отчета",
            dataIndex: "report_number",
            key: "report_number",
        },
        {
            title: "Дата отчета",
            dataIndex: "report_date",
            key: "report_date",
            render: (date) => moment(date).format("YYYY-MM-DD"),
        },
        {
            title: "Действия",
            key: "actions",
            width: "11%",
            render: (_, record) => (
                <Space.Compact>
                    <Button
                        style={{
                            display: "block", // Делаем кнопку блочным элементом
                            margin: "0 auto", // Центрируем её в ячейке
                            fontSize: "16px",
                        }}
                        icon={<SearchOutlined style={{ marginRight: "5px" }} />}
                        type="primary"
                        onClick={() => handleSelectReportAndLoad(record)}
                    >
                        Просмотреть
                    </Button>
                    <Button
                        style={{
                            display: "block", // Делаем кнопку блочным элементом
                            margin: "0 auto", // Центрируем её в ячейке
                            fontSize: "16px",
                        }}
                        icon={<DownloadOutlined style={{ marginRight: "5px" }} />}
                        variant="solid"
                        color="green"
                        onClick={() => {
                            handleSelectReport(record);
                            setVisibleModalDwnld(true);
                        }}
                    >
                        Скачать
                    </Button>
                </Space.Compact>
            ),
        },
    ];

    const tabItems = [
        {
            key: "view",
            label: "Просмотр отчета",
            children: (
                <>
                    <form onSubmit={handleSubmit}>
                        <table>
                            <tbody>
                                <SelectField
                                    label="Идентификатор компьютера"
                                    option="компьютер"
                                    id="computer_identifier"
                                    value={selectedComputer}
                                    onChange={handleComputerChange}
                                    options={computerOptions}
                                    required
                                />
                                <SelectField
                                    label="Дата отчёта"
                                    option="дату отчёта"
                                    id="report_date"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    options={dateOptions}
                                    required
                                    disabled={!selectedComputer}
                                />
                                <SelectField
                                    label="Номер отчёта"
                                    option="номер отчёта"
                                    id="report_number"
                                    value={selectedReportNumber}
                                    onChange={handleReportNumberChange}
                                    options={reportNumberOptions}
                                    required
                                    disabled={!selectedDate}
                                />
                            </tbody>
                        </table>
                        <Form.Group>
                            {/* <Form.Label>Выберите вариант скачивания:</Form.Label> */}
                            <Form.Check
                                type="radio"
                                style={{ fontSize: "16px" }}
                                label="Просмотреть отчёт перед скачиванием"
                                id="viewThenDownload"
                                name="downloadOption"
                                value="viewThenDownload"
                                checked={downloadOption === "viewThenDownload"}
                                onChange={(e) => setDownloadOption(e.target.value)}
                                disabled={reportLoaded} // Блокируем, если отчёт загружен и выбран "Просмотреть перед скачиванием"
                            />
                            <Form.Check
                                type="radio"
                                style={{ fontSize: "16px" }}
                                label="Скачать отчёт сразу, без просмотра"
                                id="downloadImmediately"
                                name="downloadOption"
                                value="downloadImmediately"
                                checked={downloadOption === "downloadImmediately"}
                                onChange={(e) => setDownloadOption(e.target.value)}
                                disabled={reportLoaded} // Блокируем, если отчёт загружен и выбран "Просмотреть перед скачиванием"
                            />
                        </Form.Group>
                        <Button
                            style={{
                                marginTop: "10px",
                                marginBottom: "10px",
                                width: "200px",
                                fontSize: "16px",
                            }}
                            htmlType="submit"
                            loading={loading}
                            type="primary"
                            disabled={loading || downloadOption === "downloadImmediately"}
                        >
                            Просмотреть отчёт
                        </Button>

                        <Button
                            style={{
                                marginTop: "10px",
                                marginBottom: "10px",
                                width: "150px",
                                marginLeft: "10px",
                                fontSize: "16px",
                            }}
                            // type="primary"
                            variant="solid"
                            color="green"
                            onClick={() => {
                                setVisibleModalDwnld(true); // Открываем модальное окно для скачивания
                            }}
                            disabled={!isReportDataFilled() || (downloadOption === "viewThenDownload" && !reportLoaded)} // Блокируем, если отчёт не загружен
                        >
                            Скачать отчёт
                        </Button>

                        {visibleDelete && role === "SuperAdmin" && (
                            <>
                                <Button danger onClick={() => setShowModalDelete(true)} style={{ marginLeft: "10px", fontSize: "16px" }}>
                                    Удалить
                                </Button>
                                <ButtonDelete
                                    visible={showModalDelete}
                                    onClose={() => setShowModalDelete(false)}
                                    onDelete={async () => {
                                        await handleDeleteReport(selectedComputer, selectedReportNumber, selectedDate, () =>
                                            setShowModalDelete(false)
                                        );
                                        setFiles({});
                                        setSelectedReportNumber("");
                                        setSelectedDate("");
                                        setSelectedComputer("");
                                        setVisibleDelete(false)
                                    }}
                                    selectedComputer={selectedComputer}
                                    selectedDate={selectedDate}
                                />
                            </>
                        )}
                    </form>

                    {Object.keys(files || {}).length > 0 && (
                        <FileTable
                            files={files}
                            reportId={reportId}
                            filesCount={filesCount}
                            errorLevels={errorLevels}
                            reportStatus={reportStatus}
                            selectedComputer={selectedComputer}
                            selectedDate={selectedDate}
                            selectedReportNumber={selectedReportNumber}
                        />
                    )}
                    <DownloadModal
                        visible={visibleModalDwnld}
                        onClose={() => setVisibleModalDwnld(false)}
                        selectedErrorLevels={selectedErrorLevels}
                        setSelectedErrorLevels={setSelectedErrorLevels}
                        selectedColumns={selectedColumns}
                        setSelectedColumns={setSelectedColumns}
                        selectedComputer={selectedComputer}
                        selectedDate={selectedDate}
                        selectedReportNumber={selectedReportNumber}
                        user={user}
                    />
                </>
            ),
        },
        {
            key: "search",
            label: "Поиск по дате",
            children: (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <Tooltip placement="bottom" title="Формат даты дд-мм-гггг, через тире">
                            <InfoCircleTwoTone style={{ marginRight: 10 }} />
                        </Tooltip>
                        <ConfigProvider
                            locale={locale}
                            theme={{
                                components: {
                                    DatePicker: {
                                        fontSize: "16px",
                                    },
                                },
                            }}
                        >
                            <RangePicker onChange={handleDateRangeChange} format="DD-MM-YYYY" style={{ width: 350, marginRight: 10 }} />
                        </ConfigProvider>
                        <Button type="primary" onClick={handleSearchByDate} loading={loadingByDate}>
                            Найти
                        </Button>
                    </div>

                    {/* {searchResults.length > 0 && ( */}
                    <Collapse
                        activeKey={isSearchResultsCollapsed ? [] : ["results"]}
                        onChange={toggleSearchResults}
                        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                        style={{ marginBottom: "10px" }}
                    >
                        <Panel
                            header="Результаты поиска"
                            style={{ fontSize: "16px" }}
                            key="results"
                            extra={
                                <Button
                                    type="link"
                                    size="small"
                                    style={{ fontSize: "16px" }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSearchResults();
                                    }}
                                >
                                    {isSearchResultsCollapsed ? "Развернуть" : "Свернуть"}
                                </Button>
                            }
                        >
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
                                    columns={searchColumns}
                                    dataSource={searchResults}
                                    rowKey="report_number"
                                    loading={loading}
                                    bordered
                                    pagination={{
                                        defaultPageSize: 15,
                                        showSizeChanger: true,
                                        position: "bottomRight",
                                        pageSizeOptions: ["10", "15", "20", "50", "100"],
                                        locale: {
                                            items_per_page: "/ на странице",
                                        },
                                        onChange: (page, pageSize) => {
                                            setCurrentPageSize((prev) => pageSize);
                                            setCurrentPage((prev) => page);
                                            window.scrollTo({
                                                top: 0,
                                                behavior: "smooth",
                                            });
                                        },
                                    }}
                                    style={{
                                        borderRadius: "10px",
                                        border: "1px solid rgb(244, 246, 248)",
                                    }}
                                />
                            </ConfigProvider>
                        </Panel>
                    </Collapse>
                    {/* )} */}
                    {Object.keys(files || {}).length > 0 && (
                        <FileTable
                            files={files}
                            reportId={reportId}
                            filesCount={filesCount}
                            errorLevels={errorLevels}
                            reportStatus={reportStatus}
                            selectedComputer={selectedComputerByDate}
                            selectedDate={selectedDateByDate}
                            selectedReportNumber={selectedReportNumberByDate}
                        />
                    )}
                    <DownloadModal
                        visible={visibleModalDwnld}
                        onClose={() => setVisibleModalDwnld(false)}
                        selectedErrorLevels={selectedErrorLevels}
                        setSelectedErrorLevels={setSelectedErrorLevels}
                        selectedColumns={selectedColumns}
                        setSelectedColumns={setSelectedColumns}
                        selectedComputer={selectedComputerByDate}
                        selectedDate={selectedDateByDate}
                        selectedReportNumber={selectedReportNumberByDate}
                        user={user}
                    />
                </>
            ),
        },
    ];

    return (
        <div style={{ marginLeft: "10px" }}>
            <h2>Просмотр отчетов</h2>
            <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} />

            {loading && <LoadingSpinner text={"Загружается..."} />}
        </div>
    );
};

export default ViewReports;
