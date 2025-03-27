document.addEventListener('DOMContentLoaded', () => {
  document
    .getElementById('sign-form')
    .addEventListener('submit', async function (event) {
      event.preventDefault();

      const username = document.getElementById('username').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const confirmPassword = document
        .getElementById('password_confirmation')
        .value.trim();

      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect') || '/home';

      if (!username || !email || !password || !confirmPassword) {
        alert('Please fill in all fields.');
        return;
      }

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            email,
            password,
            confirmPassword,
            redirect,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert(data.message);
          window.location.href = data.redirect;
        } else {
          alert(data.message);
        }
      } catch (error) {
        alert('Something went wrong. Please try again later.');
      }
    });
});
