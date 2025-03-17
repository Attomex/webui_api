import React, { useState, useEffect } from "react";
import "../scss/style.scss";
import { Button } from "react-bootstrap";
import "./pagesModules/ViewReports.css";

import { handleDeleteReport } from "../utils/deleteReport";
import {
    useComputerOptions,
    useDateOptions,
    useReportNumberOptions,
} from "../hooks/useReportsData";
import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner";

import api from "../../../utils/api";
import SelectField from "../shared/SelectField/SelectField";
import ButtonDelete from "../shared/ButtonDelete/ButtonDelete";
import FileTable from "../shared/FileTable/FileTable";
import {
    showErrorNotification,
    showSuccessNotification,
} from "../shared/Notification/Notification";

const ViewReports = () => {
    const [selectedComputer, setSelectedComputer] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedReportNumber, setSelectedReportNumber] = useState("");

    const computerOptions = useComputerOptions();
    const dateOptions = useDateOptions(selectedComputer);
    const reportNumberOptions = useReportNumberOptions(
        selectedComputer,
        selectedDate
    );

    const [loading, setLoading] = useState(false);
    // const [vulnerabilities, setVulnerabilities] = useState({});
    const [reportId, setReportId] = useState("");
    const [files, setFiles] = useState({});
    const [filesCount, setFilesCount] = useState(0);
    const [errorLevels, setErrorLevels] = useState([]);
    const [reportStatus, setReportStatus] = useState("");

    // const [visible, setVisible] = useState(false);
    // const [selectedVulnerability, setSelectedVulnerability] = useState(null);
    //Удаление отчета
    const [visibleDelete, setVisibleDelete] = useState(false);
    const [showModalDelete, setShowModalDelete] = useState(false);
    const handleShowModal = () => setShowModalDelete(true);
    const handleCloseModal = () => setShowModalDelete(false);

    useEffect(() => {
        document.title = "Просмотр отчетов";
    }, []);

    const handleDelete = () => {
        handleDeleteReport(
            selectedReportNumber,
            selectedDate,
            handleCloseModal
        );
    };
    // конец удаления отчета

    // const openModal = (vulnerability) => {
    //   setSelectedVulnerability(vulnerability);
    //   setVisible(true);
    // };

    const handleComputerChange = (event) => {
        const selectedIdentifier = event.target.value;
        setSelectedComputer(selectedIdentifier);
        setSelectedDate("");
        setSelectedReportNumber("");
        setFiles({});
        setVisibleDelete(false);
    };

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
        if (selectedComputer !== "") {
            setSelectedReportNumber("");
            setFiles({});
            setVisibleDelete(false);
        }
    };

    const handleReportNumberChange = (event) => {
        setSelectedReportNumber(event.target.value);
        // setVulnerabilities([]);
        setFiles({});
        setVisibleDelete(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            setLoading(true);
            // setVulnerabilities([]);
            setFiles({});
            const response = await api().get("/api/admin/view", {
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
            setErrorLevels(response.data.errorLevels);
            setReportStatus(response.data.reportStatus);

            showSuccessNotification(response.data.message);
            setVisibleDelete(true);
        } catch (error) {
            showErrorNotification(error.response.data.error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <div style={{ marginLeft: "10px" }}>
                <h2>Просмотр отчетов</h2>
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
                    {visibleDelete && (
                        <>
                            <Button
                                variant="danger"
                                onClick={handleShowModal}
                                style={{ marginLeft: "10px" }}
                            >
                                Удалить
                            </Button>
                            <ButtonDelete
                                visible={showModalDelete}
                                onClose={handleCloseModal}
                                onDelete={handleDelete}
                                selectedComputer={selectedComputer}
                                selectedDate={selectedDate}
                            />
                        </>
                    )}
                </form>
                {loading && <LoadingSpinner text={"Загружается..."} />}
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
            </div>
        </>
    );
};

export default ViewReports;
