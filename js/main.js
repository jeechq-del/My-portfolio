// Portafolio · Jennyfer Choque Quintero
(() => {
  const root = document.documentElement;
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  // ================= MODO DÍA / NOCHE =================
  const themeBtn = document.getElementById('themeToggle');
  const applyThemeLabel = () => {
    const light = root.getAttribute('data-theme') === 'light';
    const en = root.lang === 'en';
    themeBtn.setAttribute('aria-label', light
      ? (en ? 'Switch to dark mode' : 'Cambiar a modo noche')
      : (en ? 'Switch to light mode' : 'Cambiar a modo día'));
  };
  themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    store.set('theme', next);
    applyThemeLabel();
  });

  // ================= IDIOMA ES / EN =================
  const EN = window.I18N_EN || {};
  const nodes = document.querySelectorAll('[data-i18n]');
  const esTitle = document.title;
  const langBtn = document.getElementById('langToggle');
  const t = (key, es) => (root.lang === 'en' && EN[key]) ? EN[key] : es;

  const setLang = lang => {
    root.lang = lang;
    nodes.forEach(el => {
      if (el.dataset.es === undefined) el.dataset.es = el.innerHTML; // guarda el español original
      const key = el.dataset.i18n;
      el.innerHTML = (lang === 'en' && EN[key]) ? EN[key] : el.dataset.es;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      if (el.dataset.esPh === undefined) el.dataset.esPh = el.placeholder;
      el.placeholder = (lang === 'en' && EN[el.dataset.i18nPh]) ? EN[el.dataset.i18nPh] : el.dataset.esPh;
    });
    const top = document.getElementById('toTop');
    if (top) { const lbl = lang === 'en' ? EN.top : 'Volver arriba'; top.setAttribute('aria-label', lbl); top.title = lbl; }
    document.title = lang === 'en' ? EN['meta.title'] : esTitle;
    langBtn.classList.toggle('is-en', lang === 'en');
    langBtn.setAttribute('aria-label', lang === 'en' ? 'Cambiar a español' : 'Switch to English');
    navToggle.setAttribute('aria-label', lang === 'en' ? 'Open menu' : 'Abrir menú');
    applyThemeLabel();
    store.set('lang', lang);
  };
  langBtn.addEventListener('click', () => setLang(root.lang === 'en' ? 'es' : 'en'));

  // ================= MENÚ MÓVIL =================
  const navToggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  navToggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));

  // Idioma inicial: el guardado, o inglés si el navegador está en inglés
  const savedLang = new URLSearchParams(location.search).get('lang') || store.get('lang') || ((navigator.language || 'es').toLowerCase().startsWith('en') ? 'en' : 'es');
  if (savedLang === 'en') setLang('en'); else applyThemeLabel();

  // ================= SECCIÓN ACTIVA EN EL MENÚ =================
  const links = [...document.querySelectorAll('.nav__link')];
  const sections = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  const setActive = id => links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + id));
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  // ================= ANIMACIÓN AL HACER SCROLL =================
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  // ================= FOTO (iniciales si falta la imagen) =================
  document.querySelectorAll('.js-photo').forEach(img => {
    const fail = () => img.parentElement.classList.add('no-photo');
    if (img.complete && img.naturalWidth === 0) fail();
    img.addEventListener('error', fail);
  });

  // ================= FORMULARIO (abre el correo con el mensaje) =================
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const data = new FormData(form);
    const nombre = (data.get('nombre') || '').toString().trim();
    const correo = (data.get('correo') || '').toString().trim();
    const mensaje = (data.get('mensaje') || '').toString().trim();
    if (!nombre || !mensaje || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      note.textContent = t('f.err', 'Por favor completa tu nombre, un correo válido y el mensaje.');
      note.classList.add('is-error');
      return;
    }
    note.classList.remove('is-error');
    const subject = encodeURIComponent(`${t('f.subject', 'Contacto desde el portafolio')}: ${nombre}`);
    const body = encodeURIComponent(`${mensaje}\n\n${nombre}\n${correo}`);
    window.location.href = `mailto:jeechq@gmail.com?subject=${subject}&body=${body}`;
    note.textContent = t('f.ok', '¡Gracias! Se abrió tu aplicación de correo para enviar el mensaje.');
    form.reset();
  });

  // ================= BOTÓN VOLVER ARRIBA (con progreso de scroll) =================
  const toTop = document.getElementById('toTop');
  const ring = document.getElementById('toTopProgress');
  const LEN = 2 * Math.PI * 21;
  ring.style.strokeDasharray = LEN;
  let ticking = false;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? scrollY / max : 0;
    ring.style.strokeDashoffset = LEN * (1 - p);
    toTop.classList.toggle('is-visible', scrollY > innerHeight * 0.6);
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  // ================= DISCORD: copia el usuario =================
  const toast = document.getElementById('toast');
  let toastTimer;
  const showToast = msg => {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  };
  document.querySelectorAll('.js-discord').forEach(btn => btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('jeechq'); } catch (e) {}
    showToast(t('discord.copied', 'Usuario de Discord copiado: jeechq'));
  }));

  // ================= AÑO DEL FOOTER =================
  document.getElementById('year').textContent = new Date().getFullYear();
})();
