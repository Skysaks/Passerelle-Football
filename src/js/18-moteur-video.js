/* ===================== Moteur vidéo, données d'entraînement, finitions ===================== */
const ENGINE_FORMAT = 'passerelle.touches/1';
const REJECT_REASONS = [['pas-moi', 'Ce n’est pas moi'], ['pas-action', 'Pas d’action'], ['decale', 'Mauvais moment'], ['doublon', 'Doublon']];
const ENGINE_STEPS = [
  ['Ingestion', 'FFmpeg : 720p, 8 images/s pour l’analyse, original gardé pour les clips', 'LGPL ou GPL selon la compilation, appelé comme programme séparé', 'en place'],
  ['Choix du joueur', 'Le joueur clique sur lui-même et indique son numéro et la couleur de son maillot', 'Code Passerelle', 'en place'],
  ['Détection joueurs et ballon', 'RF-DETR Small, classes COCO « person » et « sports ball » ; puis réentraîné sur des images de foot amateur', 'Apache 2.0 (tailles Nano à Large)', 'générique, à réentraîner'],
  ['Suivi de tous les joueurs', 'ByteTrack (bibliothèque trackers de Roboflow)', 'Apache 2.0', 'en place'],
  ['Équipes', 'k-moyennes sur la couleur des maillots ; arbitre ou couleur isolée écartés', 'OpenCV : Apache 2.0', 'en place'],
  ['Contrôle de caméra fixe', 'Flux optique des points du décor ; si la caméra bouge, la physique est refusée', 'OpenCV : Apache 2.0', 'en place'],
  ['Garder le bon joueur', 'V0 : couleur du maillot et position. V1 : SAM 2 relancé par un clic quand la piste est perdue. V2 : lecture du numéro', 'SAM 2 : Apache 2.0', 'V0 en place'],
  ['Contacts ballon-joueur', 'Ballon proche des pieds du joueur, regroupé en épisodes ; position du joueur gardée pour le projecteur', 'Code Passerelle', 'en place'],
  ['Terrain et physique', 'Calibrage par 4 repères cliqués (caméra fixe) : distance, haute intensité, sprints, vitesse max, carte de chaleur', 'OpenCV : Apache 2.0', 'en place'],
  ['Type d’action', 'Règles sur la trajectoire du ballon : passe réussie ou perdue, direction, passe progressive, conduite, frappe, récupération. Ensuite : classifieur appris sur les validations', 'Code Passerelle', 'en place (règles)'],
  ['Qualité de l’analyse', 'Note A/B/C et avertissements (joueur ou ballon peu visibles, caméra mobile, calibrage imprécis) ; une analyse C est exclue des moyennes', 'Code Passerelle', 'en place'],
  ['Validation humaine', 'Le joueur valide ou refuse, l’entraîneur confirme ; chaque décision devient une donnée d’entraînement si consentement', 'Code Passerelle', 'en place']
];
const ENGINE_ROADMAP = [
  ['V0.3 · maintenant', 'Passes (issue, direction, progressives), conduites, frappes, récupérations, physique, contrôle de caméra et note de qualité ; validation humaine. Vérifié sur vidéos synthétiques à vérité connue.', 'Précision et écarts physiques mesurés sur 20 matchs réels'],
  ['V1', 'Détecteur réentraîné sur foot amateur (ballon petit et flou), SAM 2 pour les pertes de piste.', 'Gain de rappel mesuré contre des matchs marqués à la main'],
  ['V2', 'Lecture du numéro de maillot ; classifieur d’actions appris sur les validations (duels, récupérations, centres).', 'Types justes sur au moins 4 actions sur 5 (objectif interne)'],
  ['V3', 'Calibrage automatique par les lignes du terrain, pour les caméras qui pivotent ; rapport de match par joueur.', 'Seulement si les recruteurs le demandent']
];

function engineClips() { return state.matches.flatMap(m => m.clips.map(c => Object.assign({matchId:m.id}, c))).filter(c => c.origin === 'moteur' || c.origin === 'ia'); }
function engineStats() {
  const all = engineClips(), dec = all.filter(c => c.status === 'validé' || c.status === 'refusé');
  const ok = dec.filter(c => c.status === 'validé').length, ko = dec.length - ok;
  const reasons = {}; dec.filter(c => c.status === 'refusé').forEach(c => { reasons[c.reason || 'sans motif'] = (reasons[c.reason || 'sans motif'] || 0) + 1; });
  const consented = new Set([state.player.trainConsent ? 'me' : null, ...state.others.filter(o => o.trainConsent).map(o => o.id)].filter(Boolean));
  const labelled = dec.filter(c => consented.has(c.playerId)).length;
  return {proposed:all.length, decided:dec.length, ok, ko, precision:dec.length ? ok / dec.length : null, reasons, labelled, pending:all.length - dec.length};
}
// Rappel : sur un match qui a des marques manuelles ET des propositions, part des marques manuelles retrouvées à ±3 s.
function recallRows() {
  return state.matches.map(m => {
    const man = m.clips.filter(c => c.origin === 'manuel'), eng = m.clips.filter(c => c.origin === 'moteur' || c.origin === 'ia');
    if (!man.length || !eng.length) return null;
    const hit = man.filter(a => eng.some(b => Math.abs((b.t + b.dur * .43) - (a.t + a.dur * .6)) <= 3)).length;
    return {m, man:man.length, eng:eng.length, hit, recall:hit / man.length};
  }).filter(Boolean);
}

/* ---------- Carte d'analyse du match (joueur et entraîneur) ---------- */
function analysisCardHTML(m) {
  const q = qualityScore(m), tgt = m.target || {}, coach = state.role === 'entraineur';
  const st = engineStats(), runs = m.engineRuns || [];
  const lim = coach ? `Analyses d’équipe ce mois : ${usage().teamAnalyses} / ${plan('entraineur').lim.teamAnalyses >= 999 ? '∞' : plan('entraineur').lim.teamAnalyses}` : `Analyses ce mois : ${usage().analyses} / ${plan('joueur').lim.analyses}`;
  const step = (done, title, body) => `<li class="astep${done ? ' done' : ''}"><span class="adot" aria-hidden="true">${done ? '✓' : ''}</span><div><div class="t">${title}${done ? '<span class="sr"> (fait)</span>' : ''}</div><div class="small muted">${body}</div></div></li>`;
  return `<section class="card"><h3>Analyse automatique</h3>
  <ol class="asteps">
    ${step(q >= 70, 'Vidéo exploitable', q >= 70 ? `Qualité ${q} / 100.` : `Qualité ${q} / 100 : coche les critères remplis plus bas. <button type="button" class="linkbtn" data-action="filmGuide">Comment bien filmer</button>`)}
    ${step(m.aiPick != null || !!tgt.click, coach ? 'Joueurs repérés' : 'Toi sur l’image', m.aiPick != null || tgt.click ? `Sélection faite${tgt.number ? ` · n° ${esc(tgt.number)}` : ''}${tgt.color ? ` · maillot ${esc(tgt.color)}` : ''}.` : 'Clique sur toi dans une image du match, indique ton numéro.')}
    ${step(runs.length > 0, 'Propositions à valider', runs.length ? `Dernière analyse : ${esc(runs[0].engine)}, ${runs[0].n} propositions, ${fdate(runs[0].date)}.` : 'Les actions détectées arrivent dans la liste des clips, en « À valider ».')}
  </ol>
  ${(() => { const pid = state.role === 'entraineur' ? (ui.tagPlayer || (roster()[0] || {}).id) : 'me', e = m.engine && m.engine[pid], q = e && e.quality; return q ? `<p class="small" style="margin:0 0 10px"><span class="pill q${q.grade}">Qualité ${q.grade}</span> ${q.warnings && q.warnings.length ? esc(q.warnings[0]) : 'Joueur et ballon bien suivis.'}</p>` : ''; })()}<div class="actions"><button class="btn" data-action="report" data-arg="${m.id}">Rapport de match</button><button class="btn primary" data-action="aiOpen">${m.aiPick != null ? 'Relancer l’analyse' : 'Analyser le match'}</button><label class="btn" style="cursor:pointer">Importer un résultat du moteur<input type="file" accept="application/json,.json" data-engine-import="${m.id}" hidden></label></div>
  <p class="small muted" style="margin:10px 0 0">${lim}${st.precision != null ? ` · Propositions retenues jusqu’ici : <b class="num">${Math.round(st.precision * 100)} %</b>` : ''}</p>
  ${coach ? '' : F('player.trainConsent', 'J’accepte que mes clips validés ou refusés servent, sans mon nom, à améliorer le moteur', 'check')}
  <p class="tiny muted" style="margin:6px 0 0">« Analyser le match » est une simulation dans ce prototype. Le moteur réel (kit Hugging Face fourni avec le projet) produit un fichier JSON au format passerelle.match/2 : passes, conduites, frappes et, caméra fixe, distance et sprints.</p>
</section>`;
}

/* ---------- Choix du joueur : clic + numéro + couleur ---------- */
aiModal = function () {
  const m = curMatch(); const tgt = (m && m.target) || {};
  openModal('Analyser le match', `<p class="small" style="margin:0">1. Clique sur ${state.role === 'entraineur' ? 'un joueur de ton équipe' : 'toi'} dans cette image. ${ui.pick != null ? '<b>Sélection faite.</b>' : ''}</p>${pitchSVG(ui.pick)}
  <div class="form"><div class="field"><label for="ai_num">2. Numéro de maillot</label><input type="text" id="ai_num" inputmode="numeric" maxlength="3" value="${esc(tgt.number || '')}" placeholder="Ex. 8"></div>
  <div class="field"><label for="ai_col">Couleur du maillot</label><input type="text" id="ai_col" value="${esc(tgt.color || '')}" placeholder="Ex. bleu ciel"></div></div>
  <div id="aiProg" hidden><div class="bar" style="height:10px"><i id="aiBar" style="width:0%"></i></div><p class="small muted" id="aiStep" style="margin:8px 0 0" aria-live="polite"></p></div>
  <div class="actions"><button class="btn primary" data-action="aiRun"${ui.pick == null ? ' disabled' : ''}>Lancer l’analyse</button></div>
  <p class="tiny muted" style="margin:0">Simulation pour le prototype. Le numéro et la couleur aident le moteur à retrouver le joueur quand il sort du champ ou croise un coéquipier.</p>`);
};
const aiRunV4 = aiRun;
aiRun = function () {
  const m = curMatch(); if (!m) return;
  m.target = {pick:ui.pick, number:($('#ai_num') || {}).value || '', color:($('#ai_col') || {}).value || ''};
  const before = new Set(m.clips.map(c => c.id));
  aiRunV4();
  // aiRunV4 crée les clips à la fin de sa minuterie : on enrichit ensuite les nouveaux.
  const t0 = Date.now(), iv = setInterval(() => {
    const fresh = m.clips.filter(c => !before.has(c.id));
    if (fresh.length || Date.now() - t0 > 8000) {
      clearInterval(iv);
      const r = rng(hashStr(m.id + fresh.length));
      fresh.forEach(c => { c.conf = Math.round((.35 + r() * .6) * 100) / 100; c.why = `Démo : ballon à ${(0.2 + r() * .5).toFixed(1).replace('.', ',')} hauteur de joueur de tes pieds pendant ${(0.3 + r() * .8).toFixed(1).replace('.', ',')} s`; c.engine = 'démo'; });
      if (fresh.length) { (m.engineRuns = m.engineRuns || []).unshift({date:new Date().toISOString().slice(0, 10), engine:'démo (simulation)', n:fresh.length}); save(); if (currentRoute() === 'videos' || currentRoute() === 'coach-matchs') render(); }
    }
  }, 200);
};

