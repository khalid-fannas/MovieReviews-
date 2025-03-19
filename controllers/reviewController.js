const db = require("../config/db");

exports.rate = async (req, res) => {
  const { rating } = req.body;
  const movieId = req.params.id;
  const userId = req.user.id;

  try {
    const [movie] = await db.query("SELECT * FROM movies WHERE id = ?", [
      movieId,
    ]);
    if (movie.length === 0) {
      return res.status(404).json({ message: "Movie not found." });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Please provide a rating between 1 and 5." });
    }

    const [existingRating] = await db.query(
      "SELECT * FROM ratings WHERE movie_id = ? AND user_id = ?",
      [movieId, userId]
    );

    if (existingRating.length > 0) {
      await db.query(
        "UPDATE ratings SET rating = ? WHERE movie_id = ? AND user_id = ?",
        [rating, movieId, userId]
      );
      res.status(201).json({ message: "Rating updated successfully." });
    } else {
      await db.query(
        "INSERT INTO ratings (rating, movie_id, user_id) VALUES (?, ?, ?)",
        [rating, movieId, userId]
      );
      res.status(201).json({ message: "Rating submitted successfully." });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error." });
  }
};

exports.comment = async (req, res) => {
  const { comment } = req.body;
  const movieId = req.params.id;
  const userId = req.user.id;

  try {
    const [movie] = await db.query("SELECT * FROM movies WHERE id = ?", [
      movieId,
    ]);

    if (movie.length === 0) {
      return res.status(404).json({ message: "Movie not found." });
    }

    if (!comment) {
      return res.status(400).json({ message: "Please provide a comment." });
    }

    await db.query(
      "INSERT INTO comments (comment, movie_id, user_id) VALUES (?, ?, ?)",
      [comment, movieId, userId]
    );
    res.status(201).json({ message: "Comment submitted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Server error." });
  }
};
