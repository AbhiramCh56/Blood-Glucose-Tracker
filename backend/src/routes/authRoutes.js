const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/protected", authenticateToken, (req, res) => {
  return res.status(200).json({
    success: "true",
    message: "You have accessed a protected route.",
    userId: req.user.id,
  });
});

module.exports = router;
