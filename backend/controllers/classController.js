const GymClass = require('../models/GymClass');
const Booking = require('../models/Booking');

const getClasses = async (req, res) => {
  try {
    const bookedClassIds = await Booking.find({ member: req.user._id, status: 'active' }).distinct('gymClass');
    const classes = await GymClass.find({
      _id: { $nin: bookedClassIds },
      $expr: { $lt: ['$enrolled', '$capacity'] },
    }).sort({ scheduledAt: 1 });

    const formatted = classes.map((c) => ({
      _id: c._id,
      classId: c.classId,
      name: c.name,
      classroom: c.classroom,
      scheduledAt: c.scheduledAt,
      capacity: c.capacity,
      enrolled: c.enrolled,
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getClasses };
