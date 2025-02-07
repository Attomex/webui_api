import React from "react";
import { Table, Button } from "react-bootstrap";

const FileTable = ({
  files,
  reportId,
  filesCount,
  selectedComputer,
  selectedDate,
  selectedReportNumber,
}) => {
    const handleViewVulnerabilities = (file_id) => {
      const queryParams = new URLSearchParams({
        fileId: file_id,
        reportId: reportId,
      }).toString();

      window.open(`/admin/view/vulnerabilities?${queryParams}`, "_blank");
    };

  return (
    <div>
      <p>Идентификатор компьютера: {selectedComputer}</p>
      <p>Дата отчёта: {selectedDate}</p>
      <p>Номер отчёта: {selectedReportNumber}</p>

      <h2>Файлы с уязвимостями (было найдено {filesCount} файлов)</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Ссылка на файл</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(files).map((key, index) => {
            const file = files[key]; // Получаем значение по ключу
            return (
              <tr key={index}>
                <td>{file.file_path}</td> {/* Отображаем путь к файлу */}
                <td>
                  <Button
                    variant="primary"
                    onClick={() => handleViewVulnerabilities(file.id)}
                  >
                    Посмотреть связанные уязвимости
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default FileTable;
