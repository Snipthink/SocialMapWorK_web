/* Social MapWork home page: mission cards, "how a problem gets solved"
   journey, and the "Be a part of change" pledge.
   Works without JavaScript too: every mission panel is visible then. */
(function () {
	var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ---------- Accident alert story player ---------- */
	var player = document.querySelector('.story-player');
	if (player) {
		var chapters = player.querySelectorAll('.story-chapter');
		var controls = player.querySelector('.story-controls');
		var prevBtn = player.querySelector('.story-prev');
		var nextBtn = player.querySelector('.story-next');
		var playBtn = player.querySelector('.story-play');
		var dots = player.querySelectorAll('.story-dot');
		var index = 0;
		var timer = null;
		var STEP_MS = 5500;

		player.classList.add('story-js');
		controls.hidden = false;

		var setPlayLabel = function (state) {
			var icon = state === 'playing' ? 'fa-pause' : (state === 'ended' ? 'fa-redo' : 'fa-play');
			var text = state === 'playing' ? 'Pause' : (state === 'ended' ? 'Replay the story' : 'Play the story');
			playBtn.innerHTML = '<i class="fas ' + icon + '" aria-hidden="true"></i><span>' + text + '</span>';
		};

		var show = function (i) {
			index = Math.max(0, Math.min(chapters.length - 1, i));
			for (var c = 0; c < chapters.length; c++) {
				var on = c === index;
				chapters[c].classList.toggle('is-active', on);
				if (dots[c]) {
					dots[c].classList.toggle('is-active', on);
					if (on) dots[c].setAttribute('aria-current', 'step'); else dots[c].removeAttribute('aria-current');
				}
			}
			prevBtn.disabled = index === 0;
			nextBtn.disabled = index === chapters.length - 1;
		};

		var stop = function (state) {
			if (timer) { clearInterval(timer); timer = null; }
			setPlayLabel(state || 'paused');
		};

		var play = function () {
			if (index === chapters.length - 1) show(0);
			setPlayLabel('playing');
			timer = setInterval(function () {
				if (index >= chapters.length - 1) { stop('ended'); return; }
				show(index + 1);
				if (index === chapters.length - 1) stop('ended');
			}, STEP_MS);
		};

		playBtn.addEventListener('click', function () { if (timer) stop(); else play(); });
		prevBtn.addEventListener('click', function () { stop(); show(index - 1); });
		nextBtn.addEventListener('click', function () { stop(); show(index + 1); });
		for (var d = 0; d < dots.length; d++) {
			(function (n) { dots[n].addEventListener('click', function () { stop(); show(n); }); })(d);
		}
		player.addEventListener('keydown', function (e) {
			if (e.target.closest && e.target.closest('.story-controls')) {
				if (e.key === 'ArrowRight') { stop(); show(index + 1); }
				if (e.key === 'ArrowLeft') { stop(); show(index - 1); }
			}
		});
		show(0);
		setPlayLabel('paused');
	}

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
