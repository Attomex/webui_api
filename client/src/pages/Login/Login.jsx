import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Alert, Container, Card } from "react-bootstrap";
import { Button as AntdButton } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import axios from "axios";
import api from "../../utils/api";
import { useAuth } from "../Admin/context/AuthContext";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth(); // Используем контекст

    const url = process.env.REACT_APP_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            await axios
                .get(`${url}/sanctum/csrf-cookie`, { withCredentials: true })
                .then(() => {
                    api()
                        .post("/api/auth/login", { email, password })
                        .then((response) => {
                            const token = response.data.token;
                            login(token); // Используем контекст для входа
                            navigate("/admin");
                        })
                        .catch((error) => {
                            setError(error.response.data.error);
                            console.error(error);
                        });
                });
        } catch (err) {
            setError("Неправильный логин или пароль");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container
            className="d-flex justify-content-center align-items-center flex-column"
            style={{ minHeight: "100vh" }}
        >

            <Card
                style={{
                    width: "400px",
                    padding: "20px",
                    position: "relative",
                }}
            >
                <AntdButton
                    type="dashed"
                    onClick={() => navigate("/")}
                    style={{
                        position: "absolute",
                        left: "0",
                        top: "-40px",
                    }}
                    icon={<ArrowLeftOutlined />}
                >
                    Вернуться назад
                </AntdButton>
                <Card.Body>
                    <h2 className="text-center mb-4">Вход</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formEmail" className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Введите email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formPassword" className="mb-3">
                            <Form.Label>Пароль</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Введите пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button
                            variant="primary"
                            type="submit"
                            disabled={loading}
                            className="w-100"
                        >
                            {loading ? "Вход..." : "Войти"}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default LoginPage;
