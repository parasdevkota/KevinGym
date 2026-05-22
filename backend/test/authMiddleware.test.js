'use strict';

const assert = require('assert');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const AuthStrategyContext = require('../strategies/AuthStrategyContext');
const JWTStrategy = require('../strategies/JWTStrategy');
AuthStrategyContext.use(new JWTStrategy());

const { protect, requireAdmin, requireVendor } = require('../middleware/authMiddleware');
const User = require('../models/User');

function createMockRes() {
  const res = { statusCode: 200, body: null };
  res.status = sinon.stub().callsFake((code) => { res.statusCode = code; return res; });
  res.json = sinon.stub().callsFake((body) => { res.body = body; return res; });
  return res;
}

describe('Auth Middleware Test', () => {
  afterEach(() => sinon.restore());

  it('TC-061: Should return 401 if no Authorization header is provided', async () => {
    const req = { headers: {} };
    const res = createMockRes();
    const next = sinon.stub();

    await protect(req, res, next);

    assert.strictEqual(res.statusCode, 401);
    sinon.assert.notCalled(next);
  });

  it('TC-062: Should return 401 if Authorization header is missing Bearer prefix', async () => {
    const req = { headers: { authorization: 'Basic sometoken' } };
    const res = createMockRes();
    const next = sinon.stub();

    await protect(req, res, next);

    assert.strictEqual(res.statusCode, 401);
    sinon.assert.notCalled(next);
  });

  it('TC-063: Should return 401 if token has expired', async () => {
    const expiredToken = jwt.sign({ id: 'user001' }, 'test_secret', { expiresIn: '-1s' });
    const req = { headers: { authorization: `Bearer ${expiredToken}` } };
    const res = createMockRes();
    const next = sinon.stub();

    await protect(req, res, next);

    assert.strictEqual(res.statusCode, 401);
    sinon.assert.notCalled(next);
  });

  it('TC-064: Should return 401 if token signature is invalid', async () => {
    const badToken = jwt.sign({ id: 'user001' }, 'wrong_secret');
    const req = { headers: { authorization: `Bearer ${badToken}` } };
    const res = createMockRes();
    const next = sinon.stub();

    await protect(req, res, next);

    assert.strictEqual(res.statusCode, 401);
    sinon.assert.notCalled(next);
  });

  it('TC-065: Should return 401 if token is valid but user no longer exists in DB', async () => {
    const token = jwt.sign({ id: 'deleted_user' }, 'test_secret');
    sinon.stub(User, 'findById').returns({ select: sinon.stub().resolves(null) });

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createMockRes();
    const next = sinon.stub();

    await protect(req, res, next);

    assert.strictEqual(res.statusCode, 401);
    sinon.assert.notCalled(next);
  });

  it('TC-066: Should call next() and attach user to req when token is valid', async () => {
    const user = { id: 'user001', name: 'Jane Doe', email: 'jane@test.com', role: 'member' };
    const token = jwt.sign({ id: user.id }, 'test_secret');
    sinon.stub(User, 'findById').returns({ select: sinon.stub().resolves(user) });

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createMockRes();
    const next = sinon.stub();

    await protect(req, res, next);

    sinon.assert.calledOnce(next);
    assert.strictEqual(req.user, user);
  });
});

describe('requireAdmin Middleware Test', () => {
  it('TC-067: Should call next() if user role is admin', () => {
    const req = { user: { role: 'admin' } };
    const res = createMockRes();
    const next = sinon.stub();

    requireAdmin(req, res, next);

    sinon.assert.calledOnce(next);
    assert.strictEqual(res.statusCode, 200);
  });

  it('TC-068: Should return 403 if user role is member', () => {
    const req = { user: { role: 'member' } };
    const res = createMockRes();
    const next = sinon.stub();

    requireAdmin(req, res, next);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.message, 'Admin access required');
    sinon.assert.notCalled(next);
  });

  it('TC-069: Should return 403 if user role is vendor', () => {
    const req = { user: { role: 'vendor' } };
    const res = createMockRes();
    const next = sinon.stub();

    requireAdmin(req, res, next);

    assert.strictEqual(res.statusCode, 403);
    sinon.assert.notCalled(next);
  });
});

describe('requireVendor Middleware Test', () => {
  it('TC-070: Should call next() if user role is vendor', () => {
    const req = { user: { role: 'vendor' } };
    const res = createMockRes();
    const next = sinon.stub();

    requireVendor(req, res, next);

    sinon.assert.calledOnce(next);
    assert.strictEqual(res.statusCode, 200);
  });

  it('TC-071: Should return 403 if user role is member', () => {
    const req = { user: { role: 'member' } };
    const res = createMockRes();
    const next = sinon.stub();

    requireVendor(req, res, next);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.message, 'Vendor access required');
    sinon.assert.notCalled(next);
  });

  it('TC-072: Should return 403 if user role is admin', () => {
    const req = { user: { role: 'admin' } };
    const res = createMockRes();
    const next = sinon.stub();

    requireVendor(req, res, next);

    assert.strictEqual(res.statusCode, 403);
    sinon.assert.notCalled(next);
  });
});
