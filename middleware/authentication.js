const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel')

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        console.log(authHeader, "auth header");
        if (!authHeader)
            return res.status(401).json({ message: 'You are not logged in!' })

        const authToken = authHeader && authHeader.split(" ")[1];

        const decoded = jwt.verify(authToken, process.env.JWT_SECRET);

        const user = await userModel.findOne({ _id: decoded.id })

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}