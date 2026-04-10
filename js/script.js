/* ============================================================
   MEU CABELO SIM – STUDIO MANU CARDOSO
   script.js – All interactions, animations, API calls
   ============================================================ */

'use strict';

/* ===== CONFIG ===== */
const PEXELS_KEY = 'HX6lpZGO3pQmUX3XKKiI7DYLHvnu0JUSjWlIgIHe6bMiZunPISPD1l4Q';
const WA_NUMBER = '5595991584565';

/* ===== LOADING SCREEN ===== */
(function initLoader() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      screen.classList.add('hidden');
      document.body.classList.remove('loading');
      initRevealObserver();
    }, 2200);
  });

  // Fallback
  setTimeout(() => {
    screen.classList.add('hidden');
  }, 4000);
})();

/* ===== NAVBAR ===== */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('navHamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!navbar) return;

  // Scroll → add .scrolled
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 30);
        updateActiveLink();
        ticking = false;
      });
    }
  }, { passive: true });

  // Active link on scroll
  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id], header[id]');
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = sec.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }

  // Hamburger toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
    });

    // Close on link click
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
      });
    });

    // Close on backdrop click
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
      }
    });

    // ESC key close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
      }
    });
  }
})();

/* ===== SMOOTH SCROLL ===== */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

/* ===== INTERSECTION OBSERVER REVEAL ===== */
let _revealInit = false;
function initRevealObserver() {
  if (_revealInit) return;
  _revealInit = true;
  const items = document.querySelectorAll('.reveal-item');
  if (!items.length) return;

  const opts = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.08
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // stagger siblings in the same parent
        const siblings = Array.from(el.parentElement.querySelectorAll('.reveal-item:not(.revealed)'));
        const idx = siblings.indexOf(el);
        const delay = Math.min(idx * 80, 400);
        setTimeout(() => {
          el.classList.add('revealed');
        }, delay);
        observer.unobserve(el);
      }
    });
  }, opts);

  items.forEach(item => observer.observe(item));
}

// Also run on DOMContentLoaded in case loader is skipped
document.addEventListener('DOMContentLoaded', () => {
  initRevealObserver();
});

/* ===== ACCORDIONS ===== */
(function initAccordions() {
  const items = document.querySelectorAll('.accordion-item');
  if (!items.length) return;

  items.forEach(item => {
    const header = item.querySelector('.accordion-header');
    const body = item.querySelector('.accordion-body');
    if (!header || !body) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all others
      items.forEach(other => {
        if (other !== item && other.classList.contains('open')) {
          other.classList.remove('open');
          const otherHeader = other.querySelector('.accordion-header');
          if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      item.classList.toggle('open', !isOpen);
      header.setAttribute('aria-expanded', String(!isOpen));

      // Reveal cards inside with stagger
      if (!isOpen) {
        const cards = item.querySelectorAll('.tilt-card');
        cards.forEach((card, i) => {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.transition = `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms`;
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        });
      }
    });
  });
})();

/* ===== CARD TILT EFFECT ===== */
(function initTiltCards() {
  const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;
  if (isTouchDevice()) return;

  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const tiltX = y * 8;
      const tiltY = -x * 8;
      card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
      card.style.boxShadow = `${-tiltY * 2}px ${tiltX * 2 + 8}px 30px rgba(201,169,98,0.18)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
})();

/* ===== RIPPLE EFFECT ===== */
(function initRipple() {
  document.querySelectorAll('.ripple-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
      btn.appendChild(ripple);

      setTimeout(() => ripple.remove(), 700);
    });
  });
})();

/* ===== MAGNETIC BUTTONS ===== */
(function initMagneticButtons() {
  const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;
  if (isTouchDevice()) return;

  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ===== HERO TYPEWRITER EFFECT ===== */
(function initHeroTypewriter() {
  const italicLine = document.querySelector('.hero-title-italic');
  if (!italicLine) return;

  const words = ['Beleza', 'Autoestima', 'Confiança', 'Beleza'];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let isPaused = false;

  function type() {
    const current = words[wordIndex % words.length];

    if (isPaused) {
      setTimeout(type, 1500);
      isPaused = false;
      return;
    }

    if (!isDeleting) {
      italicLine.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        isPaused = true;
        isDeleting = true;
        setTimeout(type, 100);
        return;
      }
    } else {
      italicLine.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        wordIndex++;
      }
    }

    const speed = isDeleting ? 60 : 100;
    setTimeout(type, speed);
  }

  // Start after hero is visible (post-load)
  setTimeout(type, 3000);
})();

/* ===== PEXELS API IMAGES ===== */
async function fetchPexelsImage(query, perPage = 1, page = 1) {
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&orientation=portrait`,
      { headers: { Authorization: PEXELS_KEY } }
    );
    if (!res.ok) throw new Error('Pexels fetch failed');
    const data = await res.json();
    return data.photos || [];
  } catch (err) {
    console.warn('[Pexels]', err.message);
    return [];
  }
}

async function fetchPexelsLandscape(query, perPage = 1, page = 1) {
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&orientation=landscape`,
      { headers: { Authorization: PEXELS_KEY } }
    );
    if (!res.ok) throw new Error('Pexels fetch failed');
    const data = await res.json();
    return data.photos || [];
  } catch (err) {
    console.warn('[Pexels]', err.message);
    return [];
  }
}

(async function loadPexelsImages() {
  // Hero image
  const heroImg = document.getElementById('heroImg');
  if (heroImg) {
    const photos = await fetchPexelsImage('beautiful woman hair salon luxury', 1, 1);
    if (photos.length) {
      heroImg.src = photos[0].src.large;
      heroImg.alt = photos[0].alt || 'Modelo com cabelo luxuoso';
    }
  }

  // Sobre images
  const sobreImg1 = document.getElementById('sobreImg1');
  if (sobreImg1) {
    const photos = await fetchPexelsImage('hair salon interior luxury', 1, 2);
    if (photos.length) {
      sobreImg1.src = photos[0].src.large;
      sobreImg1.alt = photos[0].alt || 'Studio de beleza';
    }
  }

  const sobreImg2 = document.getElementById('sobreImg2');
  if (sobreImg2) {
    const photos = await fetchPexelsImage('hair treatment beauty woman', 1, 3);
    if (photos.length) {
      sobreImg2.src = photos[0].src.medium;
      sobreImg2.alt = photos[0].alt || 'Tratamento capilar';
    }
  }

  // Polaroid gallery
  const polStage = document.getElementById('polStage');
  if (polStage) {
    const polQueries = [
      { q: 'hairdresser woman blowdry salon', caption: 'Hair Styling' },
      { q: 'eyelash extension beauty closeup', caption: 'Extensão de Cílios' },
      { q: 'eyebrow shaping beauty woman', caption: 'Design de Sobrancelhas' },
      { q: 'mega hair extension woman beautiful', caption: 'Mega Hair' },
      { q: 'hair treatment salon woman luxury', caption: 'Cronograma Capilar' },
      { q: 'makeup artist beauty woman portrait', caption: 'Maquiagem' },
      { q: 'beautiful woman hairstyle salon result', caption: 'Resultado Final' }
    ];

    const polResults = await Promise.all(
      polQueries.map(({ q }, i) => fetchPexelsImage(q, 1, i + 1))
    );

    // Seeded random – deterministic scatter positions
    function SeededRandom(seed) {
      this.seed = seed;
      this.next = function() { this.seed = (this.seed * 9301 + 49297) % 233280; return this.seed / 233280; };
      this.range = function(min, max) { return min + this.next() * (max - min); };
    }

    function polPositions(n, seed) {
      const rng = new SeededRandom(seed);
      const isMobile = window.innerWidth < 768;
      const spread = isMobile ? Math.min(window.innerWidth * 0.78, 340) : Math.min(window.innerWidth * 0.72, 680);
      const step = spread / (n - 1);
      return Array.from({ length: n }, (_, i) => ({
        x: -spread / 2 + i * step + rng.range(-10, 10),
        y: rng.range(-38, 38),
        r: rng.range(-13, 13)
      }));
    }

    let polSeed = 42819;
    let positions = polPositions(polQueries.length, polSeed);
    const polCards = [];

    polQueries.forEach((entry, i) => {
      const photos = polResults[i];
      const url = photos && photos.length ? photos[0].src.medium : '';
      const alt = photos && photos.length ? (photos[0].alt || entry.caption) : entry.caption;

      const card = document.createElement('div');
      card.className = 'pol-card';
      card.style.setProperty('--px', positions[i].x + 'px');
      card.style.setProperty('--py', positions[i].y + 'px');
      card.style.setProperty('--pr', positions[i].r + 'deg');
      card.style.transitionDelay = (i * 0.18) + 's';
      card.style.zIndex = polQueries.length - i;
      card.innerHTML = `<div class="pol-img-wrap"><img src="${url}" alt="${alt}" loading="lazy" width="200" height="260"/></div><p class="pol-caption">${entry.caption}</p>`;
      polStage.appendChild(card);
      polCards.push(card);
    });

    // Trigger scatter on intersection
    let polFired = false;
    const polObs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !polFired) {
        polFired = true;
        polCards.forEach((c, i) => setTimeout(() => c.classList.add('pol-scattered'), i * 150));
        polObs.disconnect();
      }
    }, { threshold: 0.25 });
    polObs.observe(polStage);

    // Reshuffle button
    const polReshuffle = document.getElementById('polReshuffle');
    if (polReshuffle) {
      polReshuffle.addEventListener('click', () => {
        polCards.forEach(c => c.classList.remove('pol-scattered'));
        polSeed = Math.floor(Math.random() * 999983);
        positions = polPositions(polQueries.length, polSeed);
        setTimeout(() => {
          polCards.forEach((card, i) => {
            card.style.setProperty('--px', positions[i].x + 'px');
            card.style.setProperty('--py', positions[i].y + 'px');
            card.style.setProperty('--pr', positions[i].r + 'deg');
          });
          setTimeout(() => polCards.forEach((c, i) => setTimeout(() => c.classList.add('pol-scattered'), i * 150)), 60);
        }, 700);
      });
    }
  }
})();

/* ===== WHATSAPP BOOKING FORM ===== */
(function initBookingForm() {
  const form = document.getElementById('agendamentoForm');
  if (!form) return;

  // Set min date to today
  const dateInput = document.getElementById('data');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome')?.value.trim() || '';
    const whatsapp = document.getElementById('whatsapp')?.value.trim() || '';
    const servico = document.getElementById('servico')?.value || '';
    const data = document.getElementById('data')?.value || '';
    const horario = document.getElementById('horario')?.value || '';
    const obs = document.getElementById('obs')?.value.trim() || '';

    // Basic validation
    if (!nome || !whatsapp || !servico || !data || !horario) {
      shakeForm(form);
      showFormError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Format date
    const [year, month, day] = data.split('-');
    const dataBR = `${day}/${month}/${year}`;

    const msg = [
      'Olá! Gostaria de agendar:',
      '',
      `👤 *Nome:* ${nome}`,
      `📱 *WhatsApp:* ${whatsapp}`,
      `✂️ *Serviço:* ${servico}`,
      `📅 *Data:* ${dataBR}`,
      `🕐 *Horário:* ${horario}`,
      obs ? `📝 *Obs:* ${obs}` : ''
    ].filter(Boolean).join('\n');

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    // Visual feedback
    showFormSuccess(form);
  });

  function shakeForm(el) {
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = 'shake 0.4s var(--ease-out-expo)';
  }

  function showFormError(msg) {
    removeFormMsg();
    const el = document.createElement('div');
    el.className = 'form-msg form-msg--error';
    el.textContent = msg;
    form.prepend(el);
    setTimeout(removeFormMsg, 4000);
  }

  function showFormSuccess(formEl) {
    removeFormMsg();
    const el = document.createElement('div');
    el.className = 'form-msg form-msg--success';
    el.textContent = '✓ Redirecionando para o WhatsApp...';
    formEl.prepend(el);
    setTimeout(removeFormMsg, 4000);
  }

  function removeFormMsg() {
    form.querySelectorAll('.form-msg').forEach(m => m.remove());
  }
})();

/* ===== PARALLAX HERO IMAGE ===== */
(function initParallax() {
  const heroBg = document.getElementById('heroBg');
  if (!heroBg) return;

  const isMobile = () => window.innerWidth < 768;
  if (isMobile()) return;

  window.addEventListener('scroll', () => {
    if (isMobile()) return;
    const y = window.scrollY;
    heroBg.style.transform = `translateY(${y * 0.2}px)`;
  }, { passive: true });
})();

/* ===== FOOTER YEAR ===== */
(function setFooterYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ===== WHATSAPP FAB HIDE ON FORM VISIBLE ===== */
(function initFabVisibility() {
  const fab = document.getElementById('whatsappFab');
  const formSection = document.getElementById('agendamento');
  if (!fab || !formSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      fab.style.opacity = entry.isIntersecting ? '0' : '1';
      fab.style.pointerEvents = entry.isIntersecting ? 'none' : 'all';
    });
  }, { threshold: 0.3 });

  observer.observe(formSection);
})();

/* ===== CSS KEYFRAME INJECTION FOR FORM ===== */
(function injectDynamicCSS() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-8px); }
      40% { transform: translateX(8px); }
      60% { transform: translateX(-5px); }
      80% { transform: translateX(5px); }
    }

    .form-msg {
      padding: 0.75rem 1rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 500;
      margin-bottom: 0.75rem;
      animation: fade-in 0.3s cubic-bezier(0.16,1,0.3,1);
    }

    .form-msg--error {
      background: rgba(220,60,60,0.12);
      border: 1px solid rgba(220,60,60,0.35);
      color: #ff7070;
    }

    .form-msg--success {
      background: rgba(37,211,102,0.12);
      border: 1px solid rgba(37,211,102,0.35);
      color: #4ade80;
    }
  `;
  document.head.appendChild(style);
})();

/* ===== WHATSAPP NUMBER INPUT MASK ===== */
(function initPhoneMask() {
  const input = document.getElementById('whatsapp');
  if (!input) return;

  input.addEventListener('input', () => {
    let v = input.value.replace(/\D/g, '').substring(0, 11);
    if (v.length >= 7) {
      v = `(${v.substring(0,2)}) ${v.substring(2,7)}-${v.substring(7)}`;
    } else if (v.length >= 3) {
      v = `(${v.substring(0,2)}) ${v.substring(2)}`;
    } else if (v.length > 0) {
      v = `(${v}`;
    }
    input.value = v;
  });
})();

/* ===== SCROLL PROGRESS INDICATOR ===== */
(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.setAttribute('aria-hidden', 'true');
  bar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 2px;
    width: 0%;
    background: linear-gradient(90deg, #A8883F, #C9A962, #E2C98A);
    z-index: 9998;
    transition: width 0.1s linear;
    pointer-events: none;
  `;
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    bar.style.width = `${pct}%`;
  }, { passive: true });
})();

/* ===== INTERACTIVE IMAGE ACCORDION – load Pexels images ===== */
(async function initImgAccordion() {
  const panels = document.querySelectorAll('.img-panel');
  if (!panels.length) return;

  const queries = [
    'luxury hair salon interior',
    'beauty salon modern interior',
    'hair treatment woman spa',
    'eyelash extension beauty woman',
    'hairdresser professional woman'
  ];

  // Hover interaction (supplement CSS)
  panels.forEach((panel, i) => {
    panel.addEventListener('mouseenter', () => {
      panels.forEach(p => p.classList.remove('img-panel--active'));
      panel.classList.add('img-panel--active');
    });
  });

  // Load images in parallel
  const results = await Promise.all(
    queries.map((q, i) => fetchPexelsImage(q, 1, i + 1))
  );

  panels.forEach((panel, i) => {
    const photos = results[i];
    if (photos && photos.length) {
      const img = panel.querySelector('.img-panel-bg');
      if (img) {
        img.src = photos[0].src.large;
        img.alt = photos[0].alt || panel.dataset.title;
      }
    }
  });
})();

/* ===== STACKED TESTIMONIAL CAROUSEL ===== */
(function initDepCarousel() {
  const stack = document.getElementById('depStack');
  const prevBtn = document.getElementById('depPrev');
  const nextBtn = document.getElementById('depNext');
  const dots = document.querySelectorAll('.dep-dot');
  if (!stack || !prevBtn || !nextBtn) return;

  const cards = Array.from(stack.querySelectorAll('.dep-stack-card'));
  const total = cards.length;
  let activeIdx = cards.findIndex(c => c.classList.contains('dep-stack-card--active'));
  if (activeIdx === -1) activeIdx = total - 1;

  function updateStack() {
    cards.forEach((card, i) => {
      // Distance from active (wrapping)
      let dist = (i - activeIdx + total) % total;
      // Positions 0 = active (front), 1 = second, 2 = third…
      card.setAttribute('data-stack-pos', String(dist));
      card.setAttribute('aria-hidden', dist !== 0 ? 'true' : 'false');
      card.classList.toggle('dep-stack-card--active', dist === 0);
    });

    // Update dots
    dots.forEach((dot, i) => {
      const isActive = i === activeIdx;
      dot.classList.toggle('dep-dot--active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });
  }

  function goTo(idx) {
    activeIdx = ((idx % total) + total) % total;
    updateStack();
  }

  prevBtn.addEventListener('click', () => goTo(activeIdx - 1));
  nextBtn.addEventListener('click', () => goTo(activeIdx + 1));
  dots.forEach(dot => {
    dot.addEventListener('click', () => goTo(Number(dot.dataset.idx)));
  });

  // Swipe/drag on the stack
  let startX = 0;
  let isDragging = false;

  stack.addEventListener('pointerdown', (e) => {
    isDragging = true;
    startX = e.clientX;
  });

  window.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const diff = e.clientX - startX;
    if (Math.abs(diff) > 60) goTo(diff < 0 ? activeIdx + 1 : activeIdx - 1);
  });

  // Auto-advance every 6s
  let autoTimer = setInterval(() => goTo(activeIdx + 1), 6000);
  stack.addEventListener('pointerdown', () => clearInterval(autoTimer));

  // Init
  updateStack();
})();

/* ===== SECTION EYEBROW COUNTER ANIMATION ===== */
(function initCounterAnimation() {
  function animateValue(el, start, end, duration, isDecimal) {
    const startTime = performance.now();
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current).toString();
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const statsMap = [
    { selector: '.hero-stats .hero-stat:nth-child(1) .stat-value', end: 4.9, decimal: true },
    { selector: '.hero-stats .hero-stat:nth-child(3) .stat-value', end: 103, decimal: false }
  ];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statsMap.forEach(({ selector, end, decimal }) => {
          const el = document.querySelector(selector);
          if (el && !el.dataset.animated) {
            el.dataset.animated = 'true';
            animateValue(el, 0, end, 1800, decimal);
          }
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) observer.observe(heroStats);
})();
