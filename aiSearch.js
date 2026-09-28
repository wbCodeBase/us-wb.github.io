/* ══════════════════════════════════════════════════════════
   AI SEARCH OPTIMIZATION GUIDE — PAGE SCRIPT
══════════════════════════════════════════════════════════ */
(function () {
	'use strict';

	/* ── Navbar: scroll shadow, mobile menu, sub-menus ── */
	const navbar = document.getElementById('navbar');
	const navToggle = document.getElementById('navToggle');
	const navMenu = document.getElementById('navMenu');

	if (navbar) {
		window.addEventListener('scroll', () => {
			navbar.classList.toggle('scrolled', window.scrollY > 20);
		}, { passive: true });
	}

	function closeMenu() {
		if (!navMenu) return;
		navMenu.classList.remove('open');
		navToggle.classList.remove('open');
		navToggle.setAttribute('aria-expanded', false);
		navbar.classList.remove('menu-open');
	}

	if (navToggle && navMenu) {
		navToggle.addEventListener('click', (e) => {
			e.stopPropagation();
			const open = navMenu.classList.toggle('open');
			navToggle.classList.toggle('open', open);
			navToggle.setAttribute('aria-expanded', open);
			navbar.classList.toggle('menu-open', open);
		});
		document.addEventListener('click', (e) => {
			if (!navbar.contains(e.target)) closeMenu();
		});
	}

	document.querySelectorAll('.has-mega > .nav-link, .has-dropdown > .nav-link').forEach(link => {
		link.addEventListener('click', (e) => {
			if (window.innerWidth > 980) return;
			e.preventDefault();
			const item = link.closest('.nav-item');
			const isOpen = item.classList.contains('open');
			document.querySelectorAll('.has-mega, .has-dropdown').forEach(i => i.classList.remove('open'));
			if (!isOpen) item.classList.add('open');
		});
	});

	/* ── Navbar on dark sections ── */
	const darkSections = document.querySelectorAll('[data-nav-theme="dark"]');
	function updateNavTheme() {
		if (!navbar) return;
		const navH = navbar.offsetHeight + 10;
		let isDark = false;
		darkSections.forEach(sec => {
			const r = sec.getBoundingClientRect();
			if (r.top <= navH && r.bottom >= 0) isDark = true;
		});
		navbar.classList.toggle('nav-on-dark', isDark);
	}

	/* ── Reading progress ── */
	const progress = document.getElementById('readProgress');
	const article = document.querySelector('.gd-body');
	function updateProgress() {
		if (!progress || !article) return;
		const r = article.getBoundingClientRect();
		const total = r.height - window.innerHeight;
		const pct = Math.min(1, Math.max(0, -r.top / (total > 0 ? total : 1)));
		progress.style.width = (pct * 100) + '%';
	}

	/* ── TOC scrollspy ── */
	const tocLinks = Array.from(document.querySelectorAll('.toc-list a'));
	const tocTargets = tocLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
	function updateSpy() {
		const line = window.innerHeight * 0.3;
		let current = -1;
		tocTargets.forEach((sec, i) => {
			if (sec.getBoundingClientRect().top <= line) current = i;
		});
		tocLinks.forEach((a, i) => a.classList.toggle('active', i === current));
	}

	/* ── Back-to-top + mobile contents button ── */
	const toTop = document.getElementById('toTop');
	const tocFab = document.getElementById('tocFab');
	const guideEl = document.getElementById('guide');
	function updateFloaters() {
		if (toTop) toTop.classList.toggle('show', window.scrollY > window.innerHeight * 0.8);
		if (tocFab && guideEl) {
			const r = guideEl.getBoundingClientRect();
			const inGuide = r.top < window.innerHeight * 0.5 && r.bottom > window.innerHeight * 0.5;
			tocFab.style.opacity = inGuide ? '1' : '0';
			tocFab.style.pointerEvents = inGuide ? 'auto' : 'none';
		}
	}
	if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

	let ticking = false;
	function onScroll() {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(() => {
			updateNavTheme();
			updateProgress();
			updateSpy();
			updateFloaters();
			ticking = false;
		});
	}
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll);
	onScroll();

	/* ── Contents bottom sheet (mobile) ── */
	const toc = document.getElementById('toc');
	const tocClose = document.getElementById('tocClose');
	if (toc && tocFab) {
		tocFab.addEventListener('click', (e) => {
			e.stopPropagation();
			toc.classList.toggle('sheet-open');
		});
		document.addEventListener('click', (e) => {
			if (toc.classList.contains('sheet-open') && !toc.contains(e.target)) toc.classList.remove('sheet-open');
		});
		if (tocClose) tocClose.addEventListener('click', () => toc.classList.remove('sheet-open'));
		tocLinks.forEach(a => a.addEventListener('click', () => toc.classList.remove('sheet-open')));
	}

	/* ── Copy link ── */
	const copyBtn = document.getElementById('copyLink');
	if (copyBtn) {
		copyBtn.addEventListener('click', () => {
			const done = () => {
				copyBtn.classList.add('copied');
				copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
				setTimeout(() => { copyBtn.classList.remove('copied'); copyBtn.innerHTML = '<i class="fa-solid fa-link"></i>'; }, 1800);
			};
			if (navigator.clipboard) navigator.clipboard.writeText(window.location.href).then(done, () => {});
		});
	}

	/* ── Ticker: duplicate items for a seamless loop ── */
	const ticker = document.querySelector('.ticker-tr');
	if (ticker) {
		Array.from(ticker.children).forEach(s => ticker.appendChild(s.cloneNode(true)));
		requestAnimationFrame(() => {
			ticker.style.animationDuration = Math.max(18, (ticker.scrollWidth / 2) / 80) + 's';
		});
	}

	/* ── Series links: pages not yet published carry data-soon.
	   Remove the attribute from a link once its page is live. ── */
	const toast = document.getElementById('soonToast');
	let toastTimer;
	document.querySelectorAll('a[data-soon]').forEach(a => {
		a.addEventListener('click', (e) => {
			e.preventDefault();
			if (!toast) return;
			const title = (a.querySelector('h3') || a).textContent.trim();
			toast.innerHTML = '<i class="fa-solid fa-hourglass-half"></i>' + title + ' guide is coming soon';
			toast.classList.add('show');
			clearTimeout(toastTimer);
			toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
		});
	});

	/* ── Accordions (one open per group) ── */
	document.querySelectorAll('[data-acc]').forEach(group => {
		group.querySelectorAll('.acc-btn').forEach(btn => {
			btn.addEventListener('click', () => {
				const item = btn.closest('.acc-item');
				const isOpen = item.classList.contains('open');
				group.querySelectorAll('.acc-item').forEach(i => {
					i.classList.remove('open');
					i.querySelector('.acc-btn').setAttribute('aria-expanded', 'false');
				});
				if (!isOpen) {
					item.classList.add('open');
					btn.setAttribute('aria-expanded', 'true');
				}
			});
		});
	});

	/* ── Share links ── */
	const pageUrl = encodeURIComponent(window.location.href);
	document.querySelectorAll('[data-share]').forEach(a => { a.href = a.href + pageUrl; });

	/* ── Reveal on scroll ── */
	const revealEls = document.querySelectorAll('.reveal');
	if (revealEls.length && 'IntersectionObserver' in window) {
		const obs = new IntersectionObserver(entries => {
			entries.forEach(e => {
				if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
			});
		}, { threshold: 0.12 });
		revealEls.forEach(el => obs.observe(el));
	} else {
		revealEls.forEach(el => el.classList.add('in'));
	}

	/* ── Proposal modal ── */
	const pmOverlay = document.getElementById('pmOverlay');
	const pm = document.getElementById('pm');
	const pmForm = document.getElementById('pmForm');
	let lastFocus = null;

	function openProposal(e) {
		if (e) e.preventDefault();
		lastFocus = document.activeElement;
		pmOverlay.classList.add('open');
		pmOverlay.setAttribute('aria-hidden', 'false');
		document.body.style.overflow = 'hidden';
		setTimeout(() => { const f = document.getElementById('pmFirst'); if (f) f.focus(); }, 80);
	}
	function closeProposal() {
		pmOverlay.classList.remove('open');
		pmOverlay.setAttribute('aria-hidden', 'true');
		document.body.style.overflow = '';
		if (lastFocus) lastFocus.focus();
	}
	document.querySelectorAll('[data-open-proposal]').forEach(el => el.addEventListener('click', openProposal));
	if (pmOverlay) {
		document.getElementById('pmClose').addEventListener('click', closeProposal);
		pmOverlay.addEventListener('click', (e) => { if (e.target === pmOverlay) closeProposal(); });
		document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && pmOverlay.classList.contains('open')) closeProposal(); });
	}
	if (pmForm) {
		pmForm.addEventListener('submit', (e) => {
			e.preventDefault();
			if (!pmForm.reportValidity()) return;
			/* TODO: POST the form data to your CRM / email endpoint here */
			pm.classList.add('sent');
		});
	}

	/* ══════════════════════════════════════════════
	   LINE CHART: LLM vs organic search value
	══════════════════════════════════════════════ */
	const chartEl = document.getElementById('valueChart');
	if (chartEl) {
		const data = [
			{ year: 2024, llm: 8,   org: 100 },
			{ year: 2025, llm: 22,  org: 97 },
			{ year: 2026, llm: 45,  org: 92 },
			{ year: 2027, llm: 72,  org: 86 },
			{ year: 2028, llm: 100, org: 80 },
			{ year: 2029, llm: 130, org: 74 }
		];
		const series = [
			{ key: 'llm', name: 'LLM search value',     color: '#1877F2', dash: '' },
			{ key: 'org', name: 'Organic search value', color: '#d97706', dash: '6 4' }
		];

		/* Accessible table view */
		const tbody = document.querySelector('#valueTable tbody');
		if (tbody) tbody.innerHTML = data.map(d => `<tr><td>${d.year}</td><td>${d.llm}</td><td>${d.org}</td></tr>`).join('');

		const W = 760, H = 320, m = { t: 20, r: 120, b: 36, l: 40 };
		const iw = W - m.l - m.r, ih = H - m.t - m.b;
		const yMax = 140;
		const x = i => m.l + (i / (data.length - 1)) * iw;
		const y = v => m.t + ih - (v / yMax) * ih;
		const ns = 'http://www.w3.org/2000/svg';

		let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="${ns}" aria-hidden="true">`;
		for (let v = 0; v <= yMax; v += 35) {
			svg += `<line class="grid-l" x1="${m.l}" x2="${m.l + iw}" y1="${y(v)}" y2="${y(v)}"/>`;
			svg += `<text class="axis-t" x="${m.l - 10}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
		}
		data.forEach((d, i) => {
			svg += `<text class="axis-t" x="${x(i)}" y="${H - 10}" text-anchor="middle">${d.year}</text>`;
		});
		series.forEach(s => {
			const pts = data.map((d, i) => `${x(i)},${y(d[s.key])}`).join(' ');
			svg += `<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" ${s.dash ? `stroke-dasharray="${s.dash}"` : ''}/>`;
			const last = data[data.length - 1];
			svg += `<text class="lbl" x="${x(data.length - 1) + 12}" y="${y(last[s.key]) + 4}">${s.key === 'llm' ? 'LLM' : 'Organic'}</text>`;
		});
		svg += `<line id="chCross" x1="0" x2="0" y1="${m.t}" y2="${m.t + ih}" stroke="#9ca3af" stroke-width="1" opacity="0"/>`;
		series.forEach(s => {
			svg += `<circle class="ch-dot" data-k="${s.key}" r="5" fill="${s.color}" stroke="#fff" stroke-width="2" opacity="0"/>`;
		});
		svg += `<rect id="chHit" x="${m.l}" y="${m.t}" width="${iw}" height="${ih}" fill="transparent"/>`;
		svg += '</svg>';

		chartEl.innerHTML = svg + '<div class="chart-tip" id="chTip"></div>';

		const svgEl = chartEl.querySelector('svg');
		const cross = svgEl.querySelector('#chCross');
		const dots = svgEl.querySelectorAll('.ch-dot');
		const tip = chartEl.querySelector('#chTip');

		function showAt(clientX) {
			const r = svgEl.getBoundingClientRect();
			const sx = (clientX - r.left) * (W / r.width);
			const i = Math.max(0, Math.min(data.length - 1, Math.round(((sx - m.l) / iw) * (data.length - 1))));
			const d = data[i];
			const px = x(i);
			cross.setAttribute('x1', px); cross.setAttribute('x2', px); cross.setAttribute('opacity', 1);
			dots.forEach(c => {
				c.setAttribute('cx', px);
				c.setAttribute('cy', y(d[c.dataset.k]));
				c.setAttribute('opacity', 1);
			});
			tip.innerHTML = `<b>${d.year}</b><br>` + series.map(s =>
				`<span class="sw" style="background:${s.color}"></span>${s.name}: <b>${d[s.key]}</b>`).join('<br>');
			const scale = r.width / W;
			tip.style.left = (px * scale) + 'px';
			tip.style.top = (y(Math.max(d.llm, d.org)) * scale) + 'px';
			tip.classList.add('show');
		}
		function hide() {
			cross.setAttribute('opacity', 0);
			dots.forEach(c => c.setAttribute('opacity', 0));
			tip.classList.remove('show');
		}
		const hit = svgEl.querySelector('#chHit');
		hit.addEventListener('mousemove', e => showAt(e.clientX));
		hit.addEventListener('mouseleave', hide);
		hit.addEventListener('touchstart', e => showAt(e.touches[0].clientX), { passive: true });
		hit.addEventListener('touchmove', e => showAt(e.touches[0].clientX), { passive: true });
		hit.addEventListener('touchend', hide);
	}
})();
