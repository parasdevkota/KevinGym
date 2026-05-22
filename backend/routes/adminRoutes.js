const express = require('express');
const { getUsers, createUser, updateUser, patchUser, deleteUser } = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/users', protect, requireAdmin, getUsers);
router.post('/users', protect, requireAdmin, createUser);
router.put('/users/:id', protect, requireAdmin, updateUser);
router.patch('/users/:id', protect, requireAdmin, patchUser);
router.delete('/users/:id', protect, requireAdmin, deleteUser);

module.exports = router;
