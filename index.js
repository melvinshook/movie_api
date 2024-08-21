import express from "express";
<<<<<<< HEAD
const morgan = require("morgan");
const app = express();
app.use(express.json());
const bodyParser = require("body-parser");
const uuid = require("uuid");
const mongoose = require("mongoose");
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;
const dotenv = require("dotenv");

dotenv.config();
const { check, validationResult } = require("express-validator");
const db = process.env.URI;

mongoose.connect("mongodb://localhost:27017/cfDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
/* mongoose.connect(process.env.CONNECTION_URI, {
=======
import morgan from "morgan";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import { Movie, User } from "./models.js";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import { login } from "./auth.js";
import "./passport.js";

const app = express();

dotenv.config();
const { check, validationResult } = await import("express-validator");
const db = process.env.URI;

mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
/* mongoose.connect("mongodb://localhost:27017/myFlixDB", {
>>>>>>> parent of 8407f15 (return to old code, sign up was throwing an error on client side)
  useNewUrlParser: true,
  useUnifiedTopology: true,
}); */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("common"));

let movies = [
  {
    Title: "Step Brothers",
    Description:
      "Two aimless middle-aged losers still living at home are forced against their will to become roommates when their parents marry.",
    Genre: {
      Name: "Comedy",
      "Year Made": "2008",
    },
    Director: {
      Name: "Adam McKay",
      Bio: "Adam McKay (born April 17, 1968) is an American screenwriter, director, comedian, and actor. McKay has a comedy partnership with Will Ferrell, with whom he co-wrote the films Anchorman, Talladega Nights, and The Other Guys. Ferrell and McKay also founded their comedy website Funny or Die through their production company Gary Sanchez Productions. He has been married to Shira Piven since 1999. They have two children.",
    },
  },
  {
    Title: "Gone in 60 seconds",
    Description:
      "A retired master car thief must come back to the industry and steal fifty cars with his crew in one night to save his brother's life.",
    Genre: {
      Name: "Action",
      "Year Made": "2000",
    },
    Director: {
      Name: "Dominic Sena",
      Bio: "Dominic Sena was born on 26 April 1949 in Niles, Ohio, USA. He is a director and cinematographer, known for Kalifornia (1993), Whiteout (2009) and Swordfish (2001).",
    },
  },
  {
    Title: "Blood Diamond",
    Description:
      "A fisherman, a smuggler, and a syndicate of businessmen match wits over the possession of a priceless diamond.",
    Genre: {
      Name: "Adventure",
      "Year Made": "2006",
    },
    Director: {
      Name: "Edward Zwick",
      Bio: "Zwick moves deftly between the roles of writer, director and producer. He was nominated for a Golden Globe for his direction of the 1989 critically acclaimed Civil War drama, Glory. He received his second Golden Globe nomination as a director for Legends of the Fall. Zwick received an Academy Award as one of the producers of Shakespeare in Love, as well as a second nomination for Traffic. He wrote, directed and produced the feature film The Last Samurai. Zwick continues to work with his partner, Marshall Herskovitz, at their company Bedford Falls where they created Thirtysomething, My So-Called Life, Once and Again and Blood Diamond.",
    },
  },
];

let users = [
  {
    id: 1,
    name: "Kevin",
    favoriteMovies: [],
  },
  {
    id: 2,
    name: "Josh",
    favoriteMovies: ["Gone in 60 seconds"],
  },
];

app.post(
  "/users",
  [
    check("userName", "userName needs to be a min of 5 characters").isLength({
      min: 5,
    }),
    check(
      "userName",
      "userName contains non-alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("password", "password is required").not().isEmpty(),
    check("email", "email does not appear to be valid").isEmail(),
  ],
  async (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = await Users.hashPassword(req.body.password);
    await Users.findOne({ userName: req.body.userName })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.userName + " already exists");
        } else {
          Users.create({
            userName: req.body.userName,
            password: hashedPassword,
            email: req.body.email,
            birthday: req.body.birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.get(
  "/users/:userName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOne({ userName: req.params.userName })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.put(
  "/users/:userName",
  [
    check("userName", "userName needs to be a min of 5 characters").isLength({
      min: 5,
    }),
    check(
      "userName",
      "userName contains non-alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("password", "password is required").not().isEmpty(),
    check("email", "email does not appear to be valid").isEmail(),
  ],
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (req.user.userName !== req.params.userName) {
      return res.status(400).send("Permission was denied");
    }

    let hashedPassword = await Users.hashPassword(req.body.password);
    await Users.findOneAndUpdate(
      { userName: req.params.userName },
      {
        $set: {
          userName: req.body.userName,
          password: hashedPassword,
          email: req.body.email,
          birthday: req.body.birthday,
        },
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.post(
  "/users/:userName/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { userName: req.params.userName },
      { $push: { favoriteMovies: req.params.MovieID } },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.delete(
  "/users/:userName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndDelete({ userName: req.params.userName })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.userName + " was not found");
        } else {
          res.status(200).send(req.params.userName + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.delete(
  "/users/:userName/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { userName: req.params.userName },
      { $pull: { favoriteMovies: req.params.MovieID } },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ title: req.params.title })
      .then((movie) => {
        res.status(200).json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.post(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.create({
      Title: req.body.Title,
      Description: req.body.Description,
      Genre: req.body.Genre,
      Director: req.body.Director,
    })
      .then((movie) => {
        res.status(201).json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.put(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOneAndUpdate(
      { Title: req.params.title },
      {
        $set: {
          Title: req.body.Title,
          Description: req.body.Description,
          Genre: req.body.Genre,
          Director: req.body.Director,
        },
      },
      { new: true }
    )
      .then((updatedMovie) => {
        res.json(updatedMovie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.delete(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOneAndDelete({ Title: req.params.title })
      .then((movie) => {
        if (!movie) {
          res.status(400).send(req.params.title + " was not found");
        } else {
          res.status(200).send(req.params.title + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.get("/", (req, res) => {
  res.send("Welcome to my Movie app");
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Your app is listening on port ${port}`);
});
