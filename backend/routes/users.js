const express = require('express');
const { hash } = require("bcryptjs");
const User = require('../models/User');
const { get } = require('mongoose');
const { verifyToken, hasPermission} = require('../middleware/auth');
const { getRole, deleteUser, changePassword, requestPasswordChange, notifyPasswordChange, getAllUsers, getAssignedCameras } = require('../controllers/users');

const router = express.Router();

router.get("/get-role" ,verifyToken ,getRole);
router.get("/get-all-users", verifyToken, hasPermission("admin"), getAllUsers);
router.get("/get-assigned-cameras", verifyToken, hasPermission("admin"), getAssignedCameras);
router.post("/request-password-change", requestPasswordChange);
router.post("/change-password", verifyToken, hasPermission("admin"), changePassword);
router.post("/notify-password-change", verifyToken, hasPermission("admin"), notifyPasswordChange);
router.delete("/:id", verifyToken, hasPermission("admin"), deleteUser);


module.exports = router;


