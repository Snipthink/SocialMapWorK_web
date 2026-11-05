/* Social MapWork home page: mission cards, "how a problem gets solved"
   journey, and the "Be a part of change" pledge.
   Works without JavaScript too: every mission panel is visible then. */
(function () {
	var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ---------- Mission cards ---------- */
	var tiles = document.querySelectorAll('.mission-tile');
	var panels = document.querySelectorAll('.mission-panel');
	if (tiles.length && panels.length) {
		document.documentElement.classList.add('missions-js');

		var select = function (tile, focusPanel) {
			for (var i = 0; i < tiles.length; i++) {
				var on = tiles[i] === tile;
				tiles[i].setAttribute('aria-expanded', on ? 'true' : 'false');
				tiles[i].classList.toggle('is-active', on);
				var p = document.getElementById(tiles[i].getAttribute('aria-controls'));
				if (p) {
					p.hidden = !on;
					p.classList.toggle('is-active', on);
				}
			}
			if (focusPanel) {
				var panel = document.getElementById(tile.getAttribute('aria-controls'));
				if (panel && panel.getBoundingClientRect().top > window.innerHeight - 120) {
					panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
				}
			}
		};

		for (var t = 0; t < tiles.length; t++) {
			tiles[t].addEventListener('click', function () { select(this, true); });
		}
		select(tiles[0], false);
	}

	/* ---------- Journey: steps light up as they scroll into view ---------- */
	var steps = document.querySelectorAll('.journey-step');
	if (steps.length) {
		if (reduceMotion || !('IntersectionObserver' in window)) {
			for (var s = 0; s < steps.length; s++) steps[s].classList.add('is-lit');
		} else {
			document.documentElement.classList.add('journey-js');
			var io = new IntersectionObserver(function (entries) {
				for (var e = 0; e < entries.length; e++) {
					if (!entries[e].isIntersecting) continue;
					var all = entries[e].target.parentNode.querySelectorAll('.journey-step');
					for (var k = 0; k < all.length; k++) {
						(function (el, delay) { setTimeout(function () { el.classList.add('is-lit'); }, delay); })(all[k], k * 220);
					}
					io.disconnect();
				}
			}, { threshold: 0.35 });
			io.observe(steps[0].parentNode);
		}
	}

	/* ---------- Pledge ---------- */
	var KEY = 'smw-pledge';
	var card = document.querySelector('.pledge-card');
	if (card) {
		var boxes = card.querySelectorAll('.pledge-options input[type="checkbox"]');
		var bar = card.querySelector('.pledge-bar');
		var status = card.querySelector('.pledge-status');
		var done = card.querySelector('.pledge-done');
		var share = card.querySelector('.pledge-share');

		var saved = [];
		try { saved = JSON.parse(window.localStorage.getItem(KEY) || '[]') || []; } catch (err) { saved = []; }
		for (var b = 0; b < boxes.length; b++) {
			if (saved.indexOf(boxes[b].value) !== -1) boxes[b].checked = true;
		}

		var update = function () {
			var chosen = [];
			for (var i = 0; i < boxes.length; i++) {
				boxes[i].parentNode.classList.toggle('is-checked', boxes[i].checked);
				if (boxes[i].checked) chosen.push(boxes[i].value);
			}
			bar.style.width = (chosen.length / boxes.length * 100) + '%';
			status.textContent = chosen.length === boxes.length
				? 'All 4 chosen. You are all in!'
				: chosen.length + ' of ' + boxes.length + ' chosen';
			done.hidden = chosen.length === 0;
			card.classList.toggle('is-complete', chosen.length === boxes.length);
			try { window.localStorage.setItem(KEY, JSON.stringify(chosen)); } catch (err) { /* storage blocked */ }
		};

		for (var c = 0; c < boxes.length; c++) boxes[c].addEventListener('change', update);
		update();

		if (share) {
			share.addEventListener('click', function () {
				var data = {
					title: 'Social MapWork',
					text: 'I joined the Social MapWork mission for a better society. Be a part of change:',
					url: 'https://socialmapwork.com/'
				};
				var label = share.innerHTML;
				var flash = function (msg) {
					share.textContent = msg;
					setTimeout(function () { share.innerHTML = label; }, 2000);
				};
				if (navigator.share) {
					navigator.share(data).catch(function () { /* cancelled */ });
				} else if (navigator.clipboard && navigator.clipboard.writeText) {
					navigator.clipboard.writeText(data.text + ' ' + data.url).then(function () { flash('Link copied'); }, function () { flash('socialmapwork.com'); });
				} else {
					flash('socialmapwork.com');
				}
			});
		}
	}
})();
