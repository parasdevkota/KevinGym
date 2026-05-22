const express = require('express');
const router = express.Router();
const { createCourse, getCourses } = require('../controllers/courseController');
const { protect, requireVendor } = require('../middleware/authMiddleware');

router.post('/', protect, requireVendor, createCourse);
router.get('/', protect, getCourses);

module.exports = router;
