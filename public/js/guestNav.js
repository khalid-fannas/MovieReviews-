document.addEventListener('DOMContentLoaded', () => {
  const loginLink = document.getElementById('loginLink');
  const signupLink = document.getElementById('signupLink');

  const currentPath = window.location.pathname;

  const redirectPath = currentPath.startsWith('/guestReview/')
    ? currentPath.replace('/guestReview/', '/review/')
    : currentPath === '/'
    ? '/home'
    : currentPath;

  const encodedRedirect = encodeURIComponent(redirectPath);

  loginLink.href = `/login?redirect=${encodedRedirect}`;
  signupLink.href = `/register?redirect=${encodedRedirect}`;
});
