/* ============================================================
   script.js — Avinesh Dhal Portfolio (Noir Terminal)
   Cursor glow, scroll progress, typing effect, reveal
   animations, nav behaviour, resume modal
   ============================================================ */
(() => {
  'use strict';

  const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── CURSOR GLOW ────────────────────────────────────────────
  // Updates CSS custom properties so the radial gradient follows the cursor
  if (motionOk && window.innerWidth > 768) {
    document.addEventListener('mousemove', (e) => {
      document.documentElement.style.setProperty('--mx', e.clientX + 'px');
      document.documentElement.style.setProperty('--my', e.clientY + 'px');
    });
  }

  // ─── SCROLL PROGRESS ───────────────────────────────────────
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(4));
  }

  // ─── NAVIGATION ─────────────────────────────────────────────
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const navOverlay = document.getElementById('nav-overlay');

  // Scroll → add background class + update active link + scroll progress
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
        updateActiveLink();
        updateScrollProgress();
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

  // ─── TYPING EFFECT (Hero greeting) ─────────────────────────
  const greetingEl = document.getElementById('hero-greeting');
  const greetingText = 'Hey There!';

  function typeGreeting() {
    if (!greetingEl) return;

    if (!motionOk) {
      // No animation: just show text immediately
      greetingEl.textContent = greetingText;
      return;
    }

    greetingEl.textContent = '';
    // Add blinking cursor
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    greetingEl.appendChild(cursor);

    let charIndex = 0;
    const speed = 80; // ms per character

    function typeChar() {
      if (charIndex < greetingText.length) {
        // Insert character before the cursor
        const textNode = document.createTextNode(greetingText[charIndex]);
        greetingEl.insertBefore(textNode, cursor);
        charIndex++;
        setTimeout(typeChar, speed);
      } else {
        // Keep cursor blinking for a while, then remove
        setTimeout(() => {
          cursor.style.animation = 'none';
          cursor.style.opacity = '0';
          setTimeout(() => cursor.remove(), 300);
        }, 2500);
      }
    }

    // Start typing after a brief delay
    setTimeout(typeChar, 600);
  }

  typeGreeting();

  // ─── SCROLL REVEAL (IntersectionObserver) ───────────────────
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && motionOk) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );
    revealEls.forEach(el => observer.observe(el));
  } else {
    // Show everything immediately
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // ─── SUBTLE PARALLAX ON HERO ────────────────────────────────
  if (motionOk) {
    const heroContent = document.querySelector('.hero-content');
    const hero = document.getElementById('hero');

    if (heroContent && hero) {
      window.addEventListener('scroll', () => {
        const rect = hero.getBoundingClientRect();
        // Only apply when hero is visible
        if (rect.bottom > 0) {
          const scrolled = window.scrollY;
          const parallaxAmount = scrolled * 0.15;
          heroContent.style.transform = `translateY(${parallaxAmount}px)`;
          heroContent.style.opacity = Math.max(0, 1 - scrolled / 600);
        }
      }, { passive: true });
    }
  }

  // ─── KEYBOARD: ESC closes mobile menu & modal ──────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
      if (typeof closeResume === 'function') closeResume();
    }
  });

  // ─── RESUME MODAL LOGIC ─────────────────────────────────────
  const resumeBtn = document.getElementById('open-resume-btn');
  const resumeModal = document.getElementById('resume-modal');
  const closeResumeBtn = document.getElementById('close-resume-btn');

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

  // Make closeResume accessible globally for ESC handler
  window.closeResume = closeResume;
})();
