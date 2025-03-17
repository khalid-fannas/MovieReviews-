const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    res.locals.userIsLoggedIn = false;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.user;
    res.locals.userIsLoggedIn = true;

    next();
  } catch (error) {
    console.error("Error:", error);
    res.locals.userIsLoggedIn = false;
    return next();
  }
};
