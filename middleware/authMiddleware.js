const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect(
      '/error?status=403&message=Access+denied.+Please+log+in'
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    res.locals.userIsLoggedIn = true;
    res.locals.isAdmin = req.user.role === 'admin';

    return next();
  } catch (error) {
    console.error('Invalid token:', error);

    if (error.name === 'TokenExpiredError') {
      res.clearCookie('token');
      return res.redirect('/?expired=true');
    }

    res.clearCookie('token');
    return res.redirect(
      '/error?status=403&message=Invalid+token.+Please+log+in+again'
    );
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

    return next();
  } catch (error) {
    console.error('Invalid token:', error);

    if (error.name === 'TokenExpiredError') {
      res.clearCookie('token');
      res.locals.userIsLoggedIn = false;
      return res.redirect('/?expired=true');
    }

    res.clearCookie('token');
    return res.redirect(
      '/error?status=403&message=Invalid+token.+Please+log+in+again'
    );
  }
};
