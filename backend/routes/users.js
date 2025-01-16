const express = require('express');
const { hash } = require("bcryptjs");
const User = require('../models/User');
const { get } = require('mongoose');
const { verifyToken, hasPermission} = require('../middleware/auth');
const { getRole, deleteUser, changePassword, requestPasswordChange } = require('../controllers/users');

const router = express.Router();

router.get("/get-role" ,verifyToken ,getRole);
router.post("/request-password-change", verifyToken, requestPasswordChange);
router.post("/change-password", verifyToken, hasPermission("admin"), changePassword);
router.delete("/:id", verifyToken, hasPermission("admin"), deleteUser);


module.exports = router;


