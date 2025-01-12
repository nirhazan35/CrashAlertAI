const express = require('express');
const { hash } = require("bcryptjs");
const User = require('../models/User');
const { get } = require('mongoose');
const { verifyToken } = require('../middleware/auth');
const { getRole } = require('../controllers/users');

const router = express.Router();

router.get("/get-role" ,verifyToken ,getRole);

module.exports = router;