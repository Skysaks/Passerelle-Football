/* ===================== Preuves, statistiques, moteur V0.2 ===================== */
// Nouveaux types d'actions produits par le moteur V0.2
CLIP_TYPES.push(['passe', 'Passe', '', '#2c6e63'], ['conduite', 'Conduite de balle', '', '#7a5c1e'], ['controle', 'Contrôle', '', '#4c5e6b']);
const ENGINE_TYPE_MAP = {passe:'passe', conduite:'conduite', frappe:'tir', controle:'controle', touche:'touche'};

/* ---------- Niveaux de preuve ---------- */
const PROOF = {
  declare:{r:0, fr:'Déclaré', en:'Self-reported', es:'Declarado', d:'Saisi par le joueur, sans justificatif.'},
  document:{r:1, fr:'Justifié', en:'Documented', es:'Justificado', d:'Appuyé par un document déposé.'},
  coach:{r:2, fr:'Validé par l’entraîneur', en:'Coach-verified', es:'Validado por el entrenador', d:'Confirmé par l’entraîneur du club.'},
  moteur:{r:3, fr:'Mesuré sur vidéo', en:'Video-measured', es:'Medido en vídeo', d:'Calculé par le moteur sur des matchs filmés, actions validées une à une.'},
  certifie:{r:4, fr:'Certifié', en:'Certified', es:'Certificado', d:'Mesuré lors d’un test encadré (détection, stage, partenaire).'}
};
function proofPill(level, lang) { const p = PROOF[level] || PROOF.declare; return `<span class="proof proof-${level}" title="${esc(p.d)}"><span class="pdot" aria-hidden="true"></span>${esc(p[lang || 'fr'] || p.fr)}</span>`; }

/* ---------- Population de référence (simulée pour la démo) ---------- */
function posGroup(pos) { if (pos === 'Gardien') return 'GK'; if (/Défenseur|Latéral/.test(pos || '')) return 'DEF'; if (/Ailier|Attaquant/.test(pos || '')) return 'ATT'; return 'MIL'; }
const GROUP_LABEL = {GK:'gardiens', DEF:'défenseurs', MIL:'milieux', ATT:'attaquants'};
const GROUP_EN = {GK:'goalkeepers', DEF:'defenders', MIL:'midfielders', ATT:'forwards'};
const REF = { // moyenne, écart-type par groupe de postes, niveau amateur national/régional (hypothèses de démo)
  distance90:{GK:[5200, 500], DEF:[9300, 700], MIL:[10200, 800], ATT:[9500, 800]},
  hsr90:{GK:[120, 60], DEF:[420, 130], MIL:[500, 150], ATT:[600, 170]},
  sprints90:{GK:[1, 1], DEF:[6, 2.5], MIL:[6, 2.5], ATT:[9, 3]},
  top:{GK:[24, 1.8], DEF:[28.5, 1.6], MIL:[28, 1.6], ATT:[29.5, 1.7]},
  passes90:{GK:[22, 6], DEF:[38, 9], MIL:[45, 11], ATT:[24, 7]},
  passAcc:{GK:[68, 8], DEF:[78, 6], MIL:[80, 6], ATT:[70, 8]},
  carries90:{GK:[0.5, 0.5], DEF:[3, 1.5], MIL:[5, 2], ATT:[7, 2.5]},
  shots90:{GK:[0, 0.1], DEF:[0.4, 0.3], MIL:[1.1, 0.6], ATT:[2.6, 1]},
  ga90:{GK:[0, 0.02], DEF:[0.08, 0.07], MIL:[0.3, 0.15], ATT:[0.6, 0.25]},
  sprint30:{GK:[4.4, .15], DEF:[4.2, .14], MIL:[4.22, .14], ATT:[4.12, .14]},
  vma:{GK:[16, 1], DEF:[17.6, 1], MIL:[18, 1], ATT:[17.8, 1]},
  jump:{GK:[52, 6], DEF:[50, 6], MIL:[47, 6], ATT:[49, 6]}
};
const METRICS = [
  {k:'distance90', l:'Distance / 90 min', en:'Distance / 90', es:'Distancia / 90', u:'km', f:v => (v / 1000).toFixed(1).replace('.', ','), src:'moteur'},
  {k:'hsr90', l:'Haute intensité / 90', en:'High-speed running / 90', es:'Alta intensidad / 90', u:'m', f:v => Math.round(v), src:'moteur'},
  {k:'sprints90', l:'Sprints / 90', en:'Sprints / 90', es:'Sprints / 90', u:'', f:v => v.toFixed(1).replace('.', ','), src:'moteur'},
  {k:'top', l:'Vitesse max', en:'Top speed', es:'Velocidad máx.', u:'km/h', f:v => v.toFixed(1).replace('.', ','), src:'moteur'},
  {k:'passes90', l:'Passes / 90', en:'Passes / 90', es:'Pases / 90', u:'', f:v => v.toFixed(1).replace('.', ','), src:'moteur'},
  {k:'passAcc', l:'Passes réussies', en:'Pass accuracy', es:'Pases acertados', u:'%', f:v => Math.round(v), src:'moteur'},
  {k:'carries90', l:'Conduites / 90', en:'Ball carries / 90', es:'Conducciones / 90', u:'', f:v => v.toFixed(1).replace('.', ','), src:'moteur'},
  {k:'shots90', l:'Frappes / 90', en:'Shots / 90', es:'Tiros / 90', u:'', f:v => v.toFixed(1).replace('.', ','), src:'moteur'},
  {k:'ga90', l:'Buts + passes déc. / 90', en:'Goals + assists / 90', es:'Goles + asist. / 90', u:'', f:v => v.toFixed(2).replace('.', ','), src:'saison'},
  {k:'sprint30', l:'Sprint 30 m', en:'30 m sprint', es:'Sprint 30 m', u:'s', f:v => v.toFixed(2).replace('.', ','), low:true, src:'test'},
  {k:'vma', l:'VMA', en:'Max aerobic speed', es:'VAM', u:'km/h', f:v => v.toFixed(1).replace('.', ','), src:'test'},
  {k:'jump', l:'Détente verticale', en:'Vertical jump', es:'Salto vertical', u:'cm', f:v => Math.round(v), src:'test'}
];
const MET = Object.fromEntries(METRICS.map(m => [m.k, m]));
const RADAR_AXES = [
  ['Volume', 'Work rate', 'Volumen', ['distance90']], ['Intensité', 'Intensity', 'Intensidad', ['hsr90', 'sprints90']],
  ['Vitesse', 'Speed', 'Velocidad', ['top', 'sprint30']], ['Jeu de passe', 'Passing', 'Pase', ['passes90', 'passAcc']],
  ['Percussion', 'Progression', 'Progresión', ['carries90', 'shots90']], ['Décisif', 'End product', 'Decisivo', ['ga90']]
];
const _refCache = {};
function refPop(g, k) {
  const key = g + k; if (_refCache[key]) return _refCache[key];
  const [mu, sd] = (REF[k] || {})[g] || [0, 1], r = rng(hashStr('ref' + key)), out = [];
  for (let i = 0; i < 240; i++) { const u = Math.max(1e-9, r()), v = r(); out.push(Math.max(0, mu + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v))); }
  return (_refCache[key] = out.sort((a, b) => a - b));
}
function pctOf(g, k, v) {
  if (v == null || !isFinite(v)) return null;
  const pop = refPop(g, k); let n = 0; for (const x of pop) if (x < v) n++;
  const p = Math.round(n / pop.length * 100); return MET[k] && MET[k].low ? 100 - p : p;
}

/* ---------- Données moteur et historique ---------- */
function engineEntries(pid) { return state.matches.filter(m => m.engine && m.engine[pid]).map(m => ({m, e:m.engine[pid]})); }
function statsLog(p) {
  const rows = [];
  state.matches.forEach(m => {
    const e = m.engine && m.engine[p.id], sh = m.sheet && m.sheet[p.id];
    if (!e && !sh) return;
    const vc = m.clips.filter(c => c.playerId === p.id && c.status === 'validé');
    const passes = vc.filter(c => c.type === 'passe'), known = passes.filter(c => c.outcome === 'reussie' || c.outcome === 'perdue');
    rows.push({id:m.id, date:m.date, opp:m.opponent || m.title, minutes:sh ? n0(sh.minutes) : (e ? Math.round(e.physical ? e.physical.minutes_tracked : 0) : null),
      goals:sh ? n0(sh.goals) : null, assists:sh ? n0(sh.assists) : null, rating:sh ? sh.rating : null,
      distance:e && e.physical ? e.physical.distance_m : null, tracked:e && e.physical ? e.physical.minutes_tracked : null, hsr:e && e.physical ? e.physical.hsr_m : null,
      sprints:e && e.physical ? e.physical.sprints : null, top:e && e.physical ? e.physical.top_speed_kmh : null,
      passes:known.length ? known.length : (e && e.summary ? e.summary.passes_known : null), passOk:known.length ? known.filter(c => c.outcome === 'reussie').length : (e && e.summary ? e.summary.passes_ok : null),
      carries:e && e.summary ? e.summary.carries : null, shots:e && e.summary ? e.summary.shots : null, src:[e ? 'moteur' : null, sh ? 'feuille' : null].filter(Boolean), live:true});
  });
  (p.pastLog || []).forEach(r => rows.push(Object.assign({src:['moteur', 'feuille'], live:false}, r)));
  return rows.sort((a, b) => a.date < b.date ? -1 : 1);
}
function metricsOf(p) {
  const g = posGroup(p.position), v = {}, proof = {};
  const log = statsLog(p).filter(r => r.tracked);
  if (log.length) {
    const min = log.reduce((a, r) => a + r.tracked, 0) || 1, per = x => x / min * 90;
    v.distance90 = per(log.reduce((a, r) => a + (r.distance || 0), 0));
    v.hsr90 = per(log.reduce((a, r) => a + (r.hsr || 0), 0));
    v.sprints90 = per(log.reduce((a, r) => a + (r.sprints || 0), 0));
    v.top = Math.max(...log.map(r => r.top || 0));
    const pk = log.reduce((a, r) => a + (r.passes || 0), 0), pok = log.reduce((a, r) => a + (r.passOk || 0), 0);
    v.passes90 = per(pk); v.passAcc = pk ? pok / pk * 100 : null;
    v.carries90 = per(log.reduce((a, r) => a + (r.carries || 0), 0));
    v.shots90 = per(log.reduce((a, r) => a + (r.shots || 0), 0));
    ['distance90', 'hsr90', 'sprints90', 'top', 'passes90', 'passAcc', 'carries90', 'shots90'].forEach(k => proof[k] = 'moteur');
  } else if (p.demoMetrics) {
    Object.assign(v, p.demoMetrics);
    ['distance90', 'hsr90', 'sprints90', 'top', 'passes90', 'passAcc', 'carries90', 'shots90'].forEach(k => proof[k] = 'moteur');
  }
  const mins = n0(p.stats.minutes);
  if (mins >= 90) { v.ga90 = (n0(p.stats.goals) + n0(p.stats.assists)) / mins * 90; proof.ga90 = p.statsValidated ? 'coach' : 'declare'; }
  [['sprint30', 'sprint30'], ['vma', 'vma'], ['jump', 'jump']].forEach(([k, f]) => { if (n0(p.physical[f])) { v[k] = n0(p.physical[f]); proof[k] = p.testsCertified ? 'certifie' : 'declare'; } });
  const pct = {}; Object.keys(v).forEach(k => pct[k] = v[k] == null ? null : pctOf(g, k, v[k]));
  const basis = log.length ? {matches:log.length, minutes:Math.round(log.reduce((a, r) => a + r.tracked, 0))} : p.demoMetrics ? {matches:p.demoMetrics.matches || 3, minutes:p.demoMetrics.minutes || 240, demo:true} : null;
  return {g, v, pct, proof, basis};
}
function radarValues(mo) { return RADAR_AXES.map(([, , , ks]) => { const xs = ks.map(k => mo.pct[k]).filter(x => x != null); return xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null; }); }
function heatOf(p) {
  const es = engineEntries(p.id).filter(x => x.e.heatmap);
  const add = (acc, hm, w) => hm.values.forEach((row, r) => row.forEach((x, c) => { acc[r][c] += x * w; }));
  const acc = Array.from({length:8}, () => Array(12).fill(0));
  if (es.length) es.forEach(x => add(acc, x.e.heatmap, (x.e.physical && x.e.physical.minutes_tracked) || 1));
  else if (p.demoHeat) add(acc, {values:p.demoHeat}, 1);
  else return null;
  const mx = Math.max(...acc.flat()) || 1; return acc.map(row => row.map(x => Math.round(x / mx * 100)));
}
function demoHeatFor(g, seed) {
  const r = rng(hashStr('heat' + seed)); const cx = {GK:1, DEF:3, MIL:5.5, ATT:8.5}[g] + (r() - .5), cy = 1.5 + r() * 5;
  return Array.from({length:8}, (_, ri) => Array.from({length:12}, (_, ci) => Math.round(100 * Math.exp(-(((ci - cx) / (g === 'MIL' ? 3 : 2.2)) ** 2 + ((ri - cy) / 2.4) ** 2)))));
}

