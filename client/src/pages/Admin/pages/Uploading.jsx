import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import "../scss/style.scss";
import { parseHTML } from "../scripts/parseHTML";
import c from "./pagesModules/Uploading.module.css";
import UploadingOptions from "../components/UploadingOptions";
import api from "../../../utils/api";

import { useComputerOptions } from "../hooks/useReportsData";

import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner";
import { showSuccessNotification, showErrorNotification } from "../shared/Notification/Notification";

const Uploading = () => {
  const url = process.env.REACT_APP_API_URL;

  const [report_file, setFile] = useState(null);
  const [computerIdentifier, setComputerIdentifier] = useState("");
  const [newIdentifier, setNewIdentifier] = useState("");
  const computerOptions = useComputerOptions();
  const [loading, setLoading] = useState(false);

  const [loadingText, setLoadingText] = useState("");

  useEffect(() => {
    document.title = "Загрузка отчёта";
  }, []);

  const csrfToken = async () => { await api().get(`${url}/sanctum/csrf-cookie`) };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split(".").pop().toLowerCase();

      if (fileExtension === "html") {
        setFile(selectedFile);
      } else {
        showErrorNotification("Пожалуйста, выберите файл с расширением .html");
        setFile(null);
        document.getElementById("report_file").value = "";
      }
    }
  };

  const handleIdentifierChange = (event) => {
    setComputerIdentifier(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const reader = new FileReader();

    reader.onload = async (e) => {
      const content = e.target.result;
      const identifier = computerIdentifier;
      setLoading(true);
      setLoadingText("Происходит парсинг отчёта...");

      await new Promise((resolve) => setTimeout(resolve, 0));

      const parsedData = await parseHTML(content, identifier);

      try {
        setLoading(true);
        setLoadingText("Отчёт загружается на сервер...");

        await csrfToken();

        const response = await api().post('/api/admin/upload', parsedData);

        showSuccessNotification(response.data.message);
      } catch (error) {
        showErrorNotification(error.response.data.message);
        // console.log(error);
      } finally {
        setLoading(false);
        clearFields();
      }
    };
    reader.readAsText(report_file);
  };

  const clearFields = () => {
    setFile(null);
    setComputerIdentifier("");
    setNewIdentifier("");
    document.getElementById("report_file").value = "";
  };

  return (
    <div style={{ marginLeft: "10px" }}>
      <h2>Загрузка отчётов</h2>
      <form onSubmit={handleSubmit}>
        <table>
          <tbody>
            <tr>
              <UploadingOptions
                computerOptions={computerOptions}
                handleIdentifierChange={handleIdentifierChange}
                computerIdentifier={computerIdentifier}
                setterComputerIdentifier={setComputerIdentifier}
                newIdentifier={newIdentifier}
                setNewIdentifier={setNewIdentifier}
              />
            </tr>
            <tr>
              <td>
                <label htmlFor="report_file" className={c.form__label}>
                  Файл отчета:
                </label>
              </td>
              <td>
                <input
                  type="file"
                  id="report_file"
                  onChange={handleFileChange}
                  className={c.form__input__file}
                  required
                  accept=".html"
                />
              </td>
            </tr>
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
          value="Загрузить"
          disabled={loading}
        />

        <Button
          style={{
            marginTop: "10px",
            marginBottom: "10px",
            marginLeft: "10px",
            width: "200px",
          }}
          variant="secondary"
          onClick={clearFields}
          disabled={loading}
        >
          Очистить поля
        </Button>
      </form>
      {loading && <LoadingSpinner text={loadingText} />}
    </div>
  );
};

export default Uploading;
