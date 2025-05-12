const express = require('express');
const { verifyToken, hasPermission} = require('../middleware/auth');
const { getCameras, getLocations, assignCameras, addNewCamera } = require('../controllers/cameras')

const router = express.Router();

router.get("/get-cameras" , verifyToken, getCameras);
router.get("/get-id_location", verifyToken, getLocations);
router.post("/assign-cameras" , verifyToken, hasPermission("admin"), assignCameras);
router.post("/add-new-camera", verifyToken, hasPermission("admin"), addNewCamera);



module.exports = router;
