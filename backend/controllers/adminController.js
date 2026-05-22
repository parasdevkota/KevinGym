const User = require('../models/User');
const gymEvents = require('../events/gymEvents');
const ROLES = require('../constants/roles');

const getUsers = async (req, res) => {
  try {
    const { role, id } = req.query;
    if (id) {
      const user = await User.findById(id).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(user);
    }
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  const { firstName, lastName, email, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const name = `${firstName} ${lastName}`.trim();
    const user = await User.create({ name, email, password: 'qwertyui', role: role || ROLES.MEMBER });
    gymEvents.emit('userCreated', { name: user.name, email: user.email, role: user.role });
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, role } = req.body;
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    const updated = await user.save();
    gymEvents.emit('userUpdated', { name: updated.name, email: updated.email });
    res.json({ id: updated.id, name: updated.name, email: updated.email, role: updated.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    gymEvents.emit('userDeleted', { id: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const patchUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, role } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    const updated = await user.save();
    gymEvents.emit('userUpdated', { name: updated.name, email: updated.email });
    res.json({ id: updated.id, name: updated.name, email: updated.email, role: updated.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, createUser, updateUser, patchUser, deleteUser };
