const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { saveNewAccident, getActiveAccidents, changeAccidentStatus, getHandledAccidents, updateAccidentDetails } = require('../controllers/accidents');

const router = express.Router();

router.get("/active-accidents", verifyToken, getActiveAccidents);
router.post("/handle-accident", verifyToken, saveNewAccident);
router.post("/accident-status-update", verifyToken, changeAccidentStatus);
router.get("/handled-accidents", verifyToken, getHandledAccidents);
router.post("/update-accident-details", verifyToken, updateAccidentDetails);

module.exports = router;
