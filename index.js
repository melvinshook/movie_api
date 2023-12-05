const express = require('express'),
  morgan = require('morgan'),
  app = express(),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

app.use(bodyParser.json()), 
app.use(morgan('common'));

let movies = [
  {
    "Title": "Step Brothers",
    "Description":
    "Two aimless middle-aged losers still living at home are forced against their will to become roommates when their parents marry.",

    "Genre": {
      "Name": "Comedy",
      "Year Made": "20008",
  },
    
  "Director": {
    "Name": "Adam McKay",
    "Bio": "Adam McKay (born April 17, 1968) is an American screenwriter, director, comedian, and actor. McKay has a comedy partnership with Will Ferrell, with whom he co-wrote the films Anchorman, Talladega Nights, and The Other Guys. Ferrell and McKay also founded their comedy website Funny or Die through their production company Gary Sanchez Productions. He has been married to Shira Piven since 1999. They have two children.",
  },
},


{
    "Title": "Gone in 60 seconds",
    "Description":
      "A retired master car thief must come back to the industry and steal fifty cars with his crew in one night to save his brother's life.",
    "Genre": {
    "Name": "Action",
    "Year Made": "2000"
  },
  "Director": {
    "Name": "Dominic Sena",
    "Bio": "Dominic Sena was born on 26 April 1949 in Niles, Ohio, USA. He is a director and cinematographer, known for Kalifornia (1993), Whiteout (2009) and Swordfish (2001).",
  },
},

  {
    "Title": "Blood Diamond",
    "Description": "A fisherman, a smuggler, and a syndicate of businessmen match wits over the possession of a priceless diamond.",
    "Genre": {
      "Name": "Adventure",
      "Year Made":"2006"
    },
  "Director": {
    "Name": "Edward Zwick",
    "Bio": "Zwick moves deftly between the roles of writer, director and producer. He was nominated for a Golden Globe for his direction of the 1989 critically acclaimed Civil War drama, Glory. He received his second Golden Globe nomination as a director for Legends of the Fall. Zwick received an Academy Award as one of the producers of Shakespeare in Love, as well as a second nomination for Traffic. He wrote, directed and produced the feature film The Last Samurai. Zwick continues to work with his partner, Marshall Herskovitz, at their company Bedford Falls where they created Thirtysomething, My So-Called Life, Once and Again and Blood Diamond." 
  },
}
  
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

// Create new user
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send("users need names");
  }
})

// Update users info by ID
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find( user => user.id == id) ;

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send("no such user")
  }
})

// Create add movies to favorites list by id
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array `);
  } else {
    res.status(400).send("no such user")
  }
})

// Delete movies from favorites list by id
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle );
    res
      .status(200)
      .send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send("no such user")
  }
})

// Delete allow users to deregister
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    users = users.filter( user => user.id != id );
    res.status(200).send(`user ${id} has been removed`);
  } else {
    res.status(400).send("no such user")
  }
})

// Read All movies
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
})

// Read movies by title
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find( movie => movie.Title === title) ;

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("no such movie")
  }
})

// Read movies by genre
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find( movie => movie.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send("no such genre")
  }
})

// Read directors by name
app.get('/movies/directors/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find( movie => movie.Director.Name === directorName).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send("no such director")
  }
})

app.get('/', (req, res) => {
  res.send("Welcome to my Movie app");
});

app.use(express.static("public"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(5501, () => {
  console.log("This app is running on port 5501");
});
