const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const {
  getAllDetailsDashboard,
  addMovies,
  updateMovie,
  deleteMovie,
  changeUserRole,
  deleteUser,
} = require('../controllers/adminController');

const router = express.Router();

router.get('/dashboard', verifyToken, isAdmin, async (req, res) => {
  try {
    const dashboardDetails = await getAllDetailsDashboard();
    res.render('dashboard', { dashboardDetails, title: 'Admin Dashboard' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to load dashboard');
  }
});

router.post('/addMovies', verifyToken, isAdmin, addMovies);

router.patch('/updateMovie/:id', verifyToken, isAdmin, updateMovie);

router.delete('/deleteMovie/:id', verifyToken, isAdmin, deleteMovie);

router.patch('/userRole/:id', verifyToken, isAdmin, changeUserRole);

router.delete('/deleteUser/:id', verifyToken, isAdmin, deleteUser);

module.exports = router;
