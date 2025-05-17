import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import locale from "antd/locale/ru_RU";
import {
    showErrorNotification,
    showSuccessNotification,
} from "../shared/Notification/Notification";
import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner";
import { Button, ConfigProvider, DatePicker, Space } from "antd";
import api from "../../../utils/api";
import ViewLogsTable from "../shared/ViewLogsTable/ViewLogsTable";

const { RangePicker } = DatePicker;

dayjs.extend(customParseFormat);
const dateFormat = "DD-MM-YYYY";

const ViewLogs = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [loadingDates, setLoadingDates] = useState(false);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const [logs, setLogs] = useState([]);

    const [selectedStartEndDate, setSelectedStartEndDate] = useState({
        start_date: "",
        end_date: "",
    });

    const handleDateChange = (_, dates) => {
        setLogs([]);
        if (Array.isArray(dates) && dates.length === 2) {
            setSelectedStartEndDate({
                start_date: dates[0],
                end_date: dates[1],
            });
        } else {
            setSelectedStartEndDate({
                start_date: "",
                end_date: "",
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoadingLogs(true);

        if (
            !selectedStartEndDate.start_date ||
            !selectedStartEndDate.end_date
        ) {
            showErrorNotification("Выберите даты начала и окончания.");
            setLoadingLogs(false);
            return;
        }

        try {
            const response = await api().get("/api/logs/by-date", {
                params: {
                    start_date: selectedStartEndDate.start_date,
                    end_date: selectedStartEndDate.end_date,
                },
            });
            setLogs(response.data.logs);
            showSuccessNotification("Логи успешно загружены.");
            // console.log(response.data);
        } catch (error) {
            showErrorNotification(error.response.data.error);
        } finally {
            setLoadingLogs(false);
        }
    };

    useEffect(() => {
        const fetchDateRanges = async () => {
            setLoadingDates(true);
            try {
                const response = await api().get("/api/logs/date-ranges");
                setStartDate(response.data.overall_start_date);
                setEndDate(response.data.overall_end_date);
            } catch (error) {
                showErrorNotification(error.response.data.error);
            } finally {
                setLoadingDates(false);
            }
        };

        fetchDateRanges();
    }, []);

    return (
        <div style={{ marginLeft: "10px" }}>
            <h2>Просмотр логов</h2>

            {loadingDates ? (
                <LoadingSpinner text="Загрузка доступных дат логов..."  variant="info" animation="border"/>
            ) : (
                <Space direction="horizontal" >
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
                        <RangePicker
                            format={dateFormat}
                            minDate={dayjs(startDate, dateFormat)}
                            maxDate={dayjs(endDate, dateFormat)}
                            onChange={handleDateChange}
                            style={{ width: "350px" }}
                        />
                    </ConfigProvider>
                    <Button
                        type="primary"
                        loading={loadingLogs}
                        onClick={handleSubmit}
                        style={{ fontSize: "16px" }}
                    >
                        Просмотр
                    </Button>
                </Space>
            )}
            {logs && logs.length > 0 && (
                <ViewLogsTable logs={logs} />
            )}
        </div>
    );
};

export default ViewLogs;
