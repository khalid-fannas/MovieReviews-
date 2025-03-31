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

router.get('/', checkUserStatusOnly, async (req, res) => {
  const movies = await getTopTenMovies();

  res.render('home', { movies, title: 'HOME PAGE' });
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
      title: 'Guest Review',
    });
  } catch (error) {
    console.error('Error in route handler:', error.message);
    res
      .status(500)
      .json({ message: 'An error occurred while retrieving movie details.' });
  }
});

router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.get('/menu/categories', async (req, res) => {
  const token = req.cookies.token;

  res.locals.userIsLoggedIn = !token
    ? (res.locals.userIsLoggedIn = false)
    : (res.locals.userIsLoggedIn = true);

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

    res.render('allMovies', { movies, title: 'All Movies' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed retrieving all movies' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const query = req.query.q.trim().toLowerCase();

    const movies = await getAllMovies();

    const filteredMovies = movies.filter((movie) =>
      movie.title.toLowerCase().includes(query)
    );

    res.json(filteredMovies);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/logout', logout);

router.get('/error', (req, res) => {
  const status = Number(req.query.status) || 500;
  const message = req.query.message || 'Something went wrong';

  res.status(status).render('error', { status, message, title: 'Error' });
});

module.exports = router;
