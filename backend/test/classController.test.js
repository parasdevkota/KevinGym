'use strict';

const assert = require('assert');
const sinon = require('sinon');

const Booking = require('../models/Booking');
const GymClass = require('../models/GymClass');
const { getClasses } = require('../controllers/classController');

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

describe('Get Classes Function Test', () => {
  // Restore stubs after each test to prevent state leakage between test cases
  afterEach(() => sinon.restore());

  it('TC-048: Should return available classes successfully', async () => {
    // Simulate classes not yet booked by member with available capacity
    const classes = [{
      _id: 'gc001',
      classId: 'YOGA-01',
      name: 'Morning Yoga',
      classroom: 'Room A',
      scheduledAt: new Date('2026-06-01T10:00:00Z'),
      capacity: 20,
      enrolled: 5,
    }];

    sinon.stub(Booking, 'find').returns({
      distinct: sinon.stub().resolves(['booked-id']),
    });
    sinon.stub(GymClass, 'find').returns({
      sort: sinon.stub().resolves(classes),
    });

    const req = { user: { _id: 'member001' } };
    const res = createMockRes();

    await getClasses(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.strictEqual(res.body[0].classId, 'YOGA-01');
    assert.strictEqual(res.body[0].name, 'Morning Yoga');
  });

  it('TC-049: Should return 500 if a database error occurs', async () => {
    sinon.stub(Booking, 'find').throws(new Error('Database connection failed'));

    const req = { user: { _id: 'member001' } };
    const res = createMockRes();

    await getClasses(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.message, 'Database connection failed');
  });
});
