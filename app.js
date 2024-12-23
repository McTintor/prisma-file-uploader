const express = require('express');
const path = require('path');
const passport = require('./config/passport');
const authRoutes = require('./routes/authRoutes');
const folderRoutes = require('./routes/folderRoutes');

const app = express();

const { sessionMiddleware, flashMiddleware } = require('./config/session')

const methodOverride = require('method-override');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(sessionMiddleware);
app.use(flashMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use(authRoutes);
app.use('/folders', folderRoutes);

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})

module.exports = app;
