const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const GymClass = require('./models/GymClass');

const classes = [
  { classId: 'CLS-101', classroom: 'Studio A',   scheduledAt: new Date('2026-05-19T07:00:00'), capacity: 20 },
  { classId: 'CLS-204', classroom: 'Studio B',   scheduledAt: new Date('2026-05-20T18:30:00'), capacity: 20 },
  { classId: 'CLS-089', classroom: 'Spin Room',  scheduledAt: new Date('2026-05-21T08:00:00'), capacity: 15 },
  { classId: 'CLS-317', classroom: 'Studio A',   scheduledAt: new Date('2026-05-22T12:00:00'), capacity: 20 },
  { classId: 'CLS-142', classroom: 'Studio C',   scheduledAt: new Date('2026-05-23T09:00:00'), capacity: 20 },
  { classId: 'CLS-256', classroom: 'Yoga Loft',  scheduledAt: new Date('2026-05-24T06:00:00'), capacity: 12 },
  { classId: 'CLS-388', classroom: 'Studio B',   scheduledAt: new Date('2026-05-25T10:00:00'), capacity: 20 },
  { classId: 'CLS-412', classroom: 'Spin Room',  scheduledAt: new Date('2026-05-26T07:30:00'), capacity: 15 },
  { classId: 'CLS-501', classroom: 'Yoga Loft',  scheduledAt: new Date('2026-05-27T17:00:00'), capacity: 12 },
  { classId: 'CLS-603', classroom: 'Studio C',   scheduledAt: new Date('2026-05-28T11:00:00'), capacity: 20 },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  await GymClass.deleteMany({});
  console.log('Cleared existing gym classes');

  await GymClass.insertMany(classes);
  console.log(`Inserted ${classes.length} gym classes`);

  await mongoose.disconnect();
  console.log('Done');
};

seed().catch((err) => { console.error(err); process.exit(1); });
