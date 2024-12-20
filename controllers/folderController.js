// folderController.js
const { PrismaClient } = require('@prisma/client');
const prisma = require('../db/prisma');

// Create a new folder
const createFolder = async (req, res) => {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) {
        req.flash('error', 'Folder name is required');
        return res.redirect('/dashboard');
    }

    try {
        const existingFolder = await prisma.folder.findFirst({
            where: { name, userId },
        });

        if (existingFolder) {
            req.flash('error', 'Folder name already exists');
            return res.redirect('/dashboard');
        }

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
            include: { files: true },
        });

        res.render('dashboard', {
            user: req.user,
            folders,
            messages: req.flash('success'),
            errors: req.flash('error'),
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to retrieve folders');
    }
};

// Update folder name
const updateFolder = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) {
        req.flash('error', 'Folder name is required');
        return res.redirect('/dashboard');
    }

    try {
        const existingFolder = await prisma.folder.findFirst({
            where: { name, userId },
        });

        if (existingFolder && existingFolder.id !== id) {
            req.flash('error', 'Folder name already exists');
            return res.redirect('/dashboard');
        }

        const updatedFolder = await prisma.folder.updateMany({
            where: { id, userId },
            data: { name },
        });

        if (!updatedFolder.count) {
            req.flash('error', 'Folder not found or unauthorized');
            return res.redirect('/dashboard');
        }

        req.flash('success', 'Folder renamed successfully');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to rename folder');
    }

    res.redirect('/dashboard');
};

// Delete a folder
const deleteFolder = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const folder = await prisma.folder.findFirst({ where: { id, userId } });

        if (!folder) {
            req.flash('error', 'Folder not found or unauthorized');
            return res.redirect('/dashboard');
        }

        await prisma.folder.delete({ where: { id } });
        req.flash('success', 'Folder deleted successfully');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to delete folder');
    }

    res.redirect('/dashboard');
};

// Get folder details including files
const getFolderDetails = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const folder = await prisma.folder.findUnique({
            where: { id: id },
            include: { files: true },
        });

        if (!folder || folder.userId !== userId) {
            req.flash('error', 'Folder not found or unauthorized');
            return res.redirect('/dashboard');
        }

        res.render('folderDetails', {
            folder,
            user: req.user,
            messages: req.flash('success'),
            errors: req.flash('error'),
        });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to retrieve folder details');
        res.redirect('/dashboard');
    }
};

// Upload file to a folder
const uploadFileToFolder = async (req, res) => {
    const { folderId } = req.params;

    try {
        const folder = await prisma.folder.findUnique({
            where: { id: folderId },
        });

        if (!folder) {
            req.flash('error', 'Folder not found');
            return res.redirect('/dashboard');
        }

        if (!req.file) {
            req.flash('error', 'No file uploaded');
            return res.redirect(`/folders/${folderId}/files`);
        }

        await prisma.file.create({
            data: {
                name: req.file.originalname,
                path: req.file.path,
                folderId: folder.id,
            },
        });

        req.flash('success', 'File uploaded successfully');
        res.redirect(`/folders/${folderId}/files`);
    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to upload file');
        res.redirect(`/folders/${folderId}/files`);
    }
};

// Download a file
const downloadFile = async (req, res) => {
    const { id } = req.params;

    try {
        const file = await prisma.file.findUnique({
            where: { id: id },
        });

        if (!file) {
            return res.status(404).send('File not found');
        }

        res.download(file.path, file.name);
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to download file');
    }
};

// Delete a file
const deleteFile = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.file.delete({
            where: { id: id },
        });

        req.flash('success', 'File deleted successfully');
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to delete file');
        res.redirect('/dashboard');
    }
};

module.exports = {
    createFolder,
    listFolders,
    updateFolder,
    deleteFolder,
    getFolderDetails,
    uploadFileToFolder,
    downloadFile,
    deleteFile,
};