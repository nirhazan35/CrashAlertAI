const express = require('express');
const { hash } = require("bcryptjs");
const User = require('../models/Accident');
const { get } = require('mongoose');
const { verifyToken, hasPermission} = require('../middleware/auth');
const { saveNewAccident, getActiveAccidents} = require('../controllers/accidents')

const router = express.Router();

router.get("/active-accidents" , getActiveAccidents );
router.post("/handle-accident", verifyToken, saveNewAccident);



module.exports = router;



