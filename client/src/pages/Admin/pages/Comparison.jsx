import React, { useEffect, useState } from "react";
import "../scss/style.scss";
import { Button } from "react-bootstrap";
import "./pagesModules/ViewReports.css";
import api from "../../../utils/api";

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
    // Базовые состояния
    const [selectedComputer, setSelectedComputer] = useState("");
    //Даты новые и старые
    const [selectedNewDate, setSelectedNewDate] = useState("");
    const [selectedOldDate, setSelectedOldDate] = useState("");
    // Номера отчётов новые и старые
    const [selectedNewReportNumber, setSelectedNewReportNumber] = useState("");
    const [selectedOldReportNumber, setSelectedOldReportNumber] = useState("");

    const [data, setData] = useState({});

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

    // Статус сравнения
    const [comparisonStatus, setComparisonStatus] = useState(false);

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
            // setNewVulnerabilities(response.data.appeared_vulnerabilities); // новые
            // setFixedVulnerabilities(response.data.fixed_vulnerabilities); // исправленные
            // setOldVulnerabilities(response.data.remaining_vulnerabilities); // старые
            showSuccessNotification(response.data.message);
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
            <h2>Сравнение двух отчётов</h2>
            <h1 style={{ color: "grey", fontSize: "12px" }}>
                * Сравнение производится по одному идентификатору компьютера
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
                    }}
                    as="input"
                    type="submit"
                    value="Сравнить отчёты"
                />
            </form>
            {comparisonStatus && (
                <LoadingSpinner text="Происходит сравнение отчётов, пожалуйста подождите немного" />
            )}
            {Object.keys(data).length > 0 && (
                <ComparisonVulnerabilities data={data} />
            )}
        </div>
    );
};

export default React.memo(Comparison);
