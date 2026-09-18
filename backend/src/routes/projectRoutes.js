const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// Route GET /api/projects
router.get('/', projectController.getProjects);

module.exports = router;
