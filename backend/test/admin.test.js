'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const app = require('../server');
const User = require('../models/User');
const { createUser } = require('../controllers/adminController');
const { findByIdResult } = require('./testSetup');

chai.use(chaiHttp);
const expect = chai.expect;

const adminUser = { id: 'admin001', name: 'Admin', email: 'admin@gym.com', role: 'admin' };
const token = jwt.sign({ id: adminUser.id }, process.env.JWT_SECRET);

describe('Administrator Panel API', () => {
  afterEach(() => sinon.restore());

  // ── View Users ──────────────────────────────────────────────────────────────

  it('TC05 - Get Users: should return an array of users with status 200', async () => {
    sinon.stub(User, 'findById').callsFake(() => findByIdResult(adminUser));
    sinon.stub(User, 'find').returns({ select: sinon.stub().resolves([adminUser]) });

    const res = await chai.request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
  });

  // ── Create User ─────────────────────────────────────────────────────────────

  it('TC06 - Create User: should create a new user and return 201', async () => {
    sinon.stub(User, 'findById').callsFake(() => findByIdResult(adminUser));
    sinon.stub(User, 'findOne').resolves(null);
    sinon.stub(User, 'create').resolves({
      id: 'u002', name: 'Jane Smith', email: 'jane@test.com', role: 'member',
    });

    const res = await chai.request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com', role: 'member' });

    expect(res).to.have.status(201);
    expect(res.body.name).to.equal('Jane Smith');
    expect(res.body.email).to.equal('jane@test.com');
  });

  it('TC07 - Create User: should return 500 if a database error occurs', async () => {
    sinon.stub(User, 'findOne').throws(new Error('DB Error'));

    const req = {
      body: { firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com', role: 'member' },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await createUser(req, res);

    expect(res.status.calledWith(500)).to.be.true;
  });

  // ── Update User ─────────────────────────────────────────────────────────────

  it('TC08 - Update User: should update user details and return 200', async () => {
    const targetUser = {
      id: 'u002', name: 'Old Name', email: 'jane@test.com', role: 'member',
      save: sinon.stub().resolves({ id: 'u002', name: 'New Name', email: 'jane@test.com', role: 'member' }),
    };

    const findByIdStub = sinon.stub(User, 'findById');
    findByIdStub.onFirstCall().callsFake(() => findByIdResult(adminUser));
    findByIdStub.onSecondCall().resolves(targetUser);

    const res = await chai.request(app)
      .put('/api/admin/users/u002')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Name', email: 'jane@test.com', role: 'member' });

    expect(res).to.have.status(200);
    expect(res.body.name).to.equal('New Name');
  });

  // ── Delete User ─────────────────────────────────────────────────────────────

  it('TC09 - Delete User: should delete user and return success message', async () => {
    sinon.stub(User, 'findById').callsFake(() => findByIdResult(adminUser));
    sinon.stub(User, 'findByIdAndDelete').resolves({ id: 'u002' });

    const res = await chai.request(app)
      .delete('/api/admin/users/u002')
      .set('Authorization', `Bearer ${token}`);

    expect(res).to.have.status(200);
    expect(res.body.message).to.equal('User deleted');
  });
});
