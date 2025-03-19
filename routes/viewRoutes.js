const express = require("express");
const router = express.Router();

const { logout } = require("../controllers/authController");
const { getMovies, getMovieDetails } = require("../service/movieService");

router.get("/", async (req, res) => {
  res.locals.userIsLoggedIn = false;

  const movies = await getMovies();

  res.render("home", { movies });
});

router.get("/guestReview/:id", async (req, res) => {
  res.locals.userIsLoggedIn = false;

  const movieId = req.params.id;

  try {
    const movieDetails = await getMovieDetails(movieId);

    if (!movieDetails) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.render("review", {
      user: req.user,
      movie: movieDetails.movie,
      comments: movieDetails.comments,
      commenters: movieDetails.commenters,
      commentTimes: movieDetails.comment_times,
    });
  } catch (error) {
    console.error("Error in route handler:", error.message);
    res
      .status(500)
      .json({ message: "An error occurred while retrieving movie details." });
  }
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/logout", logout);

module.exports = router;
