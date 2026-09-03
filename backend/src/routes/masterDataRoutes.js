const express = require('express');
const router = express.Router();
const masterDataController = require('../controllers/masterDataController');

router.get('/majors', masterDataController.getMajors);
router.get('/specializations/:majorId', masterDataController.getSpecializations);
router.get('/skills', masterDataController.getSkills);

module.exports = router;
