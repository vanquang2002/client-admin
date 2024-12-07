import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import './login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('https://server-j956.onrender.com/login', {
        username,
        password,
      });

      const { accessToken, refreshToken, user } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      setLoading(false);
      setError(null);
      // Redirect to dashboard or home page after successful login
      window.location.href = '/dashboard';
    } catch (err) {
      setLoading(false);
      setError(err.response ? err.response.data.message : 'Login failed');
    }
  };

  return (
    <Container className="login-container">
      <h2 className="text-center mb-4">Login</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit} className="login-form">
        <Form.Group controlId="username">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          className="w-100 mt-3"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </Form>
    </Container>
  );
};

export default Login;
