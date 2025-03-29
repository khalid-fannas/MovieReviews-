document.addEventListener('DOMContentLoaded', () => {
  async function fetchMovies() {
    try {
      const response = await fetch('/menu/categories');
      if (!response.ok) throw new Error('Failed to fetch movies');

      const { filteredMovies, userIsLoggedIn } = await response.json();
      renderMovies(filteredMovies, userIsLoggedIn);
    } catch (error) {
      console.error('Error fetching movies:', error);
      document.getElementById('movies-container').innerHTML =
        '<p class="text-red-500">Failed to load movies.</p>';
    }
  }

  function renderMovies(filteredMovies, userIsLoggedIn) {
    const moviesContainer = document.getElementById('movies-container');
    moviesContainer.innerHTML = '';

    for (const category in filteredMovies) {
      const categorySection = document.createElement('div');
      categorySection.innerHTML = `
        <h3 class="text-xl font-bold mb-2 text-start border-b border-gray-700">
          ${category} Movies
        </h3>
        <ul class="list-disc text-start pl-5 space-y-2">
          ${filteredMovies[category]
            .map(
              (movie) => `
            <li>
              <a href="${
                userIsLoggedIn
                  ? `/review/${movie.movie_id}`
                  : `/guestReview/${movie.movie_id}`
              }" 
                 class="text-white hover:underline hover:text-yellow-500">
                ${movie.title}
              </a>
            </li>`
            )
            .join('')}
        </ul>
      `;
      moviesContainer.appendChild(categorySection);
    }
  }

  function toggleMenu() {
    const menuOverlay = document.getElementById('menu-overlay');
    const menuContent = document.getElementById('menu-overlay1');
    const body = document.body;
    body.classList.toggle('overflow-hidden');

    if (menuOverlay.classList.contains('hidden')) {
      menuOverlay.classList.remove('hidden');
      menuContent.classList.remove('animate-slide-out');
      menuContent.classList.add('animate-slide-in');

      fetchMovies();
    } else {
      menuContent.classList.remove('animate-slide-in');
      menuContent.classList.add('animate-slide-out');

      setTimeout(() => {
        menuOverlay.classList.add('hidden');
      }, 700);
    }
  }

  const menuButton = document.getElementById('menu-toggle-btn');
  const menuButton2 = document.getElementById('menu-toggle-btn2');

  if (menuButton) menuButton.addEventListener('click', toggleMenu);
  if (menuButton2) menuButton2.addEventListener('click', toggleMenu);
});
