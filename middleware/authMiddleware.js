const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).json({ message: "Access is denied. No token" });
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
