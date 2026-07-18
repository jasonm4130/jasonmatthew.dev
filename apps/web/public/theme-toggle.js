(function () {
  var STORAGE_KEY = 'theme';
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function getStoredTheme() {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  }

  function systemTheme() {
    return darkQuery.matches ? 'dark' : 'light';
  }

  // The theme the page is actually showing: an explicit choice wins, otherwise
  // the OS preference (which the CSS token media query is already honouring).
  function effectiveTheme() {
    return getStoredTheme() || systemTheme();
  }

  // Reflect an explicit choice onto the attribute; when following the system,
  // leave the attribute unset so the token media query drives the palette and a
  // no-choice visitor tracks OS light/dark changes live.
  function applyStoredPreference() {
    var stored = getStoredTheme();
    var root = document.documentElement;
    if (stored === 'dark' || stored === 'light') {
      root.setAttribute('data-theme', stored);
    } else {
      root.removeAttribute('data-theme');
    }
  }

  // aria-pressed=true means dark is currently active.
  function reflectPressed() {
    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(effectiveTheme() === 'dark'));
    }
  }

  function setupThemeToggle() {
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    reflectPressed();
    toggle.addEventListener('click', function () {
      var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.setAttribute('data-theme', next);
      reflectPressed();
      if (next === 'light') {
        toggle.classList.remove('glow');
        void toggle.offsetWidth;
        toggle.classList.add('glow');
      }
    });
  }

  // Apply any stored preference before first paint (this head script is
  // render-blocking); no stored choice → no attribute → follow the system.
  applyStoredPreference();

  // While following the system, keep aria-pressed honest as the OS flips (the
  // palette itself follows via CSS with no JS needed).
  darkQuery.addEventListener('change', function () {
    if (!getStoredTheme()) reflectPressed();
  });

  // Astro view transitions support
  document.addEventListener('astro:page-load', setupThemeToggle);
  document.addEventListener('astro:after-swap', function () {
    applyStoredPreference();
    reflectPressed();
  });
})();
