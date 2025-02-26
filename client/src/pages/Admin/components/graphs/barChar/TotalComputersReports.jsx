import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Spinner } from "react-bootstrap";
import api from "../../../../../utils/api";
import "chart.js/auto";
import c from "../ChartsModules/MainModule.module.css";

const TotalComputersReports = () => {
    const [chartData, setChartData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Загрузка данных с сервера
        const fetchData = async () => {
            Promise.all([
                api().get(`/api/admin/computerscount`),
                api().get(`/api/admin/reportscount`),
            ])
                .then((responses) => {
                    const computerCount = responses[0].data.count;
                    const reportCounts = responses[1].data; // Общее количество, активные, неактивные

                    setChartData({
                        labels: ["Количество"], // Общий заголовок для всех категорий
                        datasets: [
                            {
                                label: "Компьютеры",
                                data: [computerCount],
                                backgroundColor: "rgba(54, 162, 235, 0.2)",
                                borderColor: "rgba(54, 162, 235, 1)",
                                borderWidth: 1,
                            },
                            {
                                label: "Все отчёты",
                                data: [reportCounts.total],
                                backgroundColor: "rgba(75, 192, 192, 0.2)",
                                borderColor: "rgba(75, 192, 192, 1)",
                                borderWidth: 1,
                            },
                            {
                                label: "Активные отчёты",
                                data: [reportCounts.active],
                                backgroundColor: "rgba(153, 102, 255, 0.2)",
                                borderColor: "rgba(153, 102, 255, 1)",
                                borderWidth: 1,
                            },
                            {
                                label: "Неактивные отчёты",
                                data: [reportCounts.inactive],
                                backgroundColor: "rgba(255, 159, 64, 0.2)",
                                borderColor: "rgba(255, 159, 64, 1)",
                                borderWidth: 1,
                            },
                        ],
                    });
                })
                .catch((error) => {
                    console.error("Error fetching counts:", error);
                })
                .finally(() => setLoading(false));
        };
        fetchData();
    }, []);

    const options = {
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    callback: function (value) {
                        if (Number.isInteger(value)) {
                            return value;
                        }
                        return "";
                    },
                },
            },
        },
        plugins: {
            legend: {
                display: true,
                position: "top",
            },
        },
    };

    return (
        <div className={c.main__bars__container}>
            <h5 style={{ height: "48px" }}>
                Общее количество компьютеров и отчётов
            </h5>
            {loading ? (
                <div className="d-flex justify-content-center flex-column align-items-center">
                    <Spinner animation="border" role="status"></Spinner>
                    <div>
                        <span>Загрузка графика</span>
                    </div>
                </div>
            ) : chartData.labels ? (
                <Bar data={chartData} options={options} />
            ) : (
                <p>Нет данных для отображения</p>
            )}
        </div>
    );
};

export default TotalComputersReports;
    