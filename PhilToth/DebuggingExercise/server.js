const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Eine einfache In-Memory-Buch-Datenbank
let books = [
  { Id: 1, title: "1984", author: "George Orwell" },
  { Id: 2, title: "Brave New World", author: "Aldous Huxley" },
];

let nextId = 3;

app.use(bodyParser.json());

// GET-Route für ein Buch
app.get("/book/:Id", (req, res) => {
  const id = parseInt(req.params.Id, 10);
  const book = books.find((b) => b.Id === id);
  if (!book) {
    res.status(404).send("Book not found");
    return;
  }
  res.json(book);
});

// DELETE-Route für ein Buch
app.delete("/book/:Id", (req, res) => {
  const id = parseInt(req.params.Id, 10);
  const index = books.findIndex((b) => b.Id === id);
  if (index === -1) {
    res.status(404).send("Book does not exist please check the data");
    return;
  }
  books.splice(index, 1);
  res.send("OK delete-operation successful");
});

// POST-Route zum Hinzufügen eines Buches
app.post("/book", (req, res) => {
  const isValid = checkBookReq(req, res);
  if (!isValid) {
    return;
  }

  const newBook = {
    Id: nextId++,
    title: req.body.title,
    author: req.body.author,
  };

  books.push(newBook);
  res.status(200).json(newBook);
});

// Route, um alle Bücher abzurufen
app.get("/books", (req, res) => {
  res.json(books);
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});

// // Hilfsfunktionen
// function checkBookIdDuplicate(books, Id) {
//   return books.some((book) => book.Id === Id);
// }

function checkBookReq(req, res) {
  const {title, author } = req.body;

  if (!title) {
    res.status(400).send("Title is missing");
    return false;
  }

  if (!author) {
    res.status(400).send("Author is missing");
    return false;
  }

  if (typeof title !== "string" || title.trim() === "") {
    res.status(400).send("Title has wrong format");
    return false;
  }

  if (typeof author !== "string" || author.trim() === "") {
    res.status(400).send("Author has wrong format");
    return false;
  }

  return true;
}

module.exports = app;
