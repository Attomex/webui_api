import React, { useEffect, useState } from "react";
import "../scss/style.scss";
import { Button } from "react-bootstrap";
import {
    CRow,
} from "@coreui/react";
import "./pagesModules/ViewReports.css";
import api from "../../../utils/api";

import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner";

import { useComputerOptions } from "../hooks/useReportsData";
import useComparisonReportData from "../hooks/useComparisonReportData";
import ButtonDetails from "../shared/ButtonDetails/ButtonDetails";
import SelectField from "../shared/SelectField/SelectField";
import ComparisonVulnerability from "../shared/ComparisonVulnerability/ComparisonVulnerability";
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
    // Списки уязвимостей новые
    const [newVulnerabilities, setNewVulnerabilities] = useState([]);
    const [oldVulnerabilities, setOldVulnerabilities] = useState([]);
    const [fixedVulnerabilities, setFixedVulnerabilities] = useState([]);
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
    // Сообщения
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Статус сравнения
    const [comparisonStatus, setComparisonStatus] = useState(false);

    const [visible, setVisible] = useState(false);
    const [selectedVulnerability, setSelectedVulnerability] = useState(null);

    useEffect(() => {
        document.title = "Сравнение отчётов";
    }, []);

    const openModal = (vulnerability) => {
        setSelectedVulnerability(vulnerability);
        setVisible(true);
    };

    const handleComputerChange = (event) => {
        const selectedIdentifier = event.target.value;
        setSelectedComputer(selectedIdentifier);
        setSelectedNewDate("");
        setSelectedOldDate("");
        setSelectedNewReportNumber("");
        setSelectedOldReportNumber("");
        setNewVulnerabilities([]);
        setOldVulnerabilities([]);
        setError("");
        setMessage("");
    };

    const handleNewDateChange = (event) => {
        setSelectedNewDate(event.target.value);
        if (selectedComputer !== "") {
            setSelectedOldDate("");
            setSelectedNewReportNumber("");
            setSelectedOldReportNumber("");
            setNewVulnerabilities([]);
            setError("");
            setMessage("");
        }
    };

    const handleOldDateChange = (event) => {
        setSelectedOldDate(event.target.value);
        if (selectedComputer !== "") {
            setSelectedOldReportNumber("");
            setOldVulnerabilities([]);
            setError("");
            setMessage("");
        }
    };

    const handleNewReportNumberChange = (event) => {
        setSelectedNewReportNumber(event.target.value);
        setSelectedOldDate("");
        setSelectedOldReportNumber("");
        setNewVulnerabilities([]);
        setError("");
        setMessage("");
    };

    const handleOldReportNumberChange = (event) => {
        setSelectedOldReportNumber(event.target.value);
        setOldVulnerabilities([]);
        setError("");
        setMessage("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            setComparisonStatus(true);
            setMessage("");
            setError("");
            const response = await api().get("/api/admin/comparison", {
                params: {
                    computer_identifier: selectedComputer,
                    new_report_date: selectedNewDate,
                    new_report_number: selectedNewReportNumber,
                    old_report_date: selectedOldDate,
                    old_report_number: selectedOldReportNumber,
                },
            });
            setNewVulnerabilities(response.data.appeared_vulnerabilities); // новые
            setFixedVulnerabilities(response.data.fixed_vulnerabilities); // исправленные
            setOldVulnerabilities(response.data.remaining_vulnerabilities); // старые
            setMessage(response.data.message);
            setError("");
        } catch (error) {
            setError(error.response.data.error);
            setMessage("");
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
            {message && showSuccessNotification(message)}
            {error && showErrorNotification(error)}
            {message && (
                <>
                  <CRow>
                    <ComparisonVulnerability
                      text="Появившиеся уязвимости"
                      selectedVulnerability={newVulnerabilities}
                      openModal={openModal}
                    />

                    <ComparisonVulnerability
                      text="Неисправленные уязвимости"
                      selectedVulnerability={oldVulnerabilities}
                      openModal={openModal}
                    />

                    <ComparisonVulnerability
                      text="Исправленные уязвимости"
                      selectedVulnerability={fixedVulnerabilities}
                      openModal={openModal}
                    />
                  </CRow>
                  <ButtonDetails
                    visible={visible}
                    onClose={() => setVisible(false)}
                    selectedVulnerability={selectedVulnerability}
                  />
                </>
                // <>
                //     <Tabs
                //         defaultActiveKey="appeared"
                //         id="fill-tab-example"
                //         className="mb-3"
                //         fill
                //     >
                //         <Tab eventKey="appeared" title="Появившиеся уязвимости">
                //             <ComparisonVulnerability
                //                 text="Появившиеся уязвимости"
                //                 selectedVulnerability={newVulnerabilities}
                //                 openModal={openModal}
                //             />
                //         </Tab>
                //         <Tab
                //             eventKey="unfixed"
                //             title="Неисправленные уязвимости"
                //         >
                //             <ComparisonVulnerability
                //                 text="Неисправленные уязвимости"
                //                 selectedVulnerability={oldVulnerabilities}
                //                 openModal={openModal}
                //             />
                //         </Tab>
                //         <Tab eventKey="fixed" title="Исправленные уязвимости">
                //             <ComparisonVulnerability
                //                 text="Исправленные уязвимости"
                //                 selectedVulnerability={fixedVulnerabilities}
                //                 openModal={openModal}
                //             />
                //         </Tab>
                //     </Tabs>
                //     <ButtonDetails
                //         visible={visible}
                //         onClose={() => setVisible(false)}
                //         selectedVulnerability={selectedVulnerability}
                //     />
                // </>
            )}
        </div>
    );
};

export default React.memo(Comparison);
