/* ===================== Moteurs de la plateforme ===================== */
/* ---------- Version des données : sert à mettre en cache les calculs lourds ---------- */
let DATA_V = 0; const MO_CACHE = new Map();
const saveV6b = save; save = function () { DATA_V++; MO_CACHE.clear(); return saveV6b.apply(this, arguments); };
const saveSoonV6b = saveSoon; saveSoon = function () { DATA_V++; MO_CACHE.clear(); return saveSoonV6b.apply(this, arguments); };

/* ---------- Nouvelles mesures du moteur V0.3 ---------- */
ENGINE_TYPE_MAP.recuperation = 'recup';
REF.recov90 = {GK:[1, .8], DEF:[7, 2.5], MIL:[6.5, 2.2], ATT:[3.5, 1.5]};
REF.prog90 = {GK:[1.5, 1], DEF:[4, 1.8], MIL:[5, 2], ATT:[3, 1.5]};
METRICS.splice(METRICS.findIndex(m => m.k === 'shots90') + 1, 0,
  {k:'recov90', l:'Récupérations / 90', en:'Ball recoveries / 90', es:'Recuperaciones / 90', u:'', f:v => v.toFixed(1).replace('.', ','), src:'moteur'},
  {k:'prog90', l:'Passes progressives / 90', en:'Progressive passes / 90', es:'Pases progresivos / 90', u:'', f:v => v.toFixed(1).replace('.', ','), src:'moteur'});
METRICS.forEach(m => { MET[m.k] = m; });
RADAR_AXES.splice(4, 0, ['Récupération', 'Ball winning', 'Recuperación', ['recov90']]);
RADAR_AXES.forEach(a => { if (a[0] === 'Jeu de passe' && !a[3].includes('prog90')) a[3].push('prog90'); });
FEATURE_CHOICES.splice(6, 0, ['recov90', 'Récupérations / 90'], ['prog90', 'Passes progressives / 90']);

const statsLogV6 = statsLog;
statsLog = function (p) {
  return statsLogV6(p).map(r => {
    const m = r.live && state.matches.find(x => x.id === r.id), e = m && m.engine && m.engine[p.id];
    if (e) { r.q = (e.quality && e.quality.grade) || null; r.recov = e.summary ? e.summary.recoveries : null; r.prog = e.summary ? e.summary.progressive_passes : null; r.warn = e.quality ? e.quality.warnings || [] : []; const sh = m.sheet && m.sheet[p.id]; r.sheetOk = !!(sh && sh.validated); }
    if (r.q === 'C') { r.lowq = true; r.tracked = null; } // analyse trop fragile : gardée au journal, exclue des moyennes
    return r;
  });
};
const metricsOfV6 = metricsOf;
metricsOf = function (p) {
  const key = p.id + ':' + DATA_V; if (MO_CACHE.has(key)) return MO_CACHE.get(key);
  const mo = metricsOfV6(p), log = statsLog(p).filter(r => r.tracked);
  if (log.length) {
    const min = log.reduce((a, r) => a + r.tracked, 0) || 1;
    const sum = k => log.reduce((a, r) => a + (r[k] || 0), 0), has = k => log.some(r => r[k] != null);
    if (has('recov')) { mo.v.recov90 = sum('recov') / min * 90; mo.proof.recov90 = 'moteur'; }
    if (has('prog')) { mo.v.prog90 = sum('prog') / min * 90; mo.proof.prog90 = 'moteur'; }
  } else if (p.demoMetrics) { ['recov90', 'prog90'].forEach(k => { if (p.demoMetrics[k] != null) { mo.v[k] = p.demoMetrics[k]; mo.proof[k] = 'moteur'; } }); }
  ['recov90', 'prog90'].forEach(k => { if (mo.v[k] != null) mo.pct[k] = pctOf(mo.g, k, mo.v[k]); });
  MO_CACHE.set(key, mo); return mo;
};

