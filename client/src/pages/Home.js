import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { utilityAPI, booksAPI } from '../api/api';

const Home = () => {
  const navigate = useNavigate();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [stats, setStats] = useState({ totalBooks: 0, categories: 0, happyCustomers: 1250 });

  useEffect(() => {
    // Seed the database with initial data
    const seedDatabase = async () => {
      try {
        await utilityAPI.seedDatabase();
        fetchFeaturedBooks();
      } catch (error) {
        console.log('Database already seeded or error occurred');
        fetchFeaturedBooks();
      }
    };
    seedDatabase();
  }, []);

  const fetchFeaturedBooks = async () => {
    try {
      const response = await booksAPI.getAll();
      const books = response.data;
      setFeaturedBooks(books.slice(0, 3)); // Get first 3 books as featured
      setStats(prev => ({
        ...prev,
        totalBooks: books.length,
        categories: [...new Set(books.map(book => book.category))].length
      }));
    } catch (error) {
      console.error('Error fetching featured books:', error);
    }
  };

  const features = [
    {
      icon: 'fas fa-rocket',
      title: 'Motivational Books',
      description: 'Inspire yourself with powerful motivational and self-help books from renowned authors.',
      color: 'primary'
    },
    {
      icon: 'fas fa-language',
      title: 'Telugu Literature',
      description: 'Rich collection of Telugu books, novels, and poetry from celebrated Telugu authors.',
      color: 'success'
    },
    {
      icon: 'fas fa-globe',
      title: 'English Classics',
      description: 'Timeless English literature and contemporary novels from world-famous writers.',
      color: 'warning'
    },
    {
      icon: 'fas fa-graduation-cap',
      title: 'Competitive Exams',
      description: 'Complete preparation materials for UPSC, SSC, Banking, and other competitive exams.',
      color: 'info'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section text-white py-5">
        <div className="hero-content">
          <Container>
            <Row className="align-items-center min-vh-75">
              <Col lg={6} className="fade-in-up">
                <h1 className="display-3 fw-bold mb-4">
                  Welcome to 
                  <span className="d-block text-warning">BookStore</span>
                </h1>
                <p className="lead mb-4">
                  Discover motivational books, Telugu literature, English classics, 
                  and competitive exam preparation books. Your success journey starts here!
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <Button 
                    variant="warning" 
                    size="lg"
                    onClick={() => navigate('/books')}
                    className="px-4"
                  >
                    <i className="fas fa-book me-2"></i>
                    Browse Books
                  </Button>
                  <Button 
                    variant="outline-light" 
                    size="lg"
                    onClick={() => navigate('/register')}
                    className="px-4"
                  >
                    <i className="fas fa-user-plus me-2"></i>
                    Join Now
                  </Button>
                </div>
              </Col>
              <Col lg={6} className="text-center slide-in-left">
                <div className="position-relative">
                  <div className="display-1 mb-4" style={{ fontSize: '8rem' }}>📚</div>
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                    <div className="bg-white bg-opacity-10 rounded-circle p-5 animate__animated animate__pulse animate__infinite">
                      <i className="fas fa-heart text-danger fa-2x"></i>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </div>

      {/* Stats Section */}
      <Container className="py-5">
        <Row className="text-center">
          <Col md={4} className="mb-4">
            <div className="bg-primary text-white rounded-3 p-4 h-100">
              <i className="fas fa-book fa-3x mb-3"></i>
              <h3 className="fw-bold">{stats.totalBooks}+</h3>
              <p className="mb-0">Books Available</p>
            </div>
          </Col>
          <Col md={4} className="mb-4">
            <div className="bg-success text-white rounded-3 p-4 h-100">
              <i className="fas fa-list fa-3x mb-3"></i>
              <h3 className="fw-bold">{stats.categories}+</h3>
              <p className="mb-0">Categories</p>
            </div>
          </Col>
          <Col md={4} className="mb-4">
            <div className="bg-warning text-white rounded-3 p-4 h-100">
              <i className="fas fa-users fa-3x mb-3"></i>
              <h3 className="fw-bold">{stats.happyCustomers}+</h3>
              <p className="mb-0">Happy Customers</p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Features Section */}
      <div className="bg-light py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="fw-bold">Why Choose Our BookStore?</h2>
              <p className="text-muted">Specialized collection for motivation, literature, and exam preparation</p>
            </Col>
          </Row>
          
          <Row>
            {features.map((feature, index) => (
              <Col key={index} md={6} lg={3} className="mb-4">
                <Card className={`h-100 text-center border-0 shadow-sm fade-in-up border-${feature.color}`} style={{ animationDelay: `${index * 0.1}s` }}>
                  <Card.Body className="p-4">
                    <div className={`text-${feature.color} mb-3`}>
                      <i className={`${feature.icon} fa-3x`}></i>
                    </div>
                    <Card.Title className="h5">{feature.title}</Card.Title>
                    <Card.Text className="text-muted">
                      {feature.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* Newsletter Section */}
      <div className="bg-primary text-white py-5">
        <Container className="text-center">
          <Row className="justify-content-center">
            <Col lg={6}>
              <i className="fas fa-envelope fa-3x mb-4"></i>
              <h3 className="fw-bold mb-3">Stay Updated</h3>
              <p className="mb-4">
                Subscribe to our newsletter for updates on new motivational books, 
                Telugu literature releases, and competitive exam preparation materials!
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="Enter your email"
                  style={{ maxWidth: '300px' }}
                />
                <Button variant="warning">
                  <i className="fas fa-paper-plane me-2"></i>
                  Subscribe
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* CTA Section */}
      <Container className="py-5 text-center">
        <Row className="justify-content-center">
          <Col lg={8}>
            <h3 className="fw-bold mb-3">Ready to Start Reading?</h3>
            <p className="text-muted mb-4">
              Join thousands of book lovers and discover your next favorite book. 
              Create your account today and get access to our entire collection!
            </p>
            <div className="d-flex flex-wrap gap-3 justify-content-center">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => navigate('/register')}
                className="px-4"
              >
                <i className="fas fa-user-plus me-2"></i>
                Sign Up Now
              </Button>
              <Button 
                variant="outline-primary" 
                size="lg"
                onClick={() => navigate('/books')}
                className="px-4"
              >
                <i className="fas fa-search me-2"></i>
                Browse Books
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;