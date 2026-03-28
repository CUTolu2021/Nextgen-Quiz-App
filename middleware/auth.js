const jwt = require("jsonwebtoken");

// Middleware to verify JWT
const verifyJWTAuthToken = (req, res, next) => {
  const authHeader = req.headers?.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Kindly login" });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({ message: "Kindly login" });
  }

  jwt.verify(token, process.env.JWT_KEY, (err, user) => {
    if (err) {
      console.error("JWT verification error:", err.message);
      return res.status(403).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();
  });
};

// Middleware to restrict access based on user roles
const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Unauthorized" });
  }
  next();
};

// Middleware to restrict access to routes unique to the user
const restrictToUser = (req, res, next) => {
  if (String(req.user.userId) !== String(req.params.id)) {
    return res.status(403).json({ message: "Unauthorized to access this route" });
  }
  next();
};

module.exports = {
  verifyJWTAuthToken,
  restrictTo,
  restrictToUser,
};
