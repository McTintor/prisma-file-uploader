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
    res.redirect('/dashboard');
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

const dashboard = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }

    try {
        const folders = await prisma.folder.findMany({
            where: { userId: req.user.id },
        });

        res.render('dashboard', {
            user: req.user,
            folders,
            messages: req.flash('success'),
            errors: req.flash('error'),
        });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to load dashboard');
        res.redirect('/login');
    }
};

module.exports = {
    register,
    login,
    logout,
    renderLoginPage,
    renderRegisterPage,
    dashboard
};
