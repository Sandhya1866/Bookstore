import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Badge, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showClearModal, setShowClearModal] = useState(false);

  if (!isAuthenticated) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <i className="fas fa-lock fa-4x text-warning mb-4"></i>
          <h3>Authentication Required</h3>
          <Alert variant="warning" className="d-inline-block">
            Please <Button variant="link" className="p-0" onClick={() => navigate('/login')}>login</Button> to view your cart.
          </Alert>
        </div>
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <i className="fas fa-shopping-cart fa-4x text-muted mb-4"></i>
          <h2>Your Cart is Empty</h2>
          <p className="text-muted mb-4">Looks like you haven't added any books yet!</p>
          <Button variant="primary" size="lg" onClick={() => navigate('/books')}>
            <i className="fas fa-book me-2"></i>
            Start Shopping
          </Button>
        </div>
      </Container>
    );
  }

  const handleClearCart = () => {
    clearCart();
    setShowClearModal(false);
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            <i className="fas fa-shopping-cart me-2 text-primary"></i>
            Shopping Cart
          </h2>
          <p className="text-muted mb-0">{getTotalItems()} items in your cart</p>
        </div>
        <Button 
          variant="outline-danger" 
          size="sm"
          onClick={() => setShowClearModal(true)}
        >
          <i className="fas fa-trash me-2"></i>
          Clear Cart
        </Button>
      </div>

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <i className="fas fa-list me-2"></i>
                Cart Items
              </h5>
            </Card.Header>
            <ListGroup variant="flush">
              {cartItems.map((item, index) => (
                <ListGroup.Item key={item._id} className="cart-item slide-in-left" style={{ animationDelay: `${index * 0.1}s` }}>
                  <Row className="align-items-center">
                    <Col md={2}>
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="img-fluid rounded"
                        style={{ maxHeight: '100px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100x120/6c757d/ffffff?text=No+Image';
                        }}
                      />
                    </Col>
                    <Col md={4}>
                      <h6 className="mb-1">{item.title}</h6>
                      <p className="text-muted mb-1">
                        <i className="fas fa-user me-1"></i>
                        by {item.author}
                      </p>
                      <Badge bg="secondary" className="me-2">{item.category}</Badge>
                    </Col>
                    <Col md={2}>
                      <div className="price-badge">
                        <i className="fas fa-dollar-sign"></i>{item.price}
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="quantity-controls">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          className="quantity-btn"
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <i className="fas fa-minus"></i>
                        </Button>
                        <span className="quantity-display">
                          {item.quantity}
                        </span>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          className="quantity-btn"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        >
                          <i className="fas fa-plus"></i>
                        </Button>
                      </div>
                    </Col>
                    <Col md={1}>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => removeFromCart(item._id)}
                        title="Remove from cart"
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    </Col>
                  </Row>
                  <Row className="mt-2">
                    <Col className="text-end">
                      <strong className="text-success">
                        Subtotal: <i className="fas fa-dollar-sign"></i>{(item.price * item.quantity).toFixed(2)}
                      </strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          <div className="mt-3">
            <Button variant="outline-primary" onClick={() => navigate('/books')}>
              <i className="fas fa-arrow-left me-2"></i>
              Continue Shopping
            </Button>
          </div>
        </Col>
        
        <Col lg={4}>
          <Card className="shadow-sm sticky-top" style={{ top: '20px' }}>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-calculator me-2"></i>
                Order Summary
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <span>Items ({getTotalItems()}):</span>
                <span><i className="fas fa-dollar-sign"></i>{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Shipping:</span>
                <span className="text-success">
                  <i className="fas fa-check me-1"></i>
                  Free
                </span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Tax:</span>
                <span><i className="fas fa-dollar-sign"></i>{(getTotalPrice() * 0.08).toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-4">
                <strong className="h5">Total:</strong>
                <strong className="h5 text-success">
                  <i className="fas fa-dollar-sign"></i>{(getTotalPrice() * 1.08).toFixed(2)}
                </strong>
              </div>
              
              <div className="d-grid gap-2">
                <Button 
                  variant="success" 
                  size="lg"
                  onClick={() => navigate('/checkout')}
                  className="mb-2"
                >
                  <i className="fas fa-credit-card me-2"></i>
                  Proceed to Checkout
                </Button>
                <Button 
                  variant="outline-secondary"
                  onClick={() => navigate('/books')}
                >
                  <i className="fas fa-shopping-bag me-2"></i>
                  Add More Items
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Savings Card */}
          <Card className="mt-3 border-success">
            <Card.Body className="text-center">
              <i className="fas fa-gift fa-2x text-success mb-2"></i>
              <h6 className="text-success">Free Shipping!</h6>
              <small className="text-muted">
                You're saving <strong><i className="fas fa-dollar-sign"></i>9.99</strong> on shipping
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Clear Cart Confirmation Modal */}
      <Modal show={showClearModal} onHide={() => setShowClearModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-exclamation-triangle text-warning me-2"></i>
            Clear Cart
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to remove all items from your cart?</p>
          <p className="text-muted small">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleClearCart}>
            <i className="fas fa-trash me-2"></i>
            Clear Cart
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Cart;