const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const prisma = require('../db/prisma');

const passport = require('passport');

passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await prisma.user.findUnique({
                where: { email: username }
            });

            if (!user) {
                return done(null, false, { message: 'Incorrect username or password' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return done(null, false, { message: 'Incorrect username or password' });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));


passport.serializeUser((user, done) => {
    console.log('Serializing user:', user);
    done(null, user.id); // Store user ID in session
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
        });
        console.log('Deserializing user:', user);
        done(null, user); // Attach user object to `req.user`
    } catch (err) {
        done(err, null);
    }
});



module.exports = passport;
