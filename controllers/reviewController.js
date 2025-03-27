const db = require('../config/db');

exports.rate = async (req, res) => {
  const { rating } = req.body;
  const movieId = req.params.id;
  const userId = req.user.id;

  try {
    const [movie] = await db.query('SELECT * FROM movies WHERE id = ?', [
      movieId,
    ]);
    if (movie.length === 0) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: 'Please provide a rating between 1 and 5.' });
    }

    const [existingRating] = await db.query(
      'SELECT * FROM ratings WHERE movie_id = ? AND user_id = ?',
      [movieId, userId]
    );

    if (existingRating.length > 0) {
      await db.query(
        'UPDATE ratings SET rating = ? WHERE movie_id = ? AND user_id = ?',
        [rating, movieId, userId]
      );
    } else {
      await db.query(
        'INSERT INTO ratings (rating, movie_id, user_id) VALUES (?, ?, ?)',
        [rating, movieId, userId]
      );
    }
    const [[updatedRating]] = await db.query(
      'SELECT ROUND(AVG(rating), 1) AS newAverageRating, COUNT(*) AS newNumberOfRaters FROM ratings WHERE movie_id = ?',
      [movieId]
    );

    res.status(201).json({
      message: 'Rating saved successfully.',
      newAverageRating: updatedRating.newAverageRating || 0,
      newNumberOfRaters: updatedRating.newNumberOfRaters || 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.comment = async (req, res) => {
  const { comment } = req.body;
  const movieId = req.params.id;
  const userId = req.user.id;

  try {
    const [movie] = await db.query('SELECT * FROM movies WHERE id = ?', [
      movieId,
    ]);

    if (movie.length === 0) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    if (!comment.trim()) {
      return res.status(400).json({ message: 'Please provide a comment.' });
    }

    await db.query(
      'INSERT INTO comments (comment, movie_id, user_id) VALUES (?, ?, ?)',
      [comment, movieId, userId]
    );

    const [[newComment]] = await db.query(
      'SELECT users.name AS commenter, comments.createdAt AS commentTime FROM comments JOIN users ON comments.user_id = users.id WHERE comments.movie_id = ? ORDER BY comments.id DESC LIMIT 1',
      [movieId]
    );

    res.status(201).json({
      message: 'Comment added successfully.',
      commenter: newComment.commenter,
      commentTime: newComment.commentTime,
      comment: comment,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.favorite = async (req, res) => {
  const userId = req.user.id;
  const movieId = req.params.id;

  try {
    const [existingFavorite] = await db.query(
      'SELECT * FROM favorites WHERE user_id = ? AND movie_id = ?',
      [userId, movieId]
    );

    if (existingFavorite.length > 0) {
      await db.query(
        'DELETE FROM favorites WHERE user_id = ? AND movie_id = ?',
        [userId, movieId]
      );

      return res.json({ message: 'Removed from favorites', favorited: false });
    } else {
      await db.query(
        'INSERT INTO favorites (user_id, movie_id) VALUES (?, ?)',
        [userId, movieId]
      );

      return res
        .status(201)
        .json({ message: 'Added to favorites', favorited: true });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error toggling favorite' });
  }
};
