const authorizedRole = (requiredRole) => {
    return (req, res, next) => {
        if (req.role !== requiredRole) {
            return res.status(403).json({ message: "Access denied: not an admin" });
        }
        next();
    };
};

module.exports = authorizedRole;