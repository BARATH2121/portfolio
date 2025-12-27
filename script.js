// Initialize 3D Canvas Background
function init3DCanvas() {
    const canvas = document.getElementById('bg3d');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let particles = [];
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.z = Math.random() * 100;
            this.size = Math.random() * 2;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
            this.vz = (Math.random() - 0.5) * 1;
        }
        
        update() {
            this.x += this.vx * 0.5;
            this.y += this.vy * 0.5;
            this.z += this.vz;
            
            if (this.z > 100) this.z = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }
        
        draw() {
            const opacity = (100 - this.z) / 100;
            const color = this.z < 50 ? `rgba(37, 99, 235, ${opacity * 0.8})` : `rgba(248, 113, 113, ${opacity * 0.6})`;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let particle of particles) {
            particle.update();
            particle.draw();
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

init3DCanvas();

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = 'var(--shadow)';
    }
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe project cards
document.querySelectorAll('.project-card').forEach(card => {
    card.style.opacity = '0';
    observer.observe(card);
});

// Toggle mobile menu (if added in future)
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Form submission handler
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Add your form submission logic here
        console.log('Form submitted');
        this.reset();
    });
}

// Add click effects
document.querySelectorAll('.btn, .project-link, .contact-link').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
    });
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close any open modals or menus
        console.log('Escape key pressed');
    }
});

// Loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Console welcome message
console.log('%cWelcome to Barath\'s Portfolio!', 'color: #2563eb; font-size: 20px; font-weight: bold;');
console.log('Check out the source code on GitHub: https://github.com/BARATH2121/portfolio');

// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Update scroll position for active nav link
const updateActiveLink = debounce(function() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= (sectionTop - 200)) {
            navLinks.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`.nav-link[href="#${section.id}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
}, 100);

window.addEventListener('scroll', updateActiveLink);

// Initialize on document ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePortfolio);
} else {
    initializePortfolio();
}

function initializePortfolio() {
    console.log('Portfolio initialized');
    // Add any initialization code here
}
