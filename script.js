/* ============================================================
   script.js — Avinesh Dhal Portfolio
   Starfield canvas, scroll animations, nav behaviour
   ============================================================ */
(() => {
  'use strict';

  // ─── STARFIELD ──────────────────────────────────────────────
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let animationId;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStars(count = 160) {
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.4 + 0.3,
        alpha: Math.random() * 0.6 + 0.2,
        drift: Math.random() * 0.0005 + 0.0002,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function drawStars(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const star of stars) {
      const twinkle = Math.sin(time * star.drift * 5 + star.phase) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 190, 240, ${star.alpha * twinkle})`;
      ctx.fill();
    }
    animationId = requestAnimationFrame(drawStars);
  }

  // Respect prefers-reduced-motion
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function initStarfield() {
    resizeCanvas();
    createStars();
    if (!motionQuery.matches) {
      drawStars(0);
    } else {
      // Draw once, no animation
      drawStars(0);
      cancelAnimationFrame(animationId);
    }
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
    createStars();
  });

  initStarfield();

  // ─── NAVIGATION ─────────────────────────────────────────────
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const navOverlay = document.getElementById('nav-overlay');

  // Scroll → add background
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
        updateActiveLink();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile toggle
  function toggleMenu() {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
    navOverlay.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMenu() {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', toggleMenu);
  navOverlay.addEventListener('click', closeMenu);

  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Active link highlight
  const sections = document.querySelectorAll('section[id]');
  const allNavAnchors = navLinks.querySelectorAll('a');

  function updateActiveLink() {
    const scrollPos = window.scrollY + window.innerHeight / 3;
    let current = '';
    sections.forEach(section => {
      if (section.offsetTop <= scrollPos) {
        current = section.id;
      }
    });
    allNavAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  }

  // ─── SCROLL FADE-IN (IntersectionObserver) ──────────────────
  const fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window && !motionQuery.matches) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    fadeEls.forEach(el => observer.observe(el));
  } else {
    // Show everything immediately if motion reduced or no IO
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  // ─── KEYBOARD: ESC closes mobile menu & modal ─────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
      if (typeof closeResume === 'function') closeResume();
    }
  });

  // ─── RESUME MODAL LOGIC ──────────────────
  const resumeBtn = document.getElementById('open-resume-btn');
  const resumeModal = document.getElementById('resume-modal');
  const closeResumeBtn = document.getElementById('close-resume-btn');
  const resumeContent = document.getElementById('resume-content');
  let resumeLoaded = false;

  function openResume(e) {
    e.preventDefault();
    if (!resumeModal) return;
    
    resumeModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeResume() {
    if (resumeModal) {
      resumeModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (resumeBtn) {
    resumeBtn.addEventListener('click', openResume);
  }
  if (closeResumeBtn) {
    closeResumeBtn.addEventListener('click', closeResume);
  }
  if (resumeModal) {
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) {
        closeResume();
      }
    });
  }
})();

// ─── DYNAMIC BACKGROUND ANIMATIONS ──────────────────
(function initCanvas() {
  const bgCanvas = document.getElementById('bg-canvas');
  if (!bgCanvas) return;
  
  const bgCtx = bgCanvas.getContext('2d');
  
  let w, h;
  let particles = [];
  const mouse = { x: null, y: null, radius: 150 };
  
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });
  
  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });
  
  function resize() {
    w = bgCanvas.width = window.innerWidth;
    h = bgCanvas.height = window.innerHeight;
    initParticles();
  }
  
  window.addEventListener('resize', resize);
  
  // --- JELLY GRID LOGIC (BG) ---
  class Particle {
    constructor(x, y) {
      this.baseX = x;
      this.baseY = y;
      this.x = x;
      this.y = y;
      this.vx = 0;
      this.vy = 0;
      this.size = 2; 
      this.color = 'rgba(134, 163, 122, 0.7)'; 
    }
    
    draw() {
      bgCtx.fillStyle = this.color;
      bgCtx.beginPath();
      bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      bgCtx.closePath();
      bgCtx.fill();
    }
    
    update() {
      if (mouse.x != null && mouse.y != null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          this.vx -= (dx / distance) * force * 5;
          this.vy -= (dy / distance) * force * 5;
        }
      }
      let dxBase = this.baseX - this.x;
      let dyBase = this.baseY - this.y;
      this.vx += dxBase * 0.05; 
      this.vy += dyBase * 0.05;
      this.vx *= 0.85;
      this.vy *= 0.85;
      this.x += this.vx;
      this.y += this.vy;
    }
  }
  
  function initParticles() {
    particles = [];
    const spacing = 35;
    for (let x = 0; x < w + spacing; x += spacing) {
      for (let y = 0; y < h + spacing; y += spacing) {
        particles.push(new Particle(x, y));
      }
    }
  }

  function animate() {
    // Render Background Grid
    bgCtx.clearRect(0, 0, w, h);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    
    requestAnimationFrame(animate);
  }
  
  resize();
  animate();
})();
