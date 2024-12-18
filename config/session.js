const session = require('express-session');
const flash = require('connect-flash');
const PrismaSessionStore = require('@quixo3/prisma-session-store').PrismaSessionStore;
const prisma = require('../db/prisma');

module.exports = { 
    sessionMiddleware: session({
        store: new PrismaSessionStore(prisma, {
            checkPeriod: 2 * 60 * 1000, // session check period
            sessionModelName: 'Session',
            userModelName: 'User',
            touch: async (sid, session, expires, prisma) => {
                console.log("Session data:", session);
                await prisma.session.upsert({
                    where: { sid },
                    update: { expiresAt: expires },
                    create: {
                        sid,
                        data: JSON.stringify(session),
                        expiresAt: expires,
                    },
                });
                console.log('Session upserted successfully.');
            }
            
        }),
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
    }),

    flashMiddleware: flash(),
};
