
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const gymEvents = require('../events/gymEvents');
const ROLES = require('../constants/roles');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;
    const name = `${firstName} ${lastName}`.trim();
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const assignedRole = role === ROLES.VENDOR ? ROLES.VENDOR : ROLES.MEMBER;
        const user = await User.create({ name, email, password, role: assignedRole });
        gymEvents.emit('userRegistered', { name: user.name, email: user.email, role: user.role });
        res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user.id) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({ id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user.id) });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({
        name: user.name,
        email: user.email,
        role: user.role,
        university: user.university,
        address: user.address,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, email, university, address, password } = req.body;
        user.name = name || user.name;
        user.email = email || user.email;
        user.university = university || user.university;
        user.address = address || user.address;
        if (password) user.password = password;

        const updatedUser = await user.save();
        gymEvents.emit('userUpdated', { name: updatedUser.name, email: updatedUser.email });
        res.json({ id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role, university: updatedUser.university, address: updatedUser.address, token: generateToken(updatedUser.id) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.deleteOne();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const patchUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, email, university, address, password } = req.body;
        if (name) user.name = name;
        if (email) user.email = email;
        if (university) user.university = university;
        if (address) user.address = address;
        if (password) user.password = password;

        const updatedUser = await user.save();
        res.json({ id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role, university: updatedUser.university, address: updatedUser.address });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, updateUserProfile, getProfile, patchUserProfile, deleteUser };
