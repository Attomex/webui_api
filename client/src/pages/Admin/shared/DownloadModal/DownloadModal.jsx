import React, { useState } from 'react';
import downloadExcel from '../../scripts/downloadExcel';
import api from '../../../../utils/api';
import { 
  Modal, 
  Checkbox, 
  Button, 
  Divider, 
  Typography, 
  Spin,
  Space,
  Row,
  Col
} from 'antd';
import {
  DownloadOutlined,
  CloseOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

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
  user
}) => {
  const [loading, setLoading] = useState(false);

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

  const handleDownloadReport = async () => {
    try {
      setLoading(true);
      const response = await api().get("/api/admin/download-report", {
        params: {
          computer_identifier: selectedComputer,
          report_date: selectedDate,
          report_number: selectedReportNumber,
        },
      });

      console.log(response.data)

      downloadExcel(
        user,
        selectedErrorLevels,
        selectedColumns,
        selectedComputer,
        selectedReportNumber,
        selectedDate,
        response.data.statusReport,
        response.data.errorLevels,
        response.data.vulnerabilities
      );

      onClose();
    } catch (error) {
      console.error("Ошибка при скачивании отчёта:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Выберите параметры отчета"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button 
          key="back" 
          onClick={onClose}
          icon={<CloseOutlined />}
        >
          Закрыть
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleDownloadReport}
          loading={loading}
          icon={<DownloadOutlined />}
        >
          {loading ? "Скачивание..." : "Скачать отчёт"}
        </Button>,
      ]}
    >
      <Row gutter={[24, 16]}>
        <Col span={12}>
          <Title level={5} style={{ marginBottom: 16 }}>Уровни ошибок:</Title>
          <Space direction="vertical">
            {["Критический", "Высокий", "Средний", "Низкий"].map((level) => (
              <Checkbox
                key={level}
                checked={selectedErrorLevels.includes(level)}
                onChange={() => handleErrorLevelChange(level)}
              >
                <Text>{level}</Text>
              </Checkbox>
            ))}
          </Space>
        </Col>

        <Col span={12}>
          <Title level={5} style={{ marginBottom: 16 }}>Столбцы:</Title>
          <Space direction="vertical">
            {[
              "Уровень ошибки",
              "Идентификатор уязвимости",
              "CPE",
              "Название уязвимости",
              "Описание",
              "Возможные меры по устранению",
              "Ссылки на источники",
              "Ссылки на файлы",
            ].map((column) => (
              <Checkbox
                key={column}
                checked={selectedColumns.includes(column)}
                onChange={() => handleColumnChange(column)}
              >
                <Text>{column}</Text>
              </Checkbox>
            ))}
          </Space>
        </Col>
      </Row>
    </Modal>
  );
};

export default DownloadModal;