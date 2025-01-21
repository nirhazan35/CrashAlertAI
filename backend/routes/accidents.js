const express = require('express');
const { hash } = require("bcryptjs");
const User = require('../models/Accident');
const { get } = require('mongoose');
const { verifyToken, hasPermission} = require('../middleware/auth');
const { saveNewAccidents, getActiveAccidents} = require('../controllers/accidents')

const router = express.Router();

router.get("/active-accidents" , saveNewAccidents);
router.post("/handle-accident", verifyToken, getActiveAccidents);



module.exports = router;



