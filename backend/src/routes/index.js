const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const masterDataRoutes = require('./masterDataRoutes');

// Định tuyến các nhóm API
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
// Các API chung (ngành học, chuyên ngành, kỹ năng)
router.use('/', masterDataRoutes);
router.use('/projects', require('./projectRoutes'));

module.exports = router;
