const express = require('express');
const { getFolders, createFolder, deleteFolder } = require('../controllers/folderController');

const router = express.Router();

// Folder routes
router.get('/', getFolders);
router.post('/create', createFolder);
router.post('/:id/delete', deleteFolder);

module.exports = router;
