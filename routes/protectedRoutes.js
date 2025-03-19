const express = require("express");
const router = express.Router();

const { rate } = require("../controllers/reviewController");
const { verifyToken } = require("../middleware/authMiddleware");
const { comment } = require("../controllers/reviewController");
const { getMovies, getMovieDetails } = require("../service/movieService");

router.get("/home", verifyToken, async (req, res) => {
  res.locals.userIsLoggedIn = true;

  const movies = await getMovies();

  res.render("home", { user: req.user, movies });
});

router.get("/review/:id", verifyToken, async (req, res) => {
  res.locals.userIsLoggedIn = true;

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

router.post("/movies/:id/rate", verifyToken, rate);

router.post("/movies/:id/comment", verifyToken, comment);

module.exports = router;
