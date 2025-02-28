import React, { useState, useEffect } from "react";
import "../scss/style.scss";
import { Button } from "react-bootstrap";
import "./pagesModules/ViewReports.css";

import api from "../../../utils/api";

import {
    useComputerOptions,
    useDateOptions,
    useReportNumberOptions,
} from "../hooks/useReportsData";

import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner";
import SelectField from "../shared/SelectField/SelectField";
import downloadExcel from "../scripts/downloadExcel";
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
    // const [vulnerabilities, setVulnerabilities] = useState([]);
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

    useEffect(() => {
        document.title = "Скачать отчёт";
    }, []);

    // const openModal = (vulnerability) => {
    //     setSelectedVulnerability(vulnerability);
    //     setVisible(true);
    // };

    const handleComputerChange = (event) => {
        const selectedIdentifier = event.target.value;
        setSelectedComputer(selectedIdentifier);
        setSelectedDate("");
        setSelectedReportNumber("");
        // setVulnerabilities([]);
        setFiles({});
        setError("");
        setMessage("");
    };

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
        if (selectedComputer !== "") {
            setSelectedReportNumber("");
            // setVulnerabilities([]);
            setFiles({});
            setError("");
            setMessage("");
        }
    };

    const handleReportNumberChange = (event) => {
        setSelectedReportNumber(event.target.value);
        // setVulnerabilities([]);
        setFiles({});
        setError("");
        setMessage("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            setLoading(true);
            setMessage("");
            setError("");
            // setVulnerabilities([]);
            setFiles({});
            setDownload(true);
            const response = await api().get("/api/admin/download", {
                params: {
                    computer_identifier: selectedComputer,
                    report_date: selectedDate,
                    report_number: selectedReportNumber,
                },
            });
            // setVulnerabilities(response.data.vulnerabilities);
            setReportId(response.data.report_id);
            setFiles(response.data.files);
            setFilesCount(response.data.filesCount);

            setMessage(response.data.message);
            setError("");
            setDownload(false);
        } catch (error) {
            setError(error.response.data.error);
            setMessage("");
        } finally {
            setLoading(false);
        }
    };

    // const clearFields = () => {
    //     setSelectedComputer("");
    //     setSelectedDate("");
    //     setSelectedReportNumber("");
    // };

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

    const handleDownload = () => {
        downloadExcel(
            selectedErrorLevels,
            selectedColumns,
            selectedComputer,
            selectedReportNumber,
            selectedDate
        );
        setVisibleModalDwnld(false);
    };

    return (
        <div style={{ marginLeft: "10px" }}>
            <h2>Скачивание отчёта</h2>
            <h1 style={{ color: "grey", fontSize: "12px" }}>
                <span style={{ color: "red" }}>* Перед скачиванием отчёта необходимо просмотреть отчёт</span>
            </h1>
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
                <Button
                    style={{
                        marginTop: "10px",
                        marginBottom: "10px",
                        width: "200px",
                    }}
                    as="input"
                    type="submit"
                    value="Посмотреть отчёт"
                    disabled={loading}
                />
                <Button
                    variant="secondary"
                    style={{ marginLeft: "10px" }}
                    as="input"
                    className="downloadExcel"
                    type="button"
                    onClick={(e)=>{
                      e.preventDefault();
                      setMessage('');
                      setError('');
                      setVisibleModalDwnld(true);
                    }}
                    disabled={download}
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
                onDownload={handleDownload}
                selectedErrorLevels={selectedErrorLevels}
                setSelectedErrorLevels={setSelectedErrorLevels}
                selectedColumns={selectedColumns}
                setSelectedColumns={setSelectedColumns}
            />
        </div>
    );
};

export default React.memo(DownloadReport);
