import { useEffect, useState } from "react";
import "../scss/style.scss";
import axios from "axios";

// import ErrorLevels from "../components/graphs/barChar/ErrorLevels";
import c from "./pagesModules/Main_Admin.module.css";
import TotalComputersReports from "../components/graphs/barChar/TotalComputersReports";
import LatestVulnerability from "../shared/LatestVulnerability/LatestVulnerability";

const Main_Admin = () => {
  const url = process.env.REACT_APP_API_URL;

  const [latest, setLatest] = useState([]);

  useEffect(() => {
    document.title = "Главная";
  }, []);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const response = await axios.get(`${url}/api/admin/latestbase`);
        setLatest(response.data.latest);
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
        {/* <div className={c.chart__wrapper}>
                        <ErrorLevels />
                    </div> */}
        <div className={c.chart__wrapper}>
          <TotalComputersReports />
        </div>
      </div>
    </div>
  );
};

export default Main_Admin;
