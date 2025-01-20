const express = require('express');
const router = express.Router();
const { hash } = require("bcryptjs");
const User = require('../models/Accident');
const { get } = require('mongoose');
const { verifyToken, hasPermission} = require('../middleware/auth');
const { getRole, deleteUser, changePassword, requestPasswordChange } = require('../controllers/accidents');

const router = express.Router();

router.get("/get-accidents" ,verifyToken, getAccidents);
router.post("/handle-accident", verifyToken, hasPermission("admin"), changePassword);



module.exports = router;



