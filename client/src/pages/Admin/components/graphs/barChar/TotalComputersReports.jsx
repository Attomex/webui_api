import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Spinner } from "react-bootstrap";
import api from "../../../../../utils/api";
import c from "../ChartsModules/MainModule.module.css";

const TotalComputersReports = () => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            Promise.all([
                api().get(`/api/admin/computerscount`),
                api().get(`/api/admin/reportscount`),
            ])
                .then((responses) => {
                    const computerCount = responses[0].data.count;
                    const reportCounts = responses[1].data;

                    // Преобразуем данные в формат, понятный Recharts
                    const data = [{
                        name: "Количество",
                        computers: computerCount,
                        totalReports: reportCounts.total,
                        activeReports: reportCounts.active,
                        inactiveReports: reportCounts.inactive
                    }];

                    setChartData(data);
                })
                .catch((error) => {
                    console.error("Error fetching counts:", error);
                })
                .finally(() => setLoading(false));
        };
        fetchData();
    }, []);

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
            ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis 
                            allowDecimals={false}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar 
                            dataKey="computers" 
                            name="Компьютеры" 
                            fill="#36a2eb" 
                            fillOpacity={0.8}
                        />
                        <Bar 
                            dataKey="totalReports" 
                            name="Все отчёты" 
                            fill="#4bc0c0" 
                            fillOpacity={0.8}
                        />
                        <Bar 
                            dataKey="activeReports" 
                            name="Активные отчёты" 
                            fill="#9966ff" 
                            fillOpacity={0.8}
                        />
                        <Bar 
                            dataKey="inactiveReports" 
                            name="Неактивные отчёты" 
                            fill="#ff9f40" 
                            fillOpacity={0.8}
                        />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <p>Нет данных для отображения</p>
            )}
        </div>
    );
};

export default TotalComputersReports;