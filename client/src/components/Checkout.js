import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../api/api';

const Checkout = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [shippingInfo, setShippingInfo] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Please <Button variant="link" onClick={() => navigate('/login')}>login</Button> to checkout.
        </Alert>
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="info">
          Your cart is empty. <Button variant="link" onClick={() => navigate('/books')}>Browse books</Button>
        </Alert>
      </Container>
    );
  }

  const handleInputChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderData = {
        items: cartItems.map(item => ({
          bookId: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: getTotalPrice(),
        shippingAddress: shippingInfo
      };

      await ordersAPI.create(orderData);
      clearCart();
      alert('Order placed successfully!');
      navigate('/');
    } catch (err) {
      setError('Failed to place order. Please try again.');
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Checkout</h2>
      
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h4>Shipping Information</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Street Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="street"
                        value={shippingInfo.street}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>State</Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        value={shippingInfo.state}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>ZIP Code</Form.Label>
                      <Form.Control
                        type="text"
                        name="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Button 
                  type="submit" 
                  variant="success" 
                  size="lg" 
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? 'Processing...' : `Place Order - $${getTotalPrice().toFixed(2)}`}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h4>Order Summary</h4>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {cartItems.map(item => (
                  <ListGroup.Item key={item._id} className="d-flex justify-content-between">
                    <div>
                      <h6>{item.title}</h6>
                      <small className="text-muted">Qty: {item.quantity}</small>
                    </div>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total: ${getTotalPrice().toFixed(2)}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;