const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   POST /api/users
// @desc    Create a new user
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
