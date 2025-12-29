import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Tab, Tabs } from 'react-bootstrap';
import { adminAPI, booksAPI } from '../api/api';

const AdminDashboard = () => {
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    price: '',
    image: '',
    description: '',
    category: '',
    stock: ''
  });

  const categories = ['Motivational', 'Telugu', 'English', 'UPSC', 'GATE', 'Groups', 'Competitive'];

  useEffect(() => {
    fetchBooks();
    fetchOrders();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await booksAPI.getAll();
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await adminAPI.getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleBookFormChange = (e) => {
    setBookForm({
      ...bookForm,
      [e.target.name]: e.target.value
    });
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const bookData = {
        ...bookForm,
        price: parseFloat(bookForm.price),
        stock: parseInt(bookForm.stock)
      };

      if (editingBook) {
        await adminAPI.updateBook(editingBook._id, bookData);
      } else {
        await adminAPI.createBook(bookData);
      }

      setShowBookModal(false);
      setEditingBook(null);
      setBookForm({
        title: '',
        author: '',
        price: '',
        image: '',
        description: '',
        category: '',
        stock: ''
      });
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      price: book.price.toString(),
      image: book.image,
      description: book.description,
      category: book.category,
      stock: book.stock.toString()
    });
    setShowBookModal(true);
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await adminAPI.deleteBook(bookId);
        fetchBooks();
      } catch (error) {
        alert('Failed to delete book');
      }
    }
  };

  const openNewBookModal = () => {
    setEditingBook(null);
    setBookForm({
      title: '',
      author: '',
      price: '',
      image: '',
      description: '',
      category: '',
      stock: ''
    });
    setShowBookModal(true);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      
      <Tabs defaultActiveKey="books" className="mb-4">
        <Tab eventKey="books" title="Manage Books">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Books Management</h4>
            <Button variant="primary" onClick={openNewBookModal}>
              Add New Book
            </Button>
          </div>
          
          <Card>
            <Card.Body>
              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map(book => (
                    <tr key={book._id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.category}</td>
                      <td>${book.price}</td>
                      <td>{book.stock}</td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleEditBook(book)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteBook(book._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="orders" title="Orders">
          <h4 className="mb-3">Recent Orders</h4>
          <Card>
            <Card.Body>
              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td>{order._id.substring(0, 8)}...</td>
                      <td>{order.userId?.name}</td>
                      <td>{order.items.length} items</td>
                      <td>${order.totalAmount}</td>
                      <td>
                        <span className={`badge bg-${order.status === 'pending' ? 'warning' : 'success'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Book Modal */}
      <Modal show={showBookModal} onHide={() => setShowBookModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingBook ? 'Edit Book' : 'Add New Book'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleBookSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={bookForm.title}
                    onChange={handleBookFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Author</Form.Label>
                  <Form.Control
                    type="text"
                    name="author"
                    value={bookForm.author}
                    onChange={handleBookFormChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="price"
                    value={bookForm.price}
                    onChange={handleBookFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={bookForm.category}
                    onChange={handleBookFormChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={bookForm.stock}
                    onChange={handleBookFormChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="url"
                name="image"
                value={bookForm.image}
                onChange={handleBookFormChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={bookForm.description}
                onChange={handleBookFormChange}
                required
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button 
                variant="secondary" 
                className="me-2"
                onClick={() => setShowBookModal(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : (editingBook ? 'Update Book' : 'Add Book')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;