'use strict';

const assert = require('assert');
const sinon = require('sinon');

const Booking = require('../models/Booking');
const GymClass = require('../models/GymClass');
const {
  getMyBookings,
  createBooking,
  cancelBooking,
  rescheduleBooking,
} = require('../controllers/bookingController');

// Simulate Express response object to capture status code and response body
function createMockRes() {
  const res = { statusCode: 200, body: null };
  res.status = sinon.stub().callsFake((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = sinon.stub().callsFake((body) => {
    res.body = body;
    return res;
  });
  return res;
}

// Test fixture for gym class data used across booking tests
const gymClassData = {
  _id: 'gc001',
  classId: 'YOGA-01',
  name: 'Morning Yoga',
  classroom: 'Room A',
  scheduledAt: new Date('2026-06-01T10:00:00Z'),
  capacity: 20,
  enrolled: 5,
};

describe('Get My Bookings Function Test', () => {
  // Restore stubs after each test to prevent state leakage between test cases
  afterEach(() => sinon.restore());

  it('TC-031: Should return bookings successfully', async () => {
    const bookings = [{
      _id: 'b001',
      gymClass: gymClassData,
    }];
    // Stub Mongoose query chain: find, populate, sort
    sinon.stub(Booking, 'find').returns({
      populate: sinon.stub().returns({
        sort: sinon.stub().resolves(bookings),
      }),
    });

    const req = { user: { _id: 'member001' } };
    const res = createMockRes();

    await getMyBookings(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.strictEqual(res.body[0].classId, 'YOGA-01');
    assert.strictEqual(res.body[0].name, 'Morning Yoga');
  });

  it('TC-032: Should return 500 if a database error occurs', async () => {
    sinon.stub(Booking, 'find').throws(new Error('Database connection failed'));

    const req = { user: { _id: 'member001' } };
    const res = createMockRes();

    await getMyBookings(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.message, 'Database connection failed');
  });
});

describe('Create Booking Function Test', () => {
  // Restore stubs after each test to prevent state leakage between test cases
  afterEach(() => sinon.restore());

  it('TC-033: Should create a booking successfully', async () => {
    // Simulate available class capacity with no existing active booking
    const gymClass = { ...gymClassData, save: sinon.stub().resolves() };
    const populatedBooking = {
      _id: 'b001',
      gymClass: gymClassData,
      populate: sinon.stub().resolves(),
    };
    populatedBooking.populate = sinon.stub().resolves(populatedBooking);

    sinon.stub(GymClass, 'findById').resolves(gymClass);
    sinon.stub(Booking, 'findOne').resolves(null);
    sinon.stub(Booking, 'create').resolves(populatedBooking);

    const req = { user: { _id: 'member001' }, body: { gymClassId: 'gc001' } };
    const res = createMockRes();

    await createBooking(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.classId, 'YOGA-01');
    assert.strictEqual(res.body.name, 'Morning Yoga');
  });

  it('TC-034: Should return 404 if class is not found', async () => {
    sinon.stub(GymClass, 'findById').resolves(null);

    const req = { user: { _id: 'member001' }, body: { gymClassId: 'missing' } };
    const res = createMockRes();

    await createBooking(req, res);

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, 'Class not found');
  });

  it('TC-035: Should return 400 if class is full', async () => {
    // Simulate class at full capacity
    sinon.stub(GymClass, 'findById').resolves({
      ...gymClassData,
      enrolled: 20,
      capacity: 20,
    });

    const req = { user: { _id: 'member001' }, body: { gymClassId: 'gc001' } };
    const res = createMockRes();

    await createBooking(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.message, 'Class is full');
  });

  it('TC-036: Should return 400 if already booked', async () => {
    // Simulate member already has an active booking for this class
    sinon.stub(GymClass, 'findById').resolves(gymClassData);
    sinon.stub(Booking, 'findOne').resolves({ _id: 'existing' });

    const req = { user: { _id: 'member001' }, body: { gymClassId: 'gc001' } };
    const res = createMockRes();

    await createBooking(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.message, 'Already booked this class');
  });

  it('TC-037: Should return 500 if a database error occurs', async () => {
    sinon.stub(GymClass, 'findById').rejects(new Error('Database connection failed'));

    const req = { user: { _id: 'member001' }, body: { gymClassId: 'gc001' } };
    const res = createMockRes();

    await createBooking(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.message, 'Database connection failed');
  });
});

describe('Cancel Booking Function Test', () => {
  // Restore stubs after each test to prevent state leakage between test cases
  afterEach(() => sinon.restore());

  it('TC-038: Should cancel a booking successfully', async () => {
    const booking = {
      _id: 'b001',
      gymClass: 'gc001',
      status: 'active',
      save: sinon.stub().resolves(),
    };
    sinon.stub(Booking, 'findOne').resolves(booking);
    sinon.stub(GymClass, 'findByIdAndUpdate').resolves();

    const req = { user: { _id: 'member001' }, params: { id: 'b001' } };
    const res = createMockRes();

    await cancelBooking(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, 'Booking cancelled');
    assert.strictEqual(booking.status, 'cancelled');
  });

  it('TC-039: Should return 404 if booking is not found', async () => {
    sinon.stub(Booking, 'findOne').resolves(null);

    const req = { user: { _id: 'member001' }, params: { id: 'missing' } };
    const res = createMockRes();

    await cancelBooking(req, res);

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, 'Booking not found');
  });

  it('TC-040: Should return 400 if booking is already cancelled', async () => {
    sinon.stub(Booking, 'findOne').resolves({
      _id: 'b001',
      status: 'cancelled',
    });

    const req = { user: { _id: 'member001' }, params: { id: 'b001' } };
    const res = createMockRes();

    await cancelBooking(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.message, 'Booking already cancelled');
  });

  it('TC-041: Should return 500 if a database error occurs', async () => {
    sinon.stub(Booking, 'findOne').rejects(new Error('Database connection failed'));

    const req = { user: { _id: 'member001' }, params: { id: 'b001' } };
    const res = createMockRes();

    await cancelBooking(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.message, 'Database connection failed');
  });
});

describe('Reschedule Booking Function Test', () => {
  // Restore stubs after each test to prevent state leakage between test cases
  afterEach(() => sinon.restore());

  it('TC-042: Should reschedule a booking successfully', async () => {
    const newClass = {
      _id: 'gc002',
      classId: 'YOGA-02',
      name: 'Evening Yoga',
      classroom: 'Room B',
      scheduledAt: new Date('2026-06-02T10:00:00Z'),
      capacity: 20,
      enrolled: 3,
      save: sinon.stub().resolves(),
    };
    const booking = {
      _id: 'b001',
      gymClass: 'gc001',
      save: sinon.stub().resolves(),
      // Simulate populate attaching gymClass reference to booking document
      populate: sinon.stub().callsFake(async function populate() {
        this.gymClass = newClass;
        return this;
      }),
    };

    sinon.stub(Booking, 'findOne')
      .onFirstCall().resolves(booking)
      .onSecondCall().resolves(null);
    sinon.stub(GymClass, 'findById').resolves(newClass);
    sinon.stub(GymClass, 'findByIdAndUpdate').resolves();

    const req = {
      user: { _id: 'member001' },
      params: { id: 'b001' },
      body: { newGymClassId: 'gc002' },
    };
    const res = createMockRes();

    await rescheduleBooking(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.classId, 'YOGA-02');
    assert.strictEqual(res.body.name, 'Evening Yoga');
  });

  it('TC-043: Should return 404 if booking is not found', async () => {
    sinon.stub(Booking, 'findOne').resolves(null);

    const req = {
      user: { _id: 'member001' },
      params: { id: 'missing' },
      body: { newGymClassId: 'gc002' },
    };
    const res = createMockRes();

    await rescheduleBooking(req, res);

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, 'Booking not found');
  });

  it('TC-044: Should return 404 if new class is not found', async () => {
    sinon.stub(Booking, 'findOne').resolves({
      _id: 'b001',
      gymClass: 'gc001',
    });
    sinon.stub(GymClass, 'findById').resolves(null);

    const req = {
      user: { _id: 'member001' },
      params: { id: 'b001' },
      body: { newGymClassId: 'missing' },
    };
    const res = createMockRes();

    await rescheduleBooking(req, res);

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, 'New class not found');
  });

  it('TC-045: Should return 400 if already booked on new class', async () => {
    sinon.stub(Booking, 'findOne')
      .onFirstCall().resolves({ _id: 'b001', gymClass: 'gc001' })
      .onSecondCall().resolves({ _id: 'existing' });
    sinon.stub(GymClass, 'findById').resolves({
      ...gymClassData,
      _id: 'gc002',
      enrolled: 5,
    });

    const req = {
      user: { _id: 'member001' },
      params: { id: 'b001' },
      body: { newGymClassId: 'gc002' },
    };
    const res = createMockRes();

    await rescheduleBooking(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.message, 'Already booked this class');
  });

  it('TC-046: Should return 400 if new class is full', async () => {
    sinon.stub(Booking, 'findOne').resolves({ _id: 'b001', gymClass: 'gc001' });
    sinon.stub(GymClass, 'findById').resolves({
      ...gymClassData,
      _id: 'gc002',
      enrolled: 20,
      capacity: 20,
    });

    const req = {
      user: { _id: 'member001' },
      params: { id: 'b001' },
      body: { newGymClassId: 'gc002' },
    };
    const res = createMockRes();

    await rescheduleBooking(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.message, 'New class is full');
  });

  it('TC-047: Should return 500 if a database error occurs', async () => {
    sinon.stub(Booking, 'findOne').rejects(new Error('Database connection failed'));

    const req = {
      user: { _id: 'member001' },
      params: { id: 'b001' },
      body: { newGymClassId: 'gc002' },
    };
    const res = createMockRes();

    await rescheduleBooking(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.message, 'Database connection failed');
  });
});
