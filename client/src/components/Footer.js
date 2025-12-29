import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container>
        <Row>
          <Col md={6}>
            <h5>📚 BookStore</h5>
            <p className="mb-0">Your one-stop destination for all your reading needs.</p>
          </Col>
          <Col md={3}>
            <h6>Quick Links</h6>
            <ul className="list-unstyled">
              <li><a href="/" className="text-light text-decoration-none">Home</a></li>
              <li><a href="/books" className="text-light text-decoration-none">Books</a></li>
              <li><a href="/cart" className="text-light text-decoration-none">Cart</a></li>
            </ul>
          </Col>
          <Col md={3}>
            <h6>Contact Info</h6>
            <p className="mb-1">📧 info@bookstore.com</p>
            <p className="mb-1">📞 (555) 123-4567</p>
          </Col>
        </Row>
        <hr className="my-3" />
        <Row>
          <Col className="text-center">
            <p className="mb-0">&copy; 2025 BookStore. Built with React.js, Node.js, and MongoDB.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;