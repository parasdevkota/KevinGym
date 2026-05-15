const express = require('express');
const router = express.Router();
const { createCourse, getCourses } = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createCourse);
router.get('/', protect, getCourses);

module.exports = router;
