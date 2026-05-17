const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const { target } = req.query;
    const filter = { source: 'admin' };
    if (target) filter.target = { $in: [target, 'all'] };
    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createNotification = async (req, res) => {
  try {
    const { message, target } = req.body;
    const notification = await Notification.create({ message, target, source: 'admin' });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotifications, createNotification, deleteNotification };
