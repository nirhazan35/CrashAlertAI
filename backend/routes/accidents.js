const express = require('express');
const { verifyToken} = require('../middleware/auth');
const { saveNewAccident, getActiveAccidents, changeAccidentStatus} = require('../controllers/accidents')

const router = express.Router();

router.get("/active-accidents" , verifyToken, getActiveAccidents);
router.post("/handle-accident", verifyToken, saveNewAccident);
router.post("/mark-as-handled", verifyToken, changeAccidentStatus)


module.exports = router;



