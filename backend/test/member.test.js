'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const app = require('../server');
const User = require('../models/User');
const { findByIdResult } = require('./testSetup');

chai.use(chaiHttp);
const expect = chai.expect;

const memberUser = { id: 'member001', name: 'John Doe', email: 'john@test.com', role: 'member' };
const token = jwt.sign({ id: memberUser.id }, process.env.JWT_SECRET);

describe('Member Panel API', () => {
  afterEach(() => sinon.restore());

  // ── View Profile (Read) ──────────────────────────────────────────────────────

  it('TC11 - View Profile: should return member profile with status 200', async () => {
    const findByIdStub = sinon.stub(User, 'findById');
    findByIdStub.onFirstCall().callsFake(() => findByIdResult(memberUser));
    findByIdStub.onSecondCall().resolves(memberUser);

    const res = await chai.request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res).to.have.status(200);
    expect(res.body.name).to.equal('John Doe');
    expect(res.body.email).to.equal('john@test.com');
  });

  it('TC12 - View Profile: should return 401 if no token provided', async () => {
    const res = await chai.request(app)
      .get('/api/auth/profile');

    expect(res).to.have.status(401);
  });

  // ── Update Profile (Update) ──────────────────────────────────────────────────

  it('TC13 - Update Profile: should update member name and return 200', async () => {
    const updatedUser = { id: 'member001', name: 'John Updated', email: 'john@test.com', role: 'member' };
    const userWithSave = {
      ...memberUser,
      save: sinon.stub().resolves(updatedUser),
    };

    const findByIdStub = sinon.stub(User, 'findById');
    findByIdStub.onFirstCall().callsFake(() => findByIdResult(memberUser));
    findByIdStub.onSecondCall().resolves(userWithSave);

    const res = await chai.request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'John Updated', email: 'john@test.com' });

    expect(res).to.have.status(200);
    expect(res.body.name).to.equal('John Updated');
  });

  it('TC14 - Update Profile: should return 404 if member account not found', async () => {
    const findByIdStub = sinon.stub(User, 'findById');
    findByIdStub.onFirstCall().callsFake(() => findByIdResult(memberUser));
    findByIdStub.onSecondCall().resolves(null);

    const res = await chai.request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'John Updated', email: 'john@test.com' });

    expect(res).to.have.status(404);
    expect(res.body.message).to.equal('User not found');
  });
});
