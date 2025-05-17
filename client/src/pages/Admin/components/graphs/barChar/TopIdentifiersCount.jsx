import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../../../../../utils/api";
import { Spinner } from "react-bootstrap";
import c from "../ChartsModules/MainModule.module.css";

const TopIdentifiersCount = () => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChartData = async () => {
            api()
                .get("/api/admin/identifierscount")
                .then((response) => {
                    const data = response.data;
                    
                    // Фильтруем и преобразуем данные для Recharts
                    const filteredData = data
                        .filter((item) => item.count > 0)
                        .map((item) => ({
                            identifier_number: item.identifier_number.toString(),
                            count: item.count
                        }));

                    setChartData(filteredData);
                })
                .catch((error) => {
                    console.error("Ошибка при загрузке данных:", error);
                })
                .finally(() => setLoading(false));
        };

        fetchChartData();
    }, []);

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
            ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis 
                            dataKey="identifier_number" 
                            type="category" 
                            width={80} 
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar 
                            dataKey="count" 
                            name="Количество идентификаторов"
                            fill="#4bc0c0" 
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

export default TopIdentifiersCount;