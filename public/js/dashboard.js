document.addEventListener('DOMContentLoaded', () => {
  const movieModal = document.getElementById('movieModal');
  const openMovieModal = document.getElementById('openMovieModal');
  const closeMovieModal = document.getElementById('closeMovieModal');
  const movieForm = movieModal.querySelector('form');

  function openModal() {
    movieModal.classList.remove('hidden');
  }

  function closeModal() {
    movieModal.classList.add('hidden');
    movieForm.reset();
  }

  if (openMovieModal) {
    openMovieModal.addEventListener('click', openModal);
  }

  closeMovieModal.addEventListener('click', closeModal);

  movieForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const movieData = {
      title: document.getElementById('movieTitle').value.trim(),
      description: document.getElementById('movieDescription').value.trim(),
      release_year: document.getElementById('movieReleaseYear').value.trim(),
      image_url: document.getElementById('movieImageUrl').value.trim(),
      producer: document.getElementById('movieProducer').value.trim(),
      category: document.getElementById('movieCategory').value.trim(),
      duration: document.getElementById('movieDuration').value.trim(),
    };

    try {
      const response = await fetch('/admin/addMovies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movieData),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Movie added successfully!');
        location.reload();
      } else {
        alert(`Error: ${result.message || 'Failed to add movie'}`);
      }
    } catch (error) {
      console.error('Error adding movie:', error);
      alert('Something went wrong. Try again.');
    }
  });

  const movieTable = document.getElementById('movieTableBody');

  async function updateMovie(movieRow) {
    const movieId = movieRow.dataset.movieId;
    const updatedData = {
      title: movieRow.querySelector("input[type='text']").value.trim(),
      description: movieRow
        .querySelectorAll("input[type='text']")[1]
        .value.trim(),
      release_year: parseInt(
        movieRow.querySelector("input[type='number']").value.trim(),
        10
      ),
      producer: movieRow.querySelectorAll("input[type='text']")[2].value.trim(),
      image_url: movieRow.querySelector("input[type='url']").value.trim(),
      category: movieRow.querySelector('select').value.trim(),
      duration: parseInt(
        movieRow.querySelectorAll("input[type='number']")[1].value.trim(),
        10
      ),
    };

    try {
      const response = await fetch(`/admin/updateMovie/${movieId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      const result = await response.json();
      if (response.ok) {
        alert('Movie updated successfully!');
      } else {
        alert(`Error: ${result.message || 'Failed to update movie'}`);
      }
    } catch (error) {
      console.error('Error updating movie:', error);
      alert('Something went wrong. Try again.');
    }
  }

  async function deleteMovie(movieRow) {
    const movieId = movieRow.dataset.movieId;

    if (!confirm('Are you sure you want to delete this movie?')) return;

    try {
      const response = await fetch(`/admin/deleteMovie/${movieId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (response.ok) {
        alert('Movie deleted successfully!');
        movieRow.remove();
      } else {
        alert(`Error: ${result.message || 'Failed to delete movie'}`);
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Something went wrong. Try again.');
    }
  }

  movieTable.addEventListener('click', (event) => {
    const target = event.target;
    const movieRow = target.closest('tr');

    if (!movieRow) return;

    if (target.classList.contains('save-movie')) {
      updateMovie(movieRow);
    } else if (target.classList.contains('delete-movie')) {
      deleteMovie(movieRow);
    }
  });

  const emailFilterInput = document.getElementById('emailUserFilter');
  const userTableBody = document.getElementById('userTableBody');

  async function makeAdmin(userId) {
    try {
      const response = await fetch(`/admin/userRole/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'admin' }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data.message);
        alert(data.message);
        location.reload();
      } else {
        alert(`Error: ${data.message || 'Failed to update user role'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Try again.');
    }
  }

  async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/admin/deleteUser/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data.message);
        alert(data.message);
        location.reload();
      } else {
        alert(`Error: ${data.message || 'Failed to delete user'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Try again.');
    }
  }

  emailFilterInput.addEventListener('input', function () {
    const filterValue = emailFilterInput.value.trim().toLowerCase();
    const rows = userTableBody.getElementsByTagName('tr');

    for (let row of rows) {
      const emailCell = row.getElementsByTagName('td')[2];
      if (emailCell) {
        const emailText = emailCell.textContent.toLowerCase();
        row.style.display = emailText.includes(filterValue) ? '' : 'none';
      }
    }
  });

  const titleFilterInput = document.getElementById('moviesTitleFilter');
  const movieTableBody = document.getElementById('movieTableBody');

  titleFilterInput.addEventListener('input', function () {
    const filterValue = titleFilterInput.value.trim().toLowerCase();
    const rows = movieTableBody.getElementsByTagName('tr');

    for (let row of rows) {
      const titleCell = row.getElementsByTagName('td')[1];
      if (titleCell) {
        const titleText = titleCell.querySelector('input').value.toLowerCase();
        row.style.display = titleText.includes(filterValue) ? '' : 'none';
      }
    }
  });

  userTableBody.addEventListener('click', function (event) {
    if (event.target.closest('.make-admin')) {
      const userId = event.target.closest('tr').querySelector('td').textContent;
      makeAdmin(userId);
    }
    if (event.target.closest('.delete-user')) {
      const userId = event.target.closest('tr').querySelector('td').textContent;
      deleteUser(userId);
    }
  });
});
