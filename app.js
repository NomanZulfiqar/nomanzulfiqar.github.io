const hamburger = document.querySelector('.header .nav-bar .nav-list .hamburger');
const mobile_menu = document.querySelector('.header .nav-bar .nav-list ul');
const menu_item = document.querySelectorAll('.header .nav-bar .nav-list ul li a');
const header = document.querySelector('.header.container');
const body = document.body;

hamburger.addEventListener('click', () => {
	hamburger.classList.toggle('active');
	mobile_menu.classList.toggle('active');
});

document.addEventListener('scroll', () => {
	var scroll_position = window.scrollY;
	if (scroll_position > 250) {
		if (body.classList.contains('dark-mode')) {
			header.style.backgroundColor = 'rgba(35, 39, 47, 0.85)';
		} else {
			header.style.backgroundColor = 'rgba(255,255,255,0.95)';
		}
	} else {
		header.style.backgroundColor = 'transparent';
	}
});

menu_item.forEach((item) => {
	item.addEventListener('click', () => {
		hamburger.classList.toggle('active');
		mobile_menu.classList.toggle('active');
	});
});

// Dark/light mode toggle logic
const toggleBtn = document.getElementById('dark-mode-toggle');
const icon = toggleBtn.querySelector('i');

function setMode(mode) {
	if (mode === 'dark') {
		body.classList.add('dark-mode');
		body.classList.remove('light-mode');
		icon.classList.remove('fa-moon');
		icon.classList.add('fa-sun');
		if (window.scrollY > 250) {
			header.style.backgroundColor = 'rgba(35, 39, 47, 0.85)';
		} else {
			header.style.backgroundColor = 'transparent';
		}
	} else {
		body.classList.add('light-mode');
		body.classList.remove('dark-mode');
		icon.classList.remove('fa-sun');
		icon.classList.add('fa-moon');
		if (window.scrollY > 250) {
			header.style.backgroundColor = 'rgba(255,255,255,0.95)';
		} else {
			header.style.backgroundColor = 'transparent';
		}
	}
	localStorage.setItem('colorMode', mode);
}

toggleBtn.addEventListener('click', () => {
	const isDark = body.classList.contains('dark-mode');
	setMode(isDark ? 'light' : 'dark');
});

// On page load, set mode from localStorage or default to light
const savedMode = localStorage.getItem('colorMode');
if (savedMode === 'dark') {
	setMode('dark');
} else {
	setMode('light');
}
