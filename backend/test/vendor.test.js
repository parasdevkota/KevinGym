'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const app = require('../server');
const User = require('../models/User');
const Course = require('../models/Course');
const { findByIdResult } = require('./testSetup');

chai.use(chaiHttp);
const expect = chai.expect;

const vendorUser = { id: 'vendor001', name: 'Vendor One', email: 'vendor@gym.com', role: 'vendor' };
const memberUser = { id: 'member001', name: 'Member One', email: 'member@gym.com', role: 'member' };

const vendorToken = jwt.sign({ id: vendorUser.id }, process.env.JWT_SECRET);
const memberToken = jwt.sign({ id: memberUser.id }, process.env.JWT_SECRET);

describe('Vendor Panel API', () => {
  afterEach(() => sinon.restore());

  // ── Create Course ────────────────────────────────────────────────────────────

  it('TC15 - Create Course: vendor should create a course and return 201', async () => {
    sinon.stub(User, 'findById').callsFake(() => findByIdResult(vendorUser));
    sinon.stub(Course, 'create').resolves({
      id: 'c001', name: 'Morning Yoga', schedule: 'Mon/Wed', time: '09:00',
      description: 'Beginner friendly', studio: 'Studio A', vendorId: vendorUser.id,
    });

    const res = await chai.request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ name: 'Morning Yoga', schedule: 'Mon/Wed', time: '09:00', description: 'Beginner friendly', studio: 'Studio A' });

    expect(res).to.have.status(201);
    expect(res.body.name).to.equal('Morning Yoga');
  });

  it('TC16 - Create Course: member should be denied with 403', async () => {
    sinon.stub(User, 'findById').callsFake(() => findByIdResult(memberUser));

    const res = await chai.request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ name: 'Morning Yoga', schedule: 'Mon/Wed' });

    expect(res).to.have.status(403);
    expect(res.body.message).to.equal('Vendor access required');
  });

  it('TC17 - Create Course: should return 401 if no token provided', async () => {
    const res = await chai.request(app)
      .post('/api/courses')
      .send({ name: 'Morning Yoga', schedule: 'Mon/Wed' });

    expect(res).to.have.status(401);
  });

  // ── Get Courses ──────────────────────────────────────────────────────────────

  it('TC18 - Get Courses: vendor should retrieve all courses and return 200', async () => {
    sinon.stub(User, 'findById').callsFake(() => findByIdResult(vendorUser));
    sinon.stub(Course, 'find').returns({
      sort: sinon.stub().resolves([
        { id: 'c001', name: 'Morning Yoga', schedule: 'Mon/Wed' },
      ]),
    });

    const res = await chai.request(app)
      .get('/api/courses')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
  });
});
