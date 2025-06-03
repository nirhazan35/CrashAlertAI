const express = require('express');
const { verifyToken, verifyInternalSecret } = require('../middleware/auth');
const { saveNewAccident, getActiveAccidents, changeAccidentStatus, getHandledAccidents, updateAccidentDetails } = require('../controllers/accidents');

const router = express.Router();

router.get("/active-accidents", verifyToken, getActiveAccidents);
router.post("/handle-accident", verifyToken, saveNewAccident);
router.post("/accident-status-update", verifyToken,  changeAccidentStatus);
router.get("/handled-accidents", verifyToken, getHandledAccidents);
router.post("/update-accident-details", verifyToken, updateAccidentDetails);
router.post("/internal-new-accident", verifyInternalSecret, saveNewAccident);

module.exports = router;
