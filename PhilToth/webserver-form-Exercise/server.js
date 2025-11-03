const express = require("express");
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
const PORT = 3000;

app.get("/", (req, res) => {
  console.log(__dirname);
  res.sendFile(__dirname + "public/Hello_there.jpg");
  res.render("index", { name: "There ~ Obi-Wan Kenobi " });
});

app.post("/welcome", (req, res) => {
  console.log(req.body);
  res.sendFile(__dirname + 'public/GeneralKenobi');
  res.render("welcome", {firstName: req.body.firstName});
});


app.listen(PORT, () => {
  console.log(`Server runs  @ http://localhost:${PORT}`);
});