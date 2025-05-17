import React, { useEffect, useState } from "react";
import "../scss/style.scss";
import "./pagesModules/ViewReports.css";
import api from "../../../utils/api";
import downloadResultComparisonExcel from "../scripts/downloadResultComparisonExcel";

import { Modal, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

import { useAuth } from "../context/AuthContext";

import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner";

import { useComputerOptions } from "../hooks/useReportsData";
import useComparisonReportData from "../hooks/useComparisonReportData";
import SelectField from "../shared/SelectField/SelectField";
import ComparisonVulnerabilities from "../shared/ComparisonVulnerabilities/ComparisonVulnerabilities";
import {
    showErrorNotification,
    showSuccessNotification,
} from "../shared/Notification/Notification";

const Comparison = () => {
    const { user } = useAuth();

    // Базовые состояния
    const [selectedComputer, setSelectedComputer] = useState("");
    //Даты новые и старые
    const [selectedNewDate, setSelectedNewDate] = useState("");
    const [selectedOldDate, setSelectedOldDate] = useState("");
    
    // Номера отчётов новые и старые
    const [selectedNewReportNumber, setSelectedNewReportNumber] = useState("");
    const [selectedOldReportNumber, setSelectedOldReportNumber] = useState("");

    // Количество уязвимостей новых и старых
    const [errorLevelsNew, setErrorLevelsNew] = useState([]);
    const [errorLevelsOld, setErrorLevelsOld] = useState([]);

    const [data, setData] = useState({});

    // Статус сравнения
    const [comparisonStatus, setComparisonStatus] = useState(false);

    // Списки
    const computerOptions = useComputerOptions();
    const {
        newDateOptions,
        oldDateOptions,
        newReportNumberOptions,
        oldReportNumberOptions,
    } = useComparisonReportData(
        selectedComputer,
        selectedNewDate,
        selectedOldDate
    );

    // Модальное окно для скачивания
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [downloadingComparison, setDownloadingComparison] = useState(false);

    const showModal = () => setIsModalOpen(true);
    const handleCancel = () => {
        setDownloadingComparison(false);
        setIsModalOpen(false);
    };

    const handleOk = async () => {
        setDownloadingComparison(true);
        downloadResultComparisonExcel(
            user,
            selectedComputer,
            selectedNewDate,
            selectedOldDate,
            selectedNewReportNumber,
            selectedOldReportNumber,
            errorLevelsNew,
            errorLevelsOld,
            data
        );
        handleCancel();
        setDownloadingComparison(false);
        // Формируем данные для лога
        const logData = {
            Сообщение: "Скачивание сравнения отчётов",
            "Идентификатор компьютера": selectedComputer,
            "Дата нового отчёта": selectedNewDate,
            "Номер нового отчёта": selectedNewReportNumber,
            "Дата старого отчёта": selectedOldDate,
            "Номер старого отчёта": selectedOldReportNumber,
        };

        const formData = new FormData();
        formData.append("message", JSON.stringify(logData)); // Важно: передаём строку JSON!
        formData.append("level", "info");
        formData.append("action", "Скачивание");

        // Отправка лога
        await api().post("/api/logs/send", formData);
    };

    useEffect(() => {
        document.title = "Сравнение отчётов";
    }, []);

    const handleComputerChange = (event) => {
        event.preventDefault();
        setSelectedComputer(event.target.value);
        setSelectedNewDate("");
        setSelectedOldDate("");
        setSelectedNewReportNumber("");
        setSelectedOldReportNumber("");
        setData({});
    };

    const handleNewDateChange = (event) => {
        event.preventDefault();
        setSelectedNewDate(event.target.value);
        if (selectedComputer !== "") {
            setSelectedOldDate("");
            setSelectedNewReportNumber("");
            setSelectedOldReportNumber("");
            setData({});
        }
    };

    const handleOldDateChange = (event) => {
        event.preventDefault();
        setSelectedOldDate(event.target.value);
        if (selectedComputer !== "") {
            setSelectedOldReportNumber("");
            setData({});
        }
    };

    const handleNewReportNumberChange = (event) => {
        event.preventDefault();
        setSelectedNewReportNumber(event.target.value);
        setSelectedOldDate("");
        setSelectedOldReportNumber("");
        setData({});
    };

    const handleOldReportNumberChange = (event) => {
        event.preventDefault();
        setSelectedOldReportNumber(event.target.value);
        setData({});
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            setComparisonStatus(true);
            const response = await api().get("/api/admin/comparison", {
                params: {
                    computer_identifier: selectedComputer,
                    new_report_date: selectedNewDate,
                    new_report_number: selectedNewReportNumber,
                    old_report_date: selectedOldDate,
                    old_report_number: selectedOldReportNumber,
                },
            });
            setData(response.data);
            showSuccessNotification(response.data.message);
            setErrorLevelsNew(response.data.errorLevelsNew);
            setErrorLevelsOld(response.data.errorLevelsOld);
        } catch (error) {
            showErrorNotification(error.response.data.error);
        } finally {
            setComparisonStatus(false);
        }
    };

    // Парочку фильтор на сайтик
    const filterOldDates = (newDate) => {
        return oldDateOptions.filter((date) => date <= newDate);
    };

    const filterOldReportNumbers = (newReportNumber) => {
        return oldReportNumberOptions.filter(
            (number) => number !== newReportNumber
        );
    };

    return (
        <div style={{ marginLeft: "10px", marginRight: "15px" }}>
            <h2 style={{ marginBottom: "4px" }}>Сравнение двух отчётов</h2>
            <h1 style={{ color: "grey", fontSize: "12px", marginBottom: "12px" }}>
                <span style={{ color: "red" }}>*</span> Сравнение производится по одному идентификатору компьютера
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
                        <br />
                        <SelectField
                            label="Дата нового отчёта"
                            option="дату нового отчёта"
                            id="report_date_1"
                            value={selectedNewDate}
                            onChange={handleNewDateChange}
                            options={newDateOptions}
                            required
                            disabled={!selectedComputer}
                        />
                        <SelectField
                            label="Номер нового отчёта"
                            option="номер нового отчёта"
                            id="report_number_1"
                            value={selectedNewReportNumber}
                            onChange={handleNewReportNumberChange}
                            options={newReportNumberOptions}
                            required
                            disabled={!selectedNewDate}
                        />
                        <br />
                        {/* прошлые */}
                        <SelectField
                            label="Дата прошлого отчёта"
                            option="дату прошлого отчёта"
                            id="report_date_2"
                            value={selectedOldDate}
                            onChange={handleOldDateChange}
                            options={selectedNewDate}
                            required
                            disabled={!selectedNewReportNumber}
                            filterOptions={filterOldDates}
                        />
                        <SelectField
                            label="Номер прошлого отчёта"
                            option="номер прошлого отчёта"
                            id="report_number_2"
                            value={selectedOldReportNumber}
                            onChange={handleOldReportNumberChange}
                            options={selectedNewReportNumber}
                            required
                            disabled={!selectedOldDate}
                            filterOptions={filterOldReportNumbers}
                        />
                    </tbody>
                </table>
                <Button
                    style={{
                        marginTop: "10px",
                        marginBottom: "10px",
                        width: "200px",
                        fontSize: "16px"
                    }}
                    type="primary"
                    htmlType="submit"
                >
                    Сравнить отчёты
                </Button>
                {Object.keys(data).length > 0 && (
                    <Button
                        style={{
                            marginTop: "10px",
                            marginBottom: "10px",
                            marginLeft: "10px",
                            fontSize: "16px",
                        }}
                        icon={<DownloadOutlined style={{ marginRight: "5px" }} />}
                        variant="solid"
                        color="green"
                        onClick={showModal}
                    >
                        Скачать результаты сравнения
                    </Button>
                )}
            </form>
            {comparisonStatus && (
                <LoadingSpinner text="Происходит сравнение отчётов, пожалуйста подождите немного" />
            )}
            {Object.keys(data).length > 0 && (
                <ComparisonVulnerabilities data={data} />
            )}

            <Modal
                title="Подтверждение"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                centered
                confirmLoading={downloadingComparison}
            >
                <p>Вы уверены, что скачать результаты сравнения отчёта?</p>
            </Modal>
        </div>
    );
};

export default Comparison;
