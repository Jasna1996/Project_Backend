const { ROLES } = require("../utilities/generateToken");

const authorizedRole = (requiredRole) => {
    return (req, res, next) => {
        const userRole = req.user?.role?.toLowerCase();
        const requiredLevel = ROLES[requiredRole.toLowerCase()];
        const userLevel = ROLES[userRole];

        if (!userLevel || userLevel < requiredLevel) {
            return res.status(403).json({ message: `Access denied:Requires ${requiredRole} privileges` });
        }
        next();
    };
};

module.exports = {
    requireAdmin: authorizedRole('admin'),
    requireManager: authorizedRole('manager'),
    requireUser: authorizedRole('user'),
    authorizedRole
};