'use strict';

const assert = require('assert');
const sinon = require('sinon');

const AuthStrategyContext = require('../strategies/AuthStrategyContext');
const ROLES = require('../constants/roles');
const {
  protect,
  requireRole,
  requireAdmin,
  requireVendor,
} = require('../middleware/authMiddleware');

// Simulate Express req, res, and next for middleware tests
function createMockReqResNext(reqOverrides = {}) {
  const req = { headers: { authorization: 'Bearer test-token' }, ...reqOverrides };
  const res = { statusCode: 200, body: null };
  res.status = sinon.stub().callsFake((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = sinon.stub().callsFake((body) => {
    res.body = body;
    return res;
  });
  const next = sinon.stub();
  return { req, res, next };
}

describe('Protect Middleware Test', () => {
  afterEach(() => sinon.restore());

  it('TC-061: Should set req.user and call next when token is valid', async () => {
    const user = { _id: 'user001', role: ROLES.MEMBER, email: 'member@test.com' };
    sinon.stub(AuthStrategyContext, 'verify').resolves(user);

    const { req, res, next } = createMockReqResNext();

    await protect(req, res, next);

    assert.deepStrictEqual(req.user, user);
    sinon.assert.calledOnce(next);
    sinon.assert.notCalled(res.status);
  });

  it('TC-062: Should return 401 when token verification fails', async () => {
    sinon.stub(AuthStrategyContext, 'verify').rejects(new Error('Invalid token'));

    const { req, res, next } = createMockReqResNext();

    await protect(req, res, next);

    assert.strictEqual(res.statusCode, 401);
    assert.ok(res.body.message.includes('Not authorized'));
    sinon.assert.notCalled(next);
  });
});

describe('Require Role Middleware Test', () => {
  afterEach(() => sinon.restore());

  it('TC-063: Should call next when user has the required role', () => {
    const requireMember = requireRole(ROLES.MEMBER);
    const { req, res, next } = createMockReqResNext({ user: { role: ROLES.MEMBER } });

    requireMember(req, res, next);

    sinon.assert.calledOnce(next);
    sinon.assert.notCalled(res.status);
  });

  it('TC-064: Should return 403 when user role does not match', () => {
    const requireMember = requireRole(ROLES.MEMBER);
    const { req, res, next } = createMockReqResNext({ user: { role: ROLES.ADMIN } });

    requireMember(req, res, next);

    assert.strictEqual(res.statusCode, 403);
    assert.ok(res.body.message.includes('access required'));
    sinon.assert.notCalled(next);
  });
});

describe('Require Admin Middleware Test', () => {
  afterEach(() => sinon.restore());

  it('TC-065: Should call next when user is an admin', () => {
    const { req, res, next } = createMockReqResNext({ user: { role: ROLES.ADMIN } });

    requireAdmin(req, res, next);

    sinon.assert.calledOnce(next);
    sinon.assert.notCalled(res.status);
  });

  it('TC-066: Should return 403 when user is not an admin', () => {
    const { req, res, next } = createMockReqResNext({ user: { role: ROLES.MEMBER } });

    requireAdmin(req, res, next);

    assert.strictEqual(res.statusCode, 403);
    assert.ok(res.body.message.includes('access required'));
    sinon.assert.notCalled(next);
  });
});

describe('Require Vendor Middleware Test', () => {
  afterEach(() => sinon.restore());

  it('TC-067: Should call next when user is a vendor', () => {
    const { req, res, next } = createMockReqResNext({ user: { role: ROLES.VENDOR } });

    requireVendor(req, res, next);

    sinon.assert.calledOnce(next);
    sinon.assert.notCalled(res.status);
  });

  it('TC-068: Should return 403 when user is not a vendor', () => {
    const { req, res, next } = createMockReqResNext({ user: { role: ROLES.MEMBER } });

    requireVendor(req, res, next);

    assert.strictEqual(res.statusCode, 403);
    assert.ok(res.body.message.includes('access required'));
    sinon.assert.notCalled(next);
  });
});
