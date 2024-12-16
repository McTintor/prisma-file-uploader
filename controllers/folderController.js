const prisma = require('../db/prisma');

// Get all folders for the logged-in user
const getFolders = async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/login');
    }

    try {
        const folders = await prisma.folder.findMany({
            where: { userId: req.user.id },
            include: { files: true },
        });

        res.render('folders', { folders });
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to fetch folders');
    }
};

// Create a new folder
const createFolder = async (req, res) => {
    const { name } = req.body;

    try {
        await prisma.folder.create({
            data: {
                name,
                userId: req.user.id,
            },
        });
        res.redirect('/folders');
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to create folder');
    }
};

// Delete a folder
const deleteFolder = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.folder.delete({
            where: { id },
        });
        res.redirect('/folders');
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to delete folder');
    }
};

module.exports = {
    getFolders,
    createFolder,
    deleteFolder,
};
