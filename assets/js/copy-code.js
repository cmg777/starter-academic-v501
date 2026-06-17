// Add a "copy to clipboard" button to the top-right corner of every code box.
// Site-wide: works on every post's <pre><code class="language-XXX"> block.
// Mermaid diagrams (language-mermaid) are excluded -- they render as SVGs.
(function () {
  // Inline SVGs (no Font Awesome dependency / load-timing issue).
  var COPY_SVG =
    '<svg class="cc-copy" width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" ' +
    'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>' +
    '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
  var CHECK_SVG =
    '<svg class="cc-check" width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" ' +
    'fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<polyline points="20 6 9 17 4 12"></polyline></svg>';

  // Localized labels, keyed by the page language (defaults to English).
  var LABELS = {
    en: { copy: 'Copy', copied: 'Copied!' },
    es: { copy: 'Copiar', copied: '¡Copiado!' },
    ja: { copy: 'コピー', copied: 'コピーしました' }
  };

  function pickLabels() {
    var lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
    return LABELS[lang] || LABELS.en;
  }

  function copyText(text) {
    // Modern API (secure context: HTTPS or localhost).
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for older / non-secure contexts.
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject();
      } catch (e) {
        reject(e);
      }
    });
  }

  function addButton(code, labels) {
    // Skip Mermaid diagrams (they are turned into SVGs).
    if (code.classList.contains('language-mermaid')) return;

    var pre = code.parentElement;
    if (!pre || pre.tagName !== 'PRE') return;
    // Guard against double-binding (e.g. if the script runs twice).
    if (pre.parentNode && pre.parentNode.classList &&
        pre.parentNode.classList.contains('code-copy-wrap')) return;

    // Wrap <pre> so the button stays pinned even when wide code scrolls.
    var wrap = document.createElement('div');
    wrap.className = 'code-copy-wrap';
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy-btn';
    btn.setAttribute('aria-label', labels.copy);
    btn.title = labels.copy;
    btn.innerHTML = COPY_SVG + CHECK_SVG + '<span class="cc-tip">' + labels.copied + '</span>';

    var resetTimer = null;
    btn.addEventListener('click', function () {
      copyText(code.textContent).then(function () {
        btn.classList.add('copied');
        btn.setAttribute('aria-label', labels.copied);
        if (resetTimer) clearTimeout(resetTimer);
        resetTimer = setTimeout(function () {
          btn.classList.remove('copied');
          btn.setAttribute('aria-label', labels.copy);
        }, 1500);
      }).catch(function () {
        /* clipboard blocked -- silently ignore */
      });
    });

    wrap.appendChild(btn);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var labels = pickLabels();
    var blocks = document.querySelectorAll('.article-style pre > code[class*="language-"]');
    for (var i = 0; i < blocks.length; i++) {
      addButton(blocks[i], labels);
    }
  });
})();
