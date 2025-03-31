document.addEventListener('DOMContentLoaded', () => {
  document
    .getElementById('login-form')
    .addEventListener('submit', async function (event) {
      event.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const message = document.getElementById('message');

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
          message.innerHTML = data.message;
          window.location.href = data.redirect;
        } else {
          message.innerHTML = `<i class="fa-solid fa-triangle-exclamation w-5 h-5 text-center text-red-600 text-xl"></i> ${data.message}`;
        }
      } catch (error) {
        alert('Something went wrong. Please try again later.');
      }
    });
});
