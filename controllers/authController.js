const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

exports.register = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || confirmPassword) {
    return res.status(400).json({ Message: "Please fill in all fields." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ Message: "Password do not match" });
  }
  try {
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ Message: "Email already exists." });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    res.status(201).json({ Message: "User registered successfully." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ Message: "Server error." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ Message: "Please fill in all fields." });
  }

  try {
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({ Message: "User not found." });
    }

    const [user] = existingUser;

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ Message: "Invalid credentials." });
    }

    const payload = { user: { id: user.id } };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    if (!token) res.status(500).json({ Message: "Error generating token." });

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ Message: "Server error." });
  }
};
