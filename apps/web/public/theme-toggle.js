(function () {
  function getStoredTheme() {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null;
  }

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getActiveTheme() {
    return getStoredTheme() || getSystemTheme();
  }

  function applyTheme(theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }

  // Reflect the active theme to assistive tech: aria-pressed=true means dark is on.
  function reflectPressed() {
    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(document.documentElement.classList.contains('dark')));
    }
  }

  function setupThemeToggle() {
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    reflectPressed();
    toggle.addEventListener('click', function () {
      var isDark = document.documentElement.classList.contains('dark');
      var next = isDark ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      applyTheme(next);
      reflectPressed();
      if (next === 'light') {
        toggle.classList.remove('glow');
        void toggle.offsetWidth;
        toggle.classList.add('glow');
      }
    });
  }

  // Apply immediately to prevent FOUC
  applyTheme(getActiveTheme());

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!getStoredTheme()) {
      applyTheme(e.matches ? 'dark' : 'light');
      reflectPressed();
    }
  });

  // Astro view transitions support
  document.addEventListener('astro:page-load', setupThemeToggle);
  document.addEventListener('astro:after-swap', function () {
    applyTheme(getActiveTheme());
    reflectPressed();
  });
})();
