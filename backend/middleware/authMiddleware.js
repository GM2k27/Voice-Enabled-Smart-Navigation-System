const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    let token = req.headers["authorization"];

    if (!token) {
        return res.status(401).json({ status: "error", message: "No token provided" });
    }

    // Handle "Bearer <token>"
    if (token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        res.status(401).json({ status: "error", message: "Invalid token" });
    }
};
