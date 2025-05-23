const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { verifyToken } = require('../utilities/generateToken');

module.exports = (req, res, next) => {
    try {

        console.log("Headers", req.headers)
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log("No Authorization header found");
            return res.status(401).json({
                success: false,
                message: "Authorization header missing"
            });
        }
        // if (!authHeader || !authHeader.startsWith("Bearer ")) {
        //     return res.status(401).json({ error: "Authorization token missing or invalid" });
        // }

        // 2. Validate Bearer format
        const [bearer, token] = authHeader.split(' ');
        if (bearer !== 'Bearer' || !token) {
            return res.status(401).json({ error: "Format: Bearer <token>" });
        }


        const decoded = verifyToken(token);

        req.user = {
            _id: decoded.id,    // Matches token payload
            role: decoded.role.toLowerCase()
        };


        next();

    } catch (error) {
        console.error(error);
        console.error("Authentication error:", error.message);
        const status = error.name === 'TokenExpiredError' ? 401 : 500;

        res.status(status).json({
            success: false,
            message, debug: error.message
            // res.status(error.status || 401).json({ error: error.message || "user authentication faild!" })
        })
    }
}