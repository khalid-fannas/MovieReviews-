const db = require('../config/db');

async function getMovies(limit = 10) {
  try {
    const [movies] = await db.query(
      `SELECT 
          m.*, 
          COALESCE(r.rating_count, 0) AS number_of_raters,
          COALESCE(r.average_rating, 0) AS average_rating,
          COALESCE(c.comment_count, 0) AS number_of_comments
       FROM movies m
       LEFT JOIN (
           SELECT movie_id, 
                  COUNT(*) AS rating_count, 
                  ROUND(AVG(rating), 1) AS average_rating
           FROM ratings
           GROUP BY movie_id
       ) r ON m.id = r.movie_id
       LEFT JOIN (
           SELECT movie_id, 
                  COUNT(*) AS comment_count
           FROM comments
           GROUP BY movie_id
       ) c ON m.id = c.movie_id
       ORDER BY m.id
       LIMIT ?`,
      [limit]
    );

    return movies;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getMovieDetails(movieId, userId) {
  try {
    const [movieDetails] = await db.query(
      `SELECT 
          m.*, 
          COALESCE(r.rating_count, 0) AS number_of_raters,
          COALESCE(r.average_rating, 0) AS average_rating,
          COALESCE(c.comment_count, 0) AS number_of_comments,
          COALESCE(c.comments, '') AS comments, 
          COALESCE(c.commenters, '') AS commenters,
          COALESCE(c.comment_times, '') AS comment_times
       FROM movies m
       LEFT JOIN (
           SELECT movie_id, 
                  COUNT(*) AS rating_count, 
                  ROUND(AVG(rating), 1) AS average_rating
           FROM ratings
           GROUP BY movie_id
       ) r ON m.id = r.movie_id
       LEFT JOIN (
           SELECT c.movie_id, 
                  COUNT(*) AS comment_count,
                  COALESCE(GROUP_CONCAT(c.comment SEPARATOR ' || '), '') AS comments,
                  COALESCE(GROUP_CONCAT(u.name SEPARATOR ' || '), '') AS commenters,
                  COALESCE(GROUP_CONCAT(c.createdAt SEPARATOR ' || '), '') AS comment_times
           FROM comments c
           LEFT JOIN users u ON c.user_id = u.id
           GROUP BY c.movie_id
       ) c ON m.id = c.movie_id
       WHERE m.id = ?;`,
      [movieId]
    );

    if (!movieDetails || movieDetails.length === 0) {
      return null;
    }

    const [userRatingResult] = await db.query(
      `SELECT rating FROM ratings WHERE movie_id = ? AND user_id = ?`,
      [movieId, userId]
    );

    const [userFavorited] = await db.query(
      'SELECT * FROM favorites WHERE user_id = ? AND movie_id = ?',
      [userId, movieId]
    );

    return {
      movie: movieDetails[0],
      comments: movieDetails[0].comments
        ? movieDetails[0].comments.split(' || ')
        : [],
      commenters: movieDetails[0].commenters
        ? movieDetails[0].commenters.split(' || ')
        : [],
      comment_times: movieDetails[0].comment_times
        ? movieDetails[0].comment_times.split(' || ')
        : [],
      userRating: userRatingResult.length ? userRatingResult[0].rating : 0,
      userHasFavorited: userFavorited.length > 0,
    };
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
}

async function getFavoriteMovies(userId) {
  try {
    const [movies] = await db.query(
      `SELECT 
          m.*, 
          COALESCE(r.rating_count, 0) AS number_of_raters,
          COALESCE(r.average_rating, 0) AS average_rating,
          COALESCE(c.comment_count, 0) AS number_of_comments
       FROM movies m
       INNER JOIN favorites f ON m.id = f.movie_id
       LEFT JOIN (
           SELECT movie_id, 
                  COUNT(*) AS rating_count, 
                  ROUND(AVG(rating), 1) AS average_rating
           FROM ratings
           GROUP BY movie_id
       ) r ON m.id = r.movie_id
       LEFT JOIN (
           SELECT movie_id, 
                  COUNT(*) AS comment_count
           FROM comments
           GROUP BY movie_id
       ) c ON m.id = c.movie_id
       WHERE f.user_id = ?
       ORDER BY m.id`,
      [userId]
    );

    return movies;
  } catch (error) {
    console.error(error);
    return [];
  }
}

module.exports = { getMovies, getMovieDetails, getFavoriteMovies };
