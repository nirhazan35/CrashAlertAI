const express = require('express');
const router = express.Router();
const Camera = require('../models/Camera');

// Internal-only: list all cameras {cameraId, location, demoVideo}
router.post('/', (req, res) => {
  if (req.get('X-INTERNAL-SECRET') !== process.env.INTERNAL_SECRET) {
    return res.sendStatus(403);
  }
  console.log("req.body", req.body)
  Camera.find({}, 'cameraId location')
        .then(rows => {
          console.log("rows", rows)
          res.json(rows)
        })
        .catch(err => res.status(500).json({error:err.message}));
});

module.exports = router;
