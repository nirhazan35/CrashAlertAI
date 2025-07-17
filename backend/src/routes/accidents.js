const express = require('express');
const { verifyToken, verifyInternalSecret, hasPermission } = require('../middleware/auth');
const { saveNewAccident, getActiveAccidents, changeAccidentStatus, getHandledAccidents, updateAccidentDetails, runInference, getVideos, runInferenceWithBbox } = require('../controllers/accidents');

const router = express.Router(); 

router.get("/active-accidents", verifyToken, getActiveAccidents);
router.post("/handle-accident", verifyToken, saveNewAccident);
router.post("/accident-status-update", verifyToken,  changeAccidentStatus);
router.get("/handled-accidents", verifyToken, getHandledAccidents);
router.post("/update-accident-details", verifyToken, updateAccidentDetails);
router.post("/internal-new-accident", verifyInternalSecret, saveNewAccident);
router.post('/run-inference', verifyToken, hasPermission('admin'), runInference);
router.post('/run-inference-bbox', verifyToken, hasPermission('admin'), runInferenceWithBbox);
router.get('/get-videos', verifyToken, hasPermission('admin'), getVideos);

module.exports = router;
