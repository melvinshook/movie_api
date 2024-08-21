import jwt from 'jsonwebtoken';
import passport from 'passport';
import './passport.js';

const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret"; 

const generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.userName,
    expiresIn: "7d", 
    algorithm: "HS256",
  });
};

/* POST login route */
export const login = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      console.log({ error, user });
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          return res.status(500).send(error.message);
        }
        const token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
