import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";

const ButtonLoadMain = () => {
    return (
        <div>
            <div className="d-grid gap-2">
                <Link
                    to="/admin/upload"
                    style={{
                        textDecoration: "none",
                        textAlign: "center",
                        margin: "0 auto",
                        color: "black",
                        fontSize: "18px",
                        padding: "10px",
                        // marginLeft: "10px",
                        // marginTop: "20px",
                        width: "30%",
                        borderRadius: "10px",
                        borderColor: "rgb(255, 255, 255)",
                        borderWidth: "3px",
                        borderStyle: "solid",
                        transition: "background-color 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                            "rgba(51, 58, 76, 0.4)";
                        e.currentTarget.style.cursor = "pointer";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "";
                        e.currentTarget.style.cursor = "";
                    }}
                    onClick={(e) => {
                        e.currentTarget.style.backgroundColor = "";
                        e.currentTarget.style.cursor = "";
                    }}
                >
                    Загрузить HTML-отчёт
                </Link>
            </div>
        </div>
    );
};

export default ButtonLoadMain;
