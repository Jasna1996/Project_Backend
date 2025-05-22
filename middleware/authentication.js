const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel')

module.exports = (req, res, next) => {
    try {

        console.log("Headers", req.headers)
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Authorization token missing or invalid" });
        }
        const token = authHeader?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: req.headers.authorization })
        }
        const verifiedToken = jwt.verify(token, process.env.JWT_SECRET)
        console.log("Decoded token in middleware:", verifiedToken);
        if (!verifiedToken) {
            return res.status(404).json({ message: "User not verified!" });
        }


        if (verifiedToken.role !== "manager") {
            return res.status(401).json({ message: "Access denied" });
        }
        // req.user = verifiedToken.id;
        req.user = {
            _id: verifiedToken.id,
            role: verifiedToken.role,
        };
        next();
    } catch (error) {
        console.error(error);
        res.status(error.status || 401).json({ error: error.message || "user authentication faild!" })
    }
}