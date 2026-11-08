/* AI-KIDO — barre « Sur cette page » de l'accueil.
   Cachée en haut de page (le héros occupe l'écran), elle apparaît quand on fait défiler
   et met en valeur la section visible. Sans script, elle reste cachée : le menu principal suffit. */
(function () {
  var bar = document.querySelector('[data-home-subnav]');
  var hero = document.querySelector('.hero');
  if (!bar || !hero || !('IntersectionObserver' in window)) { return; }

  var links = Array.prototype.slice.call(bar.querySelectorAll('a[href^="#"]'));
  var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });

  /* Apparition : dès que le bas du héros passe sous l'en-tête */
  new IntersectionObserver(function (entries) {
    var visible = entries[0].isIntersecting;
    bar.classList.toggle('is-on', !visible);
    document.documentElement.classList.toggle('has-subnav', !visible);
  }, { rootMargin: '-80px 0px 0px 0px', threshold: 0 }).observe(hero);

  /* Section courante : celle qui coupe la ligne placée au tiers haut de l'écran */
  var current = null;
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { current = entry.target; }
    });
    links.forEach(function (a, i) {
      var on = targets[i] === current;
      if (on) { a.setAttribute('aria-current', 'location'); } else { a.removeAttribute('aria-current'); }
      if (on && bar.classList.contains('is-on')) {
        var nav = a.parentNode;
        var left = a.offsetLeft - nav.offsetWidth / 2 + a.offsetWidth / 2;
        if (nav.scrollTo) { nav.scrollTo({ left: left, behavior: 'smooth' }); }
      }
    });
  }, { rootMargin: '-30% 0px -65% 0px', threshold: 0 });
  targets.forEach(function (t) { if (t) { spy.observe(t); } });
})();