/* ---------- Indice de preuve ---------- */
function proofItems(p) {
  const docs = p.docs || {}, eng = engineEntries(p.id).length + ((p.pastLog || []).length ? 1 : 0), vclips = playerClips(p.id).filter(c => c.status === 'validé').length;
  return [
    {l:'Identité', lvl:p.verified && p.verified.identity ? 'certifie' : docs.passport ? 'document' : 'declare', r:'dossier', w:1},
    {l:'Statistiques de saison', lvl:p.statsValidated ? 'coach' : 'declare', r:'profil', w:1.5},
    {l:'Tests physiques', lvl:p.testsCertified ? 'certifie' : 'declare', r:'evenements', w:1},
    {l:'Données de match mesurées', lvl:eng || p.demoMetrics ? 'moteur' : 'declare', r:'videos', w:2, hint:eng ? `${eng} match${eng > 1 ? 's' : ''} mesuré${eng > 1 ? 's' : ''}` : 'Aucun match mesuré'},
    {l:'Actions en vidéo', lvl:vclips >= 5 ? 'moteur' : vclips ? 'document' : 'declare', r:'videos', w:1.5, hint:`${vclips} clip${vclips > 1 ? 's' : ''} validé${vclips > 1 ? 's' : ''}`},
    {l:'Scolarité', lvl:docs.transcripts ? 'document' : 'declare', r:'dossier', w:1},
    {l:'Référence d’entraîneur', lvl:(p.endorsements || []).length ? 'coach' : 'declare', r:'profil', w:1}
  ];
}
function proofIndex(p) { const it = proofItems(p), W = it.reduce((a, x) => a + x.w, 0); return Math.round(it.reduce((a, x) => a + x.w * PROOF[x.lvl].r / 4, 0) / W * 100); }

