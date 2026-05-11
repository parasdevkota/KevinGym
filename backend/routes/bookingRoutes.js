const express = require('express');
const { getMyBookings, createBooking, cancelBooking, rescheduleBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getMyBookings);
router.post('/', protect, createBooking);
router.delete('/:id', protect, cancelBooking);
router.put('/:id', protect, rescheduleBooking);

module.exports = router;
