/* Publication-only enhancement. Posts retain their existing multi-image viewer. */
(function () {
  'use strict';
  var link = document.querySelector('.publication-image-link');
  var dialog = document.getElementById('publication-image-viewer');
  if (!link || !dialog || typeof dialog.showModal !== 'function') return;

  var image = dialog.querySelector('.publication-image-viewer-image');
  var closeButton = dialog.querySelector('.publication-image-viewer-close');
  var previousOverflow = '';
  link.setAttribute('aria-haspopup', 'dialog');
  link.setAttribute('aria-controls', dialog.id);

  link.addEventListener('click', function (event) {
    // Preserve browser actions such as opening the original in another tab.
    if (event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!dialog.open) {
      image.src = link.href;
      dialog.showModal();
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      closeButton.focus();
    }
    event.preventDefault();
  });

  closeButton.addEventListener('click', function () {
    dialog.close();
  });

  // This single-image viewer has one control. Keep Tab/Shift+Tab on it rather
  // than allowing the browser chrome to become the next focus destination.
  dialog.addEventListener('keydown', function (event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      closeButton.focus();
    }
  });

  // Native dialog supplies Escape dismissal and inert background content.
  // Match the post viewer's click-on-backdrop dismissal.
  dialog.addEventListener('click', function (event) {
    if (event.target !== dialog) return;
    var bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });

  dialog.addEventListener('close', function () {
    document.body.style.overflow = previousOverflow;
    image.removeAttribute('src');
    link.focus({ preventScroll: true });
  });
})();
