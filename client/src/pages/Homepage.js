import React, { useEffect, useState } from "react";
import API from "../api/api";
import BookCard from "../components/BookCard";

const Homepage = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    API.get("/api/books")
      .then((res) => setBooks(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Online Book Store</h2>

      <div className="row">
        {books.map((book) => (
          <div className="col-md-3 mb-4" key={book._id}>
            <BookCard book={book} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Homepage;
