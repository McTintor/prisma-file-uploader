const express = require('express');
const { uploadFile, deleteFile, downloadFile } = require('../controllers/fileController');
const upload = require('../middlewares/upload');

const router = express.Router();

// File upload route
router.post('/upload', upload.single('file'), uploadFile);

// File download route
router.get('/download/:id', downloadFile);

// File deletion route
router.delete('/:id', deleteFile);

module.exports = router;
