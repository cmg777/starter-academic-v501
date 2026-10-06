# Publication featured-image enlargement

Publication pages displayed the shared “Click to enlarge” hint but did not load
the lightbox handler, which belongs to the post template. Publication featured
images now link to their original bundle asset. A small publication-only script
enhances that link with a native modal dialog; without JavaScript or dialog
support, the same link opens the original image normally.

The shared page-header partial branches only for publication images. The new
partial supplies English, Spanish and Japanese labels and loads fingerprinted
viewer CSS/JS only where needed. The viewer reuses the post close-button styling
and backdrop dismissal, without changing the post viewer or image assets.
Its close button is 44×44 pixels. Enter opens the link; Enter/Space, Escape and
backdrop clicks close the dialog. Tab/Shift+Tab remain on its sole control, and
closing restores focus and the body's previous overflow style. The real hint
sits below the image instead of covering the artwork.

Validation on Hugo Extended 0.111.3:

- Production build with `--gc --minify --buildFuture`: passed (existing `.Path`
  deprecation warning only); source and generated JS syntax checks passed.
- Built-output checks: all 122 publication pages with featured images have one
  localized dialog, a valid original-image link, and one viewer bundle; the 98
  English post pages do not include the new viewer. Okun image hashes unchanged
  in all three languages.
- Browser checks: desktop image/hint activation; Enter opening; Tab/Shift+Tab
  containment; Enter/Space/Escape/backdrop closing; focus return; three repeated
  open/Escape cycles; English/Spanish/Japanese controls; 390×844 layout and
  pointer activation with a 44×44 close button.
- Script-blocked preview (`Content-Security-Policy: script-src 'none'`): keyboard
  activation navigates directly to the original 1600×900 WebP.
- Existing `python_sc101` post viewer: open, next-image navigation and Escape
  still work; body scrolling is restored.

Mobile verification used the browser's narrow viewport and pointer activation,
not a physical touchscreen. No touch-only handlers or hover dependency were
introduced. The viewer has no transition-dependent close logic.
