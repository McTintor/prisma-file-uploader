const bcrypt = require('bcrypt');
const prisma = require('../db/prisma');

const register = async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: { email, password: hashedPassword },
        });
        res.status(201).json({ message: 'User registered', user });
    } catch (error) {
        res.status(400).json({ error: 'Registration failed' });
    }
};

const login = (req, res) => {
    res.status(200).json({ message: 'Logged in successfully', user: req.user });
};

const logout = (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ error: 'Logout failed' });
        res.status(200).json({ message: 'Logged out successfully' });
    });
};

module.exports = { register, login, logout };
