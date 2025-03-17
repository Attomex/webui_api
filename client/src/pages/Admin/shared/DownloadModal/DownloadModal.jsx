import React, { useState } from 'react';
import downloadExcel from '../../scripts/downloadExcel';
import api from '../../../../utils/api';
import { CModal, CModalBody, CModalHeader, CModalTitle, CModalFooter, CButton } from '@coreui/react';

const DownloadModal = ({
    visible,
    onClose,
    selectedErrorLevels,
    setSelectedErrorLevels,
    selectedColumns,
    setSelectedColumns,
    selectedComputer,
    selectedDate,
    selectedReportNumber,
    errorLevels
}) => {
    const [loading, setLoading] = useState(false); // Состояние для отслеживания загрузки

    const handleErrorLevelChange = (level) => {
        if (selectedErrorLevels.includes(level)) {
            setSelectedErrorLevels(selectedErrorLevels.filter((l) => l !== level));
        } else {
            setSelectedErrorLevels([...selectedErrorLevels, level]);
        }
    };

    const handleColumnChange = (column) => {
        if (selectedColumns.includes(column)) {
            setSelectedColumns(selectedColumns.filter((c) => c !== column));
        } else {
            setSelectedColumns([...selectedColumns, column]);
        }
    };

    // Функция для скачивания отчёта
    const handleDownloadReport = async () => {
        try {
            setLoading(true); // Включаем состояние загрузки

            // Получаем данные отчёта с сервера
            const response = await api().get("/api/admin/download-report", {
                params: {
                    computer_identifier: selectedComputer,
                    report_date: selectedDate,
                    report_number: selectedReportNumber,
                },
            });

            // // Передаем данные в функцию downloadExcel
            downloadExcel(
                selectedErrorLevels,
                selectedColumns,
                selectedComputer,
                selectedReportNumber,
                selectedDate,
                errorLevels,
                response.data.vulnerabilities // Данные отчёта
            );

            // console.log(response.data.vulnerabilities);

            // Закрываем модальное окно после скачивания
            onClose();
        } catch (error) {
            console.error("Ошибка при скачивании отчёта:", error);
        } finally {
            setLoading(false); // Выключаем состояние загрузки
        }
    };

    return (
        <CModal visible={visible} onClose={onClose}>
            <CModalHeader onClose={onClose}>
                <CModalTitle>Выберите параметры отчета</CModalTitle>
            </CModalHeader>
            <CModalBody>
                <div>
                    <h5>Уровни ошибок:</h5>
                    {["Критический", "Высокий", "Средний", "Низкий"].map((level) => (
                        <div key={level}>
                            <input
                                type="checkbox"
                                checked={selectedErrorLevels.includes(level)}
                                onChange={() => handleErrorLevelChange(level)}
                            />
                            {level}
                        </div>
                    ))}
                </div>
                <div>
                    <h5>Столбцы:</h5>
                    {[
                        "Уровень ошибки",
                        "Идентификатор уязвимости",
                        "Название уязвимости",
                        "Описание",
                        "Возможные меры по устранению",
                        "Ссылки на источники",
                        "Ссылки на файлы",
                    ].map((column) => (
                        <div key={column}>
                            <input
                                type="checkbox"
                                checked={selectedColumns.includes(column)}
                                onChange={() => handleColumnChange(column)}
                            />
                            {column}
                        </div>
                    ))}
                </div>
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={onClose}>
                    Закрыть
                </CButton>
                <CButton color="primary" onClick={handleDownloadReport} disabled={loading}>
                    {loading ? "Скачивание..." : "Скачать отчёт"}
                </CButton>
            </CModalFooter>
        </CModal>
    );
};

export default DownloadModal;