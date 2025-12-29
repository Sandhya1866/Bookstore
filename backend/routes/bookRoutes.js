const express = require("express");
const router = express.Router();

let books = [
  { id: 1, title: "Harry Potter", author: "J.K. Rowling" },
  { id: 2, title: "Atomic Habits", author: "James Clear" }
];

router.get("/books", (req, res) => {
  res.json(books);
});

module.exports = router;
