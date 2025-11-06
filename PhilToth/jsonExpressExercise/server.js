const express = require('express');
var morgan = require('morgan');
const secretApiKey = "f4042e49-e4a1-4412-8136-ac89bae8166c";
const app = express();
const PORT = 3000;
const books = [
  { id: 1, title: "Der Alchimist", author: "Paulo Coelho" },
  { id: 2, title: "1984", author: "George Orwell" },
];

app.use(morgan("combined"));

app.use((req, res, next) => {
    const apiKey = req.headers["x-api-key"];
    if(!apiKey || apiKey !== secretApiKey) {
      return res.status(403).json({error: "Fatal invalid API-Key"});
    }
    next();
});

app.get("/books/:id/", (req, res) => {
  const id = parseInt(req.params.id);
  const book = books.find((b) => b.id === id);
    if (book) {
      res.json(book);
    }
    else if (!book) {
      res.status(404).send("Book not found");
    }
});


app.listen(PORT, () => {
  console.log(`Server's running http://localhost:${PORT}`);
});