const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel')

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
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            console.log("Malformed Authorization header:", authHeader);
            return res.status(401).json({
                success: false,
                message: "Format: Bearer <token>"
            });
        }
        const token = parts[1];
        console.log("Extracted Token:", token);
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Decoded Token:", decoded);
        } catch (verifyError) {
            console.error("Token Verification Failed:", verifyError);
            throw verifyError; // Let the catch block handle it
        }
        // const token = authHeader?.split(" ")[1];
        // if (!token) {
        //     return res.status(401).json({ error: req.headers.authorization })
        // }
        // const verifiedToken = jwt.verify(token, process.env.JWT_SECRET)
        // console.log("Decoded token in middleware:", verifiedToken);
        // if (!verifiedToken) {
        //     return res.status(404).json({ message: "User not verified!" });
        // }

        req.user = {
            _id: decoded.id,    // Matches token payload
            role: decoded.role
        };

        if (decoded.role !== "manager") {
            console.log("Role check failed - User role:", decoded.role);
            return res.status(403).json({
                success: false,
                message: "Manager access required"
            });
        }
        console.log("Authentication successful for:", decoded.id);
        // req.user = verifiedToken.id;
        // req.user = {
        //     _id: verifiedToken.id,
        //     role: verifiedToken.role,
        // };
        next();
    } catch (error) {
        console.error(error);
        const status = error.name === 'TokenExpiredError' ? 401 : 500;
        const message = error.name === 'JsonWebTokenError'
            ? "Invalid token"
            : "Authentication failed";

        res.status(status).json({
            success: false,
            message, debug: error.message
            // res.status(error.status || 401).json({ error: error.message || "user authentication faild!" })
        })
    }
}