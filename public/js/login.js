document.addEventListener('DOMContentLoaded', () => {
  document
    .getElementById('login-form')
    .addEventListener('submit', async function (event) {
      event.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect') || '/home';

      if (!email || !password) {
        alert('Please fill in both fields.');
        return;
      }

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, redirect }),
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
