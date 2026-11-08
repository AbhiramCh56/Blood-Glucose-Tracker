const express = require("express");
const {
  addReading,
  getReadings,
  updateReading,
  deleteReading,
} = require("../controllers/readingsController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, addReading);
router.get("/", authenticateToken, getReadings);
router.put("/:id", authenticateToken, updateReading);
router.delete("/:id", authenticateToken, deleteReading);

module.exports = router;
