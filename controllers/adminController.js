const db = require('../config/db');

exports.getAllDetailsDashboard = async (req, res) => {
  try {
    const [movies] = await db.query('SELECT * FROM movies');
    const [users] = await db.query('SELECT * FROM users');
    const [commentCount] = await db.query(
      'SELECT COUNT(*) AS total_comments FROM comments'
    );
    const [ratingCount] = await db.query(
      'SELECT COUNT(*) AS total_ratings FROM ratings'
    );

    return {
      movieCount: movies.length || 0,
      userCount: users.length || 0,
      commentCount: commentCount[0].total_comments || 0,
      ratingCount: ratingCount[0].total_ratings || 0,
      movies: movies || [],
      users: users || [],
    };
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch data.');
  }
};

exports.addMovies = async (req, res) => {
  const {
    title,
    description,
    release_year,
    producer,
    image_url,
    category,
    duration,
  } = req.body;

  if (
    !title ||
    !description ||
    !release_year ||
    !producer ||
    !image_url ||
    !category ||
    !duration
  ) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  try {
    const lowercaseTitle = title.toLowerCase().trim();

    const [existingMovie] = await db.query(
      'SELECT * FROM movies WHERE LOWER(title) = ?',
      [lowercaseTitle]
    );

    if (existingMovie.length > 0) {
      return res.status(400).json({ message: 'Movie already exists!' });
    }

    const [result] = await db.query(
      `INSERT INTO movies (title, description, release_year, producer, image_url, category, duration)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        release_year,
        producer,
        image_url,
        category,
        duration,
      ]
    );

    if (result.affectedRows > 0) {
      return res.status(201).json({ message: 'Movie added successfully!' });
    } else {
      return res.status(500).json({ message: 'Failed to add movie' });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateMovie = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    release_year,
    producer,
    image_url,
    category,
    duration,
  } = req.body;

  if (
    !title &&
    !description &&
    !release_year &&
    !producer &&
    !image_url &&
    !category &&
    !duration
  ) {
    return res
      .status(400)
      .json({ message: 'Please provide at least one field to update' });
  }

  try {
    const [movie] = await db.query('SELECT * FROM movies WHERE id = ?', [id]);

    if (movie.length === 0) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    let hasChanges = false;
    const updateFields = [];
    const updateValues = [];

    if (title && title.toLowerCase() !== movie[0].title.toLowerCase()) {
      updateFields.push('title = ?');
      updateValues.push(title);
      hasChanges = true;
    }
    if (
      description &&
      description.toLowerCase() !== movie[0].description.toLowerCase()
    ) {
      updateFields.push('description = ?');
      updateValues.push(description);
      hasChanges = true;
    }
    if (release_year && release_year !== movie[0].release_year) {
      updateFields.push('release_year = ?');
      updateValues.push(release_year);
      hasChanges = true;
    }
    if (
      producer &&
      producer.toLowerCase() !== movie[0].producer.toLowerCase()
    ) {
      updateFields.push('producer = ?');
      updateValues.push(producer);
      hasChanges = true;
    }
    if (
      image_url &&
      image_url.toLowerCase() !== movie[0].image_url.toLowerCase()
    ) {
      updateFields.push('image_url = ?');
      updateValues.push(image_url);
      hasChanges = true;
    }
    if (
      category &&
      category.toLowerCase() !== movie[0].category.toLowerCase()
    ) {
      updateFields.push('category = ?');
      updateValues.push(category);
      hasChanges = true;
    }
    if (duration && duration !== movie[0].duration) {
      updateFields.push('duration = ?');
      updateValues.push(duration);
      hasChanges = true;
    }

    if (!hasChanges) {
      return res
        .status(400)
        .json({ message: 'No changes were made to the movie' });
    }

    updateValues.push(id);

    const [result] = await db.query(
      `UPDATE movies SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({ message: 'Movie updated successfully' });
    } else {
      return res.status(500).json({ message: 'Failed to update movie' });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteMovie = async (req, res) => {
  const { id } = req.params;

  try {
    const [movie] = await db.query('SELECT * FROM movies WHERE id = ?', [id]);

    if (movie.length === 0) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const [result] = await db.query('DELETE FROM movies WHERE id = ?', [id]);

    if (result.affectedRows > 0) {
      return res.status(200).json({ message: 'Movie deleted successfully' });
    } else {
      return res.status(500).json({ message: 'Failed to delete movie' });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.changeUserRole = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const role = req.body.role.toLowerCase();

  try {
    if (!['user', 'admin'].includes(role.toLowerCase())) {
      return res
        .status(400)
        .json({ message: 'Invalid role. Allowed values: user, admin' });
    }

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const loggedInAdminRole = req.user.role;

    const [user] = await db.query('SELECT role FROM users WHERE id = ?', [id]);

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const targetUserRole = user[0].role;

    if (targetUserRole === 'admin' && loggedInAdminRole === 'admin') {
      return res
        .status(403)
        .json({ message: 'You cannot change another admin’s role' });
    }

    if (targetUserRole === role) {
      return res.status(400).json({ message: 'User already has this role' });
    }

    const [result] = await db.query('UPDATE users SET role = ? WHERE id = ?', [
      role,
      id,
    ]);

    if (result.affectedRows > 0) {
      return res.json({ message: 'User role updated successfully!' });
    } else {
      return res.status(500).json({ message: 'Failed to update user role' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteUser = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const loggedInAdminRole = req.user.role;

  try {
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const [user] = await db.query('SELECT role FROM users WHERE id = ?', [id]);

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const targetUserRole = user[0].role;

    if (targetUserRole === 'admin' && loggedInAdminRole === 'admin') {
      return res
        .status(403)
        .json({ message: 'Admins cannot delete other admins' });
    }

    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows > 0) {
      return res.json({ message: 'User deleted successfully!' });
    } else {
      return res.status(500).json({ message: 'Failed to delete user' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