/* ---------- Graphiques SVG ---------- */
const SERIES_COLORS = ['var(--accent)', '#d0702a', '#6a4fc4'];
function radarSVG(series, lang, size) {
  size = size || 300; const c = size / 2, R = size / 2 - 40, n = RADAR_AXES.length, pad = 64;
  const pt = (i, v) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [c + Math.cos(a) * R * v / 100, c + Math.sin(a) * R * v / 100]; };
  const lab = i => RADAR_AXES[i][lang === 'en' ? 1 : lang === 'es' ? 2 : 0];
  const rings = [25, 50, 75, 100].map(v => `<polygon points="${RADAR_AXES.map((_, i) => pt(i, v).join(',')).join(' ')}" fill="none" stroke="var(--line)" stroke-width="1"/>`).join('');
  const spokes = RADAR_AXES.map((_, i) => { const [x, y] = pt(i, 100); return `<line x1="${c}" y1="${c}" x2="${x}" y2="${y}" stroke="var(--line)"/>`; }).join('');
  const labels = RADAR_AXES.map((_, i) => { const [x, y] = pt(i, 122); return `<text x="${x}" y="${y}" text-anchor="${Math.abs(x - c) < 4 ? 'middle' : x > c ? 'start' : 'end'}" dominant-baseline="middle" font-size="12" fill="var(--muted)">${esc(lab(i))}</text>`; }).join('');
  const polys = series.map((s, si) => { const vals = s.values.map(v => v == null ? 0 : v); const col = s.color || SERIES_COLORS[si]; return `<polygon points="${vals.map((v, i) => pt(i, v).join(',')).join(' ')}" fill="${col}" fill-opacity="${series.length > 1 ? .12 : .2}" stroke="${col}" stroke-width="2"/>${vals.map((v, i) => { const [x, y] = pt(i, v); return `<circle cx="${x}" cy="${y}" r="3" fill="${col}"/>`; }).join('')}`; }).join('');
  const desc = series.map(s => `${s.label} : ${RADAR_AXES.map((a, i) => `${lab(i)} ${s.values[i] == null ? 'non mesuré' : s.values[i] + 'e centile'}`).join(', ')}`).join(' ; ');
  return `<svg class="radar" viewBox="${-pad} 0 ${size + pad * 2} ${size}" role="img" aria-label="${esc('Profil en centiles. ' + desc)}">${rings}${spokes}${polys}${labels}</svg>`;
}
function heatSVG(hm, lang, attackRight) {
  if (!hm) return '';
  const W = 360, H = 233, cw = W / 12, ch = H / 8;
  const cells = hm.map((row, r) => row.map((v, c) => v > 3 ? `<rect x="${c * cw}" y="${H - (r + 1) * ch}" width="${cw + .5}" height="${ch + .5}" fill="#ffc21a" fill-opacity="${(.12 + v / 100 * .68).toFixed(2)}"/>` : '').join('')).join('');
  const lines = `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="none" stroke="#ffffffaa" stroke-width="2"/><line x1="${W / 2}" y1="1" x2="${W / 2}" y2="${H - 1}" stroke="#ffffffaa" stroke-width="2"/><circle cx="${W / 2}" cy="${H / 2}" r="31" fill="none" stroke="#ffffffaa" stroke-width="2"/><rect x="1" y="${H / 2 - 69}" width="56" height="138" fill="none" stroke="#ffffffaa" stroke-width="2"/><rect x="${W - 57}" y="${H / 2 - 69}" width="56" height="138" fill="none" stroke="#ffffffaa" stroke-width="2"/>`;
  const zone = (() => { let best = [0, 0, 0]; hm.forEach((row, r) => row.forEach((v, c) => { if (v > best[0]) best = [v, r, c]; })); const third = best[2] < 4 ? (lang === 'en' ? 'defensive third' : 'tiers défensif') : best[2] < 8 ? (lang === 'en' ? 'middle third' : 'tiers médian') : (lang === 'en' ? 'attacking third' : 'tiers offensif'); return third; })();
  const att = lang === 'en' ? 'Attack →' : lang === 'es' ? 'Ataque →' : 'Attaque →';
  return `<figure class="heat"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc((lang === 'en' ? 'Heatmap, most frequent zone: ' : 'Carte de chaleur, zone la plus fréquentée : ') + zone)}"><rect width="${W}" height="${H}" fill="#2f6b45"/>${cells}${lines}</svg><figcaption class="tiny muted">${esc(att)} · ${esc(zone)}</figcaption></figure>`;
}
function sparkSVG(vals, label, fmt) {
  const xs = vals.filter(v => v != null); if (xs.length < 2) return `<div class="spark"><div class="small muted">${esc(label)}</div><div class="tiny muted">Pas assez de matchs mesurés</div></div>`;
  const W = 160, H = 40, mn = Math.min(...xs), mx = Math.max(...xs), rg = mx - mn || 1;
  const pts = vals.map((v, i) => v == null ? null : [i / (vals.length - 1) * (W - 6) + 3, H - 4 - (v - mn) / rg * (H - 10)]).filter(Boolean);
  const last = xs[xs.length - 1], first = xs[0], d = last - first;
  return `<div class="spark"><div class="small muted">${esc(label)}</div><div class="spark-row"><b class="num">${fmt(last)}</b><svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="var(--accent)" stroke-width="2"/><circle cx="${pts[pts.length - 1][0]}" cy="${pts[pts.length - 1][1]}" r="3" fill="var(--accent)"/></svg></div><div class="tiny ${d >= 0 ? 'up' : 'down'}">${d >= 0 ? '▲' : '▼'} ${fmt(Math.abs(d))} depuis le premier match mesuré</div></div>`;
}

