const jwt = require('jsonwebtoken');

const authAdmin = (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ message: 'JWT not found' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded.id;
        req.role = decoded.role;

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = authAdmin;
