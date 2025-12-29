import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Spinner, Alert, Button, Badge } from 'react-bootstrap';
import { booksAPI } from '../api/api';
import BookCard from './BookCard';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const categories = ['Motivational', 'Telugu', 'English', 'UPSC', 'GATE', 'Groups', 'Competitive'];
  const sortOptions = [
    { value: 'title', label: 'Title (A-Z)' },
    { value: 'price-low', label: 'Price (Low to High)' },
    { value: 'price-high', label: 'Price (High to Low)' },
    { value: 'author', label: 'Author (A-Z)' },
    { value: 'newest', label: 'Newest First' }
  ];

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterAndSortBooks();
  }, [books, searchTerm, selectedCategory, sortBy, priceRange]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await booksAPI.getAll();
      setBooks(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch books. Please try again later.');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortBooks = () => {
    let filtered = [...books];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(book => book.category === selectedCategory);
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter(book => book.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(book => book.price <= parseFloat(priceRange.max));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'author':
          return a.author.localeCompare(b.author);
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    setFilteredBooks(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('title');
    setPriceRange({ min: '', max: '' });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedCategory) count++;
    if (priceRange.min || priceRange.max) count++;
    return count;
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="loading-spinner mx-auto mb-3"></div>
        <h4>Loading amazing books for you...</h4>
        <p className="text-muted">Please wait while we fetch the latest collection</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
          <h4>Oops! Something went wrong</h4>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={fetchBooks}>
            <i className="fas fa-redo me-2"></i>
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Search and Filter Section */}
      <div className="bg-white rounded-3 shadow-sm p-4 mb-4">
        <Row className="mb-3">
          <Col md={6}>
            <div className="search-container">
              <i className="fas fa-search search-icon"></i>
              <Form.Control
                type="text"
                placeholder="Search books by title, author, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </Col>
          <Col md={3}>
            <Form.Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-control"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-control"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={3}>
            <Form.Control
              type="number"
              placeholder="Min Price"
              value={priceRange.min}
              onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
              min="0"
              step="0.01"
            />
          </Col>
          <Col md={3}>
            <Form.Control
              type="number"
              placeholder="Max Price"
              value={priceRange.max}
              onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
              min="0"
              step="0.01"
            />
          </Col>
          <Col md={6} className="d-flex align-items-center">
            {getActiveFiltersCount() > 0 && (
              <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
                <i className="fas fa-times me-2"></i>
                Clear Filters ({getActiveFiltersCount()})
              </Button>
            )}
          </Col>
        </Row>
      </div>

      {/* Results Summary */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">
            <i className="fas fa-book me-2 text-primary"></i>
            Book Collection
          </h4>
          <p className="text-muted mb-0">
            Showing {filteredBooks.length} of {books.length} books
            {searchTerm && (
              <Badge bg="primary" className="ms-2">
                Search: "{searchTerm}"
              </Badge>
            )}
            {selectedCategory && (
              <Badge bg="info" className="ms-2">
                Category: {selectedCategory}
              </Badge>
            )}
          </p>
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <Alert variant="info" className="text-center py-5">
          <i className="fas fa-search fa-3x mb-3 text-muted"></i>
          <h4>No books found</h4>
          <p>Try adjusting your search criteria or browse all categories.</p>
          <Button variant="outline-primary" onClick={clearFilters}>
            <i className="fas fa-eye me-2"></i>
            View All Books
          </Button>
        </Alert>
      ) : (
        <Row>
          {filteredBooks.map((book, index) => (
            <Col key={book._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <div style={{ animationDelay: `${index * 0.1}s` }}>
                <BookCard book={book} />
              </div>
            </Col>
          ))}
        </Row>
      )}

      {/* Load More Button (for future pagination) */}
      {filteredBooks.length > 0 && (
        <div className="text-center mt-5">
          <p className="text-muted">
            <i className="fas fa-check-circle text-success me-2"></i>
            You've seen all available books!
          </p>
        </div>
      )}
    </Container>
  );
};

export default BookList;