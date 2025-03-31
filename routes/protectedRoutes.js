const express = require('express');
const router = express.Router();

const { rate, comment, favorite } = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getTopTenMovies,
  getMovieDetails,
  getFavoriteMovies,
} = require('../service/movieService');

router.get('/home', verifyToken, async (req, res) => {
  const movies = await getTopTenMovies();

  res.render('home', { user: req.user, movies, title: 'HOME PAGE' });
});

router.get('/review/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const movieId = req.params.id;

  try {
    const movieDetails = await getMovieDetails(movieId, userId);

    if (!movieDetails) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const {
      movie,
      comments,
      commenters,
      comment_times,
      userRating,
      userHasFavorited,
    } = movieDetails;

    res.render('review', {
      user: req.user,
      movie,
      comments,
      commenters,
      commentTimes: comment_times,
      userRating,
      userHasFavorited,
      title: 'Review',
    });
  } catch (error) {
    console.error('Error in route handler:', error.message);
    res
      .status(500)
      .json({ message: 'An error occurred while retrieving movie details.' });
  }
});

router.get('/favorite', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const favoriteMovies = await getFavoriteMovies(userId);

    if (favoriteMovies.length === 0) {
      return res.render('favorite', {
        message: 'No favorite movies added',
        favoriteMovies: [],
        title: 'Favorites',
      });
    }

    res.render('favorite', {
      user: req.user,
      favoriteMovies,
      title: 'Favorite',
    });
  } catch (error) {
    console.error('Error in route handler:', error.message);
    res
      .status(500)
      .json({ message: 'An error occurred while retrieving movie details.' });
  }
});

router.post('/movies/:id/rate', verifyToken, rate);

router.post('/movies/:id/comment', verifyToken, comment);

router.post('/movies/:id/favorite', verifyToken, favorite);

module.exports = router;
