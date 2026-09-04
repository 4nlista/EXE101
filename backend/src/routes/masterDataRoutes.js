const express = require('express');
const router = express.Router();
const masterDataController = require('../controllers/masterDataController');

router.get('/departments', masterDataController.getDepartments);
router.get('/majors/:departmentId', masterDataController.getMajorsByDepartment);
router.get('/skills', masterDataController.getSkills);

module.exports = router;
