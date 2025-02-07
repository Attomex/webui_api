import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try{
        await login(email, password);
        navigate('/admin')
    }catch (error) {
        alert(error.message);
    }
  };

  if(user){
    console.log(user);
    navigate('/admin')
  }

  return (
    <Container
      style={{
        maxWidth: '400px',
        marginTop: '50px',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Вход</h2>
      {error && (
        <Alert
          variant="danger"
          style={{ marginBottom: '20px', borderRadius: '4px' }}
        >
          {error}
        </Alert>
      )}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formBasicEmail" style={{ marginBottom: '15px' }}>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Введите email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
        </Form.Group>

        <Form.Group controlId="formBasicPassword" style={{ marginBottom: '15px' }}>
          <Form.Label>Пароль</Form.Label>
          <Form.Control
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Войти
        </Button>
      </Form>
    </Container>
  );
};

export default LoginPage;