const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const prisma = require('../db/prisma');

const passport = require('passport');

// Define the Local Strategy
passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            // Find the user in the database
            const user = await prisma.user.findUnique({ where: { email } });

            if (!user) {
                return done(null, false, { message: 'User not found' });
            }

            // Compare the provided password with the hashed password
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return done(null, false, { message: 'Invalid credentials' });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
);

// Serialize and deserialize the user
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;
