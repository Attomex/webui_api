import React from "react";
import { Modal, Button, Table, ConfigProvider } from "antd";

const LogDetailsModal = ({
    isModalVisible,
    setIsModalVisible,
    selectedLogData,
}) => {
    const columns = [
        {
            title: <div style={{ fontSize: "16px" }}>Поле</div>,
            dataIndex: "key",
            key: "key",
            render: (text) => {
                const firstLetter = text.charAt(0).toUpperCase();
                const restOfText = text.slice(1);
                return (
                    <strong
                        style={{ fontSize: "16px" }}
                    >{`${firstLetter}${restOfText}`}</strong>
                );
                // <strong>{text}</strong>
            },
        },
        {
            title: <div style={{ fontSize: "16px" }}>Значение</div>,
            dataIndex: "value",
            key: "value",
            render: (value) =>
                typeof value === "object" ? (
                    <pre style={{ fontSize: "16px" }}>
                        {JSON.stringify(value, null, 2)}
                    </pre>
                ) : (
                    <div style={{ fontSize: "16px" }}>{value}</div>
                ),
        },
    ];

    const dataSource = selectedLogData
        ? Object.entries(selectedLogData).map(([key, value]) => ({
              key,
              value,
          }))
        : [];

    return (
        <Modal
            title={
                <div
                    style={{
                        textAlign: "center",
                        fontSize: "20px",
                        fontWeight: "bold",
                    }}
                >
                    Детали лога
                </div>
            }
            open={isModalVisible}
            closeIcon={false}
            onCancel={() => setIsModalVisible(false)}
            footer={[
                <Button
                    key="close"
                    type="primary"
                    onClick={() => setIsModalVisible(false)}
                >
                    Закрыть
                </Button>,
            ]}
            width={800}
            centered
        >
            {selectedLogData && (
                <ConfigProvider
                    theme={{
                        components: {
                            Table: {
                                colorBgContainer: "rgb(243, 244, 247)",
                                borderColor: "rgb(204, 204, 204)",
                            },
                        },
                    }}
                >
                    <Table
                        dataSource={dataSource}
                        columns={columns}
                        pagination={false} // Отключаем пагинацию
                        bordered
                        size="small"
                    />
                </ConfigProvider>
            )}
        </Modal>
    );
};

export default LogDetailsModal;
