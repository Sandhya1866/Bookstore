# Online Book Store - Full Stack Web Application

A responsive web application that allows users to browse, search, and purchase books online. Built with React.js, Node.js, Express.js, and MongoDB.

## Features

### Customer Features
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **User Authentication**: Secure registration and login with JWT tokens
- **Book Browsing**: Search and filter books by category, title, or author
- **Shopping Cart**: Add/remove books, update quantities
- **Secure Checkout**: Place orders with shipping information
- **Order History**: View past orders and order status

### Admin Features
- **Admin Dashboard**: Manage books and view customer orders
- **Book Management**: Add, edit, and delete books
- **Order Management**: View all customer orders and sales data
- **Inventory Control**: Track book stock levels

## Tech Stack

### Frontend
- **React.js** - UI library with hooks for state management
- **React Router** - Client-side routing
- **Bootstrap 5** - Responsive CSS framework
- **React Bootstrap** - Bootstrap components for React
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

##Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd online-bookstore
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MONGODB_URI=mongodb://127.0.0.1:27017/bookstore
PORT=5000
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

### 4. Database Setup
Make sure MongoDB is running on your system. The application will automatically create the database and seed it with sample data.

## Running the Application

### Start the Backend Server
```bash
cd backend
npm start
```
The backend server will run on `http://localhost:5000`

### Start the Frontend Development Server
```bash
cd client
npm start
```
The frontend will run on `http://localhost:3000`

## Demo Accounts

### Admin Account
- **Email**: admin@bookstore.com
- **Password**: admin123

### Test Customer Account
You can register a new account or use the admin account to test all features.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Books
- `GET /api/books` - Get all books (with search and filter)
- `GET /api/books/:id` - Get single book

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders

### Admin Routes (Protected)
- `POST /api/admin/books` - Create book
- `PUT /api/admin/books/:id` - Update book
- `DELETE /api/admin/books/:id` - Delete book
- `GET /api/admin/orders` - Get all orders

## Key Features Implementation

### 1. Responsive Design
- Bootstrap 5 for mobile-first responsive design
- React Bootstrap components for consistent UI
- Custom CSS for enhanced user experience

### 2. State Management
- React Context API for global state (Auth & Cart)
- Local storage for cart persistence
- JWT token management for authentication

### 3. Security
- Password hashing with bcryptjs
- JWT token-based authentication
- Protected routes for admin functionality
- Input validation and error handling

### 4. Database Design
- User schema with role-based access
- Book schema with inventory management
- Order schema with item details and shipping info

## Security Features

- JWT token authentication
- Password hashing
- Protected admin routes
- Input validation
- CORS configuration

## Project Structure

```
online-bookstore/
├── backend/
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables
├── client/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context providers
│   │   ├── api/          # API service functions
│   │   └── App.js        # Main app component
│   └── package.json      # Frontend dependencies
└── README.md
```

## Deployment

### Backend Deployment
1. Set up MongoDB Atlas or use a cloud MongoDB service
2. Update environment variables for production
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to platforms like Netlify, Vercel, or AWS S3

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## Developer

**Sandhyarani Rajulapati**
- Email: sandhyarajulapati1866@gmail.com
- Phone: 7032801866
- Location: Sathupally-Khammam

---

Built with using React.js, Node.js, and MongoDB"# Bookstore" 
