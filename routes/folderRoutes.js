const express = require('express');
const { uploadFileToFolder, showFolderFiles, getFolderDetails, createFolder, listFolders, updateFolder, deleteFolder } = require('../controllers/folderController');
const upload = require('../middlewares/upload');
const router = express.Router();

// Middleware to protect routes
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

router.post('/', ensureAuthenticated, createFolder);
router.get('/', ensureAuthenticated, listFolders);
router.put('/:id', ensureAuthenticated, updateFolder);
router.delete('/:id', ensureAuthenticated, deleteFolder);

router.get('/:id/details', getFolderDetails);

router.get('/:folderId/files', showFolderFiles);
router.post('/:folderId/files/upload', upload.single('file'), uploadFileToFolder);

module.exports = router;
