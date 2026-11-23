(async () => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, props = {}, kids = []) => {
    const n = Object.assign(document.createElement(tag), props);
    kids.forEach(k => n.append(k));
    return n;
  };

  const tabsBox = $('#arch-tabs'), sortsBox = $('#arch-sorts'), select = $('#arch-select');
  const shots = $('#arch-shots'), now = $('#arch-now');

  let data;
  try {
    data = await (await fetch('archiv.json')).json();
  } catch (e) {
    now.textContent = 'Das Bildarchiv konnte nicht geladen werden. Bitte laden Sie die Seite neu.';
    return;
  }
  const albums = data.albums;
  const total = albums.reduce((a, al) => a + al.folders.reduce((b, f) => b + f.items.length, 0), 0);
  $('#arch-count').textContent = total.toLocaleString('de-DE');

  let ai = 0, fi = 0, list = [], vi = 0;

  // Rubriken
  const tabs = albums.map((al, i) => {
    const t = el('button', { className: 'tab', type: 'button', textContent: al.name });
    t.setAttribute('role', 'tab');
    t.addEventListener('click', () => go(i, 0, true));
    t.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const n = (i + d + albums.length) % albums.length;
      go(n, 0, true); tabs[n].focus();
    });
    tabsBox.append(t);
    return t;
  });

  select.addEventListener('change', () => go(ai, Number(select.value), true));

  function go(a, f, push) {
    ai = a; fi = f;
    const album = albums[ai], folder = album.folders[fi];
    tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === ai); t.tabIndex = k === ai ? 0 : -1; });

    // Sortenliste
    sortsBox.replaceChildren(...album.folders.map((fo, k) => {
      const b = el('button', { type: 'button', textContent: fo.name });
      if (k === fi) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', () => go(ai, k, true));
      return el('li', {}, [b]);
    }));
    select.replaceChildren(...album.folders.map((fo, k) => el('option', { value: k, textContent: `${fo.name} (${fo.items.length})`, selected: k === fi })));
    $('.sorts').classList.toggle('single', album.folders.length < 2);

    // Fotos
    list = folder.items;
    now.textContent = `${album.name}${folder.name !== album.name ? ' · ' + folder.name : ''}: ${list.length} ${list.length === 1 ? 'Foto' : 'Fotos'}`;
    shots.replaceChildren(...list.map((it, k) => {
      const img = el('img', { src: `assets/archiv/thumb/${it.i}.avif`, alt: it.n, width: it.w, height: it.h, loading: k < 12 ? 'eager' : 'lazy', decoding: 'async' });
      if (it.j) img.className = 'on-white';
      const b = el('button', { type: 'button' }, [img, el('span', { textContent: it.n })]);
      b.style.setProperty('--i', Math.min(k, 24));
      b.style.setProperty('--r', (it.w / it.h).toFixed(3));
      b.addEventListener('click', () => open(k));
      return el('li', {}, [b]);
    }));

    if (push) {
      history.replaceState(null, '', '#' + encodeURIComponent(album.name) + (fi ? '/' + encodeURIComponent(folder.name) : ''));
      const top = $('.arch-body').getBoundingClientRect().top + scrollY - 90;
      if (scrollY > top) scrollTo({ top, behavior: 'auto' });
    }
  }

  // Großansicht
  const view = $('#view'), vimg = $('#view-img');
  const show = k => {
    vi = (k + list.length) % list.length;
    const it = list[vi];
    vimg.className = it.j ? 'on-white' : '';
    vimg.src = `assets/archiv/full/${it.i}.avif`;
    vimg.alt = it.n; vimg.width = it.w; vimg.height = it.h;
    $('#view-name').textContent = it.n;
    $('#view-meta').textContent = `${albums[ai].name} · Bild ${vi + 1} von ${list.length}`;
    const nx = list[(vi + 1) % list.length];
    if (nx) new Image().src = `assets/archiv/full/${nx.i}.avif`;
  };
  const open = k => { show(k); view.showModal(); };
  $('#view-close').addEventListener('click', () => view.close());
  $('#view-prev').addEventListener('click', () => show(vi - 1));
  $('#view-next').addEventListener('click', () => show(vi + 1));
  view.addEventListener('click', e => { if (e.target === view) view.close(); });
  view.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') show(vi + 1);
    if (e.key === 'ArrowLeft') show(vi - 1);
  });
  view.addEventListener('close', () => { const b = $$('#arch-shots button')[vi]; if (b) b.focus(); });

  // Einstieg über die Adresse, z. B. bildarchiv.html#Eisbecher/Affogato
  const fromHash = () => {
    if (view.open) view.close();
    const [a, f] = location.hash.slice(1).split('/').map(s => { try { return decodeURIComponent(s); } catch { return s; } });
    const x = Math.max(0, albums.findIndex(al => al.name === a));
    const y = f ? Math.max(0, albums[x].folders.findIndex(fo => fo.name === f)) : 0;
    go(x, y, false);
  };
  addEventListener('hashchange', fromHash);
  fromHash();
})();
