(function () {
  'use strict';

  // Mobile navigation toggle
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Table of contents: highlight the heading currently in view
  var toc = document.querySelector('.toc');
  if (toc && 'IntersectionObserver' in window) {
    var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var targets = Object.keys(byId).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var visible = {};
    var setActive = function () {
      var best = null;
      for (var i = 0; i < targets.length; i++) {
        var t = targets[i];
        if (visible[t.id]) { best = t; break; }
      }
      if (!best) {
        // nothing in view: pick the last heading above the fold
        var top = window.scrollY + 120;
        for (var j = 0; j < targets.length; j++) { if (targets[j].offsetTop <= top) best = targets[j]; }
      }
      links.forEach(function (a) { a.classList.remove('active'); });
      if (best && byId[best.id]) byId[best.id].classList.add('active');
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
      setActive();
    }, { rootMargin: '-80px 0px -60% 0px', threshold: 0 });
    targets.forEach(function (t) { io.observe(t); });
    window.addEventListener('scroll', setActive, { passive: true });
    setActive();
    // On phones the TOC is a <details>; close it after choosing an entry
    toc.addEventListener('click', function (e) {
      if (e.target.closest('a') && toc.tagName === 'DETAILS' && window.innerWidth < 1024) toc.removeAttribute('open');
    });
  }

  // Lightbox for screenshots
  var box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', '화면 캡처 확대 보기');
  box.innerHTML = '<button type="button" aria-label="닫기">&times;</button><img alt=""><figcaption></figcaption>';
  document.body.appendChild(box);
  var boxImg = box.querySelector('img');
  var boxCap = box.querySelector('figcaption');
  var lastFocus = null;
  function openBox(href, caption) {
    boxImg.src = href;
    boxCap.textContent = caption || '';
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
    lastFocus = document.activeElement;
    box.querySelector('button').focus();
  }
  function closeBox() {
    box.classList.remove('open');
    boxImg.removeAttribute('src');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('.shot a');
    if (a) {
      e.preventDefault();
      var cap = a.parentNode.querySelector('figcaption');
      openBox(a.getAttribute('href'), cap ? cap.textContent : a.querySelector('img').alt);
      return;
    }
    if (box.classList.contains('open') && (e.target === box || e.target.closest('.lightbox button'))) closeBox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && box.classList.contains('open')) closeBox();
  });
})();
