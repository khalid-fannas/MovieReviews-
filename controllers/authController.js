const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  const redirectTo = req.body.redirect || '/home';

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Please fill in all fields.' });
  }

  if (password !== confirmPassword) {
    return res.status(403).json({ message: 'Passwords do not match' });
  }

  try {
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.query(
      'INSERT INTO users (name, email, password , role) VALUES (?, ?, ? , ?)',
      [username, email, hashedPassword, 'user']
    );

    const userId = result[0].insertId;

    const payload = { user: { id: userId, role: 'user' } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    if (!token)
      return res.status(500).json({ message: 'Error generating token.' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    });

    res
      .status(201)
      .json({ message: 'User registered successfully.', redirect: redirectTo });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const redirectTo = req.body.redirect || '/home';

  if (!email || !password) {
    return res.status(400).json({ message: 'Please fill in all fields.' });
  }

  try {
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const [user] = existingUser;

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const payload = { user: { id: user.id, role: user.role } };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    if (!token)
      return res.status(500).json({ message: 'Error generating token.' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    });

    res.json({ message: 'User logged in successfully.', redirect: redirectTo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
  });

  res.redirect('/');
};
