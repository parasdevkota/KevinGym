'use strict';

const assert = require('assert');
const sinon = require('sinon');

const User = require('../models/User');
const gymEvents = require('../events/gymEvents');
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/adminController');

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

describe('Get Users Function Test', () => {
  // Restore stubs after each test to prevent state leakage between test cases
  afterEach(() => sinon.restore());

  it('TC-020: Should return all users successfully', async () => {
    // Simulate user list query with password field excluded
    const users = [{ id: 'u1', name: 'Admin', email: 'admin@gym.com', role: 'admin' }];
    sinon.stub(User, 'find').returns({ select: sinon.stub().resolves(users) });

    const req = {};
    const res = createMockRes();

    await getUsers(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.strictEqual(res.body.length, 1);
  });

  it('TC-021: Should return 500 if a database error occurs', async () => {
    sinon.stub(User, 'find').throws(new Error('Database connection failed'));

    const req = {};
    const res = createMockRes();

    await getUsers(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.message, 'Database connection failed');
  });
});

describe('Create User Function Test', () => {
  // Restore stubs after each test to prevent state leakage between test cases
  afterEach(() => sinon.restore());

  it('TC-022: Should create a user successfully', async () => {
    // Simulate no existing user and successful user creation
    sinon.stub(User, 'findOne').resolves(null);
    sinon.stub(User, 'create').resolves({
      id: 'u002',
      name: 'Jane Smith',
      email: 'jane@test.com',
      role: 'member',
    });
    sinon.stub(gymEvents, 'emit'); // Isolate controller response from event side effects

    const req = {
      body: { firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com', role: 'member' },
    };
    const res = createMockRes();

    await createUser(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.email, 'jane@test.com');
  });

  it('TC-023: Should return 400 if user already exists', async () => {
    // Simulate duplicate email found in database
    sinon.stub(User, 'findOne').resolves({ email: 'jane@test.com' });
    const createStub = sinon.stub(User, 'create');

    const req = {
      body: { firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com', role: 'member' },
    };
    const res = createMockRes();

    await createUser(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.message, 'User already exists');
    sinon.assert.notCalled(createStub); // Assert create is not invoked when email already exists
  });

  it('TC-024: Should return 500 if a database error occurs', async () => {
    sinon.stub(User, 'findOne').rejects(new Error('Database connection failed'));

    const req = {
      body: { firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com', role: 'member' },
    };
    const res = createMockRes();

    await createUser(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.message, 'Database connection failed');
  });
});

describe('Update User Function Test', () => {
  // Restore stubs after each test to prevent state leakage between test cases
  afterEach(() => sinon.restore());

  it('TC-025: Should update a user successfully', async () => {
    // Simulate user found with successful document save
    const updated = { id: 'u002', name: 'New Name', email: 'jane@test.com', role: 'member' };
    const user = {
      id: 'u002',
      name: 'Old Name',
      email: 'jane@test.com',
      role: 'member',
      save: sinon.stub().resolves(updated),
    };
    sinon.stub(User, 'findById').resolves(user);
    sinon.stub(gymEvents, 'emit'); // Isolate controller response from event side effects

    const req = { params: { id: 'u002' }, body: { name: 'New Name' } };
    const res = createMockRes();

    await updateUser(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.name, 'New Name');
  });

  it('TC-026: Should return 404 if user is not found', async () => {
    sinon.stub(User, 'findById').resolves(null);

    const req = { params: { id: 'missing' }, body: { name: 'New Name' } };
    const res = createMockRes();

    await updateUser(req, res);

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, 'User not found');
  });

  it('TC-027: Should return 500 if a database error occurs', async () => {
    sinon.stub(User, 'findById').rejects(new Error('Database connection failed'));

    const req = { params: { id: 'u002' }, body: { name: 'New Name' } };
    const res = createMockRes();

    await updateUser(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.message, 'Database connection failed');
  });
});

describe('Delete User Function Test', () => {
  // Restore stubs after each test to prevent state leakage between test cases
  afterEach(() => sinon.restore());

  it('TC-028: Should delete a user successfully', async () => {
    sinon.stub(User, 'findByIdAndDelete').resolves({ id: 'u002' });
    sinon.stub(gymEvents, 'emit'); // Isolate controller response from event side effects

    const req = { params: { id: 'u002' } };
    const res = createMockRes();

    await deleteUser(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, 'User deleted');
  });

  it('TC-029: Should return 404 if user is not found', async () => {
    // Simulate no user record deleted for provided id
    sinon.stub(User, 'findByIdAndDelete').resolves(null);

    const req = { params: { id: 'missing' } };
    const res = createMockRes();

    await deleteUser(req, res);

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, 'User not found');
  });

  it('TC-030: Should return 500 if a database error occurs', async () => {
    sinon.stub(User, 'findByIdAndDelete').rejects(new Error('Database connection failed'));

    const req = { params: { id: 'u002' } };
    const res = createMockRes();

    await deleteUser(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.body.message, 'Database connection failed');
  });
});
