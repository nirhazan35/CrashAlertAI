const express = require('express');
const { verifyToken} = require('../middleware/auth');
const { saveNewAccident, getActiveAccidents} = require('../controllers/accidents')

const router = express.Router();

router.get("/active-accidents" , getActiveAccidents);
router.post("/handle-accident", verifyToken, saveNewAccident);



module.exports = router;



