import React from "react";
import { PiSealWarningDuotone } from "react-icons/pi";
import Card from "react-bootstrap/Card";
import c from './Card.module.css'

const CardM = ({ data }) => {
  const total_error = data.total_critical + data.total_high + data.total_medium + data.total_low;
  return (
    <Card style={{ minWidth: "16rem", maxWidth: "18rem" }} className={c.card}>
      <Card.Body>
        <Card.Title>Компьютер: {data.computer.identifier}</Card.Title>
        <Card.Subtitle>Количество ошибок: {total_error} </Card.Subtitle>
        <p className={c.p_style}>
          <PiSealWarningDuotone style={{ color: "#FF0000" }} />
          Критических: <b>{data.total_critical}</b>

        </p>
        <p className={c.p_style}>
          <PiSealWarningDuotone style={{ color: "#FF5000" }} />
          Высоких: <b>{data.total_high}</b>
        </p>
        <p className={c.p_style}>
          <PiSealWarningDuotone style={{ color: "#FFAF00" }} />
          Средних: <b>{data.total_medium}</b>
        </p>
        <p className={c.p_style}>
          <PiSealWarningDuotone style={{ color: "#008000" }} />
          Низких: <b>{data.total_low}</b>
        </p>
      </Card.Body>
    </Card>
  );
};

export default CardM;