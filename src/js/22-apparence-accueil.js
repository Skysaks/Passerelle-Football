/* ===================== Apparence, accueil personnalisable, objectif ===================== */
const ACCENTS = [['gazon', 'Gazon'], ['ocean', 'Océan'], ['brique', 'Brique'], ['violet', 'Violet'], ['or', 'Or'], ['graphite', 'Graphite']];
const PREF_OPTS = {
  density:[['confort', 'Confortable'], ['compact', 'Compacte']],
  radius:[['doux', 'Doux'], ['net', 'Nets'], ['rond', 'Arrondis']],
  font:[['systeme', 'Système'], ['lisible', 'Très lisible'], ['editorial', 'Éditoriale']],
  contrast:[['normal', 'Normal'], ['eleve', 'Élevé']],
  motion:[['auto', 'Selon l’appareil'], ['reduit', 'Réduites']]
};
function prefs() { state.prefs = Object.assign({accent:'gazon', density:'confort', radius:'doux', font:'systeme', contrast:'normal', motion:'auto'}, state.prefs || {}); return state.prefs; }
const applyPrefsV5 = applyPrefs;
applyPrefs = function () {
  applyPrefsV5(); const r = document.documentElement, P = prefs();
  r.setAttribute('data-accent', P.accent); r.setAttribute('data-density', P.density); r.setAttribute('data-radius', P.radius);
  r.setAttribute('data-font', P.font); r.setAttribute('data-contrast', P.contrast); r.setAttribute('data-motion', P.motion);
};
function apparenceHTML() {
  const P = prefs(), t = state.theme || 'auto', s = state.textSize || 'md';
  const seg = (key, opts, lbl, cur, act) => `<div><span class="lbl2" id="ap_${key}">${lbl}</span><div class="seg" role="group" aria-labelledby="ap_${key}">${opts.map(([v, l]) => `<button type="button" data-action="${act || 'prefSet'}" data-arg="${act ? v : key + '|' + v}" aria-pressed="${(cur !== undefined ? cur : P[key]) === v}">${esc(l)}</button>`).join('')}</div></div>`;
  return `<section class="card"><h3>Apparence</h3><div class="prefs">
    ${seg('theme', [['auto', 'Automatique'], ['light', 'Clair'], ['dark', 'Sombre']], 'Thème', t, 'setTheme')}
    <div><span class="lbl2" id="ap_acc">Couleur principale</span><div class="swatches" role="group" aria-labelledby="ap_acc">${ACCENTS.map(([k, l]) => `<button type="button" class="sw acc-${k}" data-action="prefSet" data-arg="accent|${k}" aria-pressed="${P.accent === k}" aria-label="${l}" title="${l}"></button>`).join('')}</div></div>
    ${seg('size', [['md', 'Normale'], ['lg', 'Grande'], ['xl', 'Très grande']], 'Taille du texte', s, 'setSize')}
    ${seg('density', PREF_OPTS.density, 'Densité')}${seg('radius', PREF_OPTS.radius, 'Coins')}${seg('font', PREF_OPTS.font, 'Police')}${seg('contrast', PREF_OPTS.contrast, 'Contraste')}${seg('motion', PREF_OPTS.motion, 'Animations')}
  </div><div class="ap-preview" aria-hidden="true"><div class="card kpi"><b class="v">82 %</b><span class="l">Passes réussies</span></div><div class="card"><div class="t">Aperçu</div><p class="small muted" style="margin:4px 0 10px">Le rendu change en direct.</p><span class="btn primary sm">Bouton principal</span> <span class="pill ok">Validé</span></div></div>
  <div class="actions" style="margin-top:14px"><button class="btn sm" data-action="prefReset">Revenir aux réglages d’origine</button></div></section>`;
}
displayPrefsHTML = function () { return `<div style="margin-bottom:16px">${apparenceHTML()}</div>`; };
VIEWS.apparence = () => head('Apparence', 'Adapte Passerelle à tes yeux et à ton écran. Les réglages restent sur cet appareil et dans tes données.') + apparenceHTML();
NAV_GROUPS.commun[0][1].push(['apparence', 'Apparence', 'settings']);
Object.keys(NAV_GROUPS).forEach(r => { NAV[r] = NAV_GROUPS[r].flatMap(g => g[1].map(([k, l]) => [k, l])); });
Object.assign(ACT, {
  prefSet(a) { const [k, v] = String(a).split('|'); prefs()[k] = v; save(); applyPrefs(); render(); },
  prefReset() { state.prefs = null; state.theme = 'auto'; state.textSize = 'md'; prefs(); save(); applyPrefs(); render(); toast('Apparence d’origine rétablie.'); }
});
if (!ACT.setSize) ACT.setSize = v => { state.textSize = v; save(); applyPrefs(); render(); };

/* ---------- Objectif du joueur : oriente le parcours de l'accueil ---------- */
const TRACKS = {
  usa:{l:'Université aux États-Unis', steps:p => [
    ['Test d’anglais passé', !!p.academic.englishScore, 'profil'], ['Bulletins traduits en anglais', !!(p.docs || {}).translation, 'dossier'],
    ['Inscription NCAA Eligibility Center', !!p.eligibility.ncaaRegistered, 'eligibilite'], ['Vidéo de temps forts à la une', (p.videos || []).some(v => v.featured && v.visible), 'videos'],
    ['3 matchs mesurés sur vidéo', engineEntries(p.id).length + (p.pastLog || []).length >= 3, 'stats'], ['10 entraîneurs contactés', state.messages.filter(m => m.dir === 'out').length >= 10, 'messages'],
    ['Offres comparées', state.offers.length >= 2, 'offres']]},
  europe:{l:'Club professionnel ou semi-pro en Europe', steps:p => [
    ['Vidéo de temps forts à la une', (p.videos || []).some(v => v.featured && v.visible), 'videos'], ['3 matchs mesurés sur vidéo', engineEntries(p.id).length + (p.pastLog || []).length >= 3, 'stats'],
    ['Tests physiques certifiés en détection', !!p.testsCertified, 'evenements'], ['Référence d’entraîneur', (p.endorsements || []).length > 0, 'profil'],
    ['Agent licencié FIFA identifié (si besoin)', !!(state.orders || []).some(o => /agent/i.test(o.service || '')), 'services'], ['Inscription à une détection', (state.events || []).some(e => e.me), 'evenements']]},
  etudes:{l:'Études et football en France ou au Canada', steps:p => [
    ['Projet d’études renseigné', !!p.academic.studyField, 'profil'], ['Bulletins déposés', !!(p.docs || {}).transcripts, 'dossier'],
    ['Vidéo de temps forts à la une', (p.videos || []).some(v => v.featured && v.visible), 'videos'], ['5 programmes suivis', Object.keys(p.pipeline || {}).length >= 5, 'suivi']]},
  progresser:{l:'Progresser et être vu localement', steps:p => [
    ['Un match analysé chaque mois', engineEntries(p.id).length > 0, 'videos'], ['Tests physiques suivis dans le temps', (p.testsHistory || []).length >= 2, 'stats'],
    ['Profil public partagé', (state.views || []).some(v => v.playerId === 'me'), 'partage'], ['Format vertical publié', (p.videos || []).some(v => v.type === 'Format vertical (réseaux)'), 'videos']]}
};

/* ---------- Accueil joueur composé de blocs ---------- */
const HOME_WIDGETS = [['kpis', 'Chiffres du moment'], ['plan', 'Plan de la semaine'], ['parcours', 'Mon parcours'], ['actions', 'Prochaines actions'], ['stats', 'Mes statistiques'], ['preuve', 'Indice de preuve'], ['video', 'Ma vidéo à la une'], ['matches', 'Meilleures correspondances'], ['notifs', 'Notifications']];
function homeConf() { state.home = Object.assign({order:HOME_WIDGETS.map(w => w[0]), hidden:[]}, state.home || {}); HOME_WIDGETS.forEach(([k]) => { if (!state.home.order.includes(k)) state.home.order.push(k); }); return state.home; }
const vAccueilV5 = VIEWS.accueil;
VIEWS.accueil = function () {
  const base = vAccueilV5(), p = state.player, H = homeConf();
  const cut = (startMark, endMark) => { const a = base.indexOf(startMark); if (a < 0) return ''; const b = endMark ? base.indexOf(endMark, a + startMark.length) : -1; return base.slice(a, b < 0 ? undefined : b); };
  const headPart = base.slice(0, base.indexOf('<div class="grid g4">'));
  const kpis = cut('<div class="grid g4">', '<div class="grid g2"');
  const g2 = cut('<div class="grid g2"', '<section class="card" style="margin-top:16px"><h3>Notifications');
  const secs = g2.match(/<section class="card">[\s\S]*?<\/section>/g) || [];
  const notifs = cut('<section class="card" style="margin-top:16px"><h3>Notifications').replace(' style="margin-top:16px"', '');
  const tr = TRACKS[p.track] ? p.track : 'usa', steps = TRACKS[tr].steps(p), done = steps.filter(s => s[1]).length;
  const mo = metricsOf(p), pi = proofIndex(p), fv = (p.videos || []).find(v => v.featured && v.visible);
  const W = {
    kpis:kpis.replace('<div class="grid g4">', '<div class="grid g4 w-kpis">'),
    parcours:`<section class="card"><h3>Mon parcours <label class="sr" for="trackSel">Mon objectif</label><select id="trackSel" data-action-change="trackSet" class="inline-sel">${Object.entries(TRACKS).map(([k, v]) => `<option value="${k}"${k === tr ? ' selected' : ''}>${esc(v.l)}</option>`).join('')}</select></h3>
      <div class="bar" role="img" aria-label="${done} étapes sur ${steps.length}"><i style="width:${Math.round(done / steps.length * 100)}%"></i></div><p class="small muted" style="margin:6px 0 10px">${done} étape${done > 1 ? 's' : ''} sur ${steps.length}</p>
      <ol class="asteps">${steps.map(([l, ok, r]) => `<li class="astep${ok ? ' done' : ''}"><span class="adot" aria-hidden="true">${ok ? '✓' : ''}</span><div class="row" style="padding:0;gap:8px"><span class="grow">${esc(l)}<span class="sr">${ok ? ' (fait)' : ''}</span></span>${ok ? '' : `<a class="btn sm" href="#${r}">Faire</a>`}</div></li>`).join('')}</ol></section>`,
    actions:secs[0] || '', matches:secs[1] || '', notifs,
    stats:`<section class="card"><h3>Mes statistiques <a class="btn sm" href="#stats">Détail</a></h3><div class="mini-stats">${radarSVG([{label:'Moi', values:radarValues(mo)}], 'fr', 220)}<div class="list">${['distance90', 'passAcc', 'top', 'sprints90'].filter(k => mo.v[k] != null).map(k => `<div class="row"><span class="grow small">${esc(MET[k].l)}</span><b class="num">${MET[k].f(mo.v[k])}${MET[k].u ? ' ' + MET[k].u : ''}</b><span class="small muted num">${mo.pct[k]}<sup>e</sup></span></div>`).join('') || '<div class="empty">Analyse un match pour obtenir tes premières mesures.</div>'}</div></div></section>`,
    plan:`<section class="card"><h3>Plan de la semaine <span class="small muted">trié par gain pour ton profil</span></h3>${planHTML(p, 5)}</section>`,
    preuve:`<section class="card"><h3>Indice de preuve <span class="pill ${pi >= 60 ? 'ok' : 'warn'}">${pi} / 100</span></h3><p class="small muted" style="margin:0 0 8px">Ce qui rend ton profil crédible aux yeux d’un recruteur.</p><div class="list">${proofItems(p).filter(i => PROOF[i.lvl].r < 2).slice(0, 3).map(i => `<a class="row" href="#${i.r}" style="text-decoration:none;color:inherit"><span class="grow small">${esc(i.l)}</span>${proofPill(i.lvl)}<span class="muted">›</span></a>`).join('') || '<div class="empty">Toutes tes données sont appuyées.</div>'}</div></section>`,
    video:`<section class="card"><h3>Ma vidéo à la une <a class="btn sm" href="#videos">Gérer</a></h3>${fv ? `<button class="thumb${fv.thumb ? '' : ' ph'}"${thumbStyle(fv)} data-action="playVideo" data-arg="${fv.id}" aria-label="Lire ${esc(fv.title)}"><span class="play">▶</span>${fv.duration ? `<span class="dur">${tc(fv.duration)}</span>` : ''}</button><p class="small" style="margin:8px 0 0"><b>${esc(fv.title)}</b> · ${esc(fv.type)}</p>` : '<div class="empty">Aucune vidéo à la une. C’est la première chose qu’un recruteur regarde.</div>'}<p class="tiny muted" style="margin:8px 0 0">Le studio de montage (dans un match) crée aussi un format vertical pour les réseaux.</p></section>`
  };
  const order = H.order.filter(k => !H.hidden.includes(k) && W[k]);
  const full = new Set(['kpis']);
  let html = '', buf = [];
  const flush = () => { if (buf.length) { html += `<div class="grid g2 home-grid">${buf.join('')}</div>`; buf = []; } };
  order.forEach(k => { if (full.has(k)) { flush(); html += `<div class="home-row">${W[k]}</div>`; } else buf.push(W[k]); });
  flush();
  const hi = headPart.lastIndexOf('</div></div>');
  return (hi > 0 ? headPart.slice(0, hi) + '<button class="btn" data-action="homeEdit">Personnaliser</button>' + headPart.slice(hi) : headPart) + html;
};
Object.assign(ACT, {
  homeEdit() {
    const H = homeConf();
    openModal('Personnaliser l’accueil', `<p class="small muted" style="margin:0">Choisis les blocs et leur ordre.</p><div class="list" id="homeList">${homeListHTML()}</div><div class="actions"><button class="btn" data-action="homeReset">Ordre d’origine</button><button class="btn primary" data-action="closeModal">Terminé</button></div>`);
  },
  homeMove(a) { const [k, d] = String(a).split('|'); const o = homeConf().order, i = o.indexOf(k), j = i + +d; if (i < 0 || j < 0 || j >= o.length) return; [o[i], o[j]] = [o[j], o[i]]; save(); $('#homeList').innerHTML = homeListHTML(); const b = document.querySelector(`#homeList [data-action="homeMove"][data-arg="${k}|${d}"]`); if (b && !b.disabled) b.focus(); render(); },
  homeReset() { state.home = null; homeConf(); save(); $('#homeList').innerHTML = homeListHTML(); render(); }
});
function homeListHTML() { const H = homeConf(); return H.order.map((k, i) => { const l = (HOME_WIDGETS.find(w => w[0] === k) || [k, k])[1]; return `<div class="row"><label class="check grow" style="padding:0"><input type="checkbox" data-action-change="homeHide" data-arg="${k}"${H.hidden.includes(k) ? '' : ' checked'}>${esc(l)}</label><button type="button" class="btn sm icon" data-action="homeMove" data-arg="${k}|-1" aria-label="Monter ${esc(l)}"${i === 0 ? ' disabled' : ''}>↑</button><button type="button" class="btn sm icon" data-action="homeMove" data-arg="${k}|1" aria-label="Descendre ${esc(l)}"${i === H.order.length - 1 ? ' disabled' : ''}>↓</button></div>`; }).join(''); }
Object.assign(CHANGE_ACT, {
  homeHide(k, el) { const H = homeConf(); H.hidden = el.checked ? H.hidden.filter(x => x !== k) : [...new Set([...H.hidden, k])]; save(); render(); },
  trackSet(a, el) { state.player.track = el.value; save(); render(); const s = $('#trackSel'); if (s) s.focus(); }
});
function migrate7(s) { if (s.schema >= 7) return s; if (s.player && !s.player.track) s.player.track = 'usa'; if (s.player && s.player.demo) { const L = s.player.look = s.player.look || {}; if (!L.pitch) L.pitch = ['Box-to-box midfielder covering 10+ km per 90, measured on video', '83% pass accuracy on 210 tracked passes', 'Starter in French National 3 at 18, former U19 captain']; } s.schema = 7; return s; }
const migrateV6 = migrate;
migrate = s => migrate7(migrateV6(s));

