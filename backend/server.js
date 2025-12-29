const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection - Updated to work with both local and cloud
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bookstore";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected successfully");
    console.log("Database:", MONGODB_URI.includes('mongodb.net') ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB');
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    console.log("\n🔧 TROUBLESHOOTING:");
    console.log("1. Make sure MongoDB is installed and running locally, OR");
    console.log("2. Set up MongoDB Atlas (free cloud database) at: https://www.mongodb.com/atlas");
    console.log("3. Update your .env file with the Atlas connection string");
  });

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Book Schema
const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Order Schema
const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    quantity: Number,
    price: Number
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);
const Book = mongoose.model("Book", BookSchema);
const Order = mongoose.model("Order", OrderSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: "User created successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Book Routes
app.get("/api/books", async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }
    
    const books = await Book.find(query);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Admin Routes
app.post("/api/admin/books", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json({ message: "Book created successfully", book });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.put("/api/admin/books/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json({ message: "Book updated successfully", book });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.delete("/api/admin/books/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/admin/orders", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('items.bookId', 'title author price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Order Routes
app.post("/api/orders", authenticateToken, async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      userId: req.user.userId
    });
    await order.save();
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId })
      .populate('items.bookId', 'title author price image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Seed some initial data
app.post("/api/seed", async (req, res) => {
  try {
    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@bookstore.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        name: 'Admin',
        email: 'admin@bookstore.com',
        password: hashedPassword,
        isAdmin: true
      });
      await admin.save();
    }

    // Create sample books
    const bookCount = await Book.countDocuments();
    if (bookCount === 0) {
      const sampleBooks = [
        {
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          price: 12.99,
          image: "https://via.placeholder.com/300x400?text=The+Great+Gatsby",
          description: "A classic American novel set in the Jazz Age.",
          category: "Fiction",
          stock: 50
        },
        {
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          price: 14.99,
          image: "https://via.placeholder.com/300x400?text=To+Kill+a+Mockingbird",
          description: "A gripping tale of racial injustice and childhood innocence.",
          category: "Fiction",
          stock: 30
        },
        {
          title: "1984",
          author: "George Orwell",
          price: 13.99,
          image: "https://via.placeholder.com/300x400?text=1984",
          description: "A dystopian social science fiction novel.",
          category: "Science Fiction",
          stock: 25
        }
      ];
      await Book.insertMany(sampleBooks);
    }

    res.json({ message: "Database seeded successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
