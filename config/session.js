const session = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const prisma = require('../db/prisma');

module.exports = session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
    },
    store: new PrismaSessionStore(prisma, {
        checkPeriod: 2 * 60 * 1000,
    }),
});
