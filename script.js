(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const bar = $('.bar');

  // Kopfzeile nimmt die Schriftfarbe des Kapitels darunter an
  const fields = $$('[data-ink]').filter(el => el !== bar);
  const setInk = () => {
    let ink = 'blue';
    for (const el of fields) {
      const r = el.getBoundingClientRect();
      if (r.top <= 36 && r.bottom > 36) ink = el.dataset.ink;
    }
    bar.dataset.ink = ink;
  };

  // Eine Kartenseite, drei Entfernungen
  const zoom = $('.zoom'), stage = $('.zoom-stage');
  const setZoom = () => {
    const r = zoom.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
    stage.dataset.stage = p < 0.3 ? 1 : p < 0.66 ? 2 : 3;
  };

  let tick = false, lastY = 0;
  const onScroll = () => {
    if (tick) return;
    tick = true;
    requestAnimationFrame(() => {
      setInk(); setZoom();
      const y = scrollY;
      if (!bar.classList.contains('open')) bar.classList.toggle('away', y > lastY && y > innerHeight * 0.5);
      lastY = y; tick = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  setInk(); setZoom();

  // Auftritte: Teile jeder Sektion in Lesereihenfolge
  $$('section, footer').forEach(sec => {
    $$('[data-rise], .print', sec).forEach((el, i) => el.style.setProperty('--i', i % 6));
  });
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  $$('[data-rise], .print').forEach(el => io.observe(el));

  // Musterkarten: Café wählen und blättern
  const tabs = $$('.tab'), books = $$('.book');
  const show = i => {
    tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; });
    books.forEach((b, k) => b.classList.toggle('on', k === i));
    $('.pages', books[i]).scrollLeft = 0;
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(i));
    t.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const n = (i + d + tabs.length) % tabs.length;
      show(n); tabs[n].focus();
    });
  });
  show(0);

  // Menü auf dem Telefon
  const mb = $('.menu-btn');
  const menu = open => {
    bar.classList.toggle('open', open);
    mb.setAttribute('aria-expanded', open);
    mb.textContent = open ? 'Schließen' : 'Menü';
  };
  mb.addEventListener('click', () => menu(!bar.classList.contains('open')));
  $$('.links a').forEach(a => a.addEventListener('click', () => menu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') menu(false); });

  window.__ok = true;
})();
