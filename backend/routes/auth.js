const express = require('express');
const { register, login, logout, refreshToken, resetPassword } = require ("../controllers/auth.js");
const { verifyToken, hasPermission } = require("../middleware/auth");



const router = express.Router();


router.get("/authMe", refreshToken);
router.post("/register", verifyToken, hasPermission("admin"), register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/reset-password", verifyToken, hasPermission("admin"), resetPassword);

module.exports = router;
