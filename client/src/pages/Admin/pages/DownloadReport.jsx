import React, { useState, useEffect } from "react";
import "../scss/style.scss";
import { Button, Form } from "react-bootstrap";
import "./pagesModules/ViewReports.css";

import api from "../../../utils/api";

import {
    useComputerOptions,
    useDateOptions,
    useReportNumberOptions,
} from "../hooks/useReportsData";

import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner";
import SelectField from "../shared/SelectField/SelectField";
import DownloadModal from "../shared/DownloadModal/DownloadModal";
import {
    showErrorNotification,
    showSuccessNotification,
} from "../shared/Notification/Notification";
import FileTable from "../shared/FileTable/FileTable";

const DownloadReport = () => {
    const [selectedComputer, setSelectedComputer] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedReportNumber, setSelectedReportNumber] = useState("");

    const computerOptions = useComputerOptions();
    const dateOptions = useDateOptions(selectedComputer);
    const reportNumberOptions = useReportNumberOptions(
        selectedComputer,
        selectedDate
    );

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [download, setDownload] = useState(true);
    const [reportId, setReportId] = useState("");
    const [files, setFiles] = useState({});
    const [filesCount, setFilesCount] = useState(0);

    // Модальное окно скачивания отчёта
    const [visibleModalDwnld, setVisibleModalDwnld] = useState(false);
    const [selectedErrorLevels, setSelectedErrorLevels] = useState([
        "Критический",
        "Высокий",
        "Средний",
        "Низкий",
    ]);
    const [selectedColumns, setSelectedColumns] = useState([
        "Уровень ошибки",
        "Идентификатор уязвимости",
        "Название уязвимости",
        "Описание",
        "Возможные меры по устранению",
        "Ссылки на источники",
        "Ссылки на файлы",
    ]);

    // Состояние для выбора варианта скачивания
    const [downloadOption, setDownloadOption] = useState("viewThenDownload");

    // Состояние для отслеживания загрузки отчёта
    const [reportLoaded, setReportLoaded] = useState(false);

    useEffect(() => {
        document.title = "Скачать отчёт";
    }, []);

    const isReportDataFilled = () => {
        return selectedComputer && selectedDate && selectedReportNumber;
    };

    const handleComputerChange = (event) => {
        const selectedIdentifier = event.target.value;
        setSelectedComputer(selectedIdentifier);
        setSelectedDate("");
        setSelectedReportNumber("");
        setFiles({});
        setError("");
        setMessage("");
        setDownload(true);
        setReportLoaded(false); // Сбрасываем состояние загрузки отчёта
    };

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
        if (selectedComputer !== "") {
            setSelectedReportNumber("");
            setFiles({});
            setError("");
            setMessage("");
            setDownload(true);
            setReportLoaded(false); // Сбрасываем состояние загрузки отчёта
        }
    };

    const handleReportNumberChange = (event) => {
        setSelectedReportNumber(event.target.value);
        setFiles({});
        setError("");
        setMessage("");
        setDownload(true);
        setReportLoaded(false); // Сбрасываем состояние загрузки отчёта
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            setLoading(true);
            setMessage("");
            setError("");
            setFiles({});
            setDownload(true);
            const response = await api().get("/api/admin/download", {
                params: {
                    computer_identifier: selectedComputer,
                    report_date: selectedDate,
                    report_number: selectedReportNumber,
                },
            });
            setReportId(response.data.report_id);
            setFiles(response.data.files);
            setFilesCount(response.data.filesCount);

            setMessage(response.data.message);
            setError("");
            setDownload(false);
            setReportLoaded(true); // Отчёт успешно загружен
        } catch (error) {
            setError(error.response.data.error);
            setMessage("");
            setReportLoaded(false); // Ошибка загрузки отчёта
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (visibleModalDwnld) {
            return;
        }
        setSelectedErrorLevels(["Критический", "Высокий", "Средний", "Низкий"]);
        setSelectedColumns([
            "Уровень ошибки",
            "Идентификатор уязвимости",
            "Название уязвимости",
            "Описание",
            "Возможные меры по устранению",
            "Ссылки на источники",
            "Ссылки на файлы",
        ]);
    }, [visibleModalDwnld]);

    return (
        <div style={{ marginLeft: "10px" }}>
            <h2>Скачивание отчёта</h2>
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
                    <Form.Label>Выберите вариант скачивания:</Form.Label>
                    <Form.Check
                        type="radio"
                        label="Просмотреть отчёт перед скачиванием"
                        id="viewThenDownload"
                        name="downloadOption"
                        value="viewThenDownload"
                        checked={downloadOption === "viewThenDownload"}
                        onChange={(e) => setDownloadOption(e.target.value)}
                        disabled={reportLoaded && downloadOption === "viewThenDownload"} // Блокируем, если отчёт загружен и выбран "Просмотреть перед скачиванием"
                    />
                    <Form.Check
                        type="radio"
                        label="Скачать отчёт сразу, без просмотра"
                        id="downloadImmediately"
                        name="downloadOption"
                        value="downloadImmediately"
                        checked={downloadOption === "downloadImmediately"}
                        onChange={(e) => setDownloadOption(e.target.value)}
                        disabled={reportLoaded && downloadOption === "viewThenDownload"} // Блокируем, если отчёт загружен и выбран "Просмотреть перед скачиванием"
                    />
                </Form.Group>
                <Button
                    style={{
                        marginTop: "10px",
                        marginBottom: "10px",
                        width: "200px",
                    }}
                    as="input"
                    type="submit"
                    value="Посмотреть отчёт"
                    disabled={loading || downloadOption === "downloadImmediately"} // Блокируем, если выбран "Скачать сразу"
                />
                <Button
                    variant="secondary"
                    style={{ marginLeft: "10px" }}
                    as="input"
                    className="downloadExcel"
                    type="button"
                    onClick={() => {
                        setMessage("");
                        setError("");
                        setVisibleModalDwnld(true); // Открываем модальное окно для скачивания
                    }}
                    disabled={!isReportDataFilled() || (downloadOption === "viewThenDownload" ? download : false)} // Блокируем, если данные не заполнены или выбран "Просмотреть перед скачиванием" и отчет не загружен
                    value="Скачать отчёт"
                ></Button>
            </form>
            {loading && <LoadingSpinner text="Загружается..." />}
            {message && showSuccessNotification(message)}
            {error && showErrorNotification(error)}
            {Object.keys(files || {}).length > 0 && (
                <FileTable
                    files={files}
                    reportId={reportId}
                    filesCount={filesCount}
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
            />
        </div>
    );
};

export default React.memo(DownloadReport);