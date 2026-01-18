//file: backend/medication-service/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access denied. No token provided."
    });
  }

  const token = authHeader.split(" ")[1];   // Extract token

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded._id;
    // Safety check (prevents silent crashes)
    if (!userId) {
      return res.status(401).json({
        message: "Invalid token payload"
      });
    }

    req.user = { userId };
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token is invalid or expired"
    });
  }
};
