const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const GymClass = require('./models/GymClass');
const Booking = require('./models/Booking');

const classes = [
  { classId: 'C-001', name: 'Power Yoga',        classroom: 'Studio A',  scheduledAt: new Date('2026-05-19T07:00:00'), capacity: 20 },
  { classId: 'C-002', name: 'Stretch & Restore',  classroom: 'Studio B',  scheduledAt: new Date('2026-05-20T18:30:00'), capacity: 20 },
  { classId: 'C-003', name: 'Morning Spin',        classroom: 'Spin Room', scheduledAt: new Date('2026-05-21T08:00:00'), capacity: 15 },
  { classId: 'C-004', name: 'Morning Meditation',  classroom: 'Studio A',  scheduledAt: new Date('2026-05-22T12:00:00'), capacity: 20 },
  { classId: 'C-005', name: 'Core & Balance',      classroom: 'Studio C',  scheduledAt: new Date('2026-05-23T09:00:00'), capacity: 20 },
  { classId: 'C-006', name: 'Vinyasa Flow',        classroom: 'Yoga Loft', scheduledAt: new Date('2026-05-24T06:00:00'), capacity: 12 },
  { classId: 'C-007', name: 'Hot Yoga Basics',     classroom: 'Studio B',  scheduledAt: new Date('2026-05-25T10:00:00'), capacity: 20 },
  { classId: 'C-008', name: 'Boxing Basics',       classroom: 'Spin Room', scheduledAt: new Date('2026-05-26T07:30:00'), capacity: 15 },
  { classId: 'C-009', name: 'Dance Cardio',        classroom: 'Yoga Loft', scheduledAt: new Date('2026-05-27T17:00:00'), capacity: 12 },
  { classId: 'C-010', name: 'Pilates Flow',        classroom: 'Studio C',  scheduledAt: new Date('2026-05-28T11:00:00'), capacity: 20 },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  await Booking.deleteMany({});
  console.log('Cleared existing bookings');

  await GymClass.deleteMany({});
  console.log('Cleared existing gym classes');

  await GymClass.insertMany(classes);
  console.log(`Inserted ${classes.length} gym classes`);

  await mongoose.disconnect();
  console.log('Done');
};

seed().catch((err) => { console.error(err); process.exit(1); });
