const express = require('express');
const { verifyToken, hasPermission} = require('../middleware/auth');
const { getCameras, assignCameras } = require('../controllers/cameras')

const router = express.Router();

router.get("/get-cameras" , verifyToken, hasPermission("admin"), getCameras);
router.post("/assign-cameras" , verifyToken, hasPermission("admin"), assignCameras);


module.exports = router;
