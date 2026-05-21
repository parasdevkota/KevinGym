'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const app = require('../server');
const User = require('../models/User');
const GymClass = require('../models/GymClass');
const Booking = require('../models/Booking');
const { findByIdResult } = require('./testSetup');

chai.use(chaiHttp);
const expect = chai.expect;

const memberUser = { _id: 'member001', id: 'member001', name: 'Member One', email: 'member@gym.com', role: 'member' };
const token = jwt.sign({ id: memberUser.id }, process.env.JWT_SECRET);

const gymClassData = {
  _id: 'gc001', classId: 'YOGA-01', name: 'Morning Yoga',
  classroom: 'Room A', scheduledAt: new Date('2026-06-01T10:00:00Z'),
  capacity: 20, enrolled: 5,
};

describe('Class Booking API', () => {
  afterEach(() => sinon.restore());

  // ── Browse Available Classes ─────────────────────────────────────────────

  it('TC19 - Get Classes: should return available classes with status 200', async () => {
    sinon.stub(User, 'findById').callsFake(() => findByIdResult(memberUser));
    sinon.stub(Booking, 'find').returns({ distinct: sinon.stub().resolves([]) });
    sinon.stub(GymClass, 'find').returns({ sort: sinon.stub().resolves([gymClassData]) });

    const res = await chai.request(app)
      .get('/api/classes')
      .set('Authorization', `Bearer ${token}`);

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
    expect(res.body[0].classId).to.equal('YOGA-01');
  });

  it('TC20 - Get Classes: should return 401 if no token provided', async () => {
    const res = await chai.request(app).get('/api/classes');
    expect(res).to.have.status(401);
  });

  // ── Book a Class ─────────────────────────────────────────────────────────

  it('TC21 - Create Booking: should book a class and return 201', async () => {
    const gymClass = { ...gymClassData, save: sinon.stub().resolves() };
    const booking = {
      _id: 'b001',
      populate: sinon.stub().callsFake(async function () { this.gymClass = gymClassData; return this; }),
    };
    sinon.stub(User, 'findById').callsFake(() => findByIdResult(memberUser));
    sinon.stub(GymClass, 'findById').resolves(gymClass);
    sinon.stub(Booking, 'findOne').resolves(null);
    sinon.stub(Booking, 'create').resolves(booking);

    const res = await chai.request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ gymClassId: 'gc001' });

    expect(res).to.have.status(201);
    expect(res.body.classId).to.equal('YOGA-01');
    expect(res.body.name).to.equal('Morning Yoga');
  });

  it('TC22 - Create Booking: should return 404 if class does not exist', async () => {
    sinon.stub(User, 'findById').callsFake(() => findByIdResult(memberUser));
    sinon.stub(GymClass, 'findById').resolves(null);

    const res = await chai.request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ gymClassId: 'missing' });

    expect(res).to.have.status(404);
    expect(res.body.message).to.equal('Class not found');
  });

  it('TC23 - Create Booking: should return 400 if class is full', async () => {
    sinon.stub(User, 'findById').callsFake(() => findByIdResult(memberUser));
    sinon.stub(GymClass, 'findById').resolves({ ...gymClassData, enrolled: 20, capacity: 20 });

    const res = await chai.request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ gymClassId: 'gc001' });

    expect(res).to.have.status(400);
    expect(res.body.message).to.equal('Class is full');
  });

  it('TC24 - Create Booking: should return 400 if member already booked this class', async () => {
    sinon.stub(User, 'findById').callsFake(() => findByIdResult(memberUser));
    sinon.stub(GymClass, 'findById').resolves(gymClassData);
    sinon.stub(Booking, 'findOne').resolves({ _id: 'existing' });

    const res = await chai.request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ gymClassId: 'gc001' });

    expect(res).to.have.status(400);
    expect(res.body.message).to.equal('Already booked this class');
  });

  // ── View My Bookings ─────────────────────────────────────────────────────

  it('TC25 - Get My Bookings: should return member bookings with status 200', async () => {
    sinon.stub(User, 'findById').callsFake(() => findByIdResult(memberUser));
    sinon.stub(Booking, 'find').returns({
      populate: sinon.stub().returns({
        sort: sinon.stub().resolves([{ _id: 'b001', gymClass: gymClassData }]),
      }),
    });

    const res = await chai.request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${token}`);

    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
    expect(res.body[0].classId).to.equal('YOGA-01');
  });

  // ── Cancel a Booking ─────────────────────────────────────────────────────

  it('TC26 - Cancel Booking: should cancel booking and return 200', async () => {
    const booking = { _id: 'b001', gymClass: 'gc001', status: 'active', save: sinon.stub().resolves() };
    sinon.stub(User, 'findById').callsFake(() => findByIdResult(memberUser));
    sinon.stub(Booking, 'findOne').resolves(booking);
    sinon.stub(GymClass, 'findByIdAndUpdate').resolves();

    const res = await chai.request(app)
      .delete('/api/bookings/b001')
      .set('Authorization', `Bearer ${token}`);

    expect(res).to.have.status(200);
    expect(res.body.message).to.equal('Booking cancelled');
  });

  it('TC27 - Cancel Booking: should return 404 if booking not found', async () => {
    sinon.stub(User, 'findById').callsFake(() => findByIdResult(memberUser));
    sinon.stub(Booking, 'findOne').resolves(null);

    const res = await chai.request(app)
      .delete('/api/bookings/missing')
      .set('Authorization', `Bearer ${token}`);

    expect(res).to.have.status(404);
    expect(res.body.message).to.equal('Booking not found');
  });

  it('TC28 - Cancel Booking: should return 400 if booking already cancelled', async () => {
    sinon.stub(User, 'findById').callsFake(() => findByIdResult(memberUser));
    sinon.stub(Booking, 'findOne').resolves({ _id: 'b001', status: 'cancelled' });

    const res = await chai.request(app)
      .delete('/api/bookings/b001')
      .set('Authorization', `Bearer ${token}`);

    expect(res).to.have.status(400);
    expect(res.body.message).to.equal('Booking already cancelled');
  });

  // ── Reschedule a Booking ─────────────────────────────────────────────────

  it('TC29 - Reschedule Booking: should reschedule to a new class and return 200', async () => {
    const newClass = {
      _id: 'gc002', classId: 'YOGA-02', name: 'Evening Yoga',
      classroom: 'Room B', scheduledAt: new Date('2026-06-02T18:00:00Z'),
      capacity: 20, enrolled: 3, save: sinon.stub().resolves(),
    };
    const booking = {
      _id: 'b001', gymClass: 'gc001', save: sinon.stub().resolves(),
      populate: sinon.stub().callsFake(async function () { this.gymClass = newClass; return this; }),
    };
    sinon.stub(User, 'findById').callsFake(() => findByIdResult(memberUser));
    sinon.stub(Booking, 'findOne').onFirstCall().resolves(booking).onSecondCall().resolves(null);
    sinon.stub(GymClass, 'findById').resolves(newClass);
    sinon.stub(GymClass, 'findByIdAndUpdate').resolves();

    const res = await chai.request(app)
      .put('/api/bookings/b001')
      .set('Authorization', `Bearer ${token}`)
      .send({ newGymClassId: 'gc002' });

    expect(res).to.have.status(200);
    expect(res.body.classId).to.equal('YOGA-02');
    expect(res.body.name).to.equal('Evening Yoga');
  });

  it('TC30 - Reschedule Booking: should return 404 if booking not found', async () => {
    sinon.stub(User, 'findById').callsFake(() => findByIdResult(memberUser));
    sinon.stub(Booking, 'findOne').resolves(null);

    const res = await chai.request(app)
      .put('/api/bookings/missing')
      .set('Authorization', `Bearer ${token}`)
      .send({ newGymClassId: 'gc002' });

    expect(res).to.have.status(404);
    expect(res.body.message).to.equal('Booking not found');
  });

  it('TC31 - Reschedule Booking: should return 404 if new class not found', async () => {
    sinon.stub(User, 'findById').callsFake(() => findByIdResult(memberUser));
    sinon.stub(Booking, 'findOne').resolves({ _id: 'b001', gymClass: 'gc001' });
    sinon.stub(GymClass, 'findById').resolves(null);

    const res = await chai.request(app)
      .put('/api/bookings/b001')
      .set('Authorization', `Bearer ${token}`)
      .send({ newGymClassId: 'missing' });

    expect(res).to.have.status(404);
    expect(res.body.message).to.equal('New class not found');
  });

  it('TC32 - Reschedule Booking: should return 400 if new class is full', async () => {
    sinon.stub(User, 'findById').callsFake(() => findByIdResult(memberUser));
    sinon.stub(Booking, 'findOne').resolves({ _id: 'b001', gymClass: 'gc001' });
    sinon.stub(GymClass, 'findById').resolves({ ...gymClassData, _id: 'gc002', enrolled: 20, capacity: 20 });

    const res = await chai.request(app)
      .put('/api/bookings/b001')
      .set('Authorization', `Bearer ${token}`)
      .send({ newGymClassId: 'gc002' });

    expect(res).to.have.status(400);
    expect(res.body.message).to.equal('New class is full');
  });

  it('TC33 - Reschedule Booking: should return 400 if already booked on new class', async () => {
    sinon.stub(User, 'findById').callsFake(() => findByIdResult(memberUser));
    sinon.stub(Booking, 'findOne')
      .onFirstCall().resolves({ _id: 'b001', gymClass: 'gc001' })
      .onSecondCall().resolves({ _id: 'existing' });
    sinon.stub(GymClass, 'findById').resolves({ ...gymClassData, _id: 'gc002', enrolled: 3 });

    const res = await chai.request(app)
      .put('/api/bookings/b001')
      .set('Authorization', `Bearer ${token}`)
      .send({ newGymClassId: 'gc002' });

    expect(res).to.have.status(400);
    expect(res.body.message).to.equal('Already booked this class');
  });
});
