/* ===================== Rapport de match, QR code, validation par l'entraîneur ===================== */
/* ---------- QR code (mode octet, correction M, versions 1 à 10), sans dépendance ---------- */
const QR = (() => {
  const EXP = new Array(512), LOG = new Array(256);
  for (let i = 0, x = 1; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  const mul = (a, b) => a && b ? EXP[LOG[a] + LOG[b]] : 0;
  const genPoly = n => { let g = [1]; for (let i = 0; i < n; i++) { const ng = new Array(g.length + 1).fill(0); g.forEach((c, j) => { ng[j] ^= c; ng[j + 1] ^= mul(c, EXP[i]); }); g = ng; } return g; };
  const rs = (data, n) => { const g = genPoly(n), r = data.concat(new Array(n).fill(0)); for (let i = 0; i < data.length; i++) { const c = r[i]; if (c) for (let j = 0; j < g.length; j++) r[i + j] ^= mul(g[j], c); } return r.slice(data.length); };
  // [codewords EC par bloc, [[nb blocs, données par bloc], ...]] pour le niveau M
  const TBL = {1:[10, [[1, 16]]], 2:[16, [[1, 28]]], 3:[26, [[1, 44]]], 4:[18, [[2, 32]]], 5:[24, [[2, 43]]], 6:[16, [[4, 27]]], 7:[18, [[4, 31]]], 8:[22, [[2, 38], [2, 39]]], 9:[22, [[3, 36], [2, 37]]], 10:[26, [[4, 43], [1, 44]]]};
  const ALIGN = {2:[6, 18], 3:[6, 22], 4:[6, 26], 5:[6, 30], 6:[6, 34], 7:[6, 22, 38], 8:[6, 24, 42], 9:[6, 26, 46], 10:[6, 28, 50]};
  const bch = (v, poly, bits) => { let x = v << bits; const top = Math.floor(Math.log2(poly)); for (let i = Math.floor(Math.log2(x)); i >= top; i--) if (x & (1 << i)) x ^= poly << (i - top); return (v << bits) | x; };
  function encode(text) {
    const bytes = Array.from(new TextEncoder().encode(text));
    let ver = 0; for (let v = 1; v <= 10; v++) { const cap = TBL[v][1].reduce((a, [n, d]) => a + n * d, 0); if (4 + (v < 10 ? 8 : 16) + bytes.length * 8 <= cap * 8) { ver = v; break; } }
    if (!ver) throw new Error('Texte trop long pour le QR code');
    const [ecn, groups] = TBL[ver], cap = groups.reduce((a, [n, d]) => a + n * d, 0);
    const bits = []; const put = (v, n) => { for (let i = n - 1; i >= 0; i--) bits.push((v >> i) & 1); };
    put(4, 4); put(bytes.length, ver < 10 ? 8 : 16); bytes.forEach(b => put(b, 8));
    put(0, Math.min(4, cap * 8 - bits.length)); while (bits.length % 8) bits.push(0);
    const data = []; for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));
    for (let k = 0; data.length < cap; k++) data.push(k % 2 ? 0x11 : 0xec);
    const blocks = [], ecs = []; let off = 0;
    groups.forEach(([n, d]) => { for (let i = 0; i < n; i++) { const b = data.slice(off, off + d); off += d; blocks.push(b); ecs.push(rs(b, ecn)); } });
    const cw = []; const mx = Math.max(...blocks.map(b => b.length));
    for (let i = 0; i < mx; i++) blocks.forEach(b => { if (i < b.length) cw.push(b[i]); });
    for (let i = 0; i < ecn; i++) ecs.forEach(e => cw.push(e[i]));
    const N = 17 + ver * 4, M = Array.from({length:N}, () => new Array(N).fill(null)), F = Array.from({length:N}, () => new Array(N).fill(false));
    const set = (r, c, v) => { M[r][c] = v; F[r][c] = true; };
    const finder = (r, c) => { for (let i = -1; i <= 7; i++) for (let j = -1; j <= 7; j++) { const rr = r + i, cc = c + j; if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue; const on = i >= 0 && i <= 6 && j >= 0 && j <= 6 && (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)); set(rr, cc, on ? 1 : 0); } };
    finder(0, 0); finder(0, N - 7); finder(N - 7, 0);
    for (let i = 8; i < N - 8; i++) { set(6, i, i % 2 ? 0 : 1); set(i, 6, i % 2 ? 0 : 1); }
    const AL = ALIGN[ver] || [], last = AL.length - 1;
    AL.forEach((r, ri) => AL.forEach((c, ci) => { if ((ri === 0 && ci === 0) || (ri === 0 && ci === last) || (ri === last && ci === 0)) return; for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) set(r + i, c + j, Math.max(Math.abs(i), Math.abs(j)) !== 1 ? 1 : 0); }));
    set(N - 8, 8, 1);
    for (let i = 0; i < 9; i++) { if (!F[8][i]) F[8][i] = true; if (!F[i][8]) F[i][8] = true; }
    for (let i = 0; i < 8; i++) { F[8][N - 1 - i] = true; F[N - 1 - i][8] = true; }
    if (ver >= 7) { const vb = bch(ver, 0x1f25, 12); for (let i = 0; i < 18; i++) { const b = (vb >> i) & 1, r = Math.floor(i / 3), c = N - 11 + i % 3; set(r, c, b); set(c, r, b); } }
    const pos = []; for (let c = N - 1, up = true; c > 0; c -= 2) { if (c === 6) c--; for (let k = 0; k < N; k++) { const r = up ? N - 1 - k : k; for (const cc of [c, c - 1]) if (!F[r][cc]) pos.push([r, cc]); } up = !up; }
    const bitsOut = []; cw.forEach(b => { for (let i = 7; i >= 0; i--) bitsOut.push((b >> i) & 1); });
    const MASKS = [(r, c) => (r + c) % 2 === 0, (r) => r % 2 === 0, (r, c) => c % 3 === 0, (r, c) => (r + c) % 3 === 0, (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0, (r, c) => (r * c) % 2 + (r * c) % 3 === 0, (r, c) => ((r * c) % 2 + (r * c) % 3) % 2 === 0, (r, c) => ((r + c) % 2 + (r * c) % 3) % 2 === 0];
    const build = mk => {
      const G = M.map(row => row.slice());
      pos.forEach(([r, c], i) => { const b = i < bitsOut.length ? bitsOut[i] : 0; G[r][c] = b ^ (MASKS[mk](r, c) ? 1 : 0); });
      const fb = bch((0 << 3) | mk, 0x537, 10) ^ 0x5412; // niveau M = 00
      for (let i = 0; i < 15; i++) { const b = (fb >> i) & 1;
        if (i < 6) G[i][8] = b; else if (i < 8) G[i + 1][8] = b; else G[N - 15 + i][8] = b;
        if (i < 8) G[8][N - 1 - i] = b; else if (i < 9) G[8][7] = b; else G[8][14 - i] = b; }
      return G;
    };
    const penalty = G => {
      let s = 0;
      for (let pass = 0; pass < 2; pass++) for (let i = 0; i < N; i++) { let run = 1; for (let j = 1; j < N; j++) { const a = pass ? G[j][i] : G[i][j], b = pass ? G[j - 1][i] : G[i][j - 1]; if (a === b) { run++; if (run === 5) s += 3; else if (run > 5) s++; } else run = 1; } }
      for (let i = 0; i < N - 1; i++) for (let j = 0; j < N - 1; j++) { const v = G[i][j]; if (v === G[i + 1][j] && v === G[i][j + 1] && v === G[i + 1][j + 1]) s += 3; }
      const pat = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0], pat2 = pat.slice().reverse();
      for (let i = 0; i < N; i++) for (let j = 0; j <= N - 11; j++) for (const P of [pat, pat2]) { let h = true, v = true; for (let k = 0; k < 11; k++) { if (G[i][j + k] !== P[k]) h = false; if (G[j + k][i] !== P[k]) v = false; } if (h) s += 40; if (v) s += 40; }
      const dark = G.flat().reduce((a, b) => a + b, 0); s += Math.floor(Math.abs(dark * 100 / (N * N) - 50) / 5) * 10;
      return s;
    };
    let best = null, bestS = Infinity; for (let mk = 0; mk < 8; mk++) { const G = build(mk), sc = penalty(G); if (sc < bestS) { best = G; bestS = sc; } }
    return best;
  }
  function svg(text, opt) {
    opt = opt || {}; const G = encode(text), N = G.length, q = 4, S = N + q * 2; let d = '';
    G.forEach((row, r) => row.forEach((v, c) => { if (v) d += `M${c + q} ${r + q}h1v1h-1z`; }));
    return `<svg class="qr" viewBox="0 0 ${S} ${S}" shape-rendering="crispEdges" role="img" aria-label="${esc(opt.label || 'QR code')}"${opt.size ? ` width="${opt.size}" height="${opt.size}"` : ''}><rect width="${S}" height="${S}" fill="#fff"/><path d="${d}" fill="${opt.color || '#000'}"/></svg>`;
  }
  function draw(g, text, x, y, size) { const G = encode(text), N = G.length, q = 3, s = size / (N + q * 2); g.fillStyle = '#fff'; g.fillRect(x, y, size, size); g.fillStyle = '#000'; G.forEach((row, r) => row.forEach((v, c) => { if (v) g.fillRect(Math.floor(x + (c + q) * s), Math.floor(y + (r + q) * s), Math.ceil(s), Math.ceil(s)); })); }
  return {encode, svg, draw};
})();
function profileURL(p) { return `https://passerelle.app/p/${(hashStr(p.id + p.lastName) % 1e8).toString(36)}`; }

/* Carte QR sur la page Profil public, QR dans l'export et le carton de fin du studio */
const vPartageV6 = VIEWS.partage;
VIEWS.partage = function () {
  const p = state.player; let html = vPartageV6();
  const qrCard = `<section class="card"><h3>QR code du profil</h3><div class="qr-wrap">${QR.svg(profileURL(p), {label:'QR code menant au profil public'})}<div class="small"><p style="margin:0 0 8px">À imprimer sur ta fiche de détection, ton CV ou à montrer depuis ton téléphone : un recruteur ouvre ton profil en une seconde.</p><p class="tiny muted" style="margin:0 0 8px;overflow-wrap:anywhere">${esc(profileURL(p))}</p><button class="btn sm" data-action="qrDownload">Télécharger (SVG)</button></div></div></section>`;
  const coh = `<section class="card"><h3>Contrôles de cohérence</h3><p class="small muted" style="margin:0 0 8px">Ce qu’un recruteur attentif remarquerait. Une incohérence réduit l’indice de preuve.</p>${coherenceHTML(p)}</section>`;
  html = html.replace('<section class="card"><h3>Apparence du profil</h3>', qrCard + '<section class="card"><h3>Apparence du profil</h3>');
  html = html.replace('<section class="card"><h3>Indice de preuve', coh + '<section class="card"><h3>Indice de preuve');
  return html;
};
ACT.qrDownload = () => { const p = state.player; saveFile(`qr-profil-${(p.lastName || 'joueur').toLowerCase()}.svg`, '<?xml version="1.0" encoding="UTF-8"?>' + QR.svg(profileURL(p)).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" ')); };
const profileDocV6 = profileDoc;
profileDoc = function (p, opt) {
  let html = profileDocV6(p, opt);
  if (opt && opt.export) html = html.replace('<footer class="pp2-foot">', `<footer class="pp2-foot"><div class="pp2-qr">${QR.svg(profileURL(p), {label:'QR code du profil', size:96})}<span>${esc(profileURL(p))}</span></div>`);
  return html;
};
const studioPaintCardV6 = studioPaintCard;
studioPaintCard = function (cv, kind, k) {
  studioPaintCardV6(cv, kind, k);
  if (kind !== 'outro' || !cv) return;
  const g = cv.getContext('2d'), W = cv.width, H = cv.height, sz = Math.round(Math.min(W, H) * .3);
  g.globalAlpha = Math.min(1, k * 3); QR.draw(g, profileURL(state.player), Math.round(W / 2 - sz / 2), Math.round(H / 2 + Math.min(W, H) * .16), sz); g.globalAlpha = 1;
};

/* ---------- Rapport de match ---------- */
function matchReportHTML(m, pid, exp) {
  const p = findPlayer(pid) || state.player, e = (m.engine || {})[pid], sh = (m.sheet || {})[pid], q = e && e.quality;
  const vc = m.clips.filter(c => c.playerId === pid && c.status === 'validé').sort((a, b) => (a.at || a.t) - (b.at || b.t));
  const passes = vc.filter(c => c.type === 'passe'), known = passes.filter(c => c.outcome === 'reussie' || c.outcome === 'perdue'), ok = known.filter(c => c.outcome === 'reussie').length;
  const S = e && e.summary || {}, ph = e && e.physical;
  const tile = (v, l, pf) => `<div class="pp2-key"><b>${v}</b><span>${esc(l)}</span>${pf ? `<em>${proofPill(pf)}</em>` : ''}</div>`;
  const tiles = [
    sh && has(sh.minutes) ? tile(esc(sh.minutes) + '<small> min</small>', 'Temps de jeu', sh.validated ? 'coach' : 'declare') : '',
    ph ? tile((ph.distance_m / 1000).toFixed(1).replace('.', ',') + '<small> km</small>', `Distance (${Math.round(ph.minutes_tracked)} min suivies)`, 'moteur') : '',
    ph ? tile(ph.sprints, `Sprints · pointe ${String(ph.top_speed_kmh).replace('.', ',')} km/h`, 'moteur') : '',
    known.length ? tile(`${ok}/${known.length}`, 'Passes réussies (validées)', 'moteur') : S.passes_known ? tile(`${S.passes_ok}/${S.passes_known}`, 'Passes réussies (moteur)', 'moteur') : '',
    S.progressive_passes != null ? tile(S.progressive_passes, 'Passes progressives', 'moteur') : '',
    S.recoveries != null ? tile(S.recoveries, 'Récupérations', 'moteur') : '',
    sh && (has(sh.goals) || has(sh.assists)) ? tile(`${n0(sh.goals)} · ${n0(sh.assists)}`, 'Buts · passes décisives', sh.validated ? 'coach' : 'declare') : ''
  ].filter(Boolean).join('');
  const acts = vc.length ? `<table><thead><tr><th>Minute</th><th>Action</th><th>Détail</th></tr></thead><tbody>${vc.map(c => `<tr><td>${Math.floor((c.at || c.t) / 60)}’</td><td>${esc(ctype(c.type)[1])}${c.outcome === 'reussie' ? ' ✓' : c.outcome === 'perdue' ? ' ✗' : ''}</td><td>${esc(c.why || (c.origin === 'manuel' ? 'Marqué à la main' : ''))}</td></tr>`).join('')}</tbody></table>` : '<p>Aucune action validée pour ce match.</p>';
  return `<article class="pp2" style="--pa:${profileAccent(p)}"><header class="pp2-hero cover-terrain"><div class="pp2-kick">Rapport de match · ${esc(fdate(m.date))}${m.competition ? ' · ' + esc(m.competition) : ''}</div><h1>${esc(m.title)}</h1><div class="pp2-meta">${esc(p.firstName)} ${esc(p.lastName)} · ${esc(p.position)}${q ? ` · qualité d’analyse ${esc(q.grade)}` : ''}</div></header>
    ${tiles ? `<div class="pp2-keys">${tiles}</div>` : ''}
    ${e && e.heatmap ? `<section class="pp2-sec"><div class="pp2-two"><div><h2>Zones occupées</h2>${heatSVG(e.heatmap.values, 'fr')}</div><div><h2>Qualité de l’analyse</h2><div class="pp2-facts"><div><span>Note</span><b>${esc(q ? q.grade : '—')}</b></div><div><span>Joueur visible</span><b>${q ? Math.round(q.target_visible_ratio * 100) + ' %' : '—'}</b></div><div><span>Ballon visible</span><b>${q && q.ball_visible_ratio != null ? Math.round(q.ball_visible_ratio * 100) + ' %' : '—'}</b></div><div><span>Caméra</span><b>${q ? (q.camera_fixed ? 'Fixe' : 'Mobile') : '—'}</b></div></div>${q && q.warnings && q.warnings.length ? `<p class="pp2-note">${q.warnings.map(esc).join(' ')}</p>` : ''}</div></div></section>` : ''}
    <section class="pp2-sec"><h2>Actions validées (${vc.length})</h2>${acts}</section>
    <footer class="pp2-foot">Chiffres du moteur Passerelle${e ? ' (' + esc(e.version) + ')' : ''}, actions validées par le joueur${sh && sh.validated ? ', feuille de match validée par l’entraîneur' : ''}.${exp ? ' Profil complet : ' + esc(profileURL(p)) : ''}</footer></article>`;
}
Object.assign(ACT, {
  report(id) {
    const m = state.matches.find(x => x.id === (id || (curMatch() || {}).id)); if (!m) return;
    const pid = state.role === 'entraineur' ? (ui.tagPlayer || (roster()[0] || {}).id) : 'me';
    ui.reportId = m.id;
    openModal('Rapport de match', `${matchReportHTML(m, pid)}<div class="actions"><button class="btn primary" data-action="reportExport">Exporter en HTML</button><button class="btn" data-action="reportPrint">Imprimer ou PDF</button></div>`, true);
  },
  reportExport() {
    const m = state.matches.find(x => x.id === ui.reportId); if (!m) return; const pid = state.role === 'entraineur' ? (ui.tagPlayer || (roster()[0] || {}).id) : 'me';
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rapport · ${esc(m.title)}</title><style>body{margin:0;background:#eef2f0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}main{max-width:880px;margin:24px auto;padding:0 12px}.tiny{font-size:.75rem}.muted{color:#55625d}${PP2_CSS}</style></head><body><main>${matchReportHTML(m, pid, true)}</main></body></html>`;
    saveFile(`rapport-${(m.opponent || 'match').toLowerCase().replace(/[^a-z0-9]+/gi, '-')}-${m.date}.html`, html);
  },
  reportPrint() { const sheet = document.querySelector('#modal .sheet-b'); if (!sheet) return; document.body.classList.add('print-modal'); window.print(); setTimeout(() => document.body.classList.remove('print-modal'), 500); }
});

/* ---------- Entraîneur : valider les feuilles de match de l'effectif ---------- */
function pendingSheets() {
  const ids = new Set(roster().map(p => p.id)); const out = [];
  state.matches.forEach(m => Object.entries(m.sheet || {}).forEach(([pid, sh]) => { if (ids.has(pid) && !sh.validated) out.push({m, pid, sh, p:findPlayer(pid)}); }));
  return out;
}
const vCoachAccueilV6 = VIEWS['coach-accueil'];
VIEWS['coach-accueil'] = function () {
  const html = vCoachAccueilV6(), pend = pendingSheets();
  const card = `<section class="card" style="margin-top:16px"><h3>Feuilles de match à valider <span class="pill ${pend.length ? 'warn' : 'ok'}">${pend.length}</span></h3><p class="small muted" style="margin:0 0 8px">Ta validation fait passer le temps de jeu, les buts et les passes décisives au niveau « Validé par l’entraîneur » sur le profil du joueur.</p>
    ${pend.length ? `<div class="list">${pend.map(({m, pid, sh, p}) => `<div class="row"><div class="grow"><div class="t">${esc(p ? p.firstName + ' ' + p.lastName : pid)}</div><div class="small muted">${esc(m.title)} · ${fdate(m.date)} · ${esc(sh.minutes || '?')} min · ${n0(sh.goals)} but${n0(sh.goals) > 1 ? 's' : ''} · ${n0(sh.assists)} passe${n0(sh.assists) > 1 ? 's' : ''} déc.</div></div><button class="btn sm primary" data-action="sheetValidate" data-arg="${m.id}|${pid}">Valider</button></div>`).join('')}</div>` : '<div class="empty">Tout est validé.</div>'}</section>`;
  return html + card;
};
ACT.sheetValidate = function (a) {
  const [mid, pid] = String(a).split('|'); const m = state.matches.find(x => x.id === mid); const sh = m && m.sheet && m.sheet[pid]; if (!sh) return;
  sh.validated = true; sh.validatedBy = (state.coach.firstName + ' ' + state.coach.lastName).trim(); sh.validatedAt = today();
  if (pid === 'me') state.notifications.unshift({id:uid(), to:'joueur', text:`${sh.validatedBy} a validé ta feuille de match contre ${m.opponent || m.title}.`, date:today(), read:false});
  save(); render(); toast('Feuille de match validée.');
};

