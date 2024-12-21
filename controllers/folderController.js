// folderController.js
const prisma = require('../db/prisma');
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// Create a new folder
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

        // Create folder in the database
        const newFolder = await prisma.folder.create({
            data: { name, userId },
        });

        // Create a physical directory in the uploads folder
        const folderPath = path.join(UPLOADS_DIR, `${newFolder.id}`);
        fs.mkdirSync(folderPath);

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
        const folderId = id;

        const folder = await prisma.folder.findFirst({ where: { id: folderId, userId } });
        if (!folder) {
            req.flash('error', 'Folder not found or unauthorized');
            return res.redirect('/dashboard');
        }

        // Step 1: Delete files associated with the folder
        const files = await prisma.file.findMany({ where: { folderId: folder.id } });

        for (const file of files) {
            console.log('Deleting file from disk:', file.path);
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            } else {
                console.warn(`File not found on disk: ${file.path}`);
            }
        }

        await prisma.file.deleteMany({ where: { folderId: folder.id } });

        // Step 2: Delete the folder directory from disk
        const folderPath = path.join(UPLOADS_DIR, `${folder.id}`);
        if (fs.existsSync(folderPath)) {
            fs.rmSync(folderPath, { recursive: true, force: true });
        } else {
            console.warn(`Folder directory not found on disk: ${folderPath}`);
        }

        // Step 3: Delete the folder from the database
        await prisma.folder.delete({ where: { id: folder.id } });

        req.flash('success', 'Folder deleted successfully');
    } catch (error) {
        console.error('Error deleting folder:', error);
        req.flash('error', 'Failed to delete folder');
    }

    res.redirect('/dashboard');
};



// Get folder details including files
const getFolderDetails = async (req, res) => {
    const { folderId } = req.params; // Updated parameter name
    const userId = req.user.id;

    try {
        const folder = await prisma.folder.findUnique({
            where: { id: folderId }, 
            include: { files: true }, 
        });

        if (!folder) {
            req.flash('error', 'Folder not found');
            return res.redirect('/dashboard');
        }

        if (folder.userId !== userId) {
            req.flash('error', 'Unauthorized access');
            return res.redirect('/dashboard');
        }

        console.log(folder.files);

        // Render the folderDetails view
        res.render('folderDetails', {
            folder,
            user: req.user,
            messages: req.flash('success'),
            errors: req.flash('error'),
        });
    } catch (error) {
        console.error('Error fetching folder details:', error);
        req.flash('error', 'Failed to retrieve folder details');
        res.redirect('/dashboard');
    }
};


// Upload file to a folder
const uploadFileToFolder = async (req, res) => {
    try {
        const folderId = req.params.folderId;

        // Check if folder exists
        const folder = await prisma.folder.findUnique({
            where: { id: folderId },
        });

        if (!folder) {
            req.flash('error', 'Folder not found');
            return res.redirect('/dashboard');
        }

        // Handle file upload
        const file = req.file; // File uploaded via Multer
        if (!file) {
            req.flash('error', 'No file uploaded');
            return res.redirect(`/folders/${folderId}/details`);
        }

        // Generate a unique name for the file
        const timestamp = Date.now();
        const uniqueName = `${timestamp}-${file.originalname}`;
        const folderPath = path.join(UPLOADS_DIR, `${folderId}`);
        const filePath = path.join(folderPath, uniqueName);

        // Move file to the folder's directory
        fs.renameSync(file.path, filePath);

        // Save file record in the database
        await prisma.file.create({
            data: {
                filename: uniqueName, // Save the unique name
                filepath: filePath,
                size: file.size,
                folderId: folder.id,
            },
        });

        req.flash('success', 'File uploaded successfully');
        return res.redirect(`/folders/${folderId}/details`);
    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong');
        res.redirect('/dashboard');
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