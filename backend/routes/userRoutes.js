const express = require("express");
const router = express.Router();

let users = [];

router.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  users.push({ name, email, password });
  res.json({ message: "Signup successful" });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (user) {
    return res.json({ message: "Login successful" });
  }

  res.status(400).json({ message: "Invalid credentials" });
});

module.exports = router;
