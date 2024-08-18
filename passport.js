import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { User } from './models.js';
import { Strategy as JWTStrategy, ExtractJwt as ExtractJWT } from 'passport-jwt';

const jwtSecret = 'your_jwt_secret';

passport.use(
  new LocalStrategy(
    {
      usernameField: 'userName',
      passwordField: 'password',
    },
    async (userName, password, done) => {
      try {
        const user = await User.findOne({ userName });

        if (!user) {
          console.log('Incorrect username');
          return done(null, false, { message: 'Incorrect username or password.' });
        }

        if (!user.validatePassword(password)) {
          console.log('Incorrect password');
          return done(null, false, { message: 'Incorrect password.' });
        }

        console.log('Login successful');
        return done(null, user);
      } catch (error) {
        console.error(error);
        return done(error);
      }
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    },
    async (jwtPayload, done) => {
      try {
        const user = await User.findById(jwtPayload._id);
        return done(null, user);
      } catch (error) {
        console.error(error);
        return done(error);
      }
    }
  )
);

export default passport;
