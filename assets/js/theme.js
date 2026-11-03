/* AI-KIDO — choix du thème clair / sombre.
   Chargé de façon synchrone dans <head> pour poser data-theme avant le premier affichage (pas de flash).
   Par défaut le thème suit le réglage du système ; un clic sur le bouton de l'en-tête mémorise le choix du visiteur. */
(function () {
  var KEY = 'aikido-theme';
  var COLORS = { light: '#f6efe0', dark: '#111524' };
  var root = document.documentElement;
  var query = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function stored() {
    try { var v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : null; } catch (e) { return null; }
  }
  function system() { return query && query.matches ? 'dark' : 'light'; }

  function refresh(theme) {
    var other = theme === 'dark' ? 'light' : 'dark';
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) { metas[i].removeAttribute('media'); metas[i].setAttribute('content', COLORS[theme]); }
    var buttons = document.querySelectorAll('[data-theme-toggle]');
    for (var j = 0; j < buttons.length; j++) {
      var label = buttons[j].getAttribute('data-label-' + other);
      if (label) { buttons[j].setAttribute('aria-label', label); buttons[j].setAttribute('title', label); }
    }
  }
  function apply(theme) { root.setAttribute('data-theme', theme); refresh(theme); }

  apply(stored() || system());

  document.addEventListener('DOMContentLoaded', function () { refresh(root.getAttribute('data-theme')); });
  document.addEventListener('click', function (event) {
    var target = event.target;
    while (target && target !== document && !(target.hasAttribute && target.hasAttribute('data-theme-toggle'))) target = target.parentNode;
    if (!target || target === document) return;
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY, next); } catch (e) { /* stockage indisponible : le choix vaut pour la page */ }
    apply(next);
  });
  if (query && query.addEventListener) {
    query.addEventListener('change', function () { if (!stored()) apply(system()); });
  }
})();
