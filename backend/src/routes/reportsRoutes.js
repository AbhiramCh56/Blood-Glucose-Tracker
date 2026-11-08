const express = require("express");
const {
  getDailyReport,
  getMonthToDateReport,
} = require("../controllers/reportsController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/daily", authenticateToken, getDailyReport);
router.get("/month-to-date", authenticateToken, getMonthToDateReport);

module.exports = router;
