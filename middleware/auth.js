089const jwt = require('jsonwebtoken');

// Middleware to verify JWT
const verifyJWTAuthToken = (req, res, next) => {
    const token = req.headers?.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Kindly login" });
    }

    jwt.verify(token, process.env.JWT_KEY, (err, user) => {
        if (err) {
            console.error("JWT verification error:", err); // Log the error for debugging
            return res.status(403).json({ message: "Unauthorized" });
        }

        req.user = user; // Attach user information to the request object
        next(); // Proceed to the next middleware or route handler
    });
};

// Middleware to restrict access based on user roles
const restrictTo = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Unauthorized" });
    }
    next(); // Proceed to the next middleware or route handler
};

module.exports = {
    verifyJWTAuthToken,
    restrictTo,
};