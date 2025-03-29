const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).json({ message: 'Access is denied. No token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.user;
    res.locals.userIsLoggedIn = true;
    res.locals.isAdmin = req.user.role === 'admin';

    next();
  } catch (error) {
    console.error('Error:', error);

    res.locals.userIsLoggedIn = false;
    return next();
  }
};

exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only!' });
  }
  next();
};

exports.checkUserStatusOnly = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.locals.userIsLoggedIn = false;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    res.locals.userIsLoggedIn = true;
    res.locals.isAdmin = req.user.role === 'admin';
  } catch (error) {
    console.error('Invalid token:', error);
  }
  next();
};
