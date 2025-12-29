import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <Card className="shadow-lg border-0 fade-in-up">
              <Card.Header className="bg-primary text-white text-center py-4">
                <i className="fas fa-sign-in-alt fa-2x mb-2"></i>
                <h3 className="mb-0">Welcome Back!</h3>
                <p className="mb-0 opacity-75">Sign in to your account</p>
              </Card.Header>
              <Card.Body className="p-5">
                {error && (
                  <Alert variant="danger" className="mb-4">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-envelope me-2 text-primary"></i>
                      Email Address
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      className="py-3"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-lock me-2 text-primary"></i>
                      Password
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                        className="py-3"
                      />
                      <Button 
                        variant="outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </Button>
                    </InputGroup>
                  </Form.Group>
                  
                  <div className="d-grid mb-4">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="lg"
                      disabled={loading}
                      className="py-3"
                    >
                      {loading ? (
                        <>
                          <span className="loading-spinner me-2"></span>
                          Signing In...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sign-in-alt me-2"></i>
                          Sign In
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
                
                <div className="text-center">
                  <p className="mb-3">
                    Don't have an account? 
                    <Link to="/register" className="text-decoration-none ms-1 fw-semibold">
                      Create one here
                    </Link>
                  </p>
                  
                  <div className="bg-light rounded p-3">
                    <small className="text-muted d-block mb-2">
                      <i className="fas fa-info-circle me-1"></i>
                      Demo Credentials
                    </small>
                    <div className="d-flex justify-content-between small">
                      <span><strong>Admin:</strong> admin@bookstore.com</span>
                      <span><strong>Password:</strong> admin123</span>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;