const express = require("express");
const router = express.Router();
const { logout } = require("../controllers/authController");

router.get("/", (req, res) => {
  res.render("home", { user: req.user });
});

router.get("/review", (req, res) => {
  res.render("review", { user: req.user });
});

router.get("/logout", logout);

module.exports = router;
