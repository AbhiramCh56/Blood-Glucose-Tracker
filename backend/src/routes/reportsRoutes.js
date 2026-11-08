const express = require("express");
const {
  getDailyReport,
  getMonthToDateReport,
  getPreviousMonthReport,
} = require("../controllers/reportsController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/daily", authenticateToken, getDailyReport);
router.get("/month-to-date", authenticateToken, getMonthToDateReport);
router.get("/previous-month", authenticateToken, getPreviousMonthReport);

module.exports = router;
