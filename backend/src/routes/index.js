const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const masterDataRoutes = require('./masterDataRoutes');

// Định tuyến các nhóm API
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/master-data', masterDataRoutes);

module.exports = router;
