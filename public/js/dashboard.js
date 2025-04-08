function showAlert(message, type = 'success') {
  let alertContainer = document.getElementById('alert-container');
  if (!alertContainer) {
    alertContainer = document.createElement('div');
    alertContainer.id = 'alert-container';
    alertContainer.className = 'fixed top-5 right-5 z-50 space-y-4';
    document.body.appendChild(alertContainer);
  }

  const alertBox = document.createElement('div');
  alertBox.textContent = message;

  let bgColor = 'bg-green-500';
  if (type === 'error') bgColor = 'bg-red-500';
  else if (type === 'warning') bgColor = 'bg-yellow-500';
  else if (type === 'info') bgColor = 'bg-blue-500';

  alertBox.className = `flex w-full px-4 py-3 rounded-lg shadow-lg text-white transition-all duration-300 ${bgColor} opacity-100`;
  alertBox.setAttribute('role', 'alert');
  alertContainer.appendChild(alertBox);

  setTimeout(() => {
    alertBox.classList.add('opacity-0');
    setTimeout(() => {
      alertBox.remove();
    }, 1000);
  }, 2000);
}

function showConfirmation(message, callback) {
  const confirmationBox = document.getElementById('custom-confirmation');
  const confirmBtn = document.getElementById('confirm-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const messageElement = document.getElementById('confirmation-message');

  messageElement.textContent = message;

  confirmationBox.classList.remove('hidden');

  confirmBtn.onclick = () => {
    callback(true);
    confirmationBox.classList.add('hidden');
  };

  cancelBtn.onclick = () => {
    callback(false);
    confirmationBox.classList.add('hidden');
  };
}

function showFormAlert(message, type = 'success') {
  const alertBox = document.getElementById('custom-form-alert');

  alertBox.textContent = message;

  let bgColor = 'bg-green-500';
  if (type === 'error') bgColor = 'text-red-500';
  else if (type === 'warning') bgColor = 'bg-yellow-500';
  else if (type === 'info') bgColor = 'bg-blue-500';

  alertBox.className = `flex ${bgColor}`;
  alertBox.classList.remove('hidden');

  setTimeout(() => {
    alertBox.classList.add('hidden');
  }, 2000);
}

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
        showAlert('Movie added successfully!', 'success');
        movieModal.classList.add('hidden');
      } else {
        showFormAlert(`${result.message || 'Failed to add movie'}`, 'error');
      }
    } catch (error) {
      console.error('Error adding movie:', error);
      showFormAlert('Something went wrong. Try again.', 'error');
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
        showAlert('Movie updated successfully!', 'success');
      } else {
        showAlert(`${result.message || 'Failed to update movie'}`, 'error');
      }
    } catch (error) {
      console.error('Error updating movie:', error);
      showAlert('Something went wrong. Try again.', 'error');
    }
  }

  async function deleteMovie(movieRow) {
    const movieId = movieRow.dataset.movieId;

    showConfirmation(
      'Are you sure you want to delete this movie?',
      async (confirmed) => {
        if (confirmed) {
          try {
            const response = await fetch(`/admin/deleteMovie/${movieId}`, {
              method: 'DELETE',
            });

            const result = await response.json();
            if (response.ok) {
              showAlert('Movie deleted successfully!', 'success');
              movieRow.remove();
            } else {
              showAlert(
                `Error: ${result.message || 'Failed to delete movie'}`,
                'error'
              );
            }
          } catch (error) {
            console.error('Error deleting movie:', error);
            showAlert('Something went wrong. Try again.', 'error');
          }
        }
      }
    );
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
    const button = document.getElementById(`make-admin-${userId}`);
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
        showAlert(data.message, 'success');

        button.className = '';
        button.classList.add(
          'make-admin',
          'text-gray-500',
          'cursor-not-allowed'
        );
        button.innerHTML =
          '<i class="fas fa-user-shield text-lg"></i> Already Admin';
        button.disabled = true;
      } else {
        showAlert(
          `Error: ${data.message || 'Failed to update user role'}`,
          'error'
        );
      }
    } catch (error) {
      console.error('Error:', error);
      showAlert('Something went wrong. Try again.', 'error');
    }
  }

  async function deleteUser(userId, userRow) {
    showConfirmation(
      'Are you sure you want to delete this user?',
      async (confirmed) => {
        if (confirmed) {
          try {
            const response = await fetch(`/admin/deleteUser/${userId}`, {
              method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
              console.log(data.message);
              showAlert('User deleted successfully!', 'success');
              userRow.remove();
            } else {
              showAlert(
                `Error: ${result.message || 'Failed to delete user'}`,
                'error'
              );
            }
          } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong. Try again.');
          }
        }
      }
    );
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
      const userRow = event.target.closest('tr');
      deleteUser(userId, userRow);
    }
  });
});
