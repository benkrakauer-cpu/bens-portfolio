/* Accordion tiles: accessible expand/collapse. No dependencies. */
(function () {
  'use strict';

  function setLabel(btn, open) {
    var more = btn.querySelector('.tile-more');
    if (!more) return;
    // First child node is the text ("Read more"); keep the chevron svg intact.
    var text = open ? 'Show less' : 'Read more';
    if (more.firstChild && more.firstChild.nodeType === Node.TEXT_NODE) {
      more.firstChild.nodeValue = text;
    }
  }

  function setOpen(tile, btn, panel, open) {
    tile.setAttribute('data-open', open ? 'true' : 'false');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    // inert keeps collapsed links out of the tab order and the a11y tree.
    if (open) {
      panel.removeAttribute('inert');
    } else {
      panel.setAttribute('inert', '');
    }
    setLabel(btn, open);
  }

  function init() {
    var toggles = document.querySelectorAll('.tile-toggle');
    toggles.forEach(function (btn) {
      var tile = btn.closest('.tile');
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!tile || !panel) return;

      // Start collapsed.
      setOpen(tile, btn, panel, false);

      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        setOpen(tile, btn, panel, !open);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
