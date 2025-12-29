import React from 'react';
import { Navbar, Nav, Container, Badge, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { getTotalItems } = useCart();

  const handleLogout = () => {
    logout();
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>📚 BookStore</Navbar.Brand>
        </LinkContainer>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/">
              <Nav.Link>Home</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/books">
              <Nav.Link>Books</Nav.Link>
            </LinkContainer>
            {isAdmin && (
              <LinkContainer to="/admin">
                <Nav.Link>Admin Dashboard</Nav.Link>
              </LinkContainer>
            )}
          </Nav>
          
          <Nav className="ms-auto">
            {isAuthenticated ? (
              <>
                <LinkContainer to="/cart">
                  <Nav.Link>
                    🛒 Cart {getTotalItems() > 0 && (
                      <Badge bg="danger">{getTotalItems()}</Badge>
                    )}
                  </Nav.Link>
                </LinkContainer>
                <Nav.Link disabled>Welcome, {user?.name}</Nav.Link>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <LinkContainer to="/login">
                  <Nav.Link>Login</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/register">
                  <Nav.Link>Register</Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;