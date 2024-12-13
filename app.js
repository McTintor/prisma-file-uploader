const express = require('express');
const path = require('path');
const session = require('./config/session');
const passport = require('./config/passport');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

app.use(authRoutes);
app.use('/files', fileRoutes);

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})

module.exports = app;
