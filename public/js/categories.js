document.addEventListener('DOMContentLoaded', () => {
  function toggleMenu() {
    const menuOverlay = document.getElementById('menu-overlay');
    const menuContent = document.getElementById('menu-overlay1');
    const body = document.getElementsByTagName('body')[0];
    body.classList.toggle('overflow-hidden');

    if (menuOverlay.classList.contains('hidden')) {
      menuOverlay.classList.remove('hidden');
      menuContent.classList.remove('animate-slide-out');
      menuContent.classList.add('animate-slide-in');
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

  if (menuButton && menuButton2) {
    menuButton.addEventListener('click', toggleMenu);
    menuButton2.addEventListener('click', toggleMenu);
  }
});
