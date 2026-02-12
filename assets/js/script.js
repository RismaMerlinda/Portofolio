// DOM Elements
const header = document.querySelector('.header');
const mobileMenu = document.querySelector('#mobile-menu');
const navList = document.querySelector('.nav-list');
const navLinks = document.querySelectorAll('.nav-link');

// 1. Sticky Header Effect & Active Link highlighting
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    updateActiveLink();
});

// 2. Mobile Menu Toggle
mobileMenu.addEventListener('click', () => {
    navList.classList.toggle('active');
    mobileMenu.classList.toggle('active');
});

// Close mobile menu when a link is clicked
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navList.classList.remove('active');
        mobileMenu.classList.remove('active');
    });
});

// 3. Smooth Scroll to Sections & Active Link highlighting
function updateActiveLink() {
    const sections = document.querySelectorAll('section');
    let scrollPosition = window.pageYOffset + 150;

    sections.forEach(section => {
        const id = section.getAttribute('id');
        const top = section.offsetTop;
        const height = section.offsetHeight;

        if (scrollPosition >= top && scrollPosition < top + height) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + id) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// 4. Particle Background System
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
const particleCount = 60;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(88, 166, 255, 0.3)';
        ctx.fill();
    }
}

function initParticles() {
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, index) => {
        p.update();
        p.draw();

        // Draw connections
        for (let j = index + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 150) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(88, 166, 255, ${0.1 * (1 - dist / 150)})`;
                ctx.lineWidth = 1;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    });

    requestAnimationFrame(animateParticles);
}

if (canvas) {
    initParticles();
    animateParticles();
}

// 5. Backend Integration (Contact Form, Visitor Log & Projects)
const API_URL = 'http://localhost:5000/api';

// Visitor Log - Track who opens the site
async function logVisit() {
    try {
        await fetch(`${API_URL}/visit`, { method: 'POST' });
    } catch (err) {
        console.log('Backend not running, visitor not logged.');
    }
}
logVisit();

// Fetch Projects from MongoDB
async function fetchProjects() {
    const projectsGrid = document.querySelector('.projects-grid');
    if (!projectsGrid) return;

    try {
        const response = await fetch(`${API_URL}/projects`);
        const projects = await response.json();

        if (projects && projects.length > 0) {
            projectsGrid.innerHTML = ''; // Clear hardcoded projects
            projects.forEach(project => {
                const article = document.createElement('article');
                article.className = 'project-card glass-card';
                article.innerHTML = `
                    <div class="project-image">
                        ${project.image ?
                        `<img src="${project.image}" alt="${project.title}">` :
                        `<div class="placeholder-project">${project.title.substring(0, 15)}</div>`
                    }
                        <div class="overlay"></div>
                    </div>
                    <div class="project-content">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        <div class="tech-stack">
                            ${project.stack.map(s => `<span>${s}</span>`).join('')}
                        </div>
                        <div class="project-links">
                            ${project.github ? `<a href="${project.github}" target="_blank" class="btn-sm"><i class="fa-brands fa-github"></i> Code</a>` : ''}
                            ${project.demo ? `<a href="${project.demo}" target="_blank" class="btn-sm btn-accent"><i class="fa-solid fa-arrow-up-right-from-square"></i> Demo</a>` : ''}
                        </div>
                    </div>
                `;
                projectsGrid.appendChild(article);
            });
        }
    } catch (err) {
        console.log('Using hardcoded projects (Backend not reachable)');
    }
}
fetchProjects();

const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        if (name && email && message) {
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerText = 'Sending...';
            btn.disabled = true;

            try {
                await fetch(`${API_URL}/contact`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message })
                });
            } catch (err) {
                console.log('Backend logging skipped (server not found)');
            }

            // Email Redirect
            const myEmail = "rismamerlindaa@gmail.com";
            const subject = `Inquiry from ${name}`;
            const body = `Halo Risma,\n\nSaya ${name} (${email}).\n\n${message}`;
            const mailtoUrl = `mailto:${myEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            window.location.href = mailtoUrl;

            alert(`Pesan kamu sudah disiapkan di Email!`);
            contactForm.reset();
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

// 6. Typing Animation
const typingText = document.querySelector('.typing-text');
const words = ['Websites', 'Web Applications', 'User Experiences', 'Clean Code'];
let wordIndex = 0, charIndex = 0, isDeleting = false, typeSpeed = 100;

function typeEffect() {
    if (!typingText) return;
    const currentWord = words[wordIndex];
    typingText.textContent = isDeleting
        ? currentWord.substring(0, charIndex--)
        : currentWord.substring(0, charIndex++);

    if (!isDeleting && charIndex === currentWord.length + 1) {
        isDeleting = true;
        typeSpeed = 2000;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 500;
    } else {
        typeSpeed = isDeleting ? 50 : 100;
    }
    setTimeout(typeEffect, typeSpeed);
}
typeEffect();
