const express = require('express');
const { register, login, logout, refreshToken, getAuthLogs } = require ("../controllers/auth.js");
const { verifyToken, hasPermission } = require("../middleware/auth");



const router = express.Router();


router.get("/authMe", refreshToken);
router.post("/register", verifyToken, hasPermission("admin"), register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/logs", verifyToken, hasPermission("admin"), getAuthLogs);

module.exports = router;