/* ---------- Import du résultat du moteur ---------- */
function importEngineJSON(m, txt) {
  let d; try { d = JSON.parse(txt); } catch (e) { toast('Ce fichier n’est pas un JSON lisible.'); return; }
  if (!d || d.format !== ENGINE_FORMAT || !Array.isArray(d.events)) { toast(`Format attendu : ${ENGINE_FORMAT}. Ce fichier ne vient pas du moteur Passerelle.`); return; }
  const pid = state.role === 'entraineur' ? (ui.tagPlayer || (roster()[0] || {}).id) : 'me';
  if (!m.duration && d.video && d.video.duration) m.duration = Math.round(d.video.duration);
  if (d.video && d.video.width && !m.width) { m.width = d.video.width; m.height = d.video.height; }
  const TYPES = new Set(CLIP_TYPES.map(c => c[0]));
  let added = 0, dup = 0;
  d.events.slice(0, 400).forEach(e => {
    const start = Math.max(0, +e.start || (+e.t - 3) || 0), end = +e.end || start + 7;
    if (!isFinite(start) || !isFinite(end)) return;
    if (m.clips.some(c => c.playerId === pid && Math.abs(c.t - start) < 2)) { dup++; return; }
    m.clips.push({id:uid(), type:TYPES.has(e.type) ? e.type : 'touche', t:Math.round(start * 10) / 10, dur:Math.min(15, Math.max(4, Math.round((end - start) * 10) / 10)), rating:0, inReel:false, origin:'moteur', status:'proposé', playerId:pid, conf:e.conf != null ? Math.round(+e.conf * 100) / 100 : null, why:String(e.why || '').slice(0, 140), engine:String(d.engine || 'moteur').slice(0, 40)});
    added++;
  });
  (m.engineRuns = m.engineRuns || []).unshift({date:new Date().toISOString().slice(0, 10), engine:String(d.engine || 'moteur').slice(0, 40), n:added, visible:d.stats && d.stats.target_visible_ratio});
  if (d.target) m.target = Object.assign({}, m.target, {number:d.target.jersey || (m.target || {}).number || '', color:d.target.color || (m.target || {}).color || '', click:Array.isArray(d.target.click) ? d.target.click.slice(0, 2) : null});
  { const u = usage(); if (state.role === 'entraineur') u.teamAnalyses++; else u.analyses++; }
  save(); ui.clipFilter = 'proposé'; render();
  toast(`${added} proposition${added > 1 ? 's' : ''} importée${added > 1 ? 's' : ''}${dup ? `, ${dup} déjà présente${dup > 1 ? 's' : ''}` : ''}. Valide ou refuse chacune.`);
}
document.addEventListener('change', e => {
  const el = e.target; if (!el || !el.matches || !el.matches('input[data-engine-import]')) return;
  const m = state.matches.find(x => x.id === el.dataset.engineImport), f = el.files && el.files[0]; if (!m || !f) return;
  if (f.size > 2e6) { toast('Fichier trop lourd pour un résultat d’analyse (2 Mo maximum).'); return; }
  f.text().then(t => importEngineJSON(m, t)); el.value = '';
});

/* ---------- Refus motivé (donnée d'entraînement) ---------- */
Object.assign(ACT, {
  rejectClip(id) {
    openModal('Pourquoi refuser ce clip ?', `<p class="small muted" style="margin:0">Ta réponse sert à corriger le moteur. Un seul appui.</p><div class="choicegrid">${REJECT_REASONS.map(([k, l]) => `<button type="button" class="btn" data-action="rejectWith" data-arg="${id}|${k}">${esc(l)}</button>`).join('')}</div>`);
  },
  rejectWith(a) {
    const [id, k] = String(a).split('|'); const m = curMatch(); const c = m && m.clips.find(x => x.id === id); if (!c) return;
    const done = undoable('Clip refusé.');
    c.status = 'refusé'; c.reason = (REJECT_REASONS.find(r => r[0] === k) || [, ''])[1]; c.inReel = false;
    closeModal(); refreshClips(); done();
  },
  restoreClip(id) { const c = curMatch().clips.find(x => x.id === id); if (c) { c.status = 'proposé'; c.reason = ''; refreshClips(); } },
  filmGuide() {
    openModal('Bien filmer pour l’analyse', `<ol class="guide">
      <li><b>Trépied en hauteur, au niveau du rond central.</b> Plus la caméra est haute (tribune, échafaudage, perche), moins les joueurs se masquent.</li>
      <li><b>Plan large, sans zoom.</b> Tout le terrain ou au moins la moitié dans le cadre. Le zoom fait perdre le ballon.</li>
      <li><b>Format paysage, 1080p, 25 ou 30 images/s.</b> Coupe la stabilisation « cinéma » qui recadre l’image.</li>
      <li><b>Lumière de face ou de côté.</b> Évite le soleil dans l’objectif et les projecteurs face caméra.</li>
      <li><b>Maillots à numéros lisibles</b> et couleurs différentes entre les deux équipes.</li>
      <li><b>Un fichier par mi-temps</b>, sans couper pendant le jeu.</li></ol>
      <p class="small muted" style="margin:0">Une caméra automatique (Veo, Trace, Pixellot…) donne de meilleurs résultats ; un téléphone sur trépied suffit pour démarrer.</p>`);
  },
  engineSample() {
    const sample = {format:ENGINE_FORMAT, engine:'passerelle-moteur 0.1.0', video:{file:'match.mp4', duration:2700, fps:25, width:1920, height:1080},
      target:{frame:0, click:[812, 455], jersey:'8', color:'bleu ciel'},
      events:[{t:132.6, start:129.6, end:136.6, type:'touche', conf:0.81, why:'Ballon à 0,3 hauteur de joueur des pieds pendant 0,6 s'}, {t:418.2, start:415.2, end:422.2, type:'touche', conf:0.58, why:'Ballon à 0,5 hauteur de joueur des pieds pendant 0,4 s'}],
      stats:{frames_analyzed:13500, target_visible_ratio:0.74, processing_seconds:612}};
    saveFile('exemple-resultat-moteur.json', JSON.stringify(sample, null, 2));
  },
  engineAlign() { const c = engineCost(); state.biz.gpuCost = Math.max(0.1, Math.ceil(c.perMatch * 2 * 10) / 10); save(); toast(`Coût par match du modèle économique fixé à ${fmtEur(state.biz.gpuCost)} (estimation × 2 par prudence).`); render(); }
});
Object.assign(CHANGE_ACT, { secSel(a, el) { if (el.value) { ACT.secJump(el.value); el.value = ''; } } });

