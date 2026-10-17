(function () {
	'use strict';

	const root = document.documentElement;
	const body = document.body;
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	root.classList.add('js');

	// ---------- Footer year ----------
	const year = document.getElementById('year');
	if (year) year.textContent = new Date().getFullYear();

	// ---------- Theme toggle ----------
	const themeBtn = document.getElementById('theme-toggle');
	const themeMeta = document.querySelector('meta[name="theme-color"]');

	function applyTheme(theme) {
		root.setAttribute('data-theme', theme);
		if (themeMeta) themeMeta.setAttribute('content', theme === 'light' ? '#fafafa' : '#171c24');
		themeBtn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
	}

	applyTheme(root.getAttribute('data-theme') || 'dark');

	themeBtn.addEventListener('click', () => {
		const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
		applyTheme(next);
		try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
	});

	// ---------- Header: background on scroll ----------
	const header = document.querySelector('.site-header');
	const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
	onScroll();
	window.addEventListener('scroll', onScroll, { passive: true });

	// ---------- Mobile menu ----------
	const menuBtn = document.getElementById('menu-btn');
	const navLinks = document.querySelectorAll('.nav-links a');

	function setMenu(open) {
		body.classList.toggle('menu-open', open);
		menuBtn.setAttribute('aria-expanded', String(open));
		menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
	}

	menuBtn.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
	navLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
	document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
	window.addEventListener('resize', () => { if (window.innerWidth > 860) setMenu(false); });

	// ---------- Active nav link ----------
	const sections = Array.from(navLinks)
		.map((link) => document.querySelector(link.getAttribute('href')))
		.filter(Boolean);

	const navObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;
			navLinks.forEach((link) => {
				link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
			});
		});
	}, { rootMargin: '-45% 0px -50% 0px' });

	sections.forEach((s) => navObserver.observe(s));

	// ---------- Reveal on scroll ----------
	const revealEls = document.querySelectorAll('.reveal');

	// Stagger siblings inside the same parent
	revealEls.forEach((el) => {
		const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains('reveal'));
		const i = siblings.indexOf(el);
		if (i > 0) el.style.setProperty('--d', Math.min(i * 70, 420) + 'ms');
	});

	if (reduceMotion || !('IntersectionObserver' in window)) {
		revealEls.forEach((el) => el.classList.add('in'));
	} else {
		const revealObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('in');
					revealObserver.unobserve(entry.target);
				}
			});
		}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
		revealEls.forEach((el) => revealObserver.observe(el));
	}

	// ---------- Animated counters ----------
	const counters = document.querySelectorAll('.count');
	if (!reduceMotion) {
		const countObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				const el = entry.target;
				const to = parseInt(el.dataset.to, 10);
				const start = performance.now();
				const duration = 1400;
				const tick = (now) => {
					const p = Math.min((now - start) / duration, 1);
					el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
					if (p < 1) requestAnimationFrame(tick);
				};
				el.textContent = '0';
				requestAnimationFrame(tick);
				countObserver.unobserve(el);
			});
		}, { threshold: 0.6 });
		counters.forEach((c) => countObserver.observe(c));
	}

	// ---------- Terminal typing ----------
	const terminal = document.getElementById('terminal');
	if (terminal && !reduceMotion) {
		const lines = Array.from(terminal.querySelectorAll('.line'));
		const last = lines.pop(); // prompt with cursor stays visible
		const html = lines.map((l) => l.innerHTML);
		lines.forEach((l) => { l.innerHTML = '&nbsp;'; l.style.visibility = 'hidden'; });
		last.style.visibility = 'hidden';

		let i = 0;
		const typeLine = () => {
			if (i >= lines.length) {
				last.style.visibility = '';
				return;
			}
			const line = lines[i];
			line.style.visibility = '';
			if (line.classList.contains('o')) {
				// Output appears at once
				line.innerHTML = html[i];
				i++;
				setTimeout(typeLine, 260);
				return;
			}
			// Commands are typed out
			const prompt = '<span class="p">$</span> ';
			const text = html[i].replace(prompt, '');
			let n = 0;
			const step = () => {
				line.innerHTML = prompt + text.slice(0, n) + '<span class="cursor"></span>';
				if (n < text.length) {
					n++;
					setTimeout(step, 28 + Math.random() * 40);
				} else {
					line.innerHTML = prompt + text;
					i++;
					setTimeout(typeLine, 380);
				}
			};
			step();
		};

		const termObserver = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) {
				setTimeout(typeLine, 500);
				termObserver.disconnect();
			}
		});
		termObserver.observe(terminal);
	}

	// ---------- Diagram data packets travelling along flow edges ----------
	if (!reduceMotion) {
		const SVG_NS = 'http://www.w3.org/2000/svg';
		document.querySelectorAll('.dg .e.flow').forEach((path, i) => {
			path.id = path.id || 'flow-' + i;
			const dot = document.createElementNS(SVG_NS, 'circle');
			dot.setAttribute('r', '3.5');
			dot.setAttribute('class', 'pkt');
			const motion = document.createElementNS(SVG_NS, 'animateMotion');
			motion.setAttribute('dur', (1.6 + (i % 3) * 0.3) + 's');
			motion.setAttribute('begin', -((i % 4) * 0.4) + 's');
			motion.setAttribute('repeatCount', 'indefinite');
			const mpath = document.createElementNS(SVG_NS, 'mpath');
			mpath.setAttribute('href', '#' + path.id);
			motion.appendChild(mpath);
			dot.appendChild(motion);
			path.parentNode.appendChild(dot);
		});
	}

	// ---------- Card cursor spotlight ----------
	if (window.matchMedia('(hover: hover)').matches) {
		document.querySelectorAll('.spot').forEach((card) => {
			card.addEventListener('pointermove', (e) => {
				const r = card.getBoundingClientRect();
				card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
				card.style.setProperty('--my', (e.clientY - r.top) + 'px');
			});
		});
	}

	// ---------- Experience duration (since Dec 2024) ----------
	const expEl = document.getElementById('exp-duration');
	if (expEl) {
		const now = new Date();
		const months = (now.getFullYear() - 2024) * 12 + (now.getMonth() - 11) + 1;
		const y = Math.floor(months / 12);
		const m = months % 12;
		expEl.textContent = (y ? y + ' yr' + (y > 1 ? 's' : '') : '') + (y && m ? ' ' : '') + (m ? m + ' mo' : '');
	}

	// ---------- Case study tabs ----------
	const tabs = Array.from(document.querySelectorAll('.case-tab'));
	const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));

	function selectTab(index, focus) {
		tabs.forEach((tab, i) => {
			const active = i === index;
			tab.setAttribute('aria-selected', String(active));
			tab.tabIndex = active ? 0 : -1;
			panels[i].hidden = !active;
			if (active) {
				panels[i].classList.remove('enter');
				void panels[i].offsetWidth; // restart the entrance animation
				panels[i].classList.add('enter');
			}
		});
		if (focus) {
			tabs[index].focus();
			tabs[index].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
		}
	}

	if (tabs.length) {
		panels.forEach((p, i) => { p.hidden = i !== 0; });
		tabs.forEach((tab, i) => {
			tab.addEventListener('click', () => selectTab(i, false));
			tab.addEventListener('keydown', (e) => {
				const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
				if (e.key in keys) {
					e.preventDefault();
					selectTab((i + keys[e.key] + tabs.length) % tabs.length, true);
				} else if (e.key === 'Home') {
					e.preventDefault();
					selectTab(0, true);
				} else if (e.key === 'End') {
					e.preventDefault();
					selectTab(tabs.length - 1, true);
				}
			});
		});
	}

	// ---------- Project filters ----------
	const filterBtns = document.querySelectorAll('.filter');
	const projects = document.querySelectorAll('.project');

	filterBtns.forEach((btn) => {
		btn.addEventListener('click', () => {
			const f = btn.dataset.filter;
			filterBtns.forEach((b) => {
				const on = b === btn;
				b.classList.toggle('active', on);
				b.setAttribute('aria-pressed', String(on));
			});
			projects.forEach((p) => {
				const show = f === 'all' || p.dataset.cat.split(' ').includes(f);
				p.hidden = !show;
				if (show) {
					p.classList.add('in');
					p.classList.remove('pop');
					void p.offsetWidth;
					p.classList.add('pop');
				}
			});
		});
	});

	// ---------- Copy email ----------
	const copyBtn = document.getElementById('copy-email');
	if (copyBtn) {
		copyBtn.addEventListener('click', async () => {
			const icon = copyBtn.querySelector('i');
			try {
				await navigator.clipboard.writeText(copyBtn.dataset.email);
				icon.className = 'fa-solid fa-check';
				copyBtn.setAttribute('aria-label', 'Email copied');
			} catch (e) {
				window.location.href = 'mailto:' + copyBtn.dataset.email;
			}
			setTimeout(() => {
				icon.className = 'fa-regular fa-copy';
				copyBtn.setAttribute('aria-label', 'Copy email address');
			}, 2000);
		});
	}

	// ---------- Contact form (FormSubmit → email) ----------
	const form = document.getElementById('contact-form');
	if (form) {
		const status = document.getElementById('form-status');
		const submit = form.querySelector('.form-submit');
		const submitLabel = submit.querySelector('.label');
		const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

		const checks = [
			{ el: form.elements.Name, ok: (v) => v.trim().length >= 2 },
			{ el: form.elements.Email, ok: (v) => emailRe.test(v.trim()) },
			{ el: form.elements.Message, ok: (v) => v.trim().length >= 10 },
		];

		const validate = (c) => {
			const valid = c.ok(c.el.value);
			c.el.closest('.field').classList.toggle('invalid', !valid);
			c.el.setAttribute('aria-invalid', String(!valid));
			return valid;
		};

		checks.forEach((c) => {
			c.el.addEventListener('blur', () => { if (c.el.value) validate(c); });
			c.el.addEventListener('input', () => {
				if (c.el.closest('.field').classList.contains('invalid')) validate(c);
			});
		});

		const msg = form.elements.Message;
		const counter = document.getElementById('char-count');
		if (counter) {
			msg.addEventListener('input', () => {
				counter.textContent = msg.value.length + ' / ' + msg.maxLength;
			});
		}

		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			const results = checks.map(validate);
			if (results.includes(false)) {
				checks[results.indexOf(false)].el.focus();
				return;
			}
			if (form.elements._honey.value) return; // bot

			const name = form.elements.Name.value.trim();
			const email = form.elements.Email.value.trim();
			const topic = form.elements.Topic.value;
			const payload = {
				Name: name,
				Email: email,
				Topic: topic,
				Message: form.elements.Message.value.trim(),
				'Sent from': window.location.href.split('#')[0],
				_subject: 'Portfolio: ' + topic + ' — message from ' + name,
				_replyto: email,
				_template: 'table',
				_captcha: 'false',
			};

			submit.disabled = true;
			submit.classList.add('loading');
			submitLabel.textContent = 'Sending…';
			status.className = 'form-status';
			status.textContent = '';

			const fail = (html) => {
				submit.disabled = false;
				submit.classList.remove('loading');
				submitLabel.textContent = 'Send message';
				status.className = 'form-status error';
				status.innerHTML = html;
			};
			const fallback = ' You can also email me directly at <a href="mailto:chnoman1213@gmail.com"><u>chnoman1213@gmail.com</u></a>.';

			// FormSubmit rejects pages opened straight from disk (file://)
			if (window.location.protocol === 'file:') {
				fail('The form only works on the live website, not when the file is opened from your computer.' + fallback);
				return;
			}

			const controller = new AbortController();
			const timer = setTimeout(() => controller.abort(), 20000);

			try {
				const res = await fetch('https://formsubmit.co/ajax/chnoman1213@gmail.com', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
					body: JSON.stringify(payload),
					signal: controller.signal,
				});
				const data = await res.json().catch(() => ({}));
				if (!res.ok || String(data.success) !== 'true') {
					const err = new Error(data.message || 'HTTP ' + res.status);
					err.service = true;
					throw err;
				}

				form.querySelector('.form-body').innerHTML =
					'<div class="form-done">' +
					'<span class="done-icon"><i class="fa-solid fa-check" aria-hidden="true"></i></span>' +
					'<h3>Message sent</h3>' +
					'<p>Thanks, ' + name.replace(/[<>&"]/g, '') + '. I\'ll get back to you at your email within a day.</p>' +
					'</div>';
			} catch (err) {
				if (err.name === 'AbortError') {
					fail('The mail service took too long to respond.' + fallback);
				} else if (err.service && /activat/i.test(err.message)) {
					fail('This form is waiting for activation by the site owner.' + fallback);
				} else {
					fail('Your message could not be sent' + (err.service ? ' (' + err.message.replace(/[<>&"]/g, '') + ').' : ' — please check your connection.') + fallback);
				}
				console.error('Contact form:', err);
			} finally {
				clearTimeout(timer);
			}
		});
	}
})();
