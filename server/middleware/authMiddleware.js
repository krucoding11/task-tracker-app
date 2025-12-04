const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key';

const protect = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = decodeToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

const decodeToken = (token) => jwt.verify(token, JWT_SECRET);

const authorize = (...requiredPermission) => {
  return (req, res, next) => {
    const requiredPermissions = Array.isArray(requiredPermission)
      ? requiredPermission
      : [requiredPermission];

    const userPermissions = req.user?.permissions || [];
    const hasPermission = requiredPermissions.some((perm) =>
      userPermissions.includes(perm),
    );
    if (!hasPermission) {
      return res.status(403).json({
        error: 'Access Denied: You do not have the required permission.',
      });
    }
    next();
  };
};

const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize, decodeToken, checkRole };
