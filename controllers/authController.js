const bcrypt = require('bcrypt');
const prisma = require('../db/prisma');

const renderRegisterPage = (req, res) => {
    res.render('index');
};

const renderLoginPage = (req, res) => {
    const errors = req.flash('error');
    res.render('login', {
        errors
    });
}

const register = async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await prisma.user.create({
            data: { email, password: hashedPassword },
        });
        res.redirect('/login');
    } catch (error) {
        res.status(400).json({ error: 'Registration failed' });
    }
};

const login = (req, res) => {
    res.render('dashboard', {
        user: req.user
    });
};

const logout = (req, res) => {
    req.logout(err => {
        if (err) {
            console.error(err);
            return res.status(500).send('Logout failed');
        }
        res.redirect('/login');
    });
};

const dashboard = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    res.render('dashboard', { user: req.user });
};

module.exports = {
    register,
    login,
    logout,
    renderLoginPage,
    renderRegisterPage,
    dashboard
};
