/* Social MapWork: light/dark toggle.
   The saved choice is applied early by a tiny script in each page's <head>;
   this file wires up the navbar button. Without a saved choice the page
   follows the device setting (prefers-color-scheme). */
(function () {
	var KEY = 'smw-theme';
	var root = document.documentElement;
	var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
	var buttons = document.querySelectorAll('.theme-toggle');

	function current() {
		var forced = root.getAttribute('data-theme');
		if (forced === 'dark' || forced === 'light') return forced;
		return media && media.matches ? 'dark' : 'light';
	}

	function refresh() {
		var isDark = current() === 'dark';
		var label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
		for (var i = 0; i < buttons.length; i++) {
			buttons[i].setAttribute('aria-label', label);
			buttons[i].setAttribute('title', label);
			buttons[i].setAttribute('aria-pressed', isDark ? 'true' : 'false');
		}
	}

	function toggle() {
		var next = current() === 'dark' ? 'light' : 'dark';
		root.setAttribute('data-theme', next);
		try { window.localStorage.setItem(KEY, next); } catch (e) { /* storage blocked: still switches for this page */ }
		refresh();
	}

	for (var i = 0; i < buttons.length; i++) {
		buttons[i].addEventListener('click', toggle);
	}

	if (media) {
		if (media.addEventListener) media.addEventListener('change', refresh);
		else if (media.addListener) media.addListener(refresh);
	}

	refresh();
})();
