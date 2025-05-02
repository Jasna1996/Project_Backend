const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel')

module.exports = (req, res, next) => {
    try {

        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ error: 'jwt not found' })
        }
        const verifiedToken = jwt.verify(token, process.env.JWT_SECRET)
        if (!verifiedToken) {
            return res.status(404).json({ message: "User not verified!" });
        }

        if (verifiedToken.role !== "user") {
            return res.status(401).json({ message: "Access denied" });
        }
        req.user = verifiedToken.id;
        next();
    } catch (error) {
        console.error(error);
        res.status(error.status || 401).json({ error: error.message || "user authentication faild!" })
    }
}