const jwt = require('jsonwebtoken');

const createToken = (id, role = "user") => {

    try {
        const token = jwt.sign({ id: id, role: role }, process.env.JWT_SECRET);
        console.log(token);
        return token

    } catch (error) {
        console.log(error)
    }
}

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { createToken, verifyToken }