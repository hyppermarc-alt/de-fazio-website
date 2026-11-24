(async () => {
  // Empfänger der Bildauswahl (steht so in der Datenschutzerklärung der bisherigen Seite)
  const EMPFAENGER = 'de-fazio@t-online.de';
  const SPEICHER = 'defazio-bestellkorb';

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
  const byId = new Map();
  albums.forEach(al => al.folders.forEach(fo => fo.items.forEach(it => byId.set(it.i, { ...it, a: al.name, f: fo.name }))));
  $('#arch-count').textContent = byId.size.toLocaleString('de-DE');

  // ---------- Bestellkorb (bleibt im Browser des Besuchers gespeichert) ----------
  const load = () => {
    try { return (JSON.parse(localStorage.getItem(SPEICHER)) || []).filter(id => byId.has(id)); } catch { return []; }
  };
  let korb = load();
  const save = () => { try { localStorage.setItem(SPEICHER, JSON.stringify(korb)); } catch {} };
  const has = id => korb.includes(id);
  const pfad = it => [it.a, it.f !== it.a ? it.f : null, it.n].filter(Boolean).join(' › ');

  const bar = $('#korb-bar'), barCount = $('#korb-bar-count'), barMsg = $('#korb-bar-msg');
  const openBtn = $('#korb-open');
  let msgTimer;

  function toggle(id) {
    const it = byId.get(id);
    if (has(id)) { korb = korb.filter(x => x !== id); say(`„${it.n}“ entfernt`); }
    else { korb.push(id); say(`„${it.n}“ hinzugefügt`); }
    save(); refresh();
  }
  function say(t) {
    barMsg.textContent = t;
    clearTimeout(msgTimer);
    msgTimer = setTimeout(() => { barMsg.textContent = ''; }, 2600);
  }
  function refresh() {
    const n = korb.length;
    openBtn.textContent = `Bestellkorb (${n})`;
    barCount.textContent = `${n} ${n === 1 ? 'Foto' : 'Fotos'}`;
    bar.hidden = n === 0;
    document.body.classList.toggle('has-korb', n > 0);
    bar.classList.remove('bump'); void bar.offsetWidth; bar.classList.add('bump');
    $$('#arch-shots li').forEach(li => {
      const on = has(Number(li.dataset.id));
      li.classList.toggle('picked', on);
      const b = $('.pick', li);
      b.setAttribute('aria-pressed', on);
      b.textContent = on ? 'Ausgewählt ✓' : 'Auswählen';
    });
    if (view.open) showPick();
    if (korbDlg.open && !shared) renderKorb();
  }

  // ---------- Rubriken, Sorten, Fotos ----------
  let ai = 0, fi = 0, list = [], vi = 0;
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
    sortsBox.replaceChildren(...album.folders.map((fo, k) => {
      const b = el('button', { type: 'button', textContent: fo.name });
      if (k === fi) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', () => go(ai, k, true));
      return el('li', {}, [b]);
    }));
    select.replaceChildren(...album.folders.map((fo, k) => el('option', { value: k, textContent: `${fo.name} (${fo.items.length})`, selected: k === fi })));
    $('.sorts').classList.toggle('single', album.folders.length < 2);

    list = folder.items;
    now.textContent = `${album.name}${folder.name !== album.name ? ' · ' + folder.name : ''}: ${list.length} ${list.length === 1 ? 'Foto' : 'Fotos'}`;
    shots.replaceChildren(...list.map((it, k) => {
      const img = el('img', { src: `assets/archiv/thumb/${it.i}.avif`, alt: it.n, width: it.w, height: it.h, loading: k < 12 ? 'eager' : 'lazy', decoding: 'async' });
      const view = el('button', { type: 'button', className: 'shot-view', title: 'Groß ansehen' }, [img, el('span', { textContent: it.n })]);
      view.addEventListener('click', () => open(k));
      const pick = el('button', { type: 'button', className: 'pick' });
      pick.addEventListener('click', () => toggle(it.i));
      const li = el('li', {}, [view, pick]);
      li.dataset.id = it.i;
      return li;
    }));
    refresh();

    if (push) {
      history.replaceState(null, '', '#' + encodeURIComponent(album.name) + (fi ? '/' + encodeURIComponent(folder.name) : ''));
      const top = $('.arch-body').getBoundingClientRect().top + scrollY - 90;
      if (scrollY > top) scrollTo({ top, behavior: 'auto' });
    }
  }

  // ---------- Großansicht ----------
  const view = $('#view'), vimg = $('#view-img'), vpick = $('#view-pick');
  const showPick = () => {
    const on = has(list[vi].i);
    vpick.setAttribute('aria-pressed', on);
    vpick.textContent = on ? 'Im Bestellkorb ✓ (entfernen)' : 'In den Bestellkorb';
  };
  const show = k => {
    vi = (k + list.length) % list.length;
    const it = list[vi];
    vimg.src = `assets/archiv/full/${it.i}.avif`;
    vimg.alt = it.n; vimg.width = it.w; vimg.height = it.h;
    $('#view-name').textContent = it.n;
    $('#view-meta').textContent = `${albums[ai].name} · Bild ${vi + 1} von ${list.length}`;
    showPick();
    const nx = list[(vi + 1) % list.length];
    if (nx) new Image().src = `assets/archiv/full/${nx.i}.avif`;
  };
  const open = k => { show(k); view.showModal(); };
  vpick.addEventListener('click', () => toggle(list[vi].i));
  $('#view-close').addEventListener('click', () => view.close());
  $('#view-prev').addEventListener('click', () => show(vi - 1));
  $('#view-next').addEventListener('click', () => show(vi + 1));
  view.addEventListener('click', e => { if (e.target === view) view.close(); });
  view.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') show(vi + 1);
    if (e.key === 'ArrowLeft') show(vi - 1);
  });
  view.addEventListener('close', () => { const b = $$('#arch-shots .shot-view')[vi]; if (b) b.focus(); });

  // ---------- Bestellkorb-Fenster ----------
  const korbDlg = $('#korb'), korbList = $('#korb-list'), form = $('#korb-form'), hint = $('#korb-hint');
  let shared = null; // per Link geteilte Auswahl (nur ansehen)

  function renderKorb() {
    const ids = shared || korb;
    $('#korb-h').textContent = shared ? `Geteilte Bildauswahl (${ids.length})` : `Ihr Bestellkorb (${ids.length})`;
    $('#korb-shared').hidden = !shared;
    $('#korb-empty').hidden = ids.length > 0;
    form.hidden = !!shared || ids.length === 0;
    korbList.replaceChildren(...ids.map(id => {
      const it = byId.get(id);
      const kids = [
        el('img', { src: `assets/archiv/thumb/${id}.avif`, alt: '', width: it.w, height: it.h, loading: 'lazy' }),
        el('div', { className: 'k-txt' }, [el('strong', { textContent: it.n }), el('span', { textContent: `${it.a}${it.f !== it.a ? ' › ' + it.f : ''} · Nr. ${id}` })]),
      ];
      if (!shared) {
        const rm = el('button', { type: 'button', className: 'k-rm', textContent: 'Entfernen' });
        rm.setAttribute('aria-label', `${it.n} aus dem Bestellkorb entfernen`);
        rm.addEventListener('click', () => { toggle(id); if (!korb.length) $('#korb-close').focus(); });
        kids.push(rm);
      }
      return el('li', {}, kids);
    }));
  }
  const openKorb = () => { shared = null; hint.textContent = ''; renderKorb(); korbDlg.showModal(); };
  openBtn.addEventListener('click', openKorb);
  $('#korb-bar-open').addEventListener('click', openKorb);
  $('#korb-close').addEventListener('click', () => korbDlg.close());
  korbDlg.addEventListener('click', e => { if (e.target === korbDlg) korbDlg.close(); });
  korbDlg.addEventListener('close', () => {
    if (shared) { shared = null; history.replaceState(null, '', location.pathname); }
  });
  $('#korb-take').addEventListener('click', () => {
    shared.forEach(id => { if (!has(id)) korb.push(id); });
    save(); shared = null; renderKorb(); refresh();
    history.replaceState(null, '', location.pathname);
  });
  $('#korb-clear').addEventListener('click', () => {
    if (!confirm('Alle Fotos aus dem Bestellkorb entfernen?')) return;
    korb = []; save(); refresh(); renderKorb();
  });

  const linkFor = ids => `${location.origin}${location.pathname}#auswahl=${ids.join(',')}`;
  const field = name => (form.elements[name].value || '').trim();
  function textList(ids) {
    return ids.map((id, k) => `${k + 1}. ${pfad(byId.get(id))} (Nr. ${id})`).join('\n');
  }
  function kunde() {
    return [['Name', field('name')], ['Eiscafé / Firma', field('firma')], ['Telefon', field('tel')], ['E-Mail', field('mail')]]
      .filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n');
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch {
      const ta = el('textarea', { value: text });
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      korbDlg.append(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch {}
      ta.remove(); return ok;
    }
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const ids = korb, n = ids.length;
    const nachricht = field('text');
    const head = `Guten Tag Herr De Fazio,\n\nich interessiere mich für folgende ${n} ${n === 1 ? 'Foto' : 'Fotos'} aus Ihrem Bildarchiv:\n\n`;
    const tail = `\n\nAuswahl mit Vorschaubildern ansehen:\n${linkFor(ids)}\n${nachricht ? `\nNachricht:\n${nachricht}\n` : ''}${kunde() ? `\n${kunde()}\n` : ''}\nViele Grüße${field('name') ? '\n' + field('name') : ''}`;
    const subject = `Bildauswahl aus dem Bildarchiv (${n} ${n === 1 ? 'Foto' : 'Fotos'})${field('firma') ? ' – ' + field('firma') : ''}`;
    let body = head + textList(ids) + tail;
    let mailto = `mailto:${EMPFAENGER}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (mailto.length > 1900) {
      // Sehr lange Listen passen nicht in jeden Mail-Link: Liste in die Zwischenablage, Link bleibt in der Mail
      const ok = await copy(textList(ids));
      body = head + (ok ? '[Bitte hier einfügen: Die Liste wurde in die Zwischenablage kopiert.]' : '[Die vollständige Liste finden Sie über den Link unten.]') + tail;
      mailto = `mailto:${EMPFAENGER}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      hint.textContent = ok
        ? 'Ihr E-Mail-Programm öffnet sich. Die Liste ist lang und wurde in die Zwischenablage kopiert: bitte in die E-Mail einfügen. Der Link in der E-Mail zeigt die Auswahl außerdem mit Bildern.'
        : 'Ihr E-Mail-Programm öffnet sich. Der Link in der E-Mail zeigt Herrn De Fazio Ihre komplette Auswahl mit Bildern.';
    } else {
      hint.textContent = `Ihr E-Mail-Programm öffnet sich mit der fertigen Liste an ${EMPFAENGER}. Bitte dort nur noch auf „Senden“ tippen. Öffnet sich nichts, nutzen Sie „Liste kopieren“.`;
    }
    form.dataset.mailto = mailto;
    location.href = mailto;
  });

  $('#korb-copy').addEventListener('click', async () => {
    const text = `Bildauswahl aus dem Bildarchiv von De Fazio (${korb.length} Fotos)\n\n${textList(korb)}\n\nAuswahl mit Bildern: ${linkFor(korb)}${kunde() ? '\n\n' + kunde() : ''}`;
    hint.textContent = (await copy(text)) ? 'Die Liste ist kopiert. Sie können sie jetzt z. B. in eine E-Mail oder WhatsApp-Nachricht einfügen.' : 'Kopieren hat nicht geklappt. Bitte nutzen Sie „Drucken / als PDF“.';
  });

  // Druckansicht / PDF
  const sheet = el('section', { className: 'print-sheet' });
  sheet.setAttribute('aria-hidden', 'true');
  document.body.append(sheet);
  function printList() {
    const ids = shared || korb;
    const datum = new Date().toLocaleDateString('de-DE');
    sheet.replaceChildren(
      el('h1', { textContent: `Bildauswahl für De Fazio Grafik- und Photodesign (${ids.length} Fotos)` }),
      el('p', { textContent: `Stand ${datum} · Hotline 0212 590960 · ${EMPFAENGER}` }),
      ...(!shared && kunde() ? [el('pre', { textContent: kunde() })] : []),
      el('ol', {}, ids.map(id => {
        const it = byId.get(id);
        return el('li', {}, [el('img', { src: `assets/archiv/thumb/${id}.avif`, alt: '' }), el('div', {}, [el('strong', { textContent: it.n }), el('span', { textContent: `${it.a}${it.f !== it.a ? ' › ' + it.f : ''} · Nr. ${id}` })])]);
      })),
    );
    const imgs = $$('img', sheet);
    Promise.all(imgs.map(i => i.decode().catch(() => {}))).then(() => print());
  }
  $('#korb-print').addEventListener('click', printList);
  $('#korb-print-shared').addEventListener('click', printList);

  // ---------- Einstieg über die Adresse ----------
  // bildarchiv.html#Eisbecher/Affogato  oder  bildarchiv.html#auswahl=12,345,678
  const fromHash = () => {
    const h = location.hash.slice(1);
    if (h.startsWith('auswahl=')) {
      const ids = h.slice(8).split(',').map(Number).filter(id => byId.has(id));
      if (!albums.length) return;
      if (!list.length) go(0, 0, false);
      if (ids.length) { shared = ids; renderKorb(); if (!korbDlg.open) korbDlg.showModal(); }
      return;
    }
    if (view.open) view.close();
    const [a, f] = h.split('/').map(s => { try { return decodeURIComponent(s); } catch { return s; } });
    const x = Math.max(0, albums.findIndex(al => al.name === a));
    const y = f ? Math.max(0, albums[x].folders.findIndex(fo => fo.name === f)) : 0;
    go(x, y, false);
  };
  addEventListener('hashchange', fromHash);
  fromHash();
  if (!list.length) go(0, 0, false);
})();
