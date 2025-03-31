document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search');
  const resultsContainer = document.getElementById('searchResults');

  let debounceTimer;
  let abortController = new AbortController();

  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);

    const query = searchInput.value.trim();

    if (query.length === 0) {
      resultsContainer.innerHTML = '';
      resultsContainer.classList.add('hidden');
      return;
    }

    if (query.length < 2) return;

    resultsContainer.innerHTML = `
      <div class="flex items-center">
        <p class="text-gray-500 py-4 pl-4">Searching....</p>
        <div class="w-6 h-6 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>`;
    resultsContainer.classList.remove('hidden');

    debounceTimer = setTimeout(() => {
      fetchMovies(query);
    }, 300);
  });

  async function fetchMovies(query) {
    abortController.abort();
    abortController = new AbortController();
    try {
      const response = await fetch(`/search?q=${query}`, {
        signal: abortController.signal,
      });
      const movies = await response.json();

      displaySearchResults(movies);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search Failed', error);
      }
    }
  }

  function displaySearchResults(movies) {
    resultsContainer.innerHTML = '';

    if (movies.length === 0) {
      resultsContainer.innerHTML =
        '<p class="text-gray-600 p-4">No Movies Found</p>';
      return;
    }

    const a = userStatus === 'true' ? 'review' : 'guestReview';

    movies.forEach((movie) => {
      const hour = Math.floor(movie.duration / 60);
      const remainingMinutes = movie.duration % 60;
      const movieItem = document.createElement('div');
      movieItem.className = 'p-2 border-b';
      movieItem.innerHTML = `
        <a href="/${a}/${movie.id}" class="flex items-center gap-4 p-3 rounded-lg transition duration-200 hover:bg-gray-200">
          <img src="${movie.image_url}" alt="${movie.title}" class="w-16 h-24 rounded-lg shadow-md object-cover" />
          <div class="flex flex-col">
            <p class="text-lg font-semibold text-gray-900 ">${movie.title}</p>
            <p class="text-base text-gray-800">${movie.category}</p>
            <div class="flex items-center gap-2 text-gray-800">
              <p class="text-sm">${movie.release_year}</p>/
              <p class="text-sm">${hour}h ${remainingMinutes}m</p>
            </div>
          </div>
        </a>
      `;
      resultsContainer.appendChild(movieItem);
    });

    resultsContainer.classList.remove('hidden');
  }
});
