const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

function getAllBooks() {
  return new Promise((resolve, reject) => {
    if (Object.keys(books).length > 0) {
      resolve(books);
    } else {
      reject("No books available");
    }
  });
}

function getBooksByISBN(isbn) {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject(`Book with ISBN ${isbn} not found`);
    }
  });
}

function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    const filteredBooks = Object.values(books).filter((book) =>
      book.author.toLowerCase().includes(author),
    );
    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject(`Book by the Author ${author} not found`);
    }
  });
}

function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    const filteredBooks = Object.values(books).filter((book) =>
      book.title.toLowerCase().includes(title.toLowerCase()),
    );
    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject(`Book with title ${title} not found`);
    }
  });
}
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (isValid(username)) {
      return res.status(400).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully" });
  }

  return res
    .status(400)
    .json({ message: "Username and password are required" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  getAllBooks().then((books) => {
    res.send(JSON.stringify({ books }, null, 4));
  });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
  //Write your code here
  try {
    const isbn = req.params.isbn;

    const book = await getBooksByISBN(isbn);
    res.send(book);
  } catch (error) {
    res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
});

public_users.get("/async/isbn/:isbn", async (req, res) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/isbn/${req.params.isbn}`,
    );

    res.json(response.data);
  } catch (error) {
    res.status(404).json({
      message: `Book with ISBN ${req.params.isbn} not found`,
    });
  }
});

// Get book details based on author
public_users.get("/author/:author", async (req, res) => {
  try {
    const author = req.params.author.toLowerCase();
    const filteredBooks = await getBooksByAuthor(author);
    res.send(filteredBooks);
  } catch (error) {
    res.status(404).json({ message: `Book by the Author ${author} not found` });
  }
});

// Get all books based on title
public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title;

  try {
    const booksByTitle = await getBooksByTitle(title);
    res.send(booksByTitle);
  } catch (error) {
    res.status(404).json({ message: `Book with title ${title} not found` });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    res.send(book.reviews);
  } else {
    res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
});

module.exports.general = public_users;
