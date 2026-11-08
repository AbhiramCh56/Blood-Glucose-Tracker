const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  try {
    //Read the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication token required.",
      });
    }

    //Extract the token
    const token = authHeader.split(" ")[1];

    //Verify the token
    const decocde = jwt.verify(token, process.env.JWT_SECRET);

    //Attach the user ID to request
    req.user = {
      id: decocde.userId,
    };

    //Continue to the next middleware
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or epxired token.",
    });
  }
};

module.exports = authenticateToken;
