const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const {
  addMovies,
  updateMovie,
  deleteMovie,
} = require('../controllers/adminController');

const router = express.Router();

router.post('/addMovies', verifyToken, isAdmin, addMovies);

router.patch('/updateMovie/:id', verifyToken, isAdmin, updateMovie);

router.delete('/deleteMovie/:id', verifyToken, isAdmin, deleteMovie);

module.exports = router;
