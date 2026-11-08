const express = require("express");
const { addReading } = require("../controllers/readingsController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, addReading);

module.exports = router;
