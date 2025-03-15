//this file only for testing the login and register function

const db = require("../config/db");

exports.getProfile = async (req, res) => {
  try {
    const [user] = await db.query(
      "SELECT id, name, email FROM users WHERE id = ?",
      [req.user.id]
    );

    if (!user) return res.status(404).json({ Message: "User not found." });

    res.json(user);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ Message: "Server error." });
  }
};
