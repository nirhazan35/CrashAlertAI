const express = require('express');
const { verifyToken, hasPermission} = require('../middleware/auth');
const { getCameras, getLocations, assignCameras } = require('../controllers/cameras')

const router = express.Router();

router.get("/get-cameras" , verifyToken, getCameras);
router.get("/get-id_location", verifyToken, getLocations);
router.post("/assign-cameras" , verifyToken, hasPermission("admin"), assignCameras);



module.exports = router;
