/* Detail-page lightbox: click a sub-tile screenshot to view it full-screen,
   with prev/next, Esc to close, and an optional download link (e.g. PDF). */
(function () {
  'use strict';

  var views = Array.prototype.slice.call(document.querySelectorAll('.subtile-view'));
  var lb = document.getElementById('lb');
  if (!lb || !views.length) return;

  var img = lb.querySelector('.lb-img');
  var caption = lb.querySelector('.lb-caption');
  var download = lb.querySelector('.lb-download');
  var btnPrev = lb.querySelector('.lb-nav.prev');
  var btnNext = lb.querySelector('.lb-nav.next');
  var btnClose = lb.querySelector('.lb-close');
  var current = 0;
  var lastFocused = null;

  function show(i) {
    current = (i + views.length) % views.length;
    var v = views[current];
    var full = v.getAttribute('data-full');
    var cap = v.getAttribute('data-caption') || '';
    var pdf = v.getAttribute('data-pdf');
    img.src = full;
    img.alt = cap;
    caption.textContent = cap;
    if (pdf) {
      download.href = pdf;
      download.hidden = false;
    } else {
      download.hidden = true;
      download.removeAttribute('href');
    }
  }

  function open(i) {
    lastFocused = document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  function close() {
    lb.hidden = true;
    img.src = '';
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  views.forEach(function (v, i) {
    v.addEventListener('click', function () { open(i); });
  });
  btnPrev.addEventListener('click', function () { show(current - 1); });
  btnNext.addEventListener('click', function () { show(current + 1); });
  btnClose.addEventListener('click', close);
  lb.addEventListener('click', function (e) {
    // click on the dark backdrop (not on the image/controls) closes
    if (e.target === lb || e.target.classList.contains('lb-stage')) close();
  });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
  });
})();
