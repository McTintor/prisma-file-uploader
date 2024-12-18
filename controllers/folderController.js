const prisma = require('../db/prisma');

const createFolder = async (req, res) => {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) {
        req.flash('error', 'Folder name is required');
        return res.redirect('/dashboard');
    }

    try {
        await prisma.folder.create({
            data: { name, userId },
        });
        req.flash('success', 'Folder created successfully');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to create folder');
    }

    res.redirect('/dashboard');
};

// List all folders for the logged-in user
const listFolders = async (req, res) => {
    const userId = req.user.id;

    try {
        const folders = await prisma.folder.findMany({
            where: { userId },
            include: { files: true }, // Include files if needed
        });
        res.status(200).json(folders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve folders' });
    }
};

// Update folder name
const updateFolder = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) {
        return res.status(400).json({ error: 'Folder name is required' });
    }

    try {
        const folder = await prisma.folder.updateMany({
            where: { id, userId },
            data: { name },
        });

        if (!folder.count) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        res.status(200).json({ message: 'Folder updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update folder' });
    }
};

const deleteFolder = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Delete folder by matching both id and userId
        const folder = await prisma.folder.delete({
            where: {
                id: id, // match the folder id
                userId: userId // match the user id
            }
        });

        req.flash('success', 'Folder deleted successfully');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to delete folder');
    }

    res.redirect('/dashboard');
};


module.exports = {
    createFolder,
    listFolders,
    updateFolder,
    deleteFolder,
};
