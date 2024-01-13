const express = require("express");
const morgan = require("morgan");
const app = express();
app.use(express.json());
const bodyParser = require("body-parser");
const uuid = require("uuid");
const mongoose = require("mongoose");
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect("mongodb://localhost:27017/cfDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');
app.use(morgan("common"));


let movies = [
  {
    Title: "Step Brothers",
    Description:
      "Two aimless middle-aged losers still living at home are forced against their will to become roommates when their parents marry.",

    Genre: {
      Name: "Comedy",
      "Year Made": "20008",
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

// Add a user in JSON format
/* {
  id: integer,
  userName: string,
  password: string,
  email: string,
  birthday: date,
}*/

app.post("/users", async (req, res) => {
  await Users.findOne({ userName: req.body.userName })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.userName + "already exists");
      } else {
        Users.create({
          userName: req.body.userName,
          password: req.body.password,
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
});

// Get all users json

app.get("/users", async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get user by username json

app.get("/users/:userName", async (req, res) => {
  await Users.findOne({ userName: req.params.userName })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Update a user's info by username

app.put('/users/:userName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // CONDITION TO CHECK ADDED HERE
    if(req.user.userName !== req.params.userName){
      return res.status(400).send('Permission was denied');
    }
    // CONDITION ENDS
  await Users.findOneAndUpdate({ userName: req.params.userName },
    {
      $set: {
        userName: req.body.userName,
        password: req.body.password,
        email: req.body.email,
        birthday: req.body.birthday,
      },
    },
    { new: true }
  ) // this line makes sure updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Add a movie to user's favorite list json

app.post("/users/:userName/movies/:MovieID", async (req, res) => {
  await Users.findOneAndUpdate(
    { userName: req.params.userName },
    { $push: { favoriteMovies: req.params.MovieID } },
    { new: true }
  ) //this line makes sure updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Delete a user by username json
app.delete("/users/:userName", async (req, res) => {
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
});

// delete movie from favorites
app.delete("/users/:userName/movies/:MovieID", async (req, res) => {
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
});

// Read All movies json
app.get("/movies", passport.authenticate('jwt', { session: false}), async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Read movies by title json
app.get('/movies/:title', async (req, res) => {
  await Movies.findOne({ title: req.params.title })
    .then((movie) => {
      res.status(200).json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error:" + err);
    });
});

//searches for movies by their genre and returns a JSON object
app.get('/movies/genres/:genreName', async (req, res) => {
  await Movies.findOne({ 'genre.name': req.params.genreName })
  .then((movie) => {
    res.status(200).json(movie.genre);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error : ' + err);
  });
});

// Read director by name json
app.get('/movies/directors/:directorName', async (req, res) => {
  await Movies.findOne({ 'director.name': req.params.directorName })
  .then((movie) => {
    res.status(200).json(movie.director);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

app.get("/", (req, res) => {
  res.send("Welcome to my Movie app");
});


app.listen(5501, () => {
  console.log('This app is running on port 5501');
});



