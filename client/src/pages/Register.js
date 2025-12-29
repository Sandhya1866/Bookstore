import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, ProgressBar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    return strength;
  };

  const getPasswordStrengthLabel = () => {
    const strength = getPasswordStrength();
    if (strength < 25) return { label: 'Weak', variant: 'danger' };
    if (strength < 50) return { label: 'Fair', variant: 'warning' };
    if (strength < 75) return { label: 'Good', variant: 'info' };
    return { label: 'Strong', variant: 'success' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (getPasswordStrength() < 50) {
      setError('Please choose a stronger password');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrengthLabel();

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <Card className="shadow-lg border-0 fade-in-up">
              <Card.Header className="bg-success text-white text-center py-4">
                <i className="fas fa-user-plus fa-2x mb-2"></i>
                <h3 className="mb-0">Join BookStore!</h3>
                <p className="mb-0 opacity-75">Create your reading account</p>
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
                      <i className="fas fa-user me-2 text-success"></i>
                      Full Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="py-3"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-envelope me-2 text-success"></i>
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
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-lock me-2 text-success"></i>
                      Password
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
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
                    {formData.password && (
                      <div className="mt-2">
                        <div className="d-flex justify-content-between small mb-1">
                          <span>Password Strength:</span>
                          <span className={`text-${passwordStrength.variant}`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <ProgressBar 
                          variant={passwordStrength.variant}
                          now={getPasswordStrength()}
                          style={{ height: '4px' }}
                        />
                      </div>
                    )}
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-lock me-2 text-success"></i>
                      Confirm Password
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                        className="py-3"
                        isInvalid={formData.confirmPassword && formData.password !== formData.confirmPassword}
                        isValid={formData.confirmPassword && formData.password === formData.confirmPassword}
                      />
                      <Button 
                        variant="outline-secondary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </Button>
                    </InputGroup>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <Form.Control.Feedback type="invalid">
                        Passwords do not match
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                  
                  <div className="d-grid mb-4">
                    <Button 
                      type="submit" 
                      variant="success" 
                      size="lg"
                      disabled={loading || (formData.password && formData.password !== formData.confirmPassword)}
                      className="py-3"
                    >
                      {loading ? (
                        <>
                          <span className="loading-spinner me-2"></span>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-user-plus me-2"></i>
                          Create Account
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
                
                <div className="text-center">
                  <p className="mb-3">
                    Already have an account? 
                    <Link to="/login" className="text-decoration-none ms-1 fw-semibold">
                      Sign in here
                    </Link>
                  </p>
                  
                  <div className="bg-light rounded p-3">
                    <small className="text-muted">
                      <i className="fas fa-shield-alt me-1"></i>
                      Your information is secure and will never be shared
                    </small>
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

export default Register;