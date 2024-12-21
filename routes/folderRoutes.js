const express = require('express');
const { uploadFileToFolder, deleteFile, downloadFile, getFolderDetails, createFolder, listFolders, updateFolder, deleteFolder } = require('../controllers/folderController');
const upload = require('../middlewares/upload');
const router = express.Router();

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

router.get('/:folderId/details', ensureAuthenticated, getFolderDetails);

router.post('/:folderId/details/upload', ensureAuthenticated, upload.single('file'), uploadFileToFolder);
router.delete('/:folderId/details/:fileId', ensureAuthenticated, deleteFile);
router.get('/:folderId/details/download/:fileId', ensureAuthenticated, downloadFile);

module.exports = router;