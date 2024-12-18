const express = require('express');
const { createFolder, listFolders, updateFolder, deleteFolder } = require('../controllers/folderController');
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

module.exports = router;
