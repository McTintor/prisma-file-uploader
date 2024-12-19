const { PrismaClient } = require('@prisma/client');
const prisma = require('../db/prisma');

const createFolder = async (req, res) => {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) {
        req.flash('error', 'Folder name is required');
        return res.redirect('/dashboard');
    }

    try {
        // Check if a folder with the same name already exists for the user
        const existingFolder = await prisma.folder.findFirst({
            where: { name, userId },
        });

        if (existingFolder) {
            req.flash('error', 'Folder name already exists');
            return res.redirect('/dashboard');
        }

        // Create the folder if it doesn't exist
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

const getFolderDetails = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const folder = await prisma.folder.findUnique({
            where: { id: parseInt(id) },
            include: { files: true },
        });

        if (!folder || folder.userId !== userId) {
            req.flash('error', 'Folder not found or unauthorized');
            return res.redirect('/dashboard');
        }

        res.render('folderDetails', { folder });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to retrieve folder details');
        res.redirect('/dashboard');
    }
};


// List all folders for the logged-in user
const listFolders = async (req, res) => {
    const userId = req.user.id;

    try {
        const folders = await prisma.folder.findMany({
            where: { userId },
            include: {
                files: true, // Include files in each folder
            },
        });

        res.render('dashboard', { 
            user: req.user, 
            folders,  // Ensure folders are passed to the template
            messages: req.flash('success'), 
            errors: req.flash('error') 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to retrieve folders');
    }
};


const updateFolder = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) {
        req.flash('error', 'Folder name is required');
        return res.redirect('/dashboard');
    }

    try {
        // Check if folder name already exists
        const existingFolder = await prisma.folder.findFirst({
            where: { name, userId },
        });

        if (existingFolder && existingFolder.id !== id) {
            req.flash('error', 'Folder name already exists');
            return res.redirect('/dashboard');
        }

        // Update the folder name
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

// Show Files for a Specific Folder
const showFolderFiles = async (req, res) => {
    const { folderId } = req.params;

    try {
        // Find the folder and its files
        const folder = await prisma.folder.findUnique({
            where: { id: parseInt(folderId) },
            include: { files: true }
        });

        if (!folder) {
            req.flash('error', 'Folder not found');
            return res.redirect('/dashboard');
        }

        // Render the files page for this folder
        res.render('folderDetails', { folder });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to load folder files');
        res.redirect('/dashboard');
    }
};

// Upload File to a Specific Folder
const uploadFileToFolder = async (req, res) => {
    const { folderId } = req.params;  // Folder ID from the URL params

    try {
        // Find the folder using the folderId from the params
        const folder = await prisma.folder.findUnique({
            where: {
                id: folderId,  // Ensure it's treated as a string (no need to parseInt)
            }
        });

        if (!folder) {
            req.flash('error', 'Folder not found');
            return res.redirect('/dashboard');
        }

        // Proceed with file upload logic
        const newFile = await prisma.file.create({
            data: {
                filename: req.file.filename,
                filepath: req.file.path,
                size: req.file.size,
                folderId: folder.id,  // Link the uploaded file to the folder
            }
        });

        req.flash('success', 'File uploaded successfully');
        res.redirect(`/folders/${folder.id}/files`);

    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to upload file');
        res.redirect(`/folders/${folderId}/files`);
    }
};

module.exports = {
    createFolder,
    listFolders,
    updateFolder,
    deleteFolder,
    getFolderDetails,
    showFolderFiles,
    uploadFileToFolder
};
