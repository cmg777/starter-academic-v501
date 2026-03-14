// Override Wowchemy's navbar scroll handler for reliable anchor navigation.
// The theme's jQuery.animate({scrollTop}) sometimes scrolls to the wrong section.
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var navbar = document.getElementById('navbar-main');
    if (!navbar) return;

    // Unbind the Wowchemy click handler on navbar links
    if (window.jQuery) {
      jQuery('#navbar-main li.nav-item a.nav-link').off('click');
    }

    // Rebind with a reliable native scroll
    var links = navbar.querySelectorAll('li.nav-item a.nav-link');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function (e) {
        var hash = this.getAttribute('href');
        if (!hash || hash.charAt(0) !== '#') return; // external link, let it go

        var target = document.getElementById(hash.substring(1));
        if (!target) return;

        e.preventDefault();

        var navHeight = navbar.offsetHeight || 70;
        var targetTop = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;

        window.scrollTo({ top: targetTop, behavior: 'smooth' });

        // Update URL hash without jumping
        if (window.history.replaceState) {
          window.history.replaceState(null, '', hash);
        }
      });
    }
  });

  // --- Fix: Prevent category dropdown from scrolling the page on /post/ ---
  // Wowchemy's .pub-filters change handler sets window.location.hash,
  // which triggers the hashchange listener and scrolls the page.
  // Override: use replaceState instead to avoid the scroll.

  // Block Wowchemy's hashchange scroll handler on filtering pages
  window.addEventListener('hashchange', function (e) {
    if (document.getElementById('container-publications')) {
      e.stopImmediatePropagation();
    }
  }, true); // capture phase, runs before Wowchemy's listener

})();
