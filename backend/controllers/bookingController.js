const Booking = require('../models/Booking');
const GymClass = require('../models/GymClass');

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ member: req.user._id, status: 'active' })
      .populate('gymClass')
      .sort({ createdAt: -1 });

    const formatted = bookings.map((b) => ({
      _id: b._id,
      classId: b.gymClass.classId,
      name: b.gymClass.name,
      classroom: b.gymClass.classroom,
      scheduledAt: b.gymClass.scheduledAt,
      gymClassId: b.gymClass._id,
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBooking = async (req, res) => {
  const { gymClassId } = req.body;
  try {
    const gymClass = await GymClass.findById(gymClassId);
    if (!gymClass) return res.status(404).json({ message: 'Class not found' });
    if (gymClass.enrolled >= gymClass.capacity)
      return res.status(400).json({ message: 'Class is full' });

    const existing = await Booking.findOne({ member: req.user._id, gymClass: gymClassId, status: 'active' });
    if (existing) return res.status(400).json({ message: 'Already booked this class' });

    const booking = await Booking.create({ member: req.user._id, gymClass: gymClassId });
    gymClass.enrolled += 1;
    await gymClass.save();

    await booking.populate('gymClass');
    res.status(201).json({
      _id: booking._id,
      classId: booking.gymClass.classId,
      name: booking.gymClass.name,
      classroom: booking.gymClass.classroom,
      scheduledAt: booking.gymClass.scheduledAt,
      gymClassId: booking.gymClass._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, member: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Booking already cancelled' });

    booking.status = 'cancelled';
    await booking.save();

    await GymClass.findByIdAndUpdate(booking.gymClass, { $inc: { enrolled: -1 } });
    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rescheduleBooking = async (req, res) => {
  const { newGymClassId } = req.body;
  try {
    const booking = await Booking.findOne({ _id: req.params.id, member: req.user._id, status: 'active' });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const newClass = await GymClass.findById(newGymClassId);
    if (!newClass) return res.status(404).json({ message: 'New class not found' });
    if (newClass.enrolled >= newClass.capacity)
      return res.status(400).json({ message: 'New class is full' });

    const alreadyBooked = await Booking.findOne({ member: req.user._id, gymClass: newGymClassId, status: 'active' });
    if (alreadyBooked) return res.status(400).json({ message: 'Already booked this class' });

    await GymClass.findByIdAndUpdate(booking.gymClass, { $inc: { enrolled: -1 } });
    newClass.enrolled += 1;
    await newClass.save();

    booking.gymClass = newGymClassId;
    await booking.save();
    await booking.populate('gymClass');

    res.json({
      _id: booking._id,
      classId: booking.gymClass.classId,
      name: booking.gymClass.name,
      classroom: booking.gymClass.classroom,
      scheduledAt: booking.gymClass.scheduledAt,
      gymClassId: booking.gymClass._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyBookings, createBooking, cancelBooking, rescheduleBooking };
