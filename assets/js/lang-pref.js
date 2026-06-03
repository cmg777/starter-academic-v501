/* lang-pref.js — remembers the visitor's MANUAL language choice in a cookie
   (`lang_pref`) so the geolocation edge function
   (netlify/edge-functions/geo-lang.ts) never overrides it.
   Bundled site-wide via params.yaml `plugins_js`. */
(function () {
  var KNOWN = { es: 1, ja: 1 }; // root "/" = en (default language)

  function langFromPath(p) {
    var seg = (p || "/").split("/")[1] || "";
    return KNOWN[seg] ? seg : "en";
  }

  function setLang(l) {
    if (!l) return;
    document.cookie =
      "lang_pref=" + l + ";path=/;max-age=31536000;SameSite=Lax" +
      (location.protocol === "https:" ? ";Secure" : "");
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Stamp the cookie to the language of the page currently being viewed.
    setLang(langFromPath(location.pathname));

    // Update it the moment the user clicks a language in the navbar switcher.
    var dd = document.querySelector(".i18n-dropdown");
    if (!dd) return; // no-op on a single-language page (dropdown absent)
    dd.querySelectorAll("a.dropdown-item[href]").forEach(function (a) {
      a.addEventListener("click", function () {
        var path;
        try {
          path = new URL(a.getAttribute("href"), location.origin).pathname;
        } catch (e) {
          path = a.getAttribute("href");
        }
        setLang(langFromPath(path));
      });
    });
  });
})();
