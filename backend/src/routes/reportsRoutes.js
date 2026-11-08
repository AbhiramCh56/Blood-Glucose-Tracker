const express = require("express");
const { getDailyReport } = require("../controllers/reportsController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/daily", authenticateToken, getDailyReport);

module.exports = router;
