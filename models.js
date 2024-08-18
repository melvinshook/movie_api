import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: {
    name: String,
    description: String
  },
  director: {
    name: String,
    bio: String
  },
  actors: [String],
  imagePath: String,
  featured: Boolean
});

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  birthday: Date,
  favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

userSchema.statics.hashPassword = (password) => bcrypt.hashSync(password, 10);
userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

const Movie = mongoose.model('Movie', movieSchema);
const User = mongoose.model('User', userSchema);

export { Movie, User };
