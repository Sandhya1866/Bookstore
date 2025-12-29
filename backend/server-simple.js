const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

// In-memory database (for development without MongoDB)
let users = [];
let books = [];
let orders = [];
let nextId = 1;

// JWT Secret
const JWT_SECRET = "your-secret-key";

// Helper functions
const findUserByEmail = (email) => users.find(user => user.email === email);
const findUserById = (id) => users.find(user => user.id === id);
const findBookById = (id) => books.find(book => book.id === id);

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
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = {
      id: nextId++,
      name,
      email,
      password: hashedPassword,
      isAdmin: false,
      createdAt: new Date()
    };
    
    users.push(user);
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: "User created successfully",
      token,
      user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = findUserByEmail(email);
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
      { userId: user.id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Book Routes
app.get("/api/books", async (req, res) => {
  try {
    const { category, search } = req.query;
    let filteredBooks = [...books];
    
    if (category) {
      filteredBooks = filteredBooks.filter(book => book.category === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBooks = filteredBooks.filter(book =>
        book.title.toLowerCase().includes(searchLower) ||
        book.author.toLowerCase().includes(searchLower)
      );
    }
    
    res.json(filteredBooks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/books/:id", async (req, res) => {
  try {
    const book = findBookById(parseInt(req.params.id));
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
    const book = {
      id: nextId++,
      ...req.body,
      createdAt: new Date()
    };
    books.push(book);
    res.status(201).json({ message: "Book created successfully", book });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.put("/api/admin/books/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bookIndex = books.findIndex(book => book.id === parseInt(req.params.id));
    if (bookIndex === -1) {
      return res.status(404).json({ message: "Book not found" });
    }
    
    books[bookIndex] = { ...books[bookIndex], ...req.body };
    res.json({ message: "Book updated successfully", book: books[bookIndex] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.delete("/api/admin/books/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bookIndex = books.findIndex(book => book.id === parseInt(req.params.id));
    if (bookIndex === -1) {
      return res.status(404).json({ message: "Book not found" });
    }
    
    books.splice(bookIndex, 1);
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/admin/orders", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const ordersWithUsers = orders.map(order => ({
      ...order,
      userId: findUserById(order.userId)
    }));
    res.json(ordersWithUsers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Order Routes
app.post("/api/orders", authenticateToken, async (req, res) => {
  try {
    const order = {
      id: nextId++,
      ...req.body,
      userId: req.user.userId,
      createdAt: new Date()
    };
    orders.push(order);
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const userOrders = orders.filter(order => order.userId === req.user.userId);
    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Seed some initial data
app.post("/api/seed", async (req, res) => {
  try {
    // Create admin user if not exists
    const adminExists = findUserByEmail('admin@bookstore.com');
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = {
        id: nextId++,
        name: 'Admin',
        email: 'admin@bookstore.com',
        password: hashedPassword,
        isAdmin: true,
        createdAt: new Date()
      };
      users.push(admin);
    }

    // Create sample books if none exist
    if (books.length === 0) {
      const sampleBooks = [
        // Motivational Books
        {
          id: nextId++,
          title: "Think and Grow Rich",
          author: "Napoleon Hill",
          price: 299,
          image: "https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=Think+and+Grow+Rich",
          description: "The classic guide to achieving success and wealth through positive thinking and goal setting.",
          category: "Motivational",
          stock: 50,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "The Power of Positive Thinking",
          author: "Norman Vincent Peale",
          price: 250,
          image: "https://via.placeholder.com/300x400/4ECDC4/FFFFFF?text=Power+of+Positive+Thinking",
          description: "Learn how to harness the power of positive thinking to transform your life.",
          category: "Motivational",
          stock: 40,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "You Can Win",
          author: "Shiv Khera",
          price: 199,
          image: "https://via.placeholder.com/300x400/45B7D1/FFFFFF?text=You+Can+Win",
          description: "A step-by-step tool for top achievers. Learn the secrets of success.",
          category: "Motivational",
          stock: 60,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "The 7 Habits of Highly Effective People",
          author: "Stephen R. Covey",
          price: 350,
          image: "https://via.placeholder.com/300x400/96CEB4/FFFFFF?text=7+Habits+of+Highly+Effective+People",
          description: "Powerful lessons in personal change and effectiveness.",
          category: "Motivational",
          stock: 35,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "Rich Dad Poor Dad",
          author: "Robert Kiyosaki",
          price: 320,
          image: "https://via.placeholder.com/300x400/FF9F43/FFFFFF?text=Rich+Dad+Poor+Dad",
          description: "What the rich teach their kids about money that the poor and middle class do not.",
          category: "Motivational",
          stock: 45,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "The Alchemist",
          author: "Paulo Coelho",
          price: 280,
          image: "https://via.placeholder.com/300x400/6C5CE7/FFFFFF?text=The+Alchemist",
          description: "A magical story about following your dreams and finding your destiny.",
          category: "Motivational",
          stock: 55,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "How to Win Friends and Influence People",
          author: "Dale Carnegie",
          price: 275,
          image: "https://via.placeholder.com/300x400/00B894/FFFFFF?text=How+to+Win+Friends",
          description: "The ultimate guide to building relationships and influencing people.",
          category: "Motivational",
          stock: 40,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "Atomic Habits",
          author: "James Clear",
          price: 399,
          image: "https://via.placeholder.com/300x400/E17055/FFFFFF?text=Atomic+Habits",
          description: "An easy and proven way to build good habits and break bad ones.",
          category: "Motivational",
          stock: 65,
          createdAt: new Date()
        },

        // Telugu Books
        {
          id: nextId++,
          title: "వేయి పదాలు (Veyi Padaalu)",
          author: "విశ్వనాథ సత్యనారాయణ",
          price: 180,
          image: "https://via.placeholder.com/300x400/FECA57/FFFFFF?text=వేయి+పదాలు",
          description: "తెలుగు సాహిత్యంలో అత్యుత్తమ కవిత్వ సంకలనం.",
          category: "Telugu",
          stock: 25,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "యందమూరి వీరేంద్రనాథ్ కథలు",
          author: "యందమూరి వీరేంద్రనాథ్",
          price: 220,
          image: "https://via.placeholder.com/300x400/FF9FF3/FFFFFF?text=యందమూరి+కథలు",
          description: "ప్రసిద్ధ రచయిత యందమూరి వీరేంద్రనాథ్ యొక్క అత్యుత్తమ కథల సంకలనం.",
          category: "Telugu",
          stock: 30,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "పొన్నిలై వంశం",
          author: "కల్కి",
          price: 450,
          image: "https://via.placeholder.com/300x400/54A0FF/FFFFFF?text=పొన్నిలై+వంశం",
          description: "చోళ రాజవంశం గురించిన చారిత్రక నవల.",
          category: "Telugu",
          stock: 20,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "మల్లీశ్వరి",
          author: "బుచ్చిబాబు",
          price: 160,
          image: "https://via.placeholder.com/300x400/5F27CD/FFFFFF?text=మల్లీశ్వరి",
          description: "తెలుగు సాహిత్యంలో ప్రసిద్ధ నవల.",
          category: "Telugu",
          stock: 40,
          createdAt: new Date()
        },

        // English Books
        {
          id: nextId++,
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          price: 320,
          image: "https://via.placeholder.com/300x400/00D2D3/FFFFFF?text=To+Kill+a+Mockingbird",
          description: "A gripping tale of racial injustice and childhood innocence in the American South.",
          category: "English",
          stock: 45,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "Pride and Prejudice",
          author: "Jane Austen",
          price: 280,
          image: "https://via.placeholder.com/300x400/FF6348/FFFFFF?text=Pride+and+Prejudice",
          description: "A romantic novel of manners set in Georgian England.",
          category: "English",
          stock: 35,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "1984",
          author: "George Orwell",
          price: 299,
          image: "https://via.placeholder.com/300x400/2F3542/FFFFFF?text=1984",
          description: "A dystopian social science fiction novel about totalitarian control.",
          category: "English",
          stock: 50,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          price: 260,
          image: "https://via.placeholder.com/300x400/FF3838/FFFFFF?text=The+Great+Gatsby",
          description: "A classic American novel set in the Jazz Age of the 1920s.",
          category: "English",
          stock: 40,
          createdAt: new Date()
        },

        // UPSC Books
        {
          id: nextId++,
          title: "UPSC Civil Services Prelims Paper 1 & 2",
          author: "Disha Experts",
          price: 750,
          image: "https://via.placeholder.com/300x400/2ED573/FFFFFF?text=UPSC+Prelims",
          description: "Complete study material for UPSC Civil Services Preliminary examination.",
          category: "UPSC",
          stock: 40,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "UPSC Mains General Studies Paper 1-4",
          author: "Disha Experts",
          price: 850,
          image: "https://via.placeholder.com/300x400/2ED573/FFFFFF?text=UPSC+Mains+GS",
          description: "Complete study material for UPSC Civil Services Mains examination.",
          category: "UPSC",
          stock: 35,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "Indian Polity by M. Laxmikanth",
          author: "M. Laxmikanth",
          price: 650,
          image: "https://via.placeholder.com/300x400/3742FA/FFFFFF?text=Indian+Polity",
          description: "Comprehensive book on Indian Constitution and Political System for UPSC.",
          category: "UPSC",
          stock: 60,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "Geography of India by Majid Husain",
          author: "Majid Husain",
          price: 580,
          image: "https://via.placeholder.com/300x400/FF4757/FFFFFF?text=Geography+of+India",
          description: "Complete geography book covering physical and human geography of India.",
          category: "UPSC",
          stock: 45,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "Modern History of India by Bipin Chandra",
          author: "Bipin Chandra",
          price: 520,
          image: "https://via.placeholder.com/300x400/FFA502/FFFFFF?text=Modern+History",
          description: "Comprehensive coverage of India's modern history for competitive exams.",
          category: "UPSC",
          stock: 50,
          createdAt: new Date()
        },

        // GATE Books
        {
          id: nextId++,
          title: "GATE Computer Science & IT",
          author: "Made Easy Publications",
          price: 899,
          image: "https://via.placeholder.com/300x400/1DD1A1/FFFFFF?text=GATE+CS+IT",
          description: "Complete preparation guide for GATE Computer Science and Information Technology.",
          category: "GATE",
          stock: 70,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "GATE Electronics & Communication",
          author: "Made Easy Publications",
          price: 850,
          image: "https://via.placeholder.com/300x400/10AC84/FFFFFF?text=GATE+ECE",
          description: "Comprehensive study material for GATE Electronics and Communication Engineering.",
          category: "GATE",
          stock: 65,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "GATE Mechanical Engineering",
          author: "Made Easy Publications",
          price: 920,
          image: "https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=GATE+Mechanical",
          description: "Complete guide for GATE Mechanical Engineering with solved papers.",
          category: "GATE",
          stock: 55,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "GATE Civil Engineering",
          author: "Made Easy Publications",
          price: 880,
          image: "https://via.placeholder.com/300x400/3742FA/FFFFFF?text=GATE+Civil",
          description: "Comprehensive preparation material for GATE Civil Engineering.",
          category: "GATE",
          stock: 60,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "GATE Mathematics Previous Years Solved Papers",
          author: "Arihant Experts",
          price: 450,
          image: "https://via.placeholder.com/300x400/2ED573/FFFFFF?text=GATE+Maths",
          description: "20 years solved papers with detailed solutions for GATE Mathematics.",
          category: "GATE",
          stock: 80,
          createdAt: new Date()
        },

        // Group Exams (State Government Jobs)
        {
          id: nextId++,
          title: "Telangana State Group 1 & 2 Complete Guide",
          author: "Unique Publications",
          price: 650,
          image: "https://via.placeholder.com/300x400/FF4757/FFFFFF?text=TS+Group+1+2",
          description: "Complete preparation guide for Telangana State Group 1 and Group 2 examinations.",
          category: "Groups",
          stock: 45,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "Andhra Pradesh Group 1 & 2 Study Material",
          author: "Sakshi Publications",
          price: 620,
          image: "https://via.placeholder.com/300x400/FFA502/FFFFFF?text=AP+Group+1+2",
          description: "Comprehensive study material for AP Group 1 and Group 2 competitive exams.",
          category: "Groups",
          stock: 40,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "Group 3 & 4 General Studies",
          author: "Pratiyogita Darpan",
          price: 380,
          image: "https://via.placeholder.com/300x400/54A0FF/FFFFFF?text=Group+3+4+GS",
          description: "General Studies book covering all topics for Group 3 and Group 4 examinations.",
          category: "Groups",
          stock: 70,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "Police Constable Recruitment Guide",
          author: "Arihant Publications",
          price: 420,
          image: "https://via.placeholder.com/300x400/FF9FF3/FFFFFF?text=Police+Constable",
          description: "Complete preparation guide for Police Constable recruitment examinations.",
          category: "Groups",
          stock: 85,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "Village Revenue Officer (VRO) Complete Guide",
          author: "Unique Publications",
          price: 480,
          image: "https://via.placeholder.com/300x400/5F27CD/FFFFFF?text=VRO+Guide",
          description: "Comprehensive guide for Village Revenue Officer recruitment examination.",
          category: "Groups",
          stock: 55,
          createdAt: new Date()
        },

        // Other Competitive Exams
        {
          id: nextId++,
          title: "SSC CGL Tier 1 & 2 Complete Guide",
          author: "Disha Publications",
          price: 650,
          image: "https://via.placeholder.com/300x400/FF4757/FFFFFF?text=SSC+CGL+Guide",
          description: "Comprehensive preparation guide for SSC CGL examination.",
          category: "Competitive",
          stock: 55,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "Banking Awareness for SBI & IBPS Bank PO/Clerk",
          author: "Arihant Experts",
          price: 280,
          image: "https://via.placeholder.com/300x400/FFA502/FFFFFF?text=Banking+Awareness",
          description: "Complete banking knowledge for bank recruitment examinations.",
          category: "Competitive",
          stock: 75,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "Railway Group D & ALP Complete Guide",
          author: "Kiran Publications",
          price: 520,
          image: "https://via.placeholder.com/300x400/1DD1A1/FFFFFF?text=Railway+Group+D",
          description: "Complete preparation material for Railway Group D and ALP examinations.",
          category: "Competitive",
          stock: 65,
          createdAt: new Date()
        },
        {
          id: nextId++,
          title: "Quantitative Aptitude for Competitive Examinations",
          author: "R.S. Aggarwal",
          price: 450,
          image: "https://via.placeholder.com/300x400/1DD1A1/FFFFFF?text=Quantitative+Aptitude",
          description: "Comprehensive guide for quantitative aptitude for all competitive exams.",
          category: "Competitive",
          stock: 80,
          createdAt: new Date()
        }
      ];
      books.push(...sampleBooks);
    }

    res.json({ 
      message: "Database seeded successfully with comprehensive exam preparation books",
      stats: {
        users: users.length,
        books: books.length,
        orders: orders.length,
        categories: {
          motivational: books.filter(b => b.category === 'Motivational').length,
          telugu: books.filter(b => b.category === 'Telugu').length,
          english: books.filter(b => b.category === 'English').length,
          upsc: books.filter(b => b.category === 'UPSC').length,
          gate: books.filter(b => b.category === 'GATE').length,
          groups: books.filter(b => b.category === 'Groups').length,
          competitive: books.filter(b => b.category === 'Competitive').length
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Server is running with in-memory database",
    timestamp: new Date().toISOString(),
    stats: {
      users: users.length,
      books: books.length,
      orders: orders.length
    }
  });
});

// Debug endpoint to check books
app.get("/api/debug/books", (req, res) => {
  res.json({
    totalBooks: books.length,
    categories: [...new Set(books.map(b => b.category))],
    sampleBooks: books.slice(0, 3)
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Using in-memory database (no MongoDB required)`);
  console.log(`🌐 API available at: http://localhost:${PORT}/api`);
  console.log(`💡 Visit http://localhost:${PORT}/api/health to check server status`);
});