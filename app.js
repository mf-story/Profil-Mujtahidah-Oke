/* Interactions: mobile menu, scroll-spy nav, reveal-on-scroll, stat count-up. */
(function () {
  'use strict';

  var body = document.body;

  // ---- Mobile menu ----
  var toggle = document.getElementById('menuToggle');
  var scrim = document.getElementById('scrim');
  function openMenu() { body.classList.add('menu-open'); if (scrim) scrim.hidden = false; toggle.setAttribute('aria-expanded', 'true'); }
  function closeMenu() { body.classList.remove('menu-open'); if (scrim) scrim.hidden = true; toggle.setAttribute('aria-expanded', 'false'); }
  if (toggle) toggle.addEventListener('click', function () {
    body.classList.contains('menu-open') ? closeMenu() : openMenu();
  });
  if (scrim) scrim.addEventListener('click', closeMenu);

  // Close menu when a nav link is tapped (delegated) + set it active immediately
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-nav]');
    if (!a) return;
    var id = a.getAttribute('data-nav');
    document.querySelectorAll('a[data-nav]').forEach(function (l) {
      l.classList.toggle('active', l.getAttribute('data-nav') === id);
    });
    closeMenu();
  });

  window.addEventListener('content:rendered', init);

  function init() {
    setupReveal();
    setupScrollSpy();
    setupCountUp();
  }

  // ---- Reveal on scroll ----
  function setupReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (n) { n.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (n) { io.observe(n); });
  }

  // ---- Scroll spy ----
  function setupScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('a[data-nav]'));
    var sections = links.map(function (l) { return document.getElementById(l.getAttribute('data-nav')); }).filter(Boolean);
    if (!('IntersectionObserver' in window) || !sections.length) return;

    // A section is active when it crosses the viewport's horizontal center line.
    // This is reliable for very tall sections (e.g. long publication lists).
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var id = en.target.id;
          links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('data-nav') === id); });
        }
      });
    }, { threshold: 0, rootMargin: '-50% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  // ---- Count-up stats ----
  function setupCountUp() {
    var nums = document.querySelectorAll('.num[data-count]');
    if (!('IntersectionObserver' in window)) {
      nums.forEach(function (n) { finalize(n); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animate(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io.observe(n); });
  }

  function finalize(node) {
    var target = parseInt(node.getAttribute('data-count'), 10) || 0;
    var span = node.querySelector('span');
    node.textContent = target;
    if (span) node.appendChild(span);
  }

  function animate(node) {
    var target = parseInt(node.getAttribute('data-count'), 10) || 0;
    var span = node.querySelector('span');
    var suffix = span ? span.outerHTML : '';
    var dur = 1100, start = null;
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / dur, 1);
      var val = Math.round((1 - Math.pow(1 - t, 3)) * target);
      node.innerHTML = val + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
})();
