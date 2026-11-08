const express = require("express");
const {
  addReading,
  getReadings,
} = require("../controllers/readingsController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, addReading);
router.get("/", authenticateToken, getReadings);

module.exports = router;