/* ---------- Coût par match ---------- */
function fmtEur(v) { return (Math.round(v * 100) / 100).toLocaleString('fr-FR', {minimumFractionDigits:2, maximumFractionDigits:2}) + ' €'; }
function engineCost() {
  const e = state.engine;
  const frames = n0(e.matchMin) * 60 * n0(e.fps);
  const gpuMin = frames * n0(e.msFrame) / 1000 / 60 * n0(e.overhead);
  const gpu = gpuMin / 60 * n0(e.gpuEurH);
  const vlm = e.vlm ? n0(e.candidates) * n0(e.vlmEurClip) : 0;
  const store = n0(e.storeGB) * n0(e.storeEurGBMonth) * n0(e.storeMonths);
  const perMatch = gpu + vlm + store;
  return {frames, gpuMin, gpu, vlm, store, perMatch, perPlayerMonth:perMatch * n0(e.matchesPerMonth)};
}

/* ---------- Vue opérateur : Moteur vidéo ---------- */
function vOpMoteur() {
  const st = engineStats(), c = engineCost(), rr = recallRows(), e = state.engine;
  const pct = v => v == null ? '—' : Math.round(v * 100) + ' %';
  const reasons = Object.entries(st.reasons).sort((a, b) => b[1] - a[1]);
  return head('Moteur vidéo', 'Ce que le moteur propose, ce que les joueurs en gardent, ce qu’il coûte et ce qui reste à construire.', `<button class="btn" data-action="engineSample">Exemple de résultat (JSON)</button>`) + `
  <div class="grid g4" style="margin-bottom:16px">
    <div class="card kpi"><b class="v">${st.proposed}</b><span class="l">Propositions du moteur</span></div>
    <div class="card kpi"><b class="v">${pct(st.precision)}</b><span class="l">Retenues par les joueurs (${st.ok} sur ${st.decided})</span></div>
    <div class="card kpi"><b class="v">${st.decided ? pct((st.reasons['Ce n’est pas moi'] || 0) / st.decided) : '—'}</b><span class="l">Erreurs de joueur (« pas moi »)</span></div>
    <div class="card kpi"><b class="v">${st.labelled}</b><span class="l">Décisions utilisables pour l’entraînement (avec consentement)</span></div>
  </div>
  <div class="grid g2">
    <section class="card"><h3>Chaîne de traitement</h3><div class="list">${ENGINE_STEPS.map(([s, how, lic, state_], i) => `<div class="row" style="align-items:start"><span class="num muted" style="width:1.5rem">${i + 1}</span><div class="grow"><div class="t">${esc(s)}</div><div class="small muted">${esc(how)}</div><div class="tiny muted">Licence : ${esc(lic)}</div></div><span class="pill ${state_.startsWith('en place') ? 'ok' : state_ === 'plus tard' ? '' : 'warn'}">${esc(state_)}</span></div>`).join('')}</div>
      <p class="small muted" style="margin:10px 0 0">Écarté : Ultralytics YOLO, sous AGPL-3.0, qui impose de publier tout le code du service ou d’acheter une licence Enterprise.</p></section>
    <section class="card"><h3>Pourquoi les propositions sont refusées</h3>${reasons.length ? `<div class="list">${reasons.map(([r, n]) => `<div class="row"><span class="grow">${esc(r)}</span><span class="num">${n}</span><div style="width:40%"><div class="bar"><i style="width:${Math.round(n / st.ko * 100)}%"></i></div></div></div>`).join('')}</div>` : '<div class="empty">Aucun refus pour l’instant.</div>'}
      <h3 style="margin-top:18px">Rappel sur matchs de référence</h3><p class="small muted" style="margin:0 0 8px">Matchs qui ont à la fois des actions marquées à la main et des propositions : part des actions manuelles retrouvées à ±3 s.</p>
      ${rr.length ? `<div class="tablewrap"><table><thead><tr><th>Match</th><th>Manuelles</th><th>Retrouvées</th><th>Rappel</th></tr></thead><tbody>${rr.map(x => `<tr><td>${esc(x.m.title)}</td><td class="num">${x.man}</td><td class="num">${x.hit}</td><td class="num">${pct(x.recall)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Aucun match de référence.</div>'}</section>
  </div>
  <section class="card" style="margin-top:16px"><h3>Coût d’analyse par match</h3><p class="small muted" style="margin:0 0 10px">Estimation à paramétrer : remplace chaque hypothèse par une mesure dès le premier lot de vrais matchs.</p>
    <div class="form">${F('engine.matchMin', 'Durée filmée (min)', 'number')}${F('engine.fps', 'Images analysées par seconde', 'number')}${F('engine.msFrame', 'Temps GPU par image (ms)', 'number')}${F('engine.overhead', 'Surcoût décodage et attente (×)', 'number')}${F('engine.gpuEurH', 'Prix du GPU (€ / heure)', 'number')}${F('engine.candidates', 'Clips proposés par match', 'number')}${F('engine.vlm', 'Typer chaque clip avec un modèle vision-langage', 'check')}${F('engine.vlmEurClip', 'Coût par clip typé (€)', 'number')}${F('engine.storeGB', 'Stockage par match (Go)', 'number')}${F('engine.storeEurGBMonth', 'Stockage (€ / Go / mois)', 'number')}${F('engine.storeMonths', 'Durée de conservation (mois)', 'number')}${F('engine.matchesPerMonth', 'Matchs analysés par joueur actif et par mois', 'number')}</div>
    <div class="grid g4" style="margin-top:14px" data-live="engcost">${engineCostTiles(c)}</div>
    <div class="actions" style="margin-top:12px"><button class="btn" data-action="engineAlign">Reporter dans le modèle économique</button><span class="small muted">Actuellement : ${fmtEur(n0(state.biz.gpuCost))} par match dans le modèle économique.</span></div>
  </section>
  <div class="grid g2" style="margin-top:16px">
    <section class="card"><h3>Où faire tourner le moteur</h3><div class="list">
      <div class="row" style="align-items:start"><div class="grow"><div class="t">Hugging Face gratuit</div><div class="small muted">Démo seulement : 2 Spaces ZeroGPU si le compte a plus de 30 jours, environ 5 minutes de GPU par jour. Les Spaces Gradio sur CPU ne sont plus créables en gratuit depuis l’été 2026. Spaces statiques gratuits : de quoi héberger ce prototype.</div></div><span class="pill">Test</span></div>
      <div class="row" style="align-items:start"><div class="grow"><div class="t">Hugging Face PRO</div><div class="small muted">10 Spaces ZeroGPU, 40 min de GPU par jour, extensible à 1 $ les 10 min : pilote avec quelques matchs par jour.</div></div><span class="pill info">Pilote</span></div>
      <div class="row" style="align-items:start"><div class="grow"><div class="t">GPU loué à la seconde</div><div class="small muted">Matériel Hugging Face (T4 affiché à 0,40 $ / h) ou autre loueur, traitement par lots la nuit. Exiger un hébergement dans l’UE et un contrat de sous-traitance RGPD.</div></div><span class="pill ok">Production</span></div>
      <div class="row" style="align-items:start"><div class="grow"><div class="t">Sur le téléphone</div><div class="small muted">Plus tard : pré-tri sur l’appareil pour n’envoyer que les passages utiles.</div></div><span class="pill">V3</span></div>
    </div></section>
    <section class="card"><h3>Feuille de route du moteur</h3><div class="list">${ENGINE_ROADMAP.map(([v, what, gate]) => `<div class="row" style="align-items:start"><span class="pill acc" style="flex:none">${esc(v)}</span><div class="grow"><div class="small">${esc(what)}</div><div class="tiny muted">Condition de passage : ${esc(gate)}</div></div></div>`).join('')}</div>
      <p class="small muted" style="margin:10px 0 0">Données : vidéos de mineurs → consentement parental, conservation limitée, suppression de la vidéo source après découpe des clips validés.</p></section>
  </div>`;
}
function engineCostTiles(c) {
  return `<div class="card kpi"><b class="v">${Math.round(c.gpuMin)} min</b><span class="l">GPU par match (${c.frames.toLocaleString('fr-FR')} images)</span></div>
  <div class="card kpi"><b class="v">${fmtEur(c.perMatch)}</b><span class="l">Coût total par match</span></div>
  <div class="card kpi"><b class="v">${fmtEur(c.gpu)}</b><span class="l">Dont GPU${state.engine.vlm ? ` · typage ${fmtEur(c.vlm)}` : ''}</span></div>
  <div class="card kpi"><b class="v">${fmtEur(c.perPlayerMonth)}</b><span class="l">Par joueur actif et par mois</span></div>`;
}
VIEWS['op-moteur'] = vOpMoteur;
NAV_GROUPS.operateur[0][1].splice(1, 0, ['op-moteur', 'Moteur vidéo', 'video']);
NAV.operateur = NAV_GROUPS.operateur.flatMap(g => g[1].map(([k, l]) => [k, l]));
SHORT['op-moteur'] = 'Moteur';

const refreshLiveV4 = refreshLive;
refreshLive = function () { refreshLiveV4.apply(this, arguments); const el = document.querySelector('[data-live="engcost"]'); if (el && state.engine) el.innerHTML = engineCostTiles(engineCost()); };

/* ---------- Migration schéma 5 ---------- */
function migrate5(s) {
  if (s.schema >= 5) return s;
  s.engine = Object.assign({matchMin:90, fps:8, msFrame:25, overhead:1.5, gpuEurH:0.37, candidates:60, vlm:false, vlmEurClip:0.003, storeGB:3, storeEurGBMonth:0.02, storeMonths:2, matchesPerMonth:3}, s.engine || {});
  if (s.player && s.player.trainConsent == null) s.player.trainConsent = false;
  const m1 = (s.matches || []).find(m => m.id === 'm1');
  if (m1 && !m1.clips.some(c => c.origin === 'moteur')) {
    const mk = (t, status, conf, reason, why) => ({id:uid(), type:'touche', t, dur:7, rating:status === 'validé' ? 3 : 0, inReel:false, origin:'moteur', status, playerId:'me', conf, why, reason:reason || '', engine:'passerelle-moteur 0.1.0'});
    m1.clips.push(
      mk(1263, 'validé', .86, '', 'Ballon à 0,2 hauteur de joueur des pieds pendant 0,7 s'),
      mk(2213, 'validé', .74, '', 'Ballon à 0,3 hauteur de joueur des pieds pendant 0,5 s'),
      mk(983, 'validé', .69, '', 'Ballon à 0,4 hauteur de joueur des pieds pendant 0,4 s'),
      mk(3713, 'validé', .62, '', 'Ballon à 0,4 hauteur de joueur des pieds pendant 0,8 s'),
      mk(1880, 'refusé', .51, 'Ce n’est pas moi', 'Ballon à 0,5 hauteur de joueur des pieds pendant 0,3 s'),
      mk(3305, 'refusé', .47, 'Pas d’action', 'Ballon à 0,5 hauteur de joueur des pieds pendant 0,3 s'),
      mk(4470, 'proposé', .77, '', 'Ballon à 0,3 hauteur de joueur des pieds pendant 0,6 s'),
      mk(5023, 'proposé', .55, '', 'Ballon à 0,5 hauteur de joueur des pieds pendant 0,4 s'));
    m1.target = {pick:4, number:'8', color:'bleu ciel'};
    m1.engineRuns = [{date:'2026-11-09', engine:'passerelle-moteur 0.1.0', n:8, visible:.74}];
  }
  s.schema = 5;
  return s;
}
const migrateV4 = migrate;
migrate = s => migrate5(migrateV4(s));

