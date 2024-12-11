const express = require('express');
const session = require('./config/session');
const passport = require('./config/passport');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})

module.exports = app;
