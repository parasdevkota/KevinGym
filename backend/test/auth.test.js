'use strict';

const assert = require('assert');
const sinon = require('sinon');
const bcrypt = require('bcrypt');

// Set JWT secret required for token generation in the controller
process.env.JWT_SECRET = 'test_secret';

const User = require('../models/User');
const gymEvents = require('../events/gymEvents');
const { registerUser, loginUser } = require('../controllers/authController');

// Simulate Express response object to capture status code and response body
function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
  };
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

describe('Register Function Test', () => {
  // Restore stubs after each test to prevent state leakage between test cases
  afterEach(() => sinon.restore());

  it('TC-001: Should register a new user successfully', async () => {
    // Simulate no existing user and successful user creation
    sinon.stub(User, 'findOne').resolves(null);
    sinon.stub(User, 'create').resolves({
      id: 'user001',
      name: 'Jane Doe',
      email: 'jane@test.com',
      role: 'member',
    });
    sinon.stub(gymEvents, 'emit'); // Isolate controller response from event side effects

    const req = {
      body: {
        name: 'Jane Doe',
        email: 'jane@test.com',
        password: 'Pass123!',
        role: 'member',
      },
    };
    const res = createMockRes();

    await registerUser(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.ok(res.status.calledWith(201));
    assert.ok(res.body.token);
    assert.strictEqual(res.body.email, 'jane@test.com');
    assert.strictEqual(res.body.role, 'member');
    sinon.assert.calledOnce(User.findOne);
    sinon.assert.calledOnce(User.create);
  });

  it('TC-002: Should return 400 if user already exists', async () => {
    // Simulate duplicate email found in database
    sinon.stub(User, 'findOne').resolves({
      id: 'existing',
      email: 'jane@test.com',
    });
    const createStub = sinon.stub(User, 'create');

    const req = {
      body: {
        name: 'Jane Doe',
        email: 'jane@test.com',
        password: 'Pass123!',
      },
    };
    const res = createMockRes();

    await registerUser(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.status.calledWith(400));
    assert.strictEqual(res.body.message, 'User already exists');
    sinon.assert.notCalled(createStub); // Assert create is not invoked when email already exists
  });

  it('TC-003: Should return 500 if a database error occurs', async () => {
    // Simulate database error during email lookup
    sinon.stub(User, 'findOne').rejects(new Error('Database connection failed'));

    const req = {
      body: {
        name: 'Jane Doe',
        email: 'jane@test.com',
        password: 'Pass123!',
      },
    };
    const res = createMockRes();

    await registerUser(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.ok(res.status.calledWith(500));
    assert.strictEqual(res.body.message, 'Database connection failed');
  });
});

describe('Login Function Test', () => {
  // Restore stubs after each test to prevent state leakage between test cases
  afterEach(() => sinon.restore());

  it('TC-004: Should login successfully and return a token', async () => {
    // Simulate valid user credentials with matching password hash
    sinon.stub(User, 'findOne').resolves({
      id: 'user001',
      name: 'Jane Doe',
      email: 'jane@test.com',
      role: 'member',
      password: 'hashed_password',
    });
    sinon.stub(bcrypt, 'compare').resolves(true);

    const req = {
      body: {
        email: 'jane@test.com',
        password: 'Pass123!',
      },
    };
    const res = createMockRes();

    await loginUser(req, res);

    // Assert default 200 status when controller calls res.json without explicit status
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.json.calledOnce);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.email, 'jane@test.com');
    sinon.assert.calledWith(bcrypt.compare, 'Pass123!', 'hashed_password');
  });

  it('TC-005: Should return 401 if user is not found', async () => {
    // Simulate no user record found for provided email
    sinon.stub(User, 'findOne').resolves(null);
    const compareStub = sinon.stub(bcrypt, 'compare');

    const req = {
      body: {
        email: 'missing@test.com',
        password: 'Pass123!',
      },
    };
    const res = createMockRes();

    await loginUser(req, res);

    assert.strictEqual(res.statusCode, 401);
    assert.ok(res.status.calledWith(401));
    assert.strictEqual(res.body.message, 'Invalid email or password');
    sinon.assert.notCalled(compareStub); // Assert password comparison is skipped when user is not found
  });

  it('TC-006: Should return 401 if password is incorrect', async () => {
    // Simulate valid user with non-matching password
    sinon.stub(User, 'findOne').resolves({
      id: 'user001',
      email: 'jane@test.com',
      password: 'hashed_password',
    });
    sinon.stub(bcrypt, 'compare').resolves(false);

    const req = {
      body: {
        email: 'jane@test.com',
        password: 'WrongPass!',
      },
    };
    const res = createMockRes();

    await loginUser(req, res);

    assert.strictEqual(res.statusCode, 401);
    assert.ok(res.status.calledWith(401));
    assert.strictEqual(res.body.message, 'Invalid email or password');
  });

  it('TC-007: Should return 500 if a database error occurs', async () => {
    // Simulate database error during user lookup
    sinon.stub(User, 'findOne').rejects(new Error('Database connection failed'));

    const req = {
      body: {
        email: 'jane@test.com',
        password: 'Pass123!',
      },
    };
    const res = createMockRes();

    await loginUser(req, res);

    assert.strictEqual(res.statusCode, 500);
    assert.ok(res.status.calledWith(500));
    assert.strictEqual(res.body.message, 'Database connection failed');
  });
});
