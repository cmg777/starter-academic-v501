// MathJax Configuration (overrides Wowchemy theme default)
//
// processEscapes: true — allows \$ to render as a literal dollar sign,
// preventing currency amounts like $1,736 from being interpreted as
// inline math delimiters.
window.MathJax = {
  tex: {
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)'],
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]'],
    ],
    processEscapes: true,
    packages: {'[+]': ['noerrors']},
  },
  loader: {
    load: ['[tex]/noerrors'],
  },
};
