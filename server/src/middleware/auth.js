const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'madrasa-dev-secret';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user?.role || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to access this resource' });
  }
  next();
};

module.exports = authenticateToken;
module.exports.protect = authenticateToken;
module.exports.authorizeRoles = authorizeRoles;
