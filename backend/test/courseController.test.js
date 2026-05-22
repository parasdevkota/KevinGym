'use strict';

const assert = require('assert');
const sinon = require('sinon');

const Course = require('../models/Course');
const gymEvents = require('../events/gymEvents');
const { createCourse, getCourses } = require('../controllers/courseController');

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

describe('Create Course Function Test', () => {
  // Restore stubs after each test to prevent state leakage between test cases
  afterEach(() => sinon.restore());

  it('TC-050: Should create a course successfully', async () => {
    // Simulate successful course creation by authenticated vendor
    const course = {
      id: 'c001',
      name: 'Morning Yoga',
      schedule: 'Mon/Wed',
      time: '09:00',
      vendorId: 'vendor001',
    };
    sinon.stub(Course, 'create').resolves(course);
    sinon.stub(gymEvents, 'emit'); // Isolate controller response from event side effects

    const req = {
      user: { id: 'vendor001' },
      body: {
        name: 'Morning Yoga',
        schedule: 'Mon/Wed',
        time: '09:00',
        description: 'Beginner friendly',
        studio: 'Studio A',
      },
    };
    const res = createMockRes();

    await createCourse(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.name, 'Morning Yoga');
  });

  it('TC-051: Should return 500 if a database error occurs', async () => {
    sinon.stub(Course, 'create').rejects(new Error('Database connection failed'));

    const req = {
      user: { id: 'vendor001' },
      body: { name: 'Morning Yoga', schedule: 'Mon/Wed' },
    };
    const res = createMockRes();

    await createCourse(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.message, 'Database connection failed');
  });
});

describe('Get Courses Function Test', () => {
  // Restore stubs after each test to prevent state leakage between test cases
  afterEach(() => sinon.restore());

  it('TC-052: Should return all courses successfully', async () => {
    const courses = [{ id: 'c001', name: 'Morning Yoga', schedule: 'Mon/Wed' }];
    sinon.stub(Course, 'find').returns({ sort: sinon.stub().resolves(courses) });

    const req = {};
    const res = createMockRes();

    await getCourses(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.strictEqual(res.body[0].name, 'Morning Yoga');
  });

  it('TC-053: Should return 500 if a database error occurs', async () => {
    sinon.stub(Course, 'find').throws(new Error('Database connection failed'));

    const req = {};
    const res = createMockRes();

    await getCourses(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.message, 'Database connection failed');
  });
});
