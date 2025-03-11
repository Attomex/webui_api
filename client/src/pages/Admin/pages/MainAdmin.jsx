import React, { useEffect, useState } from "react";
import "../scss/style.scss";
import api from "../../../utils/api";

import TopIdentifiersCount from "../components/graphs/barChar/TopIdentifiersCount";
import c from "./pagesModules/Main_Admin.module.css";
import TotalComputersReports from "../components/graphs/barChar/TotalComputersReports";
import LatestVulnerability from "../shared/LatestVulnerability/LatestVulnerability";

const MainAdmin = () => {
    const [latest, setLatest] = useState([]);

    useEffect(() => {
        document.title = "Главная";
        const fetchLatest = async () => {
            try {
                const response = await api().get("/api/admin/latestbase");
                setLatest(response.data?.latest);
            } catch (error) {
                setLatest([]);
            }
        };
        fetchLatest();
    }, []);

    return (
        <div style={{ marginLeft: "10px" }}>
            <br />
            <LatestVulnerability latest={latest} />
            <br />
            <h2>Графики</h2>
            <div className={c.app__container}>
                <div className={c.chart__wrapper}>
                    <TopIdentifiersCount />
                </div>
                <div className={c.chart__wrapper}>
                    <TotalComputersReports />
                </div>
            </div>
        </div>
    );
};

export default React.memo(MainAdmin);
