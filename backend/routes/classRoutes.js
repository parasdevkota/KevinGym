const express = require('express');
const { getClasses } = require('../controllers/classController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getClasses);

module.exports = router;
