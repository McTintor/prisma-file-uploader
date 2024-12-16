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
                console.log("Session data:", session); // Debug session data
                const userId = session?.passport?.user; // Access user ID

                if (userId) {
                    console.log("User ID:", userId); // Confirm user ID
                    await prisma.session.upsert({
                        where: { sid },
                        update: { expiresAt: expires },
                        create: {
                            sid,
                            data: JSON.stringify(session),
                            expiresAt: expires,
                            user: { connect: { id: userId } }, // Ensure user connection
                        },
                    });
                } else {
                    console.warn(`Session ${sid} missing user ID`);
                }
            },
        }),
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
    }),

    flashMiddleware: flash(),
};
