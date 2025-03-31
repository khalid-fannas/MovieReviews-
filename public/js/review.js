document.addEventListener('DOMContentLoaded', () => {
  const stars = document.querySelectorAll('.fa-star');
  const ratingStars = document.getElementById('ratingStar');
  const ratingResult = document.getElementById('avgRating');
  const numberOfRaters = document.getElementById('ratersNum');
  const favoriteIcon = document.getElementById('favoriteIcon');
  const submitButton = document.getElementById('commentSubmit');
  const commentInput = document.getElementById('comment');

  let currentRating = userRating;
  let tempRating = 0;
  let isFavorited = userHasFavorited === 'true';

  if (isFavorited) {
    favoriteIcon.classList.add('text-red-500');
  }

  function updateStars(rating) {
    stars.forEach((star) => {
      if (star.getAttribute('data-rating') <= rating) {
        star.classList.add('text-yellow-500');
      } else {
        star.classList.remove('text-yellow-500');
      }
    });
  }

  updateStars(currentRating);

  if (userIsLoggedIn === 'false') {
    if (ratingStars) {
      ratingStars.querySelectorAll('.fa-star').forEach((star) => {
        star.classList.add('opacity-50', 'cursor-not-allowed');
      });
    }

    commentInput.disabled = true;
    commentInput.placeholder = 'Please log in to add a comment';
    submitButton.classList.add('opacity-50', 'cursor-not-allowed');
    submitButton.disabled = true;
    favoriteIcon.classList.add('opacity-50', 'cursor-not-allowed');
  } else {
    stars.forEach((star) => {
      star.addEventListener('mouseenter', () => {
        tempRating = star.getAttribute('data-rating');
        updateStars(tempRating);
      });

      star.addEventListener('mouseleave', () => {
        updateStars(currentRating);
      });

      star.addEventListener('click', async () => {
        currentRating = star.getAttribute('data-rating');
        updateStars(currentRating);

        const response = await fetch(`/movies/${movieId}/rate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating: currentRating }),
        });

        const data = await response.json();

        if (response.ok) {
          if (data.newAverageRating !== undefined) {
            ratingResult.textContent = data.newAverageRating;
          }
          if (data.newNumberOfRaters !== undefined) {
            numberOfRaters.textContent = data.newNumberOfRaters;
          }
        } else {
          alert(data.message);
        }
      });
    });

    submitButton.addEventListener('click', async () => {
      const comment = commentInput.value.trim();
      if (!comment) return;

      const response = await fetch(`/movies/${movieId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
      });

      const data = await response.json();

      if (response.ok) {
        const noCommentsMessage = document.getElementById('noCommentsMessage');
        const commentsContainer = document.getElementById('commentsContainer');
        const newCommentDiv = document.createElement('div');

        if (noCommentsMessage) {
          noCommentsMessage.remove();
        }

        newCommentDiv.classList.add(
          'relative',
          'p-4',
          'shadow',
          'border',
          'border-gray-700',
          'border-l-yellow-500',
          'border-l-2',
          'max-w-full',
          'break-words'
        );

        newCommentDiv.innerHTML = `
            <div class="flex justify-between w-full items-center">
              <p  class="text-yellow-300 font-bold hover:underline">${
                data.commenter
              }</p>
              <div>
                <p class="text-gray-200 mt-2">${new Date(
                  data.commentTime
                ).toLocaleDateString()}</p>
              </div>
            </div>
            <p class="text-gray-300 break-words">${comment}</p>
          `;

        commentsContainer.prepend(newCommentDiv);
        commentInput.value = '';
      } else {
        alert(data.message);
      }
    });

    favoriteIcon.addEventListener('click', async () => {
      try {
        const response = await fetch(`/movies/${movieId}/favorite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();

        if (response.ok) {
          isFavorited = data.favorited;
          favoriteIcon.classList.toggle('text-red-500', isFavorited);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    });
  }
});
