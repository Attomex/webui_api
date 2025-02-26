import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import api from "../../../../../utils/api";
import { Spinner } from "react-bootstrap";
import c from "../ChartsModules/MainModule.module.css";

const TopIdentifiersCount = () => {
    const [chartData, setChartData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChartData = async () => {
            // Загрузка данных с сервера
            api()
                .get("/api/admin/identifierscount") // Используем новый эндпоинт
                .then((response) => {
                    const data = response.data;

                    // Фильтруем данные: удаляем идентификаторы с count = 0
                    const filteredData = data.filter((item) => item.count > 0);

                    // Форматируем данные для графика
                    const labels = filteredData.map(
                        (item) => item.identifier_number
                    );
                    const counts = filteredData.map((item) => item.count);

                    setChartData({
                        labels: labels,
                        datasets: [
                            {
                                label: "Количество идентификаторов",
                                data: counts,
                                backgroundColor: "rgba(75, 192, 192, 0.2)", // Цвет заливки
                                borderColor: "rgba(75, 192, 192, 1)", // Цвет границы
                                borderWidth: 1,
                            },
                        ],
                    });
                })
                .catch((error) => {
                    console.error("Ошибка при загрузке данных:", error);
                })
                .finally(() => setLoading(false));
        };

        fetchChartData();
    }, []);

    const options = {
        indexAxis: "y", // Горизонтальный график
        scales: {
            x: {
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
            tooltip: {
                enabled: true,
            },
        },
    };

    return (
        <div className={c.main__bars__container}>
            <h5 style={{ height: "48px" }}>Часто встречающиеся идентификаторы</h5>
            {loading ? (
                <div className="d-flex justify-content-center flex-column align-items-center">
                    <Spinner animation="border" role="status"></Spinner>
                    <div>
                        <span>Загрузка графика</span>
                    </div>
                </div>
            ) : chartData.labels && chartData.labels.length > 0 ? (
                <Bar data={chartData} options={options} />
            ) : (
                <p>Нет данных для отображения</p>
            )}
        </div>
    );
};

export default TopIdentifiersCount;