/* ---------- Page « Mes statistiques » ---------- */
function vStats() {
  const p = state.player, mo = metricsOf(p), log = statsLog(p), hm = heatOf(p), pi = proofIndex(p);
  const g = mo.g, rv = radarValues(mo);
  const row = m => { const v = mo.v[m.k]; if (v == null) return ''; const pc = mo.pct[m.k]; return `<tr><th scope="row">${esc(m.l)}</th><td class="num">${m.f(v)}${m.u ? ' ' + m.u : ''}</td><td><div class="pbar" role="img" aria-label="${pc}e centile"><i style="width:${pc}%"></i></div></td><td class="num">${pc}<sup>e</sup></td><td>${proofPill(mo.proof[m.k])}</td></tr>`; };
  const tests = (p.testsHistory || []).slice().sort((a, b) => a.date < b.date ? 1 : -1);
  return head('Mes statistiques', 'Ce que tes matchs filmés et tes tests disent de toi, comparé aux joueurs de ton poste, avec le niveau de preuve de chaque chiffre.', `<button class="btn" data-action="addTest">Ajouter un test physique</button><button class="btn primary" data-action="sheetPick">Remplir une feuille de match</button>`) + `
  <div class="grid g4" style="margin-bottom:16px">
    <div class="card kpi"><b class="v">${mo.basis ? mo.basis.matches : 0}</b><span class="l">Matchs mesurés${mo.basis ? ` · ${mo.basis.minutes} min suivies` : ''}</span></div>
    <div class="card kpi"><b class="v">${mo.v.distance90 != null ? MET.distance90.f(mo.v.distance90) + ' km' : '—'}</b><span class="l">Distance par 90 min</span></div>
    <div class="card kpi"><b class="v">${mo.v.passAcc != null ? Math.round(mo.v.passAcc) + ' %' : '—'}</b><span class="l">Passes réussies (validées)</span></div>
    <a class="card kpi" href="#partage" style="text-decoration:none;color:inherit"><b class="v">${pi}<small>/100</small></b><span class="l">Indice de preuve du profil</span></a>
  </div>
  <div class="grid g2">
    <section class="card"><h3>Profil en centiles <span class="small muted">vs ${GROUP_LABEL[g]}</span></h3>${radarSVG([{label:'Moi', values:rv}], 'fr')}
      <p class="tiny muted" style="margin:6px 0 0">Centile 70 = meilleur que 70 % des ${GROUP_LABEL[g]} de référence. Population de référence simulée dans ce prototype (240 profils par poste) ; en production, les joueurs mesurés du réseau.</p></section>
    <section class="card"><h3>Où je joue</h3>${hm ? heatSVG(hm, 'fr') : '<div class="empty">Calibre le terrain lors d’une analyse (caméra fixe) pour obtenir ta carte de chaleur.</div>'}
      <h3 style="margin-top:14px">Évolution</h3><div class="sparks">${sparkSVG(log.map(r => r.tracked ? r.distance / r.tracked * 90 : null), 'Distance / 90', v => (v / 1000).toFixed(1).replace('.', ',') + ' km')}${sparkSVG(log.map(r => r.sprints != null && r.tracked ? r.sprints / r.tracked * 90 : null), 'Sprints / 90', v => v.toFixed(1).replace('.', ','))}${sparkSVG(log.map(r => r.top), 'Vitesse max', v => v.toFixed(1).replace('.', ',') + ' km/h')}${sparkSVG(log.map(r => r.passes ? r.passOk / r.passes * 100 : null), 'Passes réussies', v => Math.round(v) + ' %')}</div></section>
  </div>
  <section class="card" style="margin-top:16px"><h3>Détail des indicateurs</h3><div class="tablewrap"><table class="stats-t"><thead><tr><th scope="col">Indicateur</th><th scope="col">Valeur</th><th scope="col" style="min-width:8rem">Rang</th><th scope="col">Centile</th><th scope="col">Preuve</th></tr></thead><tbody>${METRICS.map(row).join('')}</tbody></table></div>
    ${mo.basis && mo.basis.matches < 3 ? `<p class="small" style="margin:10px 0 0"><span class="pill warn">Échantillon court</span> ${mo.basis.matches} match${mo.basis.matches > 1 ? 's' : ''} mesuré${mo.basis.matches > 1 ? 's' : ''} : les recruteurs verront la mention. Trois matchs ou plus rendent les moyennes crédibles.</p>` : ''}</section>
  <div class="grid g2" style="margin-top:16px"><section class="card"><h3>Contrôles de cohérence</h3>${coherenceHTML(p)}</section><section class="card"><h3>Ce qui fera progresser ton profil</h3>${planHTML(p, 4)}</section></div>
  <section class="card" style="margin-top:16px"><h3>Journal des matchs <span class="small muted">${log.length} match${log.length > 1 ? 's' : ''}</span></h3>
    ${log.length ? `<div class="tablewrap"><table><thead><tr><th>Date</th><th>Adversaire</th><th>Min</th><th>B</th><th>PD</th><th>Distance</th><th>Sprints</th><th>V. max</th><th>Passes</th><th>Source</th><th></th></tr></thead><tbody>${log.slice().reverse().map(r => `<tr><td>${fdate(r.date)}</td><td>${esc(r.opp)}</td><td class="num">${r.minutes ?? '—'}</td><td class="num">${r.goals ?? '—'}</td><td class="num">${r.assists ?? '—'}</td><td class="num">${r.distance != null ? (r.distance / 1000).toFixed(1).replace('.', ',') + ' km' : '—'}</td><td class="num">${r.sprints ?? '—'}</td><td class="num">${r.top != null ? String(r.top).replace('.', ',') : '—'}</td><td class="num">${r.passes ? `${r.passOk}/${r.passes}` : '—'}</td><td>${r.src.map(s => `<span class="pill">${s === 'moteur' ? 'Vidéo' : 'Feuille'}</span>`).join(' ')}${r.q ? ` <span class="pill q${r.q}" title="Qualité de l’analyse">${r.q}</span>` : ''}${r.sheetOk ? ' <span class="pill ok" title="Feuille validée par l’entraîneur">✓ Entraîneur</span>' : ''}</td><td class="num">${r.live ? `<button class="btn sm" data-action="sheetOpen" data-arg="${r.id}">Feuille</button> <button class="btn sm" data-action="report" data-arg="${r.id}">Rapport</button>` : ''}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Analyse un match ou remplis une feuille de match pour commencer ton journal.</div>'}</section>
  <section class="card" style="margin-top:16px"><h3>Tests physiques ${p.testsCertified ? proofPill('certifie') : proofPill('declare')}</h3>
    ${tests.length ? `<div class="tablewrap"><table><thead><tr><th>Date</th><th>Sprint 30 m</th><th>VMA</th><th>Détente</th><th>Yo-Yo</th><th>Contexte</th></tr></thead><tbody>${tests.map((t, i) => { const prev = tests[i + 1]; const dlt = (k, low, dec) => prev && n0(prev[k]) && n0(t[k]) ? (() => { const d = n0(t[k]) - n0(prev[k]); const good = low ? d < 0 : d > 0; return ` <span class="tiny ${good ? 'up' : 'down'}">${d > 0 ? '+' : ''}${d.toFixed(dec).replace('.', ',')}</span>`; })() : ''; return `<tr><td>${fdate(t.date)}</td><td class="num">${t.sprint30 ? String(t.sprint30).replace('.', ',') + ' s' : '—'}${dlt('sprint30', true, 2)}</td><td class="num">${t.vma ? String(t.vma).replace('.', ',') + ' km/h' : '—'}${dlt('vma', false, 1)}</td><td class="num">${t.jump ? t.jump + ' cm' : '—'}${dlt('jump', false, 0)}</td><td class="num">${esc(t.yoyo || '—')}</td><td class="small">${esc(t.where || (t.certified ? 'Test encadré' : 'Auto-mesuré'))}</td></tr>`; }).join('')}</tbody></table></div>` : '<div class="empty">Aucun test enregistré.</div>'}
    <p class="tiny muted" style="margin:8px 0 0">Un test passé lors d’une détection partenaire devient « Certifié » : c’est la preuve la plus forte pour un recruteur.</p></section>
  <section class="card" style="margin-top:16px"><h3>Comment ces chiffres sont obtenus</h3><div class="list">
    ${Object.keys(PROOF).map(k => `<div class="row" style="align-items:start">${proofPill(k)}<span class="grow small muted">${esc(PROOF[k].d)}</span></div>`).join('')}
    <div class="row small muted" style="align-items:start">Distance, intensité, sprints et vitesse : caméra fixe et terrain calibré (4 repères). Passes, conduites et frappes : propositions du moteur que tu as validées. Rien n’est affiché aux recruteurs sans ton accord.</div></div></section>`;
}
VIEWS.stats = vStats;
NAV_GROUPS.joueur[0][1].splice(2, 0, ['stats', 'Statistiques', 'chart']);
NAV.joueur = NAV_GROUPS.joueur.flatMap(g => g[1].map(([k, l]) => [k, l]));
NAV_GROUPS.joueur.forEach(g => g[1].forEach(it => { if (it[0] === 'audience') it[2] = 'star'; }));
SHORT.stats = 'Stats';
TABS.joueur = ['accueil', 'profil', 'stats', 'videos'];

/* ---------- Feuille de match et tests ---------- */
Object.assign(ACT, {
  sheetPick() {
    const ms = playerMatches('me');
    if (!ms.length) { toast('Ajoute d’abord un match dans Vidéos.'); return; }
    if (ms.length === 1) { ACT.sheetOpen(ms[0].id); return; }
    openModal('Quel match ?', `<div class="list">${ms.map(m => `<button type="button" class="row btnrow" data-action="sheetOpen" data-arg="${m.id}"><span class="grow"><b>${esc(m.title)}</b><span class="small muted"> · ${fdate(m.date)}</span></span><span class="muted">›</span></button>`).join('')}</div>`);
  },
  sheetOpen(id) {
    const m = state.matches.find(x => x.id === id); if (!m) return;
    const pid = state.role === 'entraineur' ? (ui.tagPlayer || (roster()[0] || {}).id) : 'me';
    m.sheet = m.sheet || {}; m.sheet[pid] = m.sheet[pid] || {minutes:'', goals:'', assists:'', started:true, rating:''};
    const B = `matches.${state.matches.indexOf(m)}.sheet.${pid}.`;
    openModal(`Feuille de match · ${m.opponent || m.title}`, `<div class="form">${F(B + 'minutes', 'Minutes jouées', 'number')}${F(B + 'goals', 'Buts', 'number')}${F(B + 'assists', 'Passes décisives', 'number')}${F(B + 'rating', 'Note de l’entraîneur (sur 10)', 'number')}${F(B + 'started', 'Titulaire', 'check')}</div>
      <p class="small muted" style="margin:0">Les minutes servent à ramener tes statistiques à 90 minutes. La note est visible seulement si l’entraîneur la confirme.</p><div class="actions"><button class="btn primary" data-action="sheetDone">Enregistrer</button></div>`);
  },
  sheetDone() { save(); closeModal(); render(); toast('Feuille de match enregistrée.'); },
  addTest() {
    ui.newTest = {date:today(), sprint30:'', vma:'', jump:'', yoyo:'', where:''};
    openModal('Ajouter un test physique', `<div class="form"><div class="field"><label for="nt_date">Date</label><input type="date" id="nt_date" value="${ui.newTest.date}"></div><div class="field"><label for="nt_s">Sprint 30 m (s)</label><input id="nt_s" inputmode="decimal" placeholder="4,05"></div><div class="field"><label for="nt_v">VMA (km/h)</label><input id="nt_v" inputmode="decimal" placeholder="18,5"></div><div class="field"><label for="nt_j">Détente (cm)</label><input id="nt_j" inputmode="numeric" placeholder="55"></div><div class="field"><label for="nt_y">Yo-Yo (palier)</label><input id="nt_y" placeholder="19.2"></div><div class="field"><label for="nt_w">Où, avec qui</label><input id="nt_w" placeholder="Club, préparateur physique"></div></div>
      <p class="small muted" style="margin:0">Les derniers résultats deviennent tes valeurs de profil. Un test déclaré reste « Déclaré » jusqu’à une détection partenaire.</p><div class="actions"><button class="btn primary" data-action="addTestOk">Enregistrer le test</button></div>`);
  },
  addTestOk() {
    const num = id => { const v = ($('#' + id) || {}).value || ''; const x = parseFloat(v.replace(',', '.')); return isFinite(x) ? x : ''; };
    const t = {date:($('#nt_date') || {}).value || today(), sprint30:num('nt_s'), vma:num('nt_v'), jump:num('nt_j'), yoyo:($('#nt_y') || {}).value || '', where:($('#nt_w') || {}).value || '', certified:false};
    if (!t.sprint30 && !t.vma && !t.jump && !t.yoyo) { invalid('nt_s', 'Indique au moins un résultat.'); return; }
    const p = state.player; (p.testsHistory = p.testsHistory || []).push(t);
    const latest = p.testsHistory.slice().sort((a, b) => a.date < b.date ? 1 : -1)[0];
    if (latest === t) { ['sprint30', 'vma', 'jump', 'yoyo'].forEach(k => { if (t[k] !== '') p.physical[k] = t[k]; }); p.physical.testDate = t.date; }
    save(); closeModal(); render(); toast('Test enregistré.');
  }
});

/* ---------- Import du moteur V0.2 ---------- */
const importEngineJSONV5 = importEngineJSON;
importEngineJSON = function (m, txt) {
  let d; try { d = JSON.parse(txt); } catch (e) { toast('Ce fichier n’est pas un JSON lisible.'); return; }
  if (d && d.format === 'passerelle.touches/1') return importEngineJSONV5(m, txt);
  if (!d || d.format !== 'passerelle.match/2' || !Array.isArray(d.events)) { toast('Format attendu : passerelle.match/2 (ou touches/1). Ce fichier ne vient pas du moteur Passerelle.'); return; }
  const pid = state.role === 'entraineur' ? (ui.tagPlayer || (roster()[0] || {}).id) : 'me';
  if (!m.duration && d.video && d.video.duration) m.duration = Math.round(d.video.duration);
  let added = 0, dup = 0;
  d.events.slice(0, 600).forEach(e => {
    const start = Math.max(0, +e.start || (+e.t - 3) || 0), end = +e.end || start + 7;
    if (!isFinite(start) || !isFinite(end)) return;
    const type = ENGINE_TYPE_MAP[e.type] || 'touche';
    if (m.clips.some(c => c.playerId === pid && c.type === type && Math.abs(c.t - start) < 1.5)) { dup++; return; }
    m.clips.push({id:uid(), type, t:Math.round(start * 10) / 10, dur:Math.min(15, Math.max(4, Math.round((end - start) * 10) / 10)), at:+e.t || start + 3, rating:0, inReel:false, origin:'moteur', status:'proposé', playerId:pid,
      conf:e.conf != null ? Math.round(+e.conf * 100) / 100 : null, why:String(e.why || '').slice(0, 160), engine:String(d.engine || 'moteur').slice(0, 40),
      outcome:['reussie', 'perdue', 'inconnue'].includes(e.outcome) ? e.outcome : null, box:Array.isArray(e.box) && e.box.length === 4 ? e.box.map(Number) : null, xy:Array.isArray(e.xy) ? e.xy.map(Number) : null});
    added++;
  });
  m.engine = m.engine || {};
  m.engine[pid] = {version:String(d.engine || '').slice(0, 40), date:today(), calibration:d.calibration || {ok:false}, summary:d.summary || null,
    physical:d.physical || null, heatmap:d.heatmap && Array.isArray(d.heatmap.values) ? {cols:12, rows:8, values:d.heatmap.values} : null, visible:d.stats && d.stats.target_visible_ratio};
  (m.engineRuns = m.engineRuns || []).unshift({date:today(), engine:String(d.engine || 'moteur').slice(0, 40), n:added, visible:d.stats && d.stats.target_visible_ratio});
  if (d.target) m.target = Object.assign({}, m.target, {number:d.target.jersey || '', color:d.target.color || '', click:Array.isArray(d.target.click) ? d.target.click.slice(0, 2) : null});
  { const u = usage(); if (state.role === 'entraineur') u.teamAnalyses++; else u.analyses++; }
  save(); ui.clipFilter = 'proposé'; render();
  const ph = d.physical ? ` Physique : ${(d.physical.distance_m / 1000).toFixed(1).replace('.', ',')} km, ${d.physical.sprints} sprint${d.physical.sprints > 1 ? 's' : ''}.` : '';
  toast(`${added} action${added > 1 ? 's' : ''} importée${added > 1 ? 's' : ''}${dup ? `, ${dup} déjà présente${dup > 1 ? 's' : ''}` : ''}.${ph} Valide ou refuse chacune.`);
};

/* ---------- Recruteur : filtre par preuve, comparaison enrichie ---------- */
const filterProspectsV5 = filterProspects;
filterProspects = function (f, pr) {
  let list = filterProspectsV5(f, pr);
  if (n0(f.proof)) list = list.filter(x => proofIndex(x.p) >= n0(f.proof));
  if (f.measured) list = list.filter(x => metricsOf(x.p).basis);
  return list;
};
ACT.compareShow = function () {
  const ps = ui.compare.map(findPlayer).filter(Boolean), pr = myProgram();
  const mos = ps.map(metricsOf);
  const series = ps.map((p, i) => ({label:p.firstName + ' ' + p.lastName, values:radarValues(mos[i])}));
  const legend = ps.map((p, i) => `<span class="legend"><i style="background:${SERIES_COLORS[i]}"></i>${esc(p.firstName)} ${esc(p.lastName)} · ${esc(p.position)}</span>`).join('');
  const base = [['Score de correspondance', p => matchScore(p, pr).score], ['Indice de preuve', p => proofIndex(p) + ' / 100'], ['Âge', p => ageAt(p.birthDate) ?? '—'], ['Club · niveau', p => `${p.club} · ${levelLabel(p.level)}`], ['Taille · pied', p => `${p.height || '—'} cm · ${p.foot || '—'}`], ['Contrôles de cohérence', p => { const c = coherenceChecks(p); return c.length ? c.length + ' point' + (c.length > 1 ? 's' : '') + ' à vérifier' : 'Rien à signaler'; }], ['Base de mesure', (p, i) => mos[i].basis ? `${mos[i].basis.matches} matchs, ${mos[i].basis.minutes} min` : 'Aucune']];
  const metr = METRICS.map(m => [m.l + (m.u ? ` (${m.u})` : ''), (p, i) => { const v = mos[i].v[m.k]; return v == null ? '—' : `${m.f(v)} · ${mos[i].pct[m.k]}<sup>e</sup> ${proofPill(mos[i].proof[m.k])}`; }, true]);
  openModal('Comparaison', `<div class="cmp-top">${radarSVG(series, 'fr', 320)}<div class="legends">${legend}<p class="tiny muted" style="margin:6px 0 0">Centiles calculés par rapport au poste de chaque joueur.</p></div></div>
  <div class="tablewrap compare"><table><thead><tr><th></th>${ps.map(p => `<th scope="col">${esc(p.firstName)} ${esc(p.lastName)}</th>`).join('')}</tr></thead><tbody>${[...base, ...metr].map(([l, f, html]) => `<tr><th scope="row">${esc(l)}</th>${ps.map((p, i) => `<td class="num">${html ? f(p, i) : esc(f(p, i))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`, true);
};

/* ---------- Migration schéma 6 (données) ---------- */
function migrate6(s) {
  if (s.schema >= 6) return s;
  const me = s.player;
  me.testsHistory = me.testsHistory || [{date:'2026-03-10', sprint30:4.18, vma:17.9, jump:51, yoyo:'18.4', where:'Club, préparation d’avant-saison', certified:false}, {date:'2026-09-12', sprint30:4.05, vma:18.5, jump:55, yoyo:'19.2', where:'Club, reprise', certified:false}];
  if (me.demo && !me.pastLog) me.pastLog = [
    {date:'2026-09-20', opp:'AS Démo Cahors', minutes:90, goals:0, assists:1, distance:10120, tracked:86, hsr:470, sprints:6, top:28.7, passes:39, passOk:31, carries:5, shots:1},
    {date:'2026-09-27', opp:'Olympique Démo Castres', minutes:78, goals:1, assists:0, distance:8840, tracked:74, hsr:430, sprints:5, top:29.0, passes:33, passOk:27, carries:4, shots:2},
    {date:'2026-10-11', opp:'FC Démo Tarbes', minutes:90, goals:0, assists:0, distance:10480, tracked:88, hsr:540, sprints:8, top:29.4, passes:44, passOk:37, carries:6, shots:1},
    {date:'2026-10-25', opp:'Stade Démo Montauban', minutes:90, goals:1, assists:1, distance:10390, tracked:87, hsr:520, sprints:7, top:29.6, passes:47, passOk:39, carries:7, shots:2}];
  const m1 = (s.matches || []).find(m => m.id === 'm1');
  if (m1 && me.demo) { m1.engine = m1.engine || {}; m1.engine.me = m1.engine.me || {version:'passerelle-moteur 0.2.0', date:'2026-11-09', calibration:{ok:true, pitch:[100, 64], points:6, reproj_error_m:0.6, fixed_camera:true}, summary:{passes:46, passes_ok:38, passes_known:43, carries:6, shots:2}, physical:{distance_m:10240, minutes_tracked:86, hsr_m:560, sprints:8, top_speed_kmh:29.8}, heatmap:{cols:12, rows:8, values:demoHeatFor('MIL', 'me')}, visible:.74};
    m1.sheet = m1.sheet || {}; m1.sheet.me = m1.sheet.me || {minutes:90, goals:0, assists:1, started:true, rating:''}; }
  (s.others || []).forEach(o => {
    if (o.demoMetrics) return;
    const g = posGroup(o.position), r = rng(hashStr('dm' + o.id)), z = () => (r() - .5) * 1.8;
    const val = k => { const [mu, sd] = REF[k][g]; return Math.max(0, mu + sd * (z() + .35)); };
    o.demoMetrics = {distance90:val('distance90'), hsr90:val('hsr90'), sprints90:val('sprints90'), top:val('top'), passes90:val('passes90'), passAcc:Math.min(95, val('passAcc')), carries90:val('carries90'), shots90:val('shots90'), matches:2 + Math.floor(r() * 4), minutes:0};
    o.demoMetrics.minutes = o.demoMetrics.matches * 82;
    o.demoHeat = demoHeatFor(g, o.id);
  });
  s.schema = 6; return s;
}
const migrateV5 = migrate;
migrate = s => migrate6(migrateV5(s));

