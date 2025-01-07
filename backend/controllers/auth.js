const express = require('express');
const router = express.Router();
const { hash } = require("bcryptjs");
const User = require('../models/User');


// @route   POST /api/users
// @desc    Register a new user
router.post('/', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const newUser = new User({
      username,
      email,
      password,
      role,
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// @route   GET /api/users
// @desc    Login a user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login user' });
  }
});

// @route   GET /api/users
// @desc    Fetch all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
