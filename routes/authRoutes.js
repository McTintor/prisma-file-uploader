const express = require('express');
const passport = require('passport');
const { dashboard, renderRegisterPage, renderLoginPage, register, login, logout } = require('../controllers/authController');

const router = express.Router();

// Render the registration and login pages
router.get('/', renderRegisterPage);
router.get('/register', renderRegisterPage);
router.get('/login', renderLoginPage);

// Handle registration and login
router.post('/register', register);
router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), login );

router.get('/logout', logout)

router.get('/dashboard', dashboard);

module.exports = router;