/* ---------- Import du moteur V0.3 (champs supplémentaires) ---------- */
const importEngineJSONV6 = importEngineJSON;
importEngineJSON = function (m, txt) {
  let d = null; try { d = JSON.parse(txt); } catch (e) {}
  const before = new Set(m.clips.map(c => c.id));
  importEngineJSONV6(m, txt);
  if (!d || d.format !== 'passerelle.match/2') return;
  const pid = state.role === 'entraineur' ? (ui.tagPlayer || (roster()[0] || {}).id) : 'me';
  const fresh = m.clips.filter(c => !before.has(c.id));
  fresh.forEach(c => { const e = (d.events || []).find(x => Math.abs((+x.t || 0) - (c.at || 0)) < .05 && (ENGINE_TYPE_MAP[x.type] || 'touche') === c.type); if (e) { if (e.direction) c.dir = e.direction; if (e.progressive) c.prog = true; if (e.zone) c.zone = e.zone; } });
  if (m.engine && m.engine[pid] && d.quality) { m.engine[pid].quality = d.quality; save(); }
  if (d.quality && d.quality.warnings && d.quality.warnings.length) setTimeout(() => toast(`Qualité ${d.quality.grade} : ${d.quality.warnings[0]}`), 3200);
  render();
};

/* ---------- Moteur de cohérence : ce qui est déclaré tient-il debout ? ---------- */
function coherenceChecks(p) {
  const out = [], s = p.stats, ph = p.physical, ac = p.academic, mo = metricsOf(p);
  const add = (lvl, t, r) => out.push({lvl, t, r});
  if (n0(s.matches) && n0(s.minutes) > n0(s.matches) * 95) add('bad', `Minutes de saison (${s.minutes}) supérieures à ${s.matches} matchs × 95 min`, 'profil');
  if (n0(s.matches) && n0(s.goals) + n0(s.assists) > n0(s.matches) * 3) add('warn', 'Buts + passes décisives très élevés pour le nombre de matchs', 'profil');
  const logged = statsLog(p).filter(r => r.live && (r.date || '').slice(0, 4) >= String(s.season || '').slice(0, 4)).length;
  if (n0(s.matches) && logged > n0(s.matches)) add('warn', `Plus de matchs au journal (${logged}) que de matchs déclarés (${s.matches})`, 'profil');
  if (n0(ph.sprint30) && n0(ph.sprint30) < 3.8) add('warn', `Sprint 30 m de ${String(ph.sprint30).replace('.', ',')} s : niveau d’élite, à faire certifier`, 'evenements');
  if (n0(ph.sprint30) && mo.v.top != null && n0(ph.sprint30) < 4.0 && mo.v.top < 27) add('warn', `Sprint 30 m déclaré très rapide mais vitesse max mesurée de ${MET.top.f(mo.v.top)} km/h`, 'stats');
  if (n0(ph.vma) > 21) add('warn', `VMA de ${ph.vma} km/h : exceptionnelle, à faire certifier`, 'evenements');
  if (n0(ph.jump) > 75) add('warn', `Détente de ${ph.jump} cm : exceptionnelle, à faire certifier`, 'evenements');
  if (n0(p.height) && (n0(p.height) < 145 || n0(p.height) > 210)) add('bad', `Taille de ${p.height} cm improbable`, 'profil');
  if (n0(p.height) && n0(p.weight)) { const bmi = n0(p.weight) / (n0(p.height) / 100) ** 2; if (bmi < 16 || bmi > 33) add('warn', `Taille et poids incohérents (IMC ${bmi.toFixed(1).replace('.', ',')})`, 'profil'); }
  const rng_ = {'Duolingo English Test':[10, 160], 'TOEFL iBT':[0, 120], 'IELTS Academic':[0, 9], 'Cambridge (B2 First / C1)':[80, 230]}[ac.englishTest];
  if (rng_ && has(ac.englishScore) && (n0(ac.englishScore) < rng_[0] || n0(ac.englishScore) > rng_[1])) add('bad', `Score ${ac.englishTest} de ${ac.englishScore} hors de l’échelle (${rng_[0]} à ${rng_[1]})`, 'profil');
  if (has(ac.average) && (n0(ac.average) < 0 || n0(ac.average) > 20)) add('bad', 'Moyenne scolaire hors de l’échelle /20', 'profil');
  const ages = ageAt(p.birthDate); if (ages != null && (ages < 13 || ages > 30)) add('warn', `Âge de ${ages} ans inhabituel pour la plateforme`, 'profil');
  statsLog(p).filter(r => r.lowq).forEach(r => add('warn', `Analyse du ${fdate(r.date)} de qualité C : exclue des moyennes`, 'videos'));
  return out;
}
const proofIndexV6 = proofIndex;
proofIndex = function (p) { const c = coherenceChecks(p); const pen = c.reduce((a, x) => a + (x.lvl === 'bad' ? 10 : x.lvl === 'warn' && !/qualité C/.test(x.t) ? 3 : 0), 0); return Math.max(0, proofIndexV6(p) - Math.min(30, pen)); };
function coherenceHTML(p, compact) {
  const c = coherenceChecks(p);
  if (!c.length) return `<p class="small" style="margin:0"><span class="pill ok">Aucune incohérence détectée</span></p>`;
  return `<div class="list">${c.slice(0, compact ? 3 : 20).map(x => `<div class="row"><span class="dot ${x.lvl === 'bad' ? 'bad' : 'warn'}" aria-hidden="true"></span><span class="grow small">${esc(x.t)}<span class="sr"> (${x.lvl === 'bad' ? 'à corriger' : 'à vérifier'})</span></span><a class="btn sm" href="#${x.r}">${x.lvl === 'bad' ? 'Corriger' : 'Voir'}</a></div>`).join('')}</div>`;
}

