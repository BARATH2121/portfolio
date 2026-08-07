// ============================================
// BARATH M — Technology Portfolio
// Pass 1: nav, hero reveal, scroll reveal
// ============================================

const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Navbar scroll state ----
function initNavbar(){
  const navbar = document.getElementById('navbar');
  if(!navbar) return;
  const onScroll = () => {
    if(window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
}

// ---- Mobile menu ----
function initMobileMenu(){
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  if(!toggle || !menu) return;

  function openMenu(){
    menu.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    const firstLink = menu.querySelector('a');
    if(firstLink) firstLink.focus();
  }
  function closeMenu(returnFocus){
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if(returnFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => {
    if(menu.classList.contains('open')) closeMenu(true);
    else openMenu();
  });
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => closeMenu(false));
  });
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && menu.classList.contains('open')) closeMenu(true);
  });
}

// ---- Scroll reveal ----
function initScrollReveal(){
  const items = document.querySelectorAll('.reveal:not(.in)');
  if(reducedMotion){
    items.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  items.forEach(el => io.observe(el));
}

// ---- Hero line reveal (line-by-line) ----
function initHeroReveal(){
  const lines = document.querySelectorAll('.hero-title .line');
  if(reducedMotion || !lines.length) return;
  lines.forEach((line, i) => {
    line.style.transform = 'translateY(110%)';
    line.style.opacity = '0';
    line.style.transition = `transform .7s cubic-bezier(.22,1,.36,1) ${i*0.12+0.1}s, opacity .7s ease ${i*0.12+0.1}s`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        line.style.transform = 'translateY(0)';
        line.style.opacity = '1';
      });
    });
  });
}

// ---- Work filter ----
function initWorkFilter(){
  const buttons = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('[data-category]');
  if(!buttons.length) return;
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      const filter = btn.dataset.filter;
      items.forEach(item => {
        const cats = item.dataset.category.split(' ');
        const show = filter === 'all' || cats.includes(filter);
        item.classList.toggle('filtered-out', !show);
      });
    });
  });
}

// ---- Contact tabs ----
function initContactTabs(){
  const tabs = document.querySelectorAll('.contact-tab');
  const forms = document.querySelectorAll('.contact-form');
  if(!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
      tab.setAttribute('aria-selected', 'true');
      forms.forEach(f => f.classList.remove('active'));
      document.getElementById(tab.dataset.target).classList.add('active');
    });
  });
}

// ---- Contact forms: validate, then open a pre-filled mailto ----
// Honesty note: this is a static site with no backend, so there is no
// server to actually send email from. Rather than fake a "sent" success
// state, this validates the fields then hands off to the visitor's own
// email client with everything pre-filled.
function initContactForms(){
  const EMAIL = 'mbarath2121@gmail.com';

  function showError(id, msg){
    const el = document.getElementById(id);
    if(el) el.textContent = msg;
  }
  function clearErrors(form){
    form.querySelectorAll('.form-error').forEach(e => e.textContent = '');
  }
  function isValidEmail(v){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  const projectForm = document.getElementById('form-project');
  if(projectForm){
    projectForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors(projectForm);
      const name = document.getElementById('p-name').value.trim();
      const email = document.getElementById('p-email').value.trim();
      const opportunity = document.getElementById('p-opportunity').value.trim();
      const message = document.getElementById('p-message').value.trim();
      let valid = true;
      if(!name){ showError('err-p-name', 'Please enter your name.'); valid = false; }
      if(!email || !isValidEmail(email)){ showError('err-p-email', 'Please enter a valid email.'); valid = false; }
      if(!message){ showError('err-p-message', 'Please add a message.'); valid = false; }
      const status = document.getElementById('status-project');
      if(!valid){
        status.textContent = 'Please fix the highlighted fields.';
        status.className = 'form-status show error';
        return;
      }
      const subject = encodeURIComponent(`Project inquiry${opportunity ? ' — ' + opportunity : ''} from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nProject/Opportunity: ${opportunity || '—'}\n\nMessage:\n${message}`);
      window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
      status.textContent = 'Opening your email app with this message pre-filled…';
      status.className = 'form-status show success';
    });
  }

  const supportForm = document.getElementById('form-support');
  if(supportForm){
    supportForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors(supportForm);
      const name = document.getElementById('s-name').value.trim();
      const contact = document.getElementById('s-contact').value.trim();
      const device = document.getElementById('s-device').value;
      const issue = document.getElementById('s-issue').value.trim();
      let valid = true;
      if(!name){ showError('err-s-name', 'Please enter your name.'); valid = false; }
      if(!contact){ showError('err-s-contact', 'Please add an email or phone number.'); valid = false; }
      if(!issue){ showError('err-s-issue', 'Please describe the issue.'); valid = false; }
      const status = document.getElementById('status-support');
      if(!valid){
        status.textContent = 'Please fix the highlighted fields.';
        status.className = 'form-status show error';
        return;
      }
      const subject = encodeURIComponent(`Tech support request — ${device} — from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nContact: ${contact}\nDevice: ${device}\n\nIssue:\n${issue}`);
      window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
      status.textContent = 'Opening your email app with this request pre-filled…';
      status.className = 'form-status show success';
    });
  }
}

// ---- Custom cursor (desktop only, never blocks clicks) ----
function initCustomCursor(){
  const isFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  if(reducedMotion || !isFinePointer) return;

  const dot = document.getElementById('cursorDot');
  if(!dot) return;

  document.body.classList.add('custom-cursor-active');

  let x = 0, y = 0, curX = 0, curY = 0;
  window.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; });

  function loop(){
    curX += (x - curX) * 0.25;
    curY += (y - curY) * 0.25;
    dot.style.left = curX + 'px';
    dot.style.top = curY + 'px';
    requestAnimationFrame(loop);
  }
  loop();

  document.querySelectorAll('a, button, input, select, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => dot.classList.add('hover-link'));
    el.addEventListener('mouseleave', () => dot.classList.remove('hover-link'));
  });
  document.querySelectorAll('.project, .archive-card').forEach(el => {
    el.addEventListener('mouseenter', () => dot.classList.add('hover-project'));
    el.addEventListener('mouseleave', () => dot.classList.remove('hover-project'));
  });
}

initNavbar();
initMobileMenu();
initScrollReveal();
initHeroReveal();
initWorkFilter();
initContactTabs();
initContactForms();
initCustomCursor();
