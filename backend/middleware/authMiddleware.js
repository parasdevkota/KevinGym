const AuthStrategyContext = require('../strategies/AuthStrategyContext');
const ROLES = require('../constants/roles');

const protect = async (req, res, next) => {
  try {
    req.user = await AuthStrategyContext.verify(req);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, ' + error.message });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return res.status(403).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} access required` });
  }
  next();
};

const requireAdmin = requireRole(ROLES.ADMIN);
const requireVendor = requireRole(ROLES.VENDOR);

module.exports = { protect, requireAdmin, requireVendor, requireRole };
