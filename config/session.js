const session = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const prisma = require('../db/prisma');

module.exports = session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
        checkPeriod: 2 * 60 * 1000,
    }),
});
