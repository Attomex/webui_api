import React from "react";
import { useNavigate } from "react-router-dom";
import { PiSealWarningDuotone } from "react-icons/pi";
import { Card } from "react-bootstrap";
import { Button, Dropdown } from "antd";
import {
    LaptopOutlined,
    FileSearchOutlined,
} from "@ant-design/icons";
import c from "./Card.module.css";

const CardM = ({ data }) => {
    const navigate = useNavigate();

    const total_error =
        data.total_critical +
        data.total_high +
        data.total_medium +
        data.total_low;

    const searchByComputer = (e) =>{
      e.preventDefault();
      const params = `?computer_name=${data.computer.identifier}`
      navigate(`/admin/search${params}`);
    }

    const searchByReport = (e) =>{
        e.preventDefault();
        const params = `?report_number=${data.report_number}&report_date=${data.report_date}`
        navigate(`/admin/search${params}`);
      }

    const items = [
        {
            key: "1",
            label: <p style={{ color: "grey", marginBottom: "0" }}>Поиск...</p>,
            disabled: true,
        },
        {
            type: "divider",
        },
        {
            key: "2",
            label: (
                <Button variant="outlined" color="grey" style={{ width: "100%" }} onClick={searchByComputer}>
                    По компьютеру
                </Button>
            ),
            icon: <LaptopOutlined style={{ color: "rgb(35, 168, 242)" }} />,
        },
        {
            key: "3",
            label: (
                <Button variant="outlined" color="grey" style={{ width: "100%" }} onClick={searchByReport}>
                    По отчёту
                </Button>
            ),
            icon: <FileSearchOutlined style={{ color: "rgb(35, 168, 242)" }} />,
        },
    ];
    return (
        <Dropdown
            menu={{
                items,
            }}
            trigger={['contextMenu']}
        >
            <Card
                style={{ minWidth: "16rem", maxWidth: "18rem" }}
                className={c.card}
            >
                <Card.Body>
                    <Card.Title>
                        Компьютер: {data.computer.identifier}
                    </Card.Title>
                    <Card.Subtitle>
                        Количество ошибок: {total_error}{" "}
                    </Card.Subtitle>
                    <p className={c.p_style}>
                        <PiSealWarningDuotone style={{ color: "#FF0000", marginRight: "5px" }} />
                        Критических: <b>{data.total_critical}</b>
                    </p>
                    <p className={c.p_style}>
                        <PiSealWarningDuotone style={{ color: "#FF5000", marginRight: "5px" }} />
                        Высоких: <b>{data.total_high}</b>
                    </p>
                    <p className={c.p_style}>
                        <PiSealWarningDuotone style={{ color: "#FFAF00", marginRight: "5px" }} />
                        Средних: <b>{data.total_medium}</b>
                    </p>
                    <p className={c.p_style}>
                        <PiSealWarningDuotone style={{ color: "#008000", marginRight: "5px" }} />
                        Низких:<b>{data.total_low}</b>
                    </p>
                </Card.Body>
            </Card>
        </Dropdown>
    );
};

export default CardM;
