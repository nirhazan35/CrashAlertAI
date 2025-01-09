const express = require('express');
const router = express.Router();
const Accident = require('../models/Accident');


// @route   POST /api/accidents
// @desc    Create a new accident log
router.post('/', async (req, res) => {
  try {
    const { cameraId, location, severity, description, imageUrl } = req.body;

    const newAccident = new Accident({
      cameraId,
      location,
      severity,
      description,
      imageUrl,
    });

    const savedAccident = await newAccident.save();
    res.status(201).json(savedAccident);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save accident data' });
  }
});

// @route   GET /api/accidents
// @desc    Fetch all accident logs
router.get('/', async (req, res) => {
  try {
    const accidents = await Accident.find();
    res.status(200).json(accidents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accident data' });
  }
});

module.exports = router;
