const jwt = require('jsonwebtoken');

const createToken = (id, role = "user") => {

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET not configured");
        }
        const token = jwt.sign({ id: id, role: role }, process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        return token

    } catch (error) {
        console.log(error)
    }
}

const verifyToken = (token) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET not configured");
    }
    return jwt.verify(token, process.env.JWT_SECRET, { clockTolerance: 30 });
};

module.exports = { createToken, verifyToken }