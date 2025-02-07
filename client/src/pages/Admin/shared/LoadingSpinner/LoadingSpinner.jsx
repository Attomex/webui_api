import React from "react";
import { Spinner } from "react-bootstrap";

const LoadingSpinner = ({ text, variant="warning", animation="grow" }) => {
    return (
    <div
        style={{
            display: "flex",
            alignItems: "center",
            marginTop: "10px",
        }}
    >
        <Spinner
            animation={animation}
            variant={variant}
            role="status"
            style={{
                width: "2rem",
                height: "2rem",
            }}
        >
        </Spinner>
        <span style={{ marginLeft: "10px" }}>{text}</span>
    </div>
)};

export default LoadingSpinner;
