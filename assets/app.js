/* Short Draft.
   Sumber data tunggal: index.json (+ data/<slug>.json per draft, dimuat saat dibuka).
   Web read-only: tiap draft bisa dicopas (teks polos ala Discord atau markdown asli). */
'use strict';

const app = document.getElementById('app');
const qInput = document.getElementById('q');
const progEl = document.getElementById('prog');
const DATA = new Map();
let INDEX = null;
let FILTER = '';
let F_STATUS = '';
let F_SERIES = '';
let F_META = false;
let F_HOOK = false;

const STATUS_META = {
  draft: { icon: '📝', label: 'draft', hint: 'ide masuk, belum digarap' },
  ongoing: { icon: '🔧', label: 'ongoing', hint: 'lagi digarap' },
  done: { icon: '✅', label: 'done', hint: 'sudah selesai' },
};
const ZONE_ORDER = ['draft', 'ongoing', 'done'];

/* ---------------------------------- util --------------------------------- */

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fmt = (n) => (n ?? 0).toLocaleString('id-ID');
const stMeta = (s) => STATUS_META[s] || { icon: '•', label: s, hint: '' };

function copy(text, btn) {
  const done = () => {
    if (!btn) return;
    const old = btn.dataset.oldText || btn.textContent;
    btn.dataset.oldText = old;
    btn.textContent = btn.classList.contains('copybtn') ? '✓' : 'tersalin ✓';
    btn.classList.add('primary');
    clearTimeout(btn._t);
    btn._t = setTimeout(() => { btn.textContent = old; btn.classList.remove('primary'); }, 1400);
  };
  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (_) {}
    ta.remove();
  };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done).catch(fallback);
  else fallback();
}

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Teks polos: persis bentuk yang biasa ditulis di chat, siap tempel. */
const plainText = (e, d) => [e.title, ...((d?.beats || e.beats) || []).map((b) => '- ' + b.text)].join('\n');

/** Daftar papan: buat copas cepat, dikelompokkan per status. */
function boardText(entries) {
  const lines = [];
  for (const s of ZONE_ORDER) {
    const list = entries.filter((e) => e.status === s);
    if (!list.length) continue;
    lines.push(`${stMeta(s).icon} ${s.toUpperCase()} (${list.length})`);
    for (const e of list) lines.push(`- ${e.title} · ${e.beats_count} beat${e.duration ? ' · ' + e.duration + 's' : ''}`);
    lines.push('');
  }
  return lines.join('\n').trim();
}

/* ------------------------------- markdown -------------------------------- */

function md(src) {
  const lines = String(src || '').replace(/\r/g, '').split('\n');
  const out = [];
  let inCode = false, list = null;

  const inline = (t) =>
    esc(t)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  const flushList = () => { if (list) { out.push(`<${list.t}>${list.items.join('')}</${list.t}>`); list = null; } };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (/^```/.test(line)) {
      flushList();
      out.push(inCode ? '</code></pre>' : '<pre><code>');
      inCode = !inCode;
      continue;
    }
    if (inCode) { out.push(esc(raw) + '\n'); continue; }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { flushList(); out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); continue; }

    const bq = line.match(/^>\s?(.*)$/);
    if (bq) { flushList(); out.push(`<blockquote>${inline(bq[1])}</blockquote>`); continue; }

    if (/^\s*(?:---+|\*\*\*+|___+)\s*$/.test(line)) { flushList(); out.push('<hr>'); continue; }

    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (ul || ol) {
      const type = ul ? 'ul' : 'ol';
      if (!list || list.t !== type) { flushList(); list = { t: type, items: [] }; }
      list.items.push(`<li>${inline((ul || ol)[1])}</li>`);
      continue;
    }

    if (!line.trim()) { flushList(); continue; }
    flushList();
    out.push(`<p>${inline(line)}</p>`);
  }
  flushList();
  if (inCode) out.push('</code></pre>');
  return out.join('\n');
}

/* --------------------------------- router -------------------------------- */

const parseHash = () => {
  const h = location.hash.replace(/^#\/?/, '');
  if (!h || h === '/') return { view: 'home' };
  const parts = h.split('/').filter(Boolean);
  if (parts[0] === 'd' && parts.length >= 2) return { view: 'draft', slug: parts.slice(1).join('/') };
  return { view: 'home' };
};

const entryBySlug = (slug) => (INDEX?.entries || []).find((e) => e.slug === slug);

async function loadData(slug) {
  if (DATA.has(slug)) return DATA.get(slug);
  const meta = entryBySlug(slug);
  if (!meta) return null;
  const res = await fetch(meta.data, { cache: 'no-cache' });
  if (!res.ok) throw new Error('gagal memuat ' + meta.data);
  const d = await res.json();
  DATA.set(slug, d);
  return d;
}

/* --------------------------------- papan --------------------------------- */

function matches(e) {
  if (F_STATUS && e.status !== F_STATUS) return false;
  if (F_SERIES && e.series !== F_SERIES) return false;
  if (F_META && (e.ready ?? 0) >= (e.ready_total || 9)) return false;
  if (F_HOOK && e.has_hook) return false;
  if (!FILTER) return true;
  const q = FILTER.toLowerCase();
  const hay = [
    e.title, e.slug, e.logline, e.setting, e.series, e.lane, e.source,
    (e.tags || []).join(' '), (e.characters || []).join(' '),
    (e.beats || []).map((b) => b.text).join(' '),
  ].join(' ').toLowerCase();
  return hay.includes(q);
}

/* ---- identitas visual draft: poster CSS-only, deterministik dari slug ---- */
const PALETTES = [
  { a: '#e0a33e', b: '#3a2a12' }, // amber (aksen keluarga)
  { a: '#4fb3a5', b: '#123430' }, // teal
  { a: '#8b7bd8', b: '#251f42' }, // violet
  { a: '#e0705f', b: '#3d1a15' }, // coral
  { a: '#5b9bd5', b: '#152c42' }, // biru
  { a: '#8fbf4f', b: '#233418' }, // hijau
  { a: '#d76fa8', b: '#3c1529' }, // pink
  { a: '#c9a227', b: '#3a2f0e' }, // emas
];
const PATTERNS = ['stripes', 'dots', 'grid', 'rays', 'chevron', 'waves'];

function hash32(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function posterFor(e, h = 76) {
  const k = hash32(String(e.slug || e.title || 'x'));
  const pal = PALETTES[k % PALETTES.length];
  const pat = PATTERNS[(k >>> 3) % PATTERNS.length];
  const [w0, h0] = String(e.format || '9:16').split(':').map(Number);
  const ratio = w0 && h0 ? w0 / h0 : 9 / 16;
  // monogram dari kata pembeda (kata terakhir judul): "Cookie" -> CO, "merpati" -> ME
  const last = String(e.title || '?').trim().split(/\s+/).pop() || '?';
  const mono = last.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase();
  return { pal, pat, width: Math.max(38, Math.round(h * ratio)), mono, fmt: e.format || '' };
}

function posterHTML(e, h = 76, extra = '') {
  const p = posterFor(e, h);
  return `<div class="poster ${extra} p-${p.pat}" style="width:${p.width}px;height:${h}px;--pa:${p.pal.a};--pb:${p.pal.b}" aria-hidden="true"><span class="mono">${esc(p.mono)}</span><i class="fmt">${esc(p.fmt)}</i></div>`;
}

function rowHTML(e) {
  const r = e.ready ?? 0;
  const t = e.ready_total || 9;
  const missing = (e.checks || []).filter((c) => !c.ok).map((c) => c.label.toLowerCase());
  const hl = (v) => {
    const s = esc(v);
    if (!FILTER) return s;
    const q = FILTER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try { return s.replace(new RegExp('(' + q + ')', 'gi'), '<mark>$1</mark>'); } catch (_) { return s; }
  };
  return `
  <div class="row">
    <a class="rowmain" href="#/d/${e.slug}">
      ${posterHTML(e, 76)}
      <div class="t">
        <h3>${hl(e.title)}${e.series && INDEX.series.length > 1 ? `<span class="tag">${esc(e.series)}</span>` : ''}</h3>
        ${e.has_hook
          ? `<p class="logline hook" title="isyarat hook — frame pertama: ${e.hook_signals.frame1 ? '✓' : '✗'} · pertanyaan: ${e.hook_signals.question ? '✓' : '✗'} · gerak: ${e.hook_signals.motion ? '✓' : '✗'}">🎣 ${hl(e.hook)}</p>`
          : `${e.preview ? `<p class="logline">${hl(e.preview)}</p>` : '<p class="logline muted">beat belum diisi</p>'}`}
        <div class="sub">
          <span>${e.beats_count} beat</span>
          ${e.camera_beats ? `<span>🎥 ${e.camera_beats}</span>` : ''}
          ${e.format ? `<span>${esc(e.format)}</span>` : ''}
          ${e.duration ? `<span>${esc(String(e.duration))} dtk</span>` : ''}
          ${e.has_hook ? '' : '<span class="nohook">hook belum ditulis</span>'}
          ${missing.length ? `<span class="miss" title="metadata belum lengkap: ${esc(missing.join(', '))}">⚠ ${missing.length}</span>` : ''}
        </div>
      </div>
      <div class="mid">
        <div class="meter" title="kelengkapan metadata ${r}/${t}">
          <span class="num">siap ${r}/${t}</span>
          <span class="track"><i class="${r / t >= 0.75 ? '' : r / t >= 0.5 ? 'mid' : 'low'}" style="width:${Math.round((r / t) * 100)}%"></i></span>
        </div>
        <div class="sub"><span>${esc(e.date || '')}</span></div>
      </div>
      <div class="right">
        <span class="pill ${esc(e.status)}"><i class="dot"></i>${stMeta(e.status).icon} ${esc(stMeta(e.status).label)}</span>
        <span class="arrow">→</span>
      </div>
    </a>
    <button class="copybtn js-rowcopy" type="button" data-slug="${esc(e.slug)}" title="Salin teks draft ini (judul + beat)" aria-label="Salin teks ${esc(e.title)}">⧉</button>
  </div>`;
}

function renderHome() {
  const entries = INDEX.entries.filter(matches);
  const done = INDEX.statuses.done || 0;
  const ongoing = INDEX.statuses.ongoing || 0;

  const fbtn = (kind, val, label, active) =>
    `<button class="fbtn" type="button" data-f="${kind}" data-v="${esc(val)}" aria-pressed="${active}">${label}</button>`;

  const statusChips = ZONE_ORDER
    .filter((s) => (INDEX.statuses[s] || 0) > 0 || F_STATUS === s)
    .map((s) => fbtn('status', s, `${stMeta(s).icon} ${stMeta(s).label} ${INDEX.statuses[s] || 0}`, F_STATUS === s))
    .join('');

  const zones = ZONE_ORDER.map((s) => {
    const list = entries.filter((e) => e.status === s);
    if (!list.length) return '';
    return `
    <section class="zone card">
      <div class="zone-head zone-${s}">
        <h2>${stMeta(s).icon} ${esc(stMeta(s).label)}</h2>
        <span class="count">${list.length}</span>
      </div>
      ${list.map(rowHTML).join('')}
    </section>`;
  }).join('');

  const density = document.documentElement.dataset.density === 'compact';
  const shown = entries.reduce((a, e) => a + e.beats_count, 0);
  const metaTodo = INDEX.entries.filter((e) => (e.ready ?? 0) < (e.ready_total || 9)).length;
  const hookTodo = INDEX.entries.filter((e) => !e.has_hook).length;

  app.innerHTML = `
    <div class="board-head">
      <div>
        <h1>Papan short draft</h1>
        <p>Draft pendek buat video AI: satu draft cuma beberapa beat + statusnya
           (📝 draft · 🔧 ongoing · ✅ done · ⚠ = metadata belum lengkap). Klik baris buat baca
           lengkap &amp; copas teksnya, atau tekan ⧉ buat langsung nyalin satu draft.</p>
        <p class="hintline">Nambah draft / naik-turunin status: kirim di chat. Web ini cuma baca —
           isinya datang dari repo.</p>
      </div>
      <div class="stats">
        <div class="stat"><b>${totals.shown(entries, INDEX.count)}</b><span>draft tampil</span></div>
        <div class="stat"><b>${fmt(shown)}</b><span>beat</span></div>
        <div class="stat"><b>${INDEX.hooks}/${INDEX.count}</b><span>🎣 ada hook</span></div>
        <div class="stat"><b>${ongoing}</b><span>🔧 ongoing</span></div>
        <div class="stat"><b>${done}</b><span>✅ done</span></div>
      </div>
    </div>

    <div class="card toolbar">
      <span class="flabel">status</span>
      ${fbtn('status', '', `semua ${INDEX.count}`, !F_STATUS && !F_META && !F_HOOK)}
      ${statusChips}
      ${metaTodo ? `<div class="sep"></div>${fbtn('meta', '1', `⚠ kurang meta ${metaTodo}`, F_META)}` : ''}
      ${hookTodo ? `<div class="sep"></div>${fbtn('hook', '1', `🎣 hook kosong ${hookTodo}`, F_HOOK)}` : ''}
      ${INDEX.series.length > 1 ? `<div class="sep"></div><span class="flabel">seri</span>
        ${fbtn('series', '', 'semua', !F_SERIES)}
        ${INDEX.series.slice(0, 4).map((s) => fbtn('series', s, esc(s), F_SERIES === s)).join('')}` : ''}
      <div class="spacer"></div>
      <button class="fbtn js-board-copy" type="button" title="Salin daftar draft (judul + status)">⧉ salin daftar</button>
      <button class="fbtn js-density" type="button" aria-pressed="${density}" title="Rapatkan / longgarkan (d)">${density ? '◱ rapat' : '◲ normal'}</button>
    </div>

    ${zones || `<div class="card empty">
      <p><b>Belum ada draft yang cocok.</b></p>
      <p class="mono" style="font-size:12.5px">drafts/&lt;slug&gt;/draft.md (+ notes.md)</p>
      <p>Bikin draft baru: <code>python3 tools/drafts.py add --title "..." --beats-file beat.txt</code>,
         lalu <code>python3 tools/build_index.py</code>.</p>
    </div>`}`;

  app.querySelectorAll('.fbtn[data-f]').forEach((b) =>
    b.addEventListener('click', () => {
      const kind = b.dataset.f, val = b.dataset.v;
      if (kind === 'status') {
        F_STATUS = val;
        if (!val) { F_META = false; F_SERIES = ''; F_HOOK = false; }  // "semua" = reset semua filter
      }
      if (kind === 'meta') F_META = !F_META;
      if (kind === 'hook') F_HOOK = !F_HOOK;
      if (kind === 'series') F_SERIES = val;
      renderHome();
    })
  );
  app.querySelectorAll('.js-density').forEach((b) => b.addEventListener('click', toggleDensity));
  app.querySelectorAll('.js-board-copy').forEach((b) =>
    b.addEventListener('click', () => copy(boardText(entries), b))
  );
  app.querySelectorAll('.js-rowcopy').forEach((b) =>
    b.addEventListener('click', async (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const meta = entryBySlug(b.dataset.slug);
      if (!meta) return;
      try {
        const d = await loadData(meta.slug);
        copy(plainText(meta, d), b);
      } catch (_) {
        b.textContent = '✕';
        setTimeout(() => { b.textContent = '⧉'; }, 1400);
      }
    })
  );
}

const totals = {
  shown: (entries, total) => (entries.length === total ? total : `${entries.length}/${total}`),
};

/* --------------------------------- detail -------------------------------- */

function chevronRow(c) {
  return `
    <div class="ready-row ${c.ok ? 'ok' : 'warn'}">
      <div class="mark">${c.ok ? '✓' : '!'}</div>
      <div class="lbl">${esc(c.label)}<small>${esc(c.note || '')}</small></div>
      <div class="val">${esc(String(c.value))}</div>
    </div>`;
}

async function renderDraft(slug) {
  const e = entryBySlug(slug);
  if (!e) { app.innerHTML = `<div class="card empty">Draft <code>${esc(slug)}</code> nggak ada di index.</div>`; return; }

  app.innerHTML = `<div class="loading">Memuat ${esc(e.title)}…</div>`;
  let d;
  try { d = await loadData(slug); } catch (err) {
    app.innerHTML = `<div class="card empty">Gagal memuat data: ${esc(err.message)}</div>`;
    return;
  }
  if (parseHash().slug !== slug) return;

  const list = INDEX.entries;
  const i = list.findIndex((x) => x.slug === slug);
  const prev = i > 0 ? list[i - 1] : null;
  const next = i >= 0 && i < list.length - 1 ? list[i + 1] : null;

  const chips = [
    ['beat', e.beats_count],
    ['kamera', e.camera_beats || '-'],
    ['format', e.format],
    ['durasi', e.duration ? e.duration + ' dtk' : ''],
    ['seri', e.series],
    ['lane', e.lane],
    ['setting', e.setting],
    ['karakter', (e.characters || []).join(', ')],
    ['dibuat', e.date],
  ].filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== '-');

  const beats = (d.beats || []).map((b) => `
    <li class="beat ${b.camera ? 'cam' : ''}">
      <span class="bn">${b.n}</span>
      <p class="bt">${esc(b.text)}</p>
      ${b.camera ? '<span class="camtag" title="beat ini arahan kamera/POV">🎥</span>' : ''}
      <button class="copybtn js-beat" type="button" data-beat="${b.n}" aria-label="Salin beat ${b.n}" title="Salin beat ini">⧉</button>
    </li>`).join('');

  app.innerHTML = `
    <div class="crumbs"><a href="#/">← Papan</a><span>/</span><span>${esc(e.series || 'short draft')}</span><span>/</span><span class="mono">${esc(e.slug)}</span></div>

    <header class="card desk-head">
      <div class="dh-grid">
        ${posterHTML(e, 132, 'poster-lg')}
        <div class="dh-body">
          <div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap">
            <span class="pill ${esc(e.status)}"><i class="dot"></i>${stMeta(e.status).icon} ${esc(stMeta(e.status).label)}</span>
            ${(e.tags || []).map((t) => `<span class="pill">${esc(t)}</span>`).join('')}
          </div>
          <h1>${esc(e.title)}</h1>
          ${e.logline ? `<p class="logline">${esc(e.logline)}</p>` : ''}
          <div class="chips">${chips.map(([k, v]) => {
            const s = String(v);
            const short = s.length > 44 ? s.slice(0, 42) + '…' : s;
            return `<span class="chip"${s.length > 44 ? ` title="${esc(s)}"` : ''}><b>${esc(k)}</b> <code>${esc(short)}</code></span>`;
          }).join('')}</div>
          <div class="actions">
            <button class="btn primary" data-copy="plain" type="button" title="Teks polos: judul + '-' di depan tiap beat">Salin teks</button>
            <button class="btn" data-copy="md" type="button" title="Markdown asli draft ini, termasuk frontmatter">Salin markdown</button>
            <button class="btn" data-dl="md" type="button">Unduh .md</button>
            <a class="btn" href="${esc(e.url)}" target="_blank" rel="noopener">GitHub</a>
            ${e.notes_path ? `<a class="btn" href="https://github.com/${esc(INDEX.repo || 'paimonchan/short-draft')}/blob/main/${esc(e.notes_path)}" target="_blank" rel="noopener">notes.md</a>` : ''}
          </div>
        </div>
      </div>
    </header>

    <nav class="sectnav" aria-label="Bagian halaman">
      <a href="#sect-hook" data-jump="sect-hook">🎣 Hook${e.has_hook ? ` <span>${e.hook_score}/3</span>` : ''}</a>
      <a href="#sect-beat" data-jump="sect-beat">Beat</a>
      ${d.notes ? '<a href="#sect-notes" data-jump="sect-notes">Catatan</a>' : ''}
      <a href="#sect-ready" data-jump="sect-ready">Kesiapan <span>${e.ready}/${e.ready_total}</span></a>
      <a href="#sect-raw" data-jump="sect-raw">Markdown</a>
    </nav>

    <div class="desk wide">
      <div id="deskbody">
        <section class="card sect" id="sect-hook">
          <div class="sect-head"><span class="k">hook</span><h2>Hook (0–2,2 dtk)</h2>
            <span class="hint">${e.has_hook ? `isyarat ${e.hook_score}/3` : 'belum diisi'}</span></div>
          ${e.has_hook ? `
            <p class="hooktext">🎣 ${esc(e.hook)}</p>
            <div class="chips">
              ${[['frame1', 'frame pertama'], ['question', 'ada pertanyaan'], ['motion', 'ada gerak/bunyi']]
                .map(([k, label]) => `<span class="chip sig ${e.hook_signals[k] ? 'ok' : 'no'}"><b>${e.hook_signals[k] ? '✓' : '✗'}</b> <code>${label}</code></span>`)
                .join('')}
            </div>` : `<p class="hooktext muted">Belum ada hook untuk draft ini. Isi satu baris: apa yang <b>sudah</b> terjadi di frame pertama + pertanyaan yang bikin orang berhenti scroll.</p>`}
          <div class="sect-foot"><span class="muted">Rubrik 5 cek: muka di frame 1 · premis kebaca tanpa penjelasan · ada pertanyaan yang belum dijawab · masih jalan walau dimute (caption bawa pertanyaannya) · beda dari frame 1 episode lain. Isyarat di atas heuristik teks, bukan penilaian mutu.</span></div>
        </section>

        <section class="card sect" id="sect-beat">
          <div class="sect-head"><span class="k">aksi</span><h2>Beat</h2>
            <span class="hint">${e.beats_count} beat · ${e.camera_beats} arahan kamera · ${e.words} kata</span></div>
          <ol class="beats">${beats || '<li class="beat"><p class="bt muted">Belum ada beat.</p></li>'}</ol>
          <div class="sect-foot">
            <span class="muted">Tiap beat bisa dicopas sendiri. Yang bertanda 🎥 isinya arahan kamera/POV.</span>
          </div>
        </section>

        ${d.notes ? `<section class="card sect" id="sect-notes">
          <div class="sect-head"><span class="k">produksi</span><h2>Catatan produksi</h2></div>
          <div class="notes">${md(d.notes)}</div>
        </section>` : ''}

        <section class="card sect" id="sect-ready">
          <div class="sect-head"><span class="k">meta</span><h2>Kesiapan metadata</h2>
            <span class="hint">${e.ready}/${e.ready_total} terisi</span></div>
          <div class="ready-grid">${(e.checks || []).map(chevronRow).join('')}</div>
        </section>

        <section class="card sect" id="sect-raw">
          <details class="seg seg-extra">
            <summary><span class="st"><b>Lihat markdown mentah</b></span><span class="sc">raw</span><span class="chev">▸</span></summary>
            <div class="sbody"><pre class="raw">${esc(d.raw || '')}</pre></div>
          </details>
        </section>
      </div>
    </div>

    <nav class="pager">
      ${prev ? `<a class="btn" href="#/d/${prev.slug}">← ${esc(prev.title)}</a>` : '<span></span>'}
      ${next ? `<a class="btn" href="#/d/${next.slug}">${esc(next.title)} →</a>` : '<span></span>'}
    </nav>`;

  app.querySelectorAll('[data-copy="plain"]').forEach((b) => b.addEventListener('click', () => copy(plainText(e, d), b)));
  app.querySelectorAll('[data-copy="md"]').forEach((b) => b.addEventListener('click', () => copy(d.raw || '', b)));
  app.querySelectorAll('[data-dl="md"]').forEach((b) => b.addEventListener('click', () => download(e.slug + '.md', d.raw || '')));
  app.querySelectorAll('.js-beat').forEach((b) =>
    b.addEventListener('click', (ev) => {
      ev.preventDefault();
      const beat = (d.beats || []).find((x) => String(x.n) === b.dataset.beat);
      if (beat) copy(beat.text, b);
    })
  );
  app.querySelectorAll('.sectnav a[data-jump]').forEach((a) =>
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      document.getElementById(a.dataset.jump)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    })
  );

  updateFooter(e);
}

/* --------------------------------- shell --------------------------------- */

function updateFooter(e) {
  document.getElementById('foot-left').textContent = e
    ? `${e.title} · ${e.beats_count} beat`
    : 'Short Draft, draft pendek untuk video AI';
  document.getElementById('brand-sub').textContent = e ? e.title : 'draft pendek → video AI';
  document.getElementById('foot-right').textContent = INDEX
    ? `index ${INDEX.generated} · ${INDEX.count} draft · ${fmt(INDEX.beats)} beat`
    : '';
}

function route() {
  const r = parseHash();
  if (r.view === 'draft') renderDraft(r.slug);
  else { renderHome(); updateFooter(null); }
  window.scrollTo({ top: 0, behavior: 'auto' });
  onScroll();
}

/* --------------------------------- events -------------------------------- */

qInput.addEventListener('input', () => {
  FILTER = qInput.value.trim();
  if (parseHash().view !== 'home') location.hash = '#/';
  else renderHome();
});

function toggleTheme() {
  const cur = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = cur;
  try { localStorage.setItem('sd-theme', cur); } catch (_) {}
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', cur === 'light' ? '#f5f7f9' : '#0a0c0f');
}

function toggleDensity() {
  const cur = document.documentElement.dataset.density === 'compact' ? 'normal' : 'compact';
  document.documentElement.dataset.density = cur;
  try { localStorage.setItem('sd-density', cur); } catch (_) {}
  document.querySelectorAll('.js-density').forEach((b) => {
    b.setAttribute('aria-pressed', String(cur === 'compact'));
    b.textContent = cur === 'compact' ? '◱ rapat' : '◲ normal';
  });
}

document.getElementById('theme').addEventListener('click', toggleTheme);
document.getElementById('density-btn')?.addEventListener('click', toggleDensity);

document.addEventListener('keydown', (ev) => {
  const typing = /^(input|textarea)$/i.test(ev.target.tagName);
  if (ev.key === '/' && !typing) { ev.preventDefault(); qInput.focus(); qInput.select(); return; }
  if (ev.key === 'Escape') {
    if (typing) { qInput.value = ''; FILTER = ''; qInput.blur(); if (parseHash().view === 'home') renderHome(); }
    else if (parseHash().view === 'draft') location.hash = '#/';
    return;
  }
  if ((ev.key === 't' || ev.key === 'T') && !typing) { toggleTheme(); return; }
  if ((ev.key === 'd' || ev.key === 'D') && !typing) { toggleDensity(); return; }
  if (typing) return;

  const r = parseHash();
  if (r.view !== 'draft') return;
  const i = INDEX.entries.findIndex((x) => x.slug === r.slug);
  if (ev.key === 'ArrowRight' && i < INDEX.entries.length - 1) location.hash = `#/d/${INDEX.entries[i + 1].slug}`;
  if (ev.key === 'ArrowLeft' && i > 0) location.hash = `#/d/${INDEX.entries[i - 1].slug}`;
});

window.addEventListener('hashchange', route);
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);

function onScroll() {
  if (!progEl) return;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progEl.style.width = h > 0 ? Math.min(100, (window.scrollY / h) * 100) + '%' : '0';
}

/* --------------------------------- init ---------------------------------- */

try {
  const t = localStorage.getItem('sd-theme');
  if (t) document.documentElement.dataset.theme = t;
  const dn = localStorage.getItem('sd-density');
  if (dn) document.documentElement.dataset.density = dn;
} catch (_) {}

// tombol density di topbar ikut state yang tersimpan
(() => {
  const compact = document.documentElement.dataset.density === 'compact';
  document.querySelectorAll('.js-density').forEach((b) => {
    b.setAttribute('aria-pressed', String(compact));
    b.textContent = compact ? '◱ rapat' : '◲ normal';
  });
})();

fetch('index.json', { cache: 'no-cache' })
  .then((r) => { if (!r.ok) throw new Error('index.json ' + r.status); return r.json(); })
  .then((idx) => {
    INDEX = idx;
    updateFooter(null);
    route();
  })
  .catch((err) => {
    app.innerHTML = `<div class="card empty">Gagal memuat index.json, ${esc(err.message)}</div>`;
  });
