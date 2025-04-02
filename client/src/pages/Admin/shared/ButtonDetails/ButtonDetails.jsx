import React from "react";
import { Modal, Button, Typography, Descriptions, ConfigProvider, Tag } from "antd";

const { Text, Link } = Typography;

const ButtonDetails = ({ visible, onClose, selectedVulnerability }) => {
    const renderLinks = (links) => {
        if (!links || links.length === 0) {
            return <Text type="secondary">Нет ссылок</Text>;
        }

        return (
            <ul style={{ paddingLeft: 20, margin: 0 }}>
                {links.map((link, index) => (
                    <li key={index}>
                        <Link
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: "16px" }}
                        >
                            {link.length > 80
                                ? `${link.substring(0, 80)}...`
                                : link}
                        </Link>
                    </li>
                ))}
            </ul>
        );
    };

    const renderErrorLevel = (error_level) => {
        let color = "";
        switch (error_level) {
            case 'Критический':
                color = 'red';
                break;
            case 'Высокий':
                color = 'orange';
                break;
            case 'Средний':
                color = 'yellow';
                break;
            case 'Низкий':
                color = 'green';
                break;
            default:
                color = 'gray';
        }

        return <Tag color={color} style={{ color: "black", fontSize: "14px", fontWeight: "480"  }}>{error_level}</Tag>;
    }

    const items = [
        {
            key: "1",
            label: "Уровень уязвимости",
            children: renderErrorLevel(selectedVulnerability.error_level),
        },
        {
            key: "2",
            label: "Идентификатор",
            children: selectedVulnerability.identifiers,
        },
        {
            key: "3",
            label: "CPE",
            children: selectedVulnerability.cpe,
        },
        {
            key: "4",
            label: "Название",
            children: selectedVulnerability.name,
        },
        {
            key: "5",
            label: "Описание",
            children: selectedVulnerability.description,
        },
        {
            key: "6",
            label: "Рекомендации",
            children: selectedVulnerability.remediation_measures,
        },
        {
            key: "7",
            label: "Ссылки",
            children: renderLinks(selectedVulnerability.source_links),
        },
    ];

    return (
        <ConfigProvider
            theme={{
                components: {
                    Descriptions: {
                        labelBg: "rgba(117, 117, 117, 0.2)",
                        colorSplit: "rgba(117, 117, 117, 0.25)",
                        fontSize: 16,
                    },
                },
            }}
        >
            <Modal
                title="Подробная информация об уязвимости"
                open={visible}
                onCancel={onClose}
                width={1100}
                footer={[<Button onClick={onClose}>Закрыть</Button>]}
                centered
                destroyOnClose
            >
                {selectedVulnerability && (
                    <Descriptions
                        column={1}
                        bordered
                        size="middle"
                        items={items}
                        style={{
                            borderRadius: "16px",
                            overflow: "hidden",
                        }}
                        labelStyle={{
                            color: "black",
                            width: "18%",
                            padding: "10px",
                        }}
                    />
                )}
            </Modal>
        </ConfigProvider>
    );
};

export default ButtonDetails;
