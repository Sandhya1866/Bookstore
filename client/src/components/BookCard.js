import React, { useState } from 'react';
import { Card, Button, Badge, Toast, ToastContainer } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const BookCard = ({ book }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      return;
    }

    setIsAdding(true);
    
    // Simulate loading for better UX
    setTimeout(() => {
      addToCart(book);
      setShowToast(true);
      setIsAdding(false);
    }, 500);
  };

  const getStockBadge = () => {
    if (book.stock === 0) {
      return <Badge bg="danger" className="position-absolute top-0 end-0 m-2">Out of Stock</Badge>;
    } else if (book.stock < 5) {
      return <Badge bg="warning" className="position-absolute top-0 end-0 m-2">Low Stock</Badge>;
    } else if (book.stock < 10) {
      return <Badge bg="info" className="position-absolute top-0 end-0 m-2">Limited</Badge>;
    }
    return null;
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <>
      <Card className="h-100 shadow-sm book-card fade-in-up">
        <div className="position-relative">
          <div 
            style={{ 
              height: '300px', 
              backgroundColor: '#f8f9fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              border: '2px solid #dee2e6',
              borderRadius: '8px 8px 0 0'
            }}
          >
            <div style={{
              fontSize: '48px',
              marginBottom: '10px'
            }}>
              📚
            </div>
            <div style={{
              textAlign: 'center',
              padding: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#495057'
            }}>
              {book.title}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6c757d'
            }}>
              by {book.author}
            </div>
          </div>
          {getStockBadge()}
          <div className="position-absolute bottom-0 start-0 m-2">
            <Badge bg="secondary" className="px-2 py-1">
              {book.category}
            </Badge>
          </div>
        </div>
        
        <Card.Body className="d-flex flex-column">
          <Card.Title className="text-truncate mb-2" title={book.title}>
            {book.title}
          </Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            <i className="fas fa-user me-1"></i>
            by {book.author}
          </Card.Subtitle>
          <Card.Text className="flex-grow-1 text-muted small">
            {truncateText(book.description, 100)}
          </Card.Text>
          
          <div className="mt-auto">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="price-badge">
                <i className="fas fa-dollar-sign"></i>${book.price}
              </span>
              <small className="text-muted">
                <i className="fas fa-boxes me-1"></i>
                Stock: {book.stock}
              </small>
            </div>
            
            <Button 
              variant={book.stock === 0 ? "secondary" : "primary"}
              className="w-100 position-relative"
              onClick={handleAddToCart}
              disabled={book.stock === 0 || isAdding}
            >
              {isAdding ? (
                <>
                  <span className="loading-spinner me-2"></span>
                  Adding...
                </>
              ) : book.stock === 0 ? (
                <>
                  <i className="fas fa-times me-2"></i>
                  Out of Stock
                </>
              ) : (
                <>
                  <i className="fas fa-cart-plus me-2"></i>
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>

      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide
          bg="success"
        >
          <Toast.Header>
            <i className="fas fa-check-circle text-success me-2"></i>
            <strong className="me-auto">Success!</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            <strong>{book.title}</strong> has been added to your cart!
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default BookCard;