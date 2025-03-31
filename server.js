const express = require('express');
require('dotenv').config();
const db = require('./config/db');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const viewRoutes = require('./routes/viewRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const adminRoutes = require('./routes/adminRoutes');

const PORT = process.env.PORT || 3000;
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/', viewRoutes);
app.use('/', protectedRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).render('error', {
    status: 404,
    message: 'Page not found',
    title: 'Error',
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  console.log('ads');
  res.status(err.status || 500).render('error', {
    status: err.status || 500,
    message: err.message || 'Something went wrong',
    title: 'Error',
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
