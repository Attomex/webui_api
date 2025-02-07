import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button } from "react-bootstrap";
import ButtonDetails from "../ButtonDetails/ButtonDetails";
import "../../scss/style.scss";
import { useLocation } from "react-router-dom";
// import { use } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VulnerabilitiesPage = () => {
  const url = process.env.REACT_APP_API_URL;

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  // ?file_id=1&reportId=1
  const fileId = queryParams.get("fileId");
  const reportId = queryParams.get("reportId");

  const [file, setFile] = useState([]);
  const [selectedVulnerability, setSelectedVulnerability] = useState("");
  const [visible, setVisible] = useState(false);
  const [vulnerabilities, setVulnerabilities] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const openModal = (vulnerability) => {
    setSelectedVulnerability(vulnerability);
    setVisible(true);
  };

  useEffect(() => {
    document.title = "Связные уязвимости";
  }, []);

  useEffect(() => {
    const fetchVulnerabilities = async () => {
      try {
        const response = await axios.get(
          `${url}/api/admin/view/vulnerabilities?fileId=${fileId}&reportId=${reportId}`
        );
        setFile(response.data.file.file_path);
        setVulnerabilities(response.data.vulnerabilities);
        toast.success("Уязвимости успешно загружены", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
        })
      } catch (error) {
        console.error("Error fetching vulnerabilities:", error);
        setError(error.response.data.error);
        toast.error("Ошибка при получении уязвимостей", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
      }
    };
    fetchVulnerabilities();
  }, [fileId, reportId]);

  return (
    <div style={{ marginLeft: "10px" }}>
      <h2>Связные уязвимости для файла: <span style={{color: "red"}}>{file}</span></h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Идентификатор</th>
            <th>Уровень ошибки</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {vulnerabilities && vulnerabilities.map((vuln, index) => (
            <tr key={index}>
              <td>{vuln.identifiers}</td>
              <td>{vuln.error_level}</td>
              <td>
                <Button variant="secondary" onClick={() => openModal(vuln)}>
                  Показать подробности
                </Button>
              </td>
            </tr>
            ))}
        </tbody>
      </Table>

      {selectedVulnerability && (
        <ButtonDetails
          visible={visible}
          selectedVulnerability={selectedVulnerability}
          onClose={() => setVisible(false)}
        />
      )}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default VulnerabilitiesPage;
