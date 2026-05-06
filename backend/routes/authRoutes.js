
const express = require('express');
const { registerUser, loginUser, updateUserProfile, getProfile, patchUserProfile, deleteUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateUserProfile);
router.patch('/profile', protect, patchUserProfile);
router.delete('/profile', protect, deleteUser);

module.exports = router;