/* ---------- Moteur de priorités : quelle action rapporte le plus maintenant ? ---------- */
const UPGRADE = {'Identité':['Fais vérifier ton identité (passeport)', 'certifie', 10, 'dossier'], 'Statistiques de saison':['Demande à ton entraîneur de valider tes statistiques', 'coach', 5, 'profil'], 'Tests physiques':['Passe des tests certifiés en détection', 'certifie', 120, 'evenements'],
  'Données de match mesurées':['Analyse un match filmé sur trépied', 'moteur', 30, 'videos'], 'Actions en vidéo':['Valide au moins 5 actions proposées par le moteur', 'moteur', 10, 'videos'], 'Scolarité':['Dépose tes bulletins', 'document', 10, 'dossier'], 'Référence d’entraîneur':['Demande une recommandation à ton entraîneur', 'coach', 5, 'profil']};
function priorityPlan(p) {
  const cands = [], base = proofIndexV6(p);
  proofItems(p).forEach(it => {
    const up = UPGRADE[it.l]; if (!up || PROOF[it.lvl].r >= PROOF[up[1]].r) return;
    const items = proofItems(p), W = items.reduce((a, x) => a + x.w, 0);
    const gain = Math.round(it.w * (PROOF[up[1]].r - PROOF[it.lvl].r) / 4 / W * 100);
    cands.push({t:up[0], r:up[3], min:up[2], gain, kind:'Preuve', val:gain * 1.5});
  });
  seductionChecks(p).filter(c => !c.ok && !/Indice de preuve/.test(c.t)).forEach(c => cands.push({t:c.t, r:c.r, a:c.a, min:/vidéo/i.test(c.t) ? 30 : 5, gain:null, kind:'Attractivité', val:6}));
  const tr = TRACKS[p.track] ? p.track : 'usa', st = TRACKS[tr].steps(p);
  st.filter(s => !s[1]).forEach(s => cands.push({t:s[0], r:s[2], min:/contact|NCAA|bulletin|test/i.test(s[0]) ? 30 : 15, gain:null, kind:'Parcours', val:Math.round(40 / st.length)}));
  coherenceChecks(p).filter(c => !/qualité C/.test(c.t)).forEach(c => cands.push({t:'Corriger : ' + c.t, r:c.r, min:3, gain:c.lvl === 'bad' ? 10 : 3, kind:'Cohérence', val:c.lvl === 'bad' ? 15 : 5}));
  const seen = new Set();
  return cands.map(c => Object.assign(c, {prio:c.val / Math.sqrt(c.min)})).sort((a, b) => b.prio - a.prio).filter(c => { const k = c.t.toLowerCase().slice(0, 28); if (seen.has(k)) return false; seen.add(k); return true; });
}
function planHTML(p, n) {
  const plan = priorityPlan(p).slice(0, n || 5);
  if (!plan.length) return '<div class="empty">Rien d’urgent : ton profil est complet et appuyé.</div>';
  return `<ol class="plan-list">${plan.map((c, i) => `<li><span class="plan-n" aria-hidden="true">${i + 1}</span><div class="grow"><div class="t">${esc(c.t)}</div><div class="tiny muted">${esc(c.kind)} · ≈ ${c.min < 60 ? c.min + ' min' : Math.round(c.min / 60) + ' h'}${c.gain ? ` · +${c.gain} à l’indice de preuve` : ''}</div></div>${c.a ? `<button class="btn sm" data-action="${c.a}">Faire</button>` : `<a class="btn sm" href="#${c.r}">Faire</a>`}</li>`).join('')}</ol>`;
}

