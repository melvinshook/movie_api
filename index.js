const express = require("express"),
  morgan = require("morgan");

const app = express();

app.use(morgan("common"));

let topTenMovies = [
  { title: "Step Brothers" },
  { title: "Gone in 60 seconds" },
  { title: "Blood Diamond" },
  { title: "The Fast and Furious" },
  { title: "How to Train Your Dragon" },
];

app.get("/movies", (req, res) => {
  res.json(topTenMovies);
});

app.get("/", (req, res) => {
  res.send("Welcome to my Movie app");
});

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(5500, () => {
  console.log('This app is running on port 8080');
});
