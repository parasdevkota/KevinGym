'use strict';

const assert = require('assert');
const sinon = require('sinon');

const Notification = require('../models/Notification');
const {
  getNotifications,
  createNotification,
  deleteNotification,
} = require('../controllers/notificationController');

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

describe('Get Notifications Function Test', () => {
  // Restore stubs after each test to prevent state leakage between test cases
  afterEach(() => sinon.restore());

  it('TC-054: Should return notifications successfully', async () => {
    const notifications = [{
      id: 'n001',
      message: 'Gym closed tomorrow',
      target: 'all',
      source: 'admin',
    }];
    sinon.stub(Notification, 'find').returns({
      sort: sinon.stub().resolves(notifications),
    });

    const req = { query: {} };
    const res = createMockRes();

    await getNotifications(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.strictEqual(res.body[0].message, 'Gym closed tomorrow');
    sinon.assert.calledWith(Notification.find, { source: 'admin' });
  });

  it('TC-055: Should return 500 if a database error occurs', async () => {
    sinon.stub(Notification, 'find').throws(new Error('Database connection failed'));

    const req = { query: {} };
    const res = createMockRes();

    await getNotifications(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.message, 'Database connection failed');
  });

  it('TC-060: Should return notifications filtered by target', async () => {
    // Simulate query filter by target audience including broadcast notifications
    const notifications = [{
      id: 'n002',
      message: 'Members only update',
      target: 'members',
      source: 'admin',
    }];
    sinon.stub(Notification, 'find').returns({
      sort: sinon.stub().resolves(notifications),
    });

    const req = { query: { target: 'members' } };
    const res = createMockRes();

    await getNotifications(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body[0].target, 'members');
    sinon.assert.calledWith(Notification.find, {
      source: 'admin',
      target: { $in: ['members', 'all'] },
    });
  });
});

describe('Create Notification Function Test', () => {
  // Restore stubs after each test to prevent state leakage between test cases
  afterEach(() => sinon.restore());

  it('TC-056: Should create a notification successfully', async () => {
    const notification = {
      id: 'n001',
      message: 'New class added',
      target: 'members',
      source: 'admin',
    };
    sinon.stub(Notification, 'create').resolves(notification);

    const req = { body: { message: 'New class added', target: 'members' } };
    const res = createMockRes();

    await createNotification(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.message, 'New class added');
  });

  it('TC-057: Should return 500 if a database error occurs', async () => {
    sinon.stub(Notification, 'create').rejects(new Error('Database connection failed'));

    const req = { body: { message: 'New class added', target: 'members' } };
    const res = createMockRes();

    await createNotification(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.message, 'Database connection failed');
  });
});

describe('Delete Notification Function Test', () => {
  // Restore stubs after each test to prevent state leakage between test cases
  afterEach(() => sinon.restore());

  it('TC-058: Should delete a notification successfully', async () => {
    sinon.stub(Notification, 'findByIdAndDelete').resolves({ id: 'n001' });

    const req = { params: { id: 'n001' } };
    const res = createMockRes();

    await deleteNotification(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, 'Notification deleted');
  });

  it('TC-059: Should return 500 if a database error occurs', async () => {
    sinon.stub(Notification, 'findByIdAndDelete').rejects(new Error('Database connection failed'));

    const req = { params: { id: 'n001' } };
    const res = createMockRes();

    await deleteNotification(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.message, 'Database connection failed');
  });
});
