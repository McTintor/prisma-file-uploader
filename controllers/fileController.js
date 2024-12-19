const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const uploadFile = async (req, res) => {
    const { folderId } = req.params;  // Folder ID comes from URL params

    try {
        // Find the folder to which the file will be uploaded
        const folder = await prisma.folder.findUnique({
            where: {
                id: parseInt(folderId)  // Ensure the folderId is treated as an integer
            }
        });

        if (!folder) {
            req.flash('error', 'Folder not found');
            return res.redirect('/dashboard');
        }

        // Proceed with file upload logic
        const newFile = await prisma.file.create({
            data: {
                name: req.file.filename,
                path: req.file.path,
                folderId: folder.id,  // Link the uploaded file to the specific folder
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


const deleteFile = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the file in the database and delete it
        const file = await prisma.file.delete({
            where: { id: parseInt(id) },
        });

        req.flash('success', 'File deleted successfully');
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to delete file');
        res.redirect('/dashboard');
    }
};

const downloadFile = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the file in the database
        const file = await prisma.file.findUnique({
            where: { id: parseInt(id) },
        });

        if (!file) {
            return res.status(404).send('File not found');
        }

        // Send the file for download
        res.download(file.path, file.name);
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to download file');
    }
};


module.exports = {
    uploadFile,
    deleteFile,
    downloadFile
};