/* ---------- Correspondance : adéquation sportive mesurée et paliers ---------- */
const TIER_REQ = t => t >= 4 ? 75 : t >= 3.5 ? 65 : t >= 3 ? 55 : t >= 2.5 ? 45 : 35;
const matchScoreV6 = matchScore;
matchScore = function (p, pr) {
  const r = matchScoreV6(p, pr); if (r.excluded) return r;
  const o = ORGS[pr.org] || {t:2.5}, mo = metricsOf(p), rv = radarValues(mo).filter(x => x != null);
  const req = TIER_REQ(o.t), avg = rv.length ? Math.round(rv.reduce((a, b) => a + b, 0) / rv.length) : null;
  const pts = avg == null ? 7 : Math.max(0, Math.min(15, 15 * (.5 + (avg - req) / 40)));
  r.parts.push({pts, max:15, good:avg == null ? '' : `Performances mesurées au ${avg}e centile (repère ≈ ${req}e pour ${pr.org})`, bad:avg == null ? 'Aucune performance mesurée : analyse un match' : `Performances mesurées au ${avg}e centile, sous le repère (≈ ${req}e) pour ${pr.org}`, perf:true});
  const got = r.parts.reduce((s, x) => s + x.pts, 0), max = r.parts.reduce((s, x) => s + x.max, 0);
  r.score = Math.round(got / max * (o.uni ? 100 : 90));
  r.perfAvg = avg; r.perfReq = req;
  r.bucket = r.score < 60 || (avg != null && avg < req - 15) ? 'ambitieux' : (r.score >= 80 && (avg == null || avg >= req + 5)) ? 'sur' : 'cible';
  return r;
};
const BUCKET = {ambitieux:['Ambitieux', 'warn', 'Peu probable mais possible : vaut le coup d’écrire.'], cible:['Cible', 'info', 'Ton profil correspond : priorité de tes contacts.'], sur:['Sûr', 'ok', 'Très bonne correspondance : garde-les en sécurité.']};
function bucketPill(r) { if (!r.bucket) return ''; const b = BUCKET[r.bucket]; return `<span class="pill ${b[1]}" title="${esc(b[2])}">${b[0]}</span>`; }
const vDebouchesV6 = VIEWS.debouches;
VIEWS.debouches = function () {
  const html = vDebouchesV6(), p = state.player, all = ranked(p).filter(x => !x.r.excluded);
  const n = k => all.filter(x => x.r.bucket === k).length, f = ui.debouches;
  const bar = `<section class="card bucket-card"><div class="bucket-row">${Object.entries(BUCKET).map(([k, [l, cls, d]]) => `<button type="button" class="bucket ${cls}" data-action="bucketFilter" data-arg="${k}" aria-pressed="${f.bucket === k}"><b class="num">${n(k)}</b><span>${l}</span><small>${esc(d)}</small></button>`).join('')}</div><p class="tiny muted" style="margin:10px 0 0">Repère d’usage : écrire à environ 3 programmes ambitieux, 6 cibles et 3 sûrs. Le palier combine le score de correspondance et tes performances mesurées par rapport au niveau de la division.</p></section>`;
  let out = html.replace('<section class="card">', bar + '<section class="card">');
  if (f.bucket) { // filtrage par palier : on retire les lignes des autres paliers
    const keep = new Set(all.filter(x => x.r.bucket === f.bucket).map(x => x.pr.id));
    out = out.replace(/<div class="prog">[\s\S]*?(?=<div class="prog">|<\/section>)/g, blk => { const m = blk.match(/data-arg="([^"]+)">(Suivre|Écrire|Fiche)/); return !m || keep.has(m[1]) ? blk : ''; });
  }
  return out;
};
ACT.bucketFilter = k => { ui.debouches.bucket = ui.debouches.bucket === k ? '' : k; render(); };

/* ---------- Opérateur : calibrage des seuils de confiance ---------- */
function confBuckets() {
  const dec = engineClips().filter(c => (c.status === 'validé' || c.status === 'refusé') && c.conf != null);
  return [[0, .4], [.4, .6], [.6, .8], [.8, 1.01]].map(([a, b]) => { const xs = dec.filter(c => c.conf >= a && c.conf < b); const ok = xs.filter(c => c.status === 'validé').length; return {a, b, n:xs.length, ok, prec:xs.length ? ok / xs.length : null}; });
}
const vOpMoteurV6 = VIEWS['op-moteur'];
VIEWS['op-moteur'] = function () {
  const bk = confBuckets(), thr = bk.find(x => x.n >= 2 && x.prec >= .7);
  const grades = {A:0, B:0, C:0}; state.matches.forEach(m => Object.values(m.engine || {}).forEach(e => { const g = e.quality && e.quality.grade; if (g) grades[g]++; }));
  const sec = `<div class="grid g2" style="margin-top:16px"><section class="card"><h3>Seuil de confiance</h3><p class="small muted" style="margin:0 0 8px">Part des propositions retenues selon la confiance annoncée par le moteur. Sous le seuil recommandé, masquer les propositions évite de faire perdre du temps aux joueurs.</p>
    <div class="tablewrap"><table><thead><tr><th>Confiance</th><th>Décidées</th><th>Retenues</th><th>Précision</th></tr></thead><tbody>${bk.map(x => `<tr><td class="num">${Math.round(x.a * 100)} à ${Math.min(100, Math.round(x.b * 100))} %</td><td class="num">${x.n}</td><td class="num">${x.ok}</td><td class="num">${x.prec == null ? '—' : Math.round(x.prec * 100) + ' %'}</td></tr>`).join('')}</tbody></table></div>
    <p class="small" style="margin:10px 0 0">${thr ? `Seuil recommandé : <b>${Math.round(thr.a * 100)} %</b> (première tranche à 70 % de précision ou plus).` : 'Pas assez de décisions pour recommander un seuil (2 par tranche au minimum).'}</p></section>
    <section class="card"><h3>Qualité des analyses</h3><div class="grade-row">${['A', 'B', 'C'].map(g => `<div class="grade g${g}"><b>${g}</b><span class="num">${grades[g]}</span></div>`).join('')}</div><p class="small muted" style="margin:10px 0 0">A : joueur et ballon bien vus, caméra fixe. B : exploitable avec prudence. C : exclue des moyennes et signalée au joueur. Les causes sont décrites dans chaque résultat (caméra qui bouge, ballon flou, calibrage imprécis).</p></section></div>`;
  return vOpMoteurV6() + sec;
};

/* ---------- Données de démonstration (schéma 8) ---------- */
function migrate8(s) {
  if (s.schema >= 8) return s;
  const me = s.player;
  (me.pastLog || []).forEach((r, i) => { if (r.recov == null) { r.recov = [6, 5, 8, 7, 6][i % 5]; r.prog = [5, 4, 7, 6, 5][i % 5]; } });
  const m1 = (s.matches || []).find(m => m.id === 'm1');
  if (m1 && m1.engine && m1.engine.me) { const e = m1.engine.me; e.summary = Object.assign({recoveries:7, progressive_passes:6, passes_received:38}, e.summary || {}); e.quality = e.quality || {grade:'A', target_visible_ratio:.74, ball_visible_ratio:.61, camera_fixed:true, camera_drift_ratio:.004, warnings:[]}; }
  (s.others || []).forEach(o => { if (o.demoMetrics && o.demoMetrics.recov90 == null) { const g = posGroup(o.position), r = rng(hashStr('dm8' + o.id)); ['recov90', 'prog90'].forEach(k => { const [mu, sd] = REF[k][g]; o.demoMetrics[k] = Math.max(0, mu + sd * ((r() - .5) * 1.8 + .3)); }); } });
  s.schema = 8; return s;
}
const migrateV7 = migrate;
migrate = s => migrate8(migrateV7(s));

