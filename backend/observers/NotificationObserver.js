const gymEvents = require('../events/gymEvents');
const Notification = require('../models/Notification');

class NotificationObserver {
  constructor() {
    gymEvents.on('userRegistered', ({ name, role }) =>
      Notification.create({ message: `New ${role} sign-up: ${name}`, target: 'all' })
    );
    gymEvents.on('userCreated', ({ name, role }) =>
      Notification.create({ message: `Admin created user: ${name} as ${role}`, target: 'all' })
    );
    gymEvents.on('userUpdated', ({ name }) =>
      Notification.create({ message: `User profile updated: ${name}`, target: 'all' })
    );
    gymEvents.on('userDeleted', ({ id }) =>
      Notification.create({ message: `User deleted: ${id}`, target: 'all' })
    );
    gymEvents.on('courseCreated', ({ name }) =>
      Notification.create({ message: `New course available: ${name}`, target: 'members' })
    );
  }
}

module.exports = NotificationObserver;
