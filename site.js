(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Werbemittel-Untermenü: per Klick/Tipp und Tastatur bedienbar
  $$('.has-sub').forEach(li => {
    const btn = $('button', li);
    const set = open => { li.classList.toggle('open', open); btn.setAttribute('aria-expanded', open); };
    btn.addEventListener('click', e => { e.stopPropagation(); set(!li.classList.contains('open')); });
    li.addEventListener('keydown', e => { if (e.key === 'Escape') { set(false); btn.focus(); } });
    li.addEventListener('focusout', e => { if (!li.contains(e.relatedTarget)) set(false); });
    document.addEventListener('click', e => { if (!li.contains(e.target)) set(false); });
  });

  // Slider auf der Startseite: wechselt alle 5 Sekunden, Punkte zum Wählen
  const slider = $('.slider');
  if (slider) {
    const slides = $$('.slide', slider), dots = $$('.dots button');
    let i = 0, timer;
    const show = n => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => { s.classList.toggle('on', k === i); s.setAttribute('aria-hidden', k !== i); });
      dots.forEach((d, k) => d.setAttribute('aria-current', k === i));
    };
    const play = () => { clearInterval(timer); if (!still) timer = setInterval(() => show(i + 1), 5000); };
    dots.forEach((d, k) => d.addEventListener('click', () => { show(k); play(); }));
    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', play);
    show(0); play();
  }

  // Kacheln springen beim ersten Sichtbarwerden herein (wie bisher)
  const pops = $$('.pop');
  if (pops.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -10% 0px' });
    pops.forEach(p => io.observe(p));
  } else pops.forEach(p => p.classList.add('in'));

  // Musterkarte durchblättern
  const pages = $('.pages');
  if (pages) {
    const figs = $$('figure', pages), out = $('.book-ctl output');
    const current = () => {
      const x = pages.scrollLeft + 4;
      let n = 0;
      figs.forEach((f, k) => { if (f.offsetLeft - pages.offsetLeft <= x) n = k; });
      return n;
    };
    const update = () => { out.textContent = `Seite ${current() + 1} von ${figs.length}`; };
    const go = d => {
      const n = Math.max(0, Math.min(figs.length - 1, current() + d));
      pages.scrollTo({ left: figs[n].offsetLeft - pages.offsetLeft, behavior: still ? 'auto' : 'smooth' });
    };
    $$('.book-ctl [data-dir]').forEach(b => b.addEventListener('click', () => go(Number(b.dataset.dir))));
    pages.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    let t; pages.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(update, 60); }, { passive: true });
    update();
  }
})();
