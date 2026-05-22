'use strict';

const assert = require('assert');
const sinon = require('sinon');

// Set JWT secret required for token generation on profile update
process.env.JWT_SECRET = 'test_secret';

const User = require('../models/User');
const gymEvents = require('../events/gymEvents');
const {
  getProfile,
  updateUserProfile,
  deleteUser,
  patchUserProfile,
} = require('../controllers/authController');

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

// Test fixture for member profile data used across profile tests
const memberUser = {
  id: 'user001',
  name: 'Jane Doe',
  email: 'jane@test.com',
  role: 'member',
  university: 'QUT',
  address: 'Brisbane',
};

describe('Get Profile Function Test', () => {
  // Restore stubs after each test to prevent state leakage between test cases
  afterEach(() => sinon.restore());

  it('TC-008: Should return profile successfully', async () => {
    // Simulate successful user lookup by authenticated id
    sinon.stub(User, 'findById').resolves(memberUser);

    const req = { user: { id: 'user001' } };
    const res = createMockRes();

    await getProfile(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.name, 'Jane Doe');
    assert.strictEqual(res.body.email, 'jane@test.com');
  });

  it('TC-009: Should return 404 if user is not found', async () => {
    // Simulate no user record found for authenticated id
    sinon.stub(User, 'findById').resolves(null);

    const req = { user: { id: 'missing' } };
    const res = createMockRes();

    await getProfile(req, res);

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, 'User not found');
  });

  it('TC-010: Should return 500 if a database error occurs', async () => {
    // Simulate database error during profile lookup
    sinon.stub(User, 'findById').rejects(new Error('Database connection failed'));

    const req = { user: { id: 'user001' } };
    const res = createMockRes();

    await getProfile(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.message, 'Server error');
  });
});

describe('Update Profile Function Test', () => {
  // Restore stubs after each test to prevent state leakage between test cases
  afterEach(() => sinon.restore());

  it('TC-011: Should update profile successfully', async () => {
    // Simulate user found with successful document save
    const updatedUser = {
      ...memberUser,
      name: 'Jane Updated',
    };
    const user = {
      ...memberUser,
      save: sinon.stub().resolves(updatedUser),
    };
    sinon.stub(User, 'findById').resolves(user);
    sinon.stub(gymEvents, 'emit'); // Isolate controller response from event side effects

    const req = {
      user: { id: 'user001' },
      body: { name: 'Jane Updated', email: 'jane@test.com' },
    };
    const res = createMockRes();

    await updateUserProfile(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.name, 'Jane Updated');
    assert.ok(res.body.token);
  });

  it('TC-012: Should return 404 if user is not found', async () => {
    sinon.stub(User, 'findById').resolves(null);

    const req = {
      user: { id: 'missing' },
      body: { name: 'Jane Updated' },
    };
    const res = createMockRes();

    await updateUserProfile(req, res);

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, 'User not found');
  });

  it('TC-013: Should return 500 if a database error occurs', async () => {
    sinon.stub(User, 'findById').rejects(new Error('Database connection failed'));

    const req = {
      user: { id: 'user001' },
      body: { name: 'Jane Updated' },
    };
    const res = createMockRes();

    await updateUserProfile(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.message, 'Database connection failed');
  });
});

describe('Delete Profile Function Test', () => {
  // Restore stubs after each test to prevent state leakage between test cases
  afterEach(() => sinon.restore());

  it('TC-014: Should delete profile successfully', async () => {
    // Simulate user found with successful document deletion
    const user = { deleteOne: sinon.stub().resolves() };
    sinon.stub(User, 'findById').resolves(user);

    const req = { user: { id: 'user001' } };
    const res = createMockRes();

    await deleteUser(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, 'User deleted successfully');
    sinon.assert.calledOnce(user.deleteOne);
  });

  it('TC-015: Should return 404 if user is not found', async () => {
    sinon.stub(User, 'findById').resolves(null);

    const req = { user: { id: 'missing' } };
    const res = createMockRes();

    await deleteUser(req, res);

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, 'User not found');
  });

  it('TC-016: Should return 500 if a database error occurs', async () => {
    sinon.stub(User, 'findById').rejects(new Error('Database connection failed'));

    const req = { user: { id: 'user001' } };
    const res = createMockRes();

    await deleteUser(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.message, 'Database connection failed');
  });
});

describe('Patch Profile Function Test', () => {
  // Restore stubs after each test to prevent state leakage between test cases
  afterEach(() => sinon.restore());

  it('TC-017: Should patch profile successfully', async () => {
    // Simulate partial update of fields provided in request body
    const updatedUser = { ...memberUser, university: 'UQ' };
    const user = {
      ...memberUser,
      save: sinon.stub().resolves(updatedUser),
    };
    sinon.stub(User, 'findById').resolves(user);

    const req = {
      user: { id: 'user001' },
      body: { university: 'UQ' },
    };
    const res = createMockRes();

    await patchUserProfile(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.university, 'UQ');
  });

  it('TC-018: Should return 404 if user is not found', async () => {
    sinon.stub(User, 'findById').resolves(null);

    const req = {
      user: { id: 'missing' },
      body: { university: 'UQ' },
    };
    const res = createMockRes();

    await patchUserProfile(req, res);

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, 'User not found');
  });

  it('TC-019: Should return 500 if a database error occurs', async () => {
    sinon.stub(User, 'findById').rejects(new Error('Database connection failed'));

    const req = {
      user: { id: 'user001' },
      body: { university: 'UQ' },
    };
    const res = createMockRes();

    await patchUserProfile(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.message, 'Database connection failed');
  });
});
