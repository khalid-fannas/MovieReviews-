document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('expired') === 'true') {
    alert('Your session has expired. Please log in again.');
    window.location.href = '/login';
  }
});
