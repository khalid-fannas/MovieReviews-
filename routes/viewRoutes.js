const express = require('express');
const router = express.Router();

const { logout } = require('../controllers/authController');
const {
  getTopTenMovies,
  getMovieDetails,
  getTopMoviesPerCategory,
  getAllMovies,
} = require('../service/movieService');

const { checkUserStatusOnly } = require('../middleware/authMiddleware');

const db = require('../config/db');

router.get('/', checkUserStatusOnly, async (req, res) => {
  const movies = await getTopTenMovies();

  res.render('home', { movies });
});

router.get('/guestReview/:id', checkUserStatusOnly, async (req, res) => {
  const movieId = req.params.id;

  try {
    const movieDetails = await getMovieDetails(movieId);

    if (!movieDetails) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const { movie, comments, commenters, comment_times } = movieDetails;

    res.render('review', {
      movie,
      comments,
      commenters,
      commentTimes: comment_times,
      userRating: 0,
      userHasFavorited: false,
    });
  } catch (error) {
    console.error('Error in route handler:', error.message);
    res
      .status(500)
      .json({ message: 'An error occurred while retrieving movie details.' });
  }
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/menu/categories', checkUserStatusOnly, async (req, res) => {
  res.locals.userIsLoggedIn = req.user ? true : false;
  try {
    const filteredMovies = await getTopMoviesPerCategory();
    res.status(200).json({
      filteredMovies,
      userIsLoggedIn: res.locals.userIsLoggedIn,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed retrieving filtered movies' });
  }
});

router.get('/allMovies', checkUserStatusOnly, async (req, res) => {
  try {
    const movies = await getAllMovies();

    if (!movies) {
      return res.status(401).json({ message: 'No Movies Found' });
    }

    res.render('allMovies', { movies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed retrieving all movies' });
  }
});

router.get('/logout', logout);

module.exports = router;
