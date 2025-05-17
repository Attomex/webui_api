import React, { useState, useEffect } from "react";
import { Modal, Button } from "antd";
import "../scss/style.scss";
import { parseHTML } from "../scripts/parseHTML";
import c from "./pagesModules/Uploading.module.css";
import UploadingOptions from "../components/UploadingOptions";
import api from "../../../utils/api";
import { useComputerOptions } from "../hooks/useReportsData";
import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner";
import { showSuccessNotification, showErrorNotification } from "../shared/Notification/Notification";
import CreateTaskForm from "../shared/CreateTaskForm/CreateTaskForm";

function normalizeNumber(num) {
    return num > 1000 ? `${(num / 1000).toFixed(2)} с` : `${num} мс`;
}

const Uploading = () => {
    const url = process.env.REACT_APP_API_URL;

    const [report_file, setFile] = useState(null);
    const [computerIdentifier, setComputerIdentifier] = useState("");
    const [newIdentifier, setNewIdentifier] = useState("");
    const computerOptions = useComputerOptions();
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");

    const [uniqueFiles, setUniqueFiles] = useState([]);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const [reportNumber, setReportNumber] = useState("");

    const [parseDurationMs, setParseDurationMs] = useState(null);
    const [uploadDurationMs, setUploadDurationMs] = useState(null);

    useEffect(() => {
        document.title = "Загрузка отчёта";
    }, []);

    const csrfToken = async () => {
        await api().get(`${url}/sanctum/csrf-cookie`);
    };

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

    // const handleSubmit = (event) => {
    //     event.preventDefault();

    //     const reader = new FileReader();

    //     reader.onload = async (e) => {
    //         // const content = e.target.result;
    //         // const identifier = computerIdentifier;
    //         // setLoading(true);
    //         // setLoadingText("Происходит парсинг отчёта...");

    //         // const { parsedData, uniqueFilesData } = await parseHTML(content, identifier);
    //         // setUniqueFiles(uniqueFilesData.uniqueFiles);
    //         // setReportNumber(parsedData.reportNumber);

    //         // setShowConfirmModal(true);
    //         // setLoading(false);

    //         try {
    //             const content = e.target.result;
    //             const identifier = computerIdentifier;
    //             setLoading(true);
    //             setLoadingText("Происходит парсинг отчёта...");
    //             const { parsedData, uniqueFilesData, parseDuration } = await parseHTML(content, identifier);
    //             setUniqueFiles(uniqueFilesData.uniqueFiles);
    //             setReportNumber(parsedData.reportNumber);
    //             setParseDurationMs(parseDuration.toFixed(4));

    //             setShowConfirmModal(true);
    //         } catch (parseError) {
    //             // console.log(parseError.message)
    //             showErrorNotification(parseError.message);
    //         } finally {
    //             setLoading(false);
    //         }

    //         // try {
    //         //   setLoading(true);
    //         //   setLoadingText("Отчёт загружается на сервер...");

    //         //   await csrfToken();

    //         //   const response = await api().post('/api/admin/upload', parsedData);

    //         //   setUploadDurationMs(response.data.uploadDuration)
    //         //   showSuccessNotification(response.data.message);

    //         //   // Сохраняем уникальные файлы и показываем форму задания
    //         // setReportNumber(parsedData.reportNumber);
    //         //   setUniqueFiles(uniqueFilesData.uniqueFiles);
    //         //   setShowTaskForm(true);
    //         // } catch (error) {
    //         //   showErrorNotification(error.response.data.message);
    //         // } finally {
    //         //   setLoading(false);
    //         //   clearFields();
    //         // }
    //     };
    //     reader.readAsText(report_file);
    // };

    const handleSubmit = (event) => {
        event.preventDefault();
      
        if (!report_file) {
          showErrorNotification("Сначала выберите файл отчёта");
          return;
        }
      
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            // 1) Парсинг
            setLoading(true);
            setLoadingText("Происходит парсинг отчёта...");
            const { parsedData, uniqueFilesData, parseDuration } = await parseHTML(
              e.target.result,
              computerIdentifier
            );
      
            setUniqueFiles(uniqueFilesData.uniqueFiles);
            setReportNumber(parsedData.reportNumber);
            setParseDurationMs(parseDuration.toFixed(2));
      
            // 2) Загрузка на сервер
            setLoadingText("Отчёт загружается на сервер...");
            await csrfToken();
            const response = await api().post("/api/admin/upload", parsedData);
      
            setUploadDurationMs(response.data.uploadDuration);
            showSuccessNotification(response.data.message);
            setShowConfirmModal(true);
      
          } catch (error) {
            const msg = error.response?.data?.message || error.message;
            showErrorNotification(msg);
          } finally {
            setLoading(false);
          }
        };
      
        // Читаем файл из стейта
        reader.readAsText(report_file);
    };
      

    // Обработчик отправки задания
    const handleTaskSubmit = async (taskData) => {
          console.log(taskData);

        try {
            setLoading(true);
            setLoadingText("Получение данных для задания...");

            await csrfToken();
            const response = await api().post("/api/admin/tasks", taskData);

            showSuccessNotification("Задание успешно создано");
            clearFields();
            // console.log(response);
        } catch (error) {
            showErrorNotification(error.response?.data?.error || "Ошибка создания задания");
        } finally {
            setLoading(false);
        }
    };

    const clearFields = () => {
        setFile(null);
        setComputerIdentifier("");
        setNewIdentifier("");
        setShowTaskForm(false);
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
                
                {parseDurationMs !== null && (
                    <div style={{ marginTop: "10px", fontSize: "14px" }}>
                        <div>Время парсинга документа: {parseDurationMs} мс</div>
                        {uploadDurationMs !== null && (
                            <div>Время загрузки данных в БД: {normalizeNumber(uploadDurationMs)}</div>
                        )}
                    </div>
                )}

                <Button
                    style={{
                        marginTop: "10px",
                        marginBottom: "10px",
                        width: "200px",
                        fontSize: "16px",
                    }}
                    htmlType="submit"
                    type="primary"
                    disabled={loading}
                >
                    Загрузить
                </Button>

                <Button
                    style={{
                        marginTop: "10px",
                        marginBottom: "10px",
                        marginLeft: "10px",
                        width: "200px",
                        fontSize: "16px",
                    }}
                    variant="secondary"
                    onClick={clearFields}
                    disabled={loading}
                >
                    Очистить поля
                </Button>
            </form>
            {loading && <LoadingSpinner text={loadingText} />}

            <Modal
                title="Задание для инженера"
                open={showConfirmModal}
                onCancel={() => setShowConfirmModal(false)}
                centered
                footer={
                    <div>
                        <Button style={{ marginRight: "10px" }} variant="secondary" onClick={() => setShowConfirmModal(false)}>
                            Нет
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => {
                                setShowConfirmModal(false);
                                setShowTaskForm(true);
                            }}
                        >
                            Да
                        </Button>
                    </div>
                }
            >
                <p>Вы хотите создать задание для инженера?</p>
            </Modal>

            {showTaskForm && (
                <CreateTaskForm
                    uniqueFiles={uniqueFiles}
                    reportNumber={reportNumber}
                    onSubmit={handleTaskSubmit}
                    onCancel={() => setShowTaskForm(false)}
                />
            )}
        </div>
    );
};

export default Uploading;
