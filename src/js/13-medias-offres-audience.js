/* ========== Médias, offres, audience, dossier, détections, services, modèle économique ========== */
const IDB = {
  db:null,
  open() { return new Promise((res, rej) => { if (this.db) return res(this.db); let r; try { r = indexedDB.open('passerelle-media', 1); } catch (e) { return rej(e); } r.onupgradeneeded = () => r.result.createObjectStore('blobs'); r.onsuccess = () => { this.db = r.result; res(this.db); }; r.onerror = () => rej(r.error); }); },
  async tx(mode, fn) { const db = await this.open(); return new Promise((res, rej) => { const t = db.transaction('blobs', mode); const rq = fn(t.objectStore('blobs')); t.oncomplete = () => res(rq && rq.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); }); },
  put(k, v) { return this.tx('readwrite', s => s.put(v, k)); },
  get(k) { return this.tx('readonly', s => s.get(k)); },
  del(k) { return this.tx('readwrite', s => s.delete(k)); }
};
const mediaCache = {};
function money2(v, cur) { try { return new Intl.NumberFormat('fr-FR', {style:'currency', currency:cur || 'EUR', minimumFractionDigits: Number(v) % 1 ? 2 : 0, maximumFractionDigits:2}).format(n0(v)); } catch (e) { return v + ' ' + (cur || ''); } }

/* ---------- Offres ---------- */
const PLANS = {
  'joueur-free':{role:'joueur', name:'Gratuit', price:0, cur:'EUR', per:'', lim:{videos:3, analyses:1, audience:false}, f:['Profil complet et lien privé','3 vidéos sur le profil','1 analyse automatique de match par mois','Marquage manuel illimité','Matching, suivi et messages','Nombre de vues du profil']},
  'joueur-pro':{role:'joueur', name:'Pro', price:9.9, cur:'EUR', per:'mois', note:'ou 79 € par an', lim:{videos:20, analyses:8, audience:true}, f:['20 vidéos sur le profil','8 analyses automatiques par mois','Audience détaillée : quels programmes t’ont vu, quelles vidéos','Alertes quand un besoin publié correspond à ton profil','Tarif réduit aux journées de détection','Export du profil']},
  'club-partenaire':{role:'entraineur', name:'Club partenaire', price:0, cur:'EUR', per:'', lim:{teamAnalyses:2}, f:['Effectif, invitations, recommandations','2 analyses de matchs d’équipe par mois','20 % des abonnements Pro de tes joueurs reversés au club','Validation des stats et des vidéos']},
  'club-licence':{role:'entraineur', name:'Licence club', price:390, cur:'EUR', per:'équipe / saison', lim:{teamAnalyses:999}, f:['Analyses illimitées des matchs d’équipe','Offre Pro incluse pour les joueurs de l’équipe','Tableau de bord club et exports','Tarifs négociés sur la captation vidéo']},
  'rec-free':{role:'recruteur', name:'Gratuit', price:0, cur:'USD', per:'', lim:{profiles:5, contacts:3, saved:false, csv:false}, f:['Recherche de prospects et filtres','5 profils complets par mois','3 demandes de contact par mois','Shortlist']},
  'rec-pro':{role:'recruteur', name:'Recruteur Pro', price:79, cur:'USD', per:'mois', lim:{profiles:Infinity, contacts:Infinity, saved:true, csv:true}, f:['Profils et contacts illimités','Recherches enregistrées et alertes','Export CSV de la shortlist','Accès prioritaire aux détections','Même tarif public pour tous les programmes']}
};
const DEFAULT_PLAN = {joueur:'joueur-free', entraineur:'club-partenaire', recruteur:'rec-free'};
const ACC = [
  {k:'acc-autonome', name:'Autonome', price:390, f:['Logiciel 12 mois inclus','1 revue de dossier de 30 min avec un conseiller']},
  {k:'acc-accompagne', name:'Accompagné', price:1490, f:['4 séances avec un conseiller','Liste de 25 programmes validée','Vidéo de temps forts montée','Préparation des appels avec les coachs','Dossier administratif']},
  {k:'acc-signature', name:'Signature', price:2990, f:['Tout l’Accompagné','Outreach piloté avec toi','Comparaison des offres','Visa et arrivée']}
];
const PLAN_ROUTE = {joueur:'abonnement', entraineur:'club', recruteur:'recruteur-abonnement'};
function plan(role) { return PLANS[state.plans[role]] || PLANS[DEFAULT_PLAN[role]]; }
function usage() { const mo = today().slice(0, 7); if (!state.usage || state.usage.month !== mo) state.usage = {month:mo, analyses:0, teamAnalyses:0, recProfiles:[], recContacts:0}; return state.usage; }
function upsell(text, role) { openModal('Fonction de l’offre supérieure', `<p style="margin:0">${esc(text)}</p><div class="actions"><button class="btn primary" data-action="goPlans" data-arg="${role}">Voir les offres</button></div>`); }
function payModal(label, amount, cur, onPaid, detail) {
  ui.pay = onPaid;
  openModal('Paiement', `<div class="card" style="box-shadow:none"><div style="font-weight:650">${esc(label)}</div><div class="kpi" style="margin-top:6px"><span class="v">${amount ? money2(amount, cur) : 'Gratuit'}</span>${detail ? `<span class="l">${esc(detail)}</span>` : ''}</div></div><div class="callout warn small">Paiement de démonstration : aucun prélèvement, aucune donnée bancaire. En production : Stripe (carte, SEPA, paiement en 3 fois pour les forfaits).</div><div class="actions"><button class="btn primary" data-action="payConfirm">${amount ? 'Confirmer (démo)' : 'Activer'}</button></div>`);
}
function bill(label, amount, cur) { state.billing.unshift({id:uid(), date:today(), label, amount, cur:cur || 'EUR'}); }

/* ---------- Migration et données d'exemple : médias et offres ---------- */
function migrate(s) {
  const P0 = s.player;
  const fill = p => { if (!p.videos) p.videos = []; if (!p.docs) p.docs = {}; if (!p.verified) p.verified = {identity:false}; if (p.testsCertified === undefined) p.testsCertified = null; if (p.videosVerified === undefined) p.videosVerified = false; if (!p.guardian) p.guardian = {name:'', email:'', phone:''}; if (p.guardian.consent === undefined) p.guardian.consent = false; };
  [P0, ...s.others].forEach(fill);
  if (!s.schema || s.schema < 2) {
    if (P0.id === 'me' && P0.demo && !P0.videos.length) { P0.videos.push({id:'v-demo1', title:'Temps forts 2025-2026', type:'Temps forts', date:'2026-06-10', duration:212, thumb:'', featured:true, visible:true, demo:true, source:'demo', link:'', assetId:'', localKey:'', sizeMB:0}); P0.videosVerified = true; P0.docs = {passport:{status:'vérifié', name:'passeport.pdf', date:'2026-10-02', demo:true}, transcripts:{status:'fourni', name:'bulletins-terminale.pdf', date:'2026-10-02', demo:true}, english:{status:'fourni', name:'duolingo-115.pdf', date:'2026-09-20', demo:true}}; P0.verified.identity = true; }
    s.others.forEach(o => { if (!o.videos.length && o.demo) o.videos.push({id:'v-' + o.id, title:'Temps forts', type:'Temps forts', date:'2026-06-01', duration:150 + (hashStr(o.id) % 120), thumb:'', featured:true, visible:true, demo:true, source:'demo', link:'', assetId:'', localKey:'', sizeMB:0}); });
    const o1 = s.others.find(o => o.id === 'o1'); if (o1) o1.demoPro = true;
    const o4 = s.others.find(o => o.id === 'o4'); if (o4) { o4.testsCertified = {date:'2026-10-18', event:'Combine Valencia (exemple)', jump:66}; o4.verified.identity = true; }
    s.plans = s.plans || {...DEFAULT_PLAN};
    s.billing = s.billing || [];
    s.views = s.views || [
      {id:uid(), playerId:'me', programId:'p1', viewer:'Daniel Reyes', kind:'profil', date:'2026-11-20'},
      {id:uid(), playerId:'me', programId:'p1', viewer:'Daniel Reyes', kind:'video', videoId:'v-demo1', seconds:95, date:'2026-11-20'},
      {id:uid(), playerId:'me', programId:'p2', viewer:'Luis Ortega', kind:'profil', date:'2026-11-18'},
      {id:uid(), playerId:'me', programId:'p2', viewer:'Luis Ortega', kind:'video', videoId:'v-demo1', seconds:212, date:'2026-11-18'},
      {id:uid(), playerId:'me', programId:'p6', viewer:'Julien Tremblay', kind:'profil', date:'2026-11-12'},
      {id:uid(), playerId:'me', programId:'p3', viewer:'Ben Okafor', kind:'profil', date:'2026-11-05'}
    ];
    s.events = s.events || [
      {id:'e1', name:'Passerelle Showcase Toulouse', city:'Toulouse', date:'2027-03-13', gender:'Masculin', ages:'17 à 21 ans', price:89, proPrice:69, capacity:120, registered:46, recruiters:['p1','p2','p8'], includes:['Tests physiques certifiés : 30 m, VMA, détente','2 matchs filmés en 4K, analysés et découpés par joueur','Présentation vidéo de 3 min en anglais','Échanges avec les recruteurs présents'], me:false, results:false},
      {id:'e2', name:'Passerelle Showcase Féminin Lyon', city:'Lyon', date:'2027-04-10', gender:'Féminin', ages:'16 à 21 ans', price:89, proPrice:69, capacity:80, registered:21, recruiters:['p7','p5'], includes:['Tests physiques certifiés','2 matchs filmés et analysés','Atelier dossier universitaire'], me:false, results:false},
      {id:'e3', name:'Combine international Madrid', city:'Madrid', date:'2027-05-22', gender:'Masculin', ages:'17 à 22 ans', price:119, proPrice:99, capacity:150, registered:63, recruiters:['p2','p3','p4','p10'], includes:['Tests certifiés','3 matchs filmés','Recruteurs universitaires et clubs européens'], me:false, results:false}
    ];
    s.providers = s.providers || [
      {id:'s1', cat:'Captation vidéo', name:'Studio Bord Terrain', zone:'Toulouse et 50 km', price:70, unit:'match', delay:'Fichier sous 48 h', desc:'Trépied surélevé, plan large 4K, fichier prêt pour l’analyse.', status:'actif'},
      {id:'s6', cat:'Captation vidéo', name:'Côté Stade Vidéo', zone:'Montpellier', price:80, unit:'match', delay:'Fichier sous 72 h', desc:'Deux caméras, fichier complet et plan serré sur le joueur.', status:'actif'},
      {id:'s2', cat:'Montage', name:'Clip & Go', zone:'À distance', price:45, unit:'vidéo', delay:'72 h', desc:'Vidéo de temps forts de 3 à 5 min, carton titre, cercle sur le joueur.', status:'actif'},
      {id:'s3', cat:'Tests physiques certifiés', name:'Lab Perf Occitanie', zone:'Toulouse', price:40, unit:'séance', delay:'Résultats le jour même', desc:'30 m chronométré, VMA, détente, protocole publié. Résultats certifiés sur ton profil.', status:'actif'},
      {id:'s4', cat:'Traduction', name:'Traductions Exemple', zone:'À distance', price:30, unit:'page', delay:'5 jours', desc:'Traduction des bulletins et du diplôme en anglais pour les admissions.', status:'actif'},
      {id:'s5', cat:'Anglais', name:'English for Athletes', zone:'Visio', price:25, unit:'séance', delay:'Selon agenda', desc:'Préparation Duolingo English Test et TOEFL, simulation d’entretien avec un coach.', status:'actif'}
    ];
    s.take = s.take || 15;
    s.orders = s.orders || [];
    s.savedSearches = s.savedSearches || [{id:'ss1', name:'Milieux centraux avec test d’anglais', filters:{gender:'Homme', pos:'Milieu central', level:'0', minH:'', foot:'all', eng:true, video:false, budget:false, q:''}, alert:true, created:'2026-11-10', seen:[]}];
    s.biz = s.biz || {players:5000, proConv:4, proPrice:7.5, partnerShareOfPro:30, partnerShare:20, accSales:60, accPrice:1490, accCostPct:32, clubs:40, teamsPerClub:2, teamPrice:390, recruiters:25, recPrice:79, events:4, eventPlayers:100, eventPrice:79, eventCost:4500, gmv:60000, take:15, matches:8000, gpuCost:1.5, payFees:2, fixed:60000};
    s.schema = 2;
  }
  return s;
}

/* ---------- Badges de confiance ---------- */
function badgesHTML(p) {
  const b = [];
  if (p.verified && p.verified.identity) b.push('<span class="pill ok">Identité vérifiée</span>');
  if (p.statsValidated) b.push('<span class="pill ok">Stats validées par l’entraîneur</span>');
  if (p.videosVerified) b.push('<span class="pill ok">Vidéos confirmées par l’entraîneur</span>');
  if (p.testsCertified) b.push(`<span class="pill acc">Tests certifiés${p.testsCertified.event ? ' · ' + esc(p.testsCertified.event) : ''}</span>`);
  return b.join('');
}
function badgesEN(p) {
  const b = [];
  if (p.verified && p.verified.identity) b.push('ID verified');
  if (p.statsValidated) b.push('Stats verified by coach');
  if (p.videosVerified) b.push('Video confirmed by coach');
  if (p.testsCertified) b.push('Certified physical testing');
  return b.length ? `<p style="margin:6px 0 0;color:#0b6b4d;font-weight:600;font-size:0.8125rem">✓ ${b.map(esc).join(' · ✓ ')}</p>` : '';
}

/* ---------- Vidéos du profil ---------- */
function findVideo(id) { for (const p of allPlayers(true)) { const v = (p.videos || []).find(x => x.id === id); if (v) return v; } return null; }
async function mediaURL(v) {
  if (!v) return null;
  if (v.localKey) {
    if (mediaCache[v.localKey]) return mediaCache[v.localKey];
    try { const b = await IDB.get(v.localKey); if (b) { const u = URL.createObjectURL(b); mediaCache[v.localKey] = u; return u; } } catch (e) {}
  }
  if (v.assetId && IN_FRAME) return '/_blob/' + v.assetId;
  return null;
}
function hydrateMedia() {
  document.querySelectorAll('video[data-media]').forEach(async el => {
    if (el.dataset.hydrated) return; el.dataset.hydrated = '1';
    const u = await mediaURL(findVideo(el.dataset.media));
    if (u) el.src = u; else { const w = el.closest('.vmedia'); if (w) w.classList.add('missing'); }
  });
}
function vStore(v) { return v.demo ? 'Démo' : v.assetId ? 'Hébergée' : v.localKey ? 'Sur cet appareil' : v.link ? 'Lien externe' : '—'; }
function thumbStyle(v, extra) { const st = (v.thumb ? `background-image:url('${v.thumb}');` : '') + (extra || ''); return st ? ` style="${st}"` : ''; }
function videoCardHTML(v, i) {
  const B = `player.videos.${i}.`;
  return `<div class="vcard"><button class="thumb${v.thumb ? '' : ' ph'}"${thumbStyle(v)} data-action="playVideo" data-arg="${v.id}" aria-label="Lire ${esc(v.title)}"><span class="play">▶</span>${v.duration ? `<span class="dur">${tc(v.duration)}</span>` : ''}${v.featured ? '<span class="feat pill acc">À la une</span>' : ''}</button>
  <div class="vbody"><input type="text" id="${fid(B + 'title')}" data-bind="${B}title" value="${esc(v.title)}" aria-label="Titre de la vidéo">
  <select id="${fid(B + 'type')}" data-bind="${B}type" aria-label="Type">${VIDEO_TYPES_V6.map(t => `<option${t === v.type ? ' selected' : ''}>${t}</option>`).join('')}</select>
  <div class="chips"><span class="pill">${vStore(v)}</span>${v.sizeMB ? `<span class="pill">${v.sizeMB} Mo</span>` : ''}${state.player.videosVerified ? '<span class="pill ok">Confirmée</span>' : ''}</div>
  <label class="check small" style="padding:0"><input type="checkbox" id="${fid(B + 'visible')}" data-bind="${B}visible"${v.visible ? ' checked' : ''}>Visible sur le profil public</label>
  <div class="actions">${v.featured ? '' : `<button class="btn sm" data-action="featureVideo" data-arg="${v.id}">À la une</button>`}<button class="btn sm" data-action="chapters" data-arg="${v.id}">Chapitres${(v.chapters || []).length ? ` (${v.chapters.length})` : ''}</button><button class="btn sm icon" data-action="moveVideo" data-arg="${v.id}:-1" aria-label="Monter">↑</button><button class="btn sm icon" data-action="moveVideo" data-arg="${v.id}:1" aria-label="Descendre">↓</button>${v.localKey ? `<button class="btn sm" data-action="downloadVideo" data-arg="${v.id}">Télécharger</button>` : ''}<button class="btn sm icon danger" data-action="delVideo" data-arg="${v.id}" aria-label="Supprimer">✕</button></div></div></div>`;
}
function vidSection() {
  const p = state.player, lim = plan('joueur').lim.videos;
  return `<section class="card"><div class="sec"><div class="sec-h"><h3>Vidéos du profil <span class="small muted num">${p.videos.length} / ${lim}</span></h3><div class="actions"><label class="btn sm primary" style="cursor:pointer">Ajouter une vidéo<input type="file" accept="video/mp4,video/webm,video/quicktime,video/*" data-upload="video" hidden></label><button class="btn sm" data-action="addVideoLink">Ajouter un lien</button></div></div>
  <p class="small muted" style="margin:0">MP4 ou WebM recommandés. ${caps.assets ? 'Jusqu’à 20 Mo, la vidéo est hébergée avec ton profil et lisible par les recruteurs ; au-delà, elle reste sur cet appareil.' : 'Ici, la vidéo reste sur cet appareil. Dans la version en ligne, elle est hébergée avec ton profil (20 Mo maximum par fichier).'} La vidéo à la une s’affiche en premier sur ton profil public.</p>
  <div class="vgrid">${p.videos.map((v, i) => videoCardHTML(v, i)).join('') || '<div class="empty">Ajoute ta vidéo de temps forts : c’est la première chose qu’un recruteur regarde.</div>'}</div></div></section>`;
}
function probeVideo(blob) {
  return new Promise(res => {
    const v = document.createElement('video'); const u = URL.createObjectURL(blob); let done = false;
    const fin = o => { if (done) return; done = true; URL.revokeObjectURL(u); res(o); };
    const out = {duration:0, width:0, height:0, thumb:''};
    v.muted = true; v.playsInline = true; v.preload = 'metadata'; v.src = u;
    v.onloadedmetadata = () => { out.duration = isFinite(v.duration) ? Math.round(v.duration) : 0; out.width = v.videoWidth; out.height = v.videoHeight; try { v.currentTime = Math.min(1.5, (out.duration || 3) / 3); } catch (e) { fin(out); } };
    v.onseeked = () => { try { const c = document.createElement('canvas'); const w = 480, h = Math.round(w * (v.videoHeight || 9) / (v.videoWidth || 16)); c.width = w; c.height = h; c.getContext('2d').drawImage(v, 0, 0, w, h); out.thumb = c.toDataURL('image/jpeg', .72); } catch (e) {} fin(out); };
    v.onerror = () => fin(out);
    setTimeout(() => fin(out), 8000);
  });
}
async function addVideoBlob(blob, o) {
  const p = state.player, lim = plan('joueur').lim.videos;
  if (p.videos.length >= lim) { upsell(`L’offre ${plan('joueur').name} permet ${lim} vidéos sur le profil. Passe à Pro pour en ajouter jusqu’à 20.`, 'joueur'); return false; }
  toast('Préparation de la vidéo…');
  const meta = await probeVideo(blob);
  const id = uid();
  const v = {id, title:o.title || 'Nouvelle vidéo', type:o.type || 'Temps forts', date:today(), duration:meta.duration, width:meta.width, height:meta.height, thumb:meta.thumb, featured:!p.videos.some(x => x.featured), visible:true, demo:false, source:o.source || 'upload', link:'', assetId:'', localKey:'', sizeMB:Math.round(blob.size / 104857.6) / 10};
  try { await IDB.put('v_' + id, blob); v.localKey = 'v_' + id; } catch (e) {}
  const type = (blob.type || '').split(';')[0];
  if (caps.assets) {
    if (blob.size > 20 * 1048576) toast('Fichier de plus de 20 Mo : gardé sur cet appareil uniquement.');
    else if (!/^video\/(mp4|webm)$/.test(type)) toast('Format non hébergeable (MP4 ou WebM requis) : gardé sur cet appareil.');
    else { try { const r = await caps.assets.upload(blob, {type}); v.assetId = r.id; } catch (e) { toast(e && e.code === 'quota_or_state' ? 'Espace d’hébergement plein : gardé sur cet appareil.' : 'Hébergement impossible : gardé sur cet appareil.'); } }
  }
  if (!v.localKey && !v.assetId) { toast('Impossible de stocker cette vidéo sur cet appareil.'); return false; }
  p.videos.push(v); save(); render(); toast(v.assetId ? 'Vidéo hébergée et ajoutée au profil.' : 'Vidéo ajoutée au profil.');
  return true;
}
function playVideoModal(id) {
  const v = findVideo(id); if (!v) return;
  if (v.link && !v.localKey && !v.assetId) { openModal(v.title, `<p style="margin:0">Cette vidéo est hébergée ailleurs.</p><div class="actions"><a class="btn primary" href="${esc(v.link)}" target="_blank" rel="noopener">Ouvrir la vidéo</a></div><p class="small muted" style="margin:0">${esc(v.link)}</p>`); return; }
  if (v.demo) { openModal(v.title, `<div class="thumb ph" style="cursor:default;border-radius:12px"><span class="small" style="color:#cfe3d9">Vidéo de démonstration sans fichier</span></div>`); return; }
  openModal(v.title, `<div class="vmedia"><video data-media="${v.id}" data-vid="${v.id}" data-owner="${state.role === 'joueur' ? 'self' : 'me'}" controls autoplay playsinline poster="${esc(v.thumb)}"></video><div class="vmissing small">Fichier introuvable sur cet appareil.</div></div>`, true);
}
function publicVideosHTML(p, exp) {
  const vs = (p.videos || []).filter(v => v.visible).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  if (!vs.length) return '';
  if (exp) return `<h3>Video</h3>${vs.map(v => `<p style="margin:0 0 4px">${esc(v.title)} · ${esc(v.type === 'Temps forts' ? 'Highlights' : v.type)}${v.duration ? ' · ' + tc(v.duration) : ''}${v.link ? ' · ' + esc(v.link) : ''}</p>`).join('')}`;
  const cell = (v, big) => v.demo || (!v.localKey && !v.assetId) ? `<div class="vmedia"><div class="thumb ph"${thumbStyle(v, 'cursor:default')}>${v.link ? `<a class="btn sm" href="${esc(v.link)}" target="_blank" rel="noopener">Open video</a>` : '<span class="small" style="color:#cfe3d9">Demo video</span>'}</div><div class="small" style="margin-top:4px"><b>${esc(v.title)}</b>${v.duration ? ' · ' + tc(v.duration) : ''}</div></div>` : `<div class="vmedia"><video data-media="${v.id}" data-vid="${v.id}" data-owner="${esc(p.id)}" controls playsinline preload="metadata" poster="${esc(v.thumb)}"></video><div class="vmissing small">Video not available on this device.</div><div class="small" style="margin-top:4px"><b>${esc(v.title)}</b>${v.duration ? ' · ' + tc(v.duration) : ''}</div></div>`;
  return `<h3>Video</h3>${cell(vs[0], true)}${vs.length > 1 ? `<div class="vgrid" style="margin-top:10px">${vs.slice(1).map(v => cell(v)).join('')}</div>` : ''}`;
}
function logView(kind, playerId, videoId) {
  const pr = myProgram();
  state.views.unshift({id:uid(), playerId, programId:pr.id, viewer:state.recruiter.name, kind, videoId:videoId || '', date:today()});
  if (playerId === 'me' && kind === 'profil') state.notifications.unshift({id:uid(), to:'joueur', text:`${pr.name} a consulté ton profil.`, date:today(), read:false});
  save();
}

/* ---------- Audience ---------- */
function vAudience() {
  const vs = state.views.filter(v => v.playerId === 'me'), pro = plan('joueur').lim.audience;
  const d30 = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const recent = vs.filter(v => v.date >= d30);
  const progs = new Set(recent.map(v => v.programId));
  const vids = vs.filter(v => v.kind === 'video');
  const secs = vids.reduce((s, v) => s + n0(v.seconds), 0);
  const per = {}; vids.forEach(v => { per[v.videoId] = (per[v.videoId] || 0) + 1; });
  const who = v => { const pr = findProgram(v.programId); if (!pr) return 'Programme supprimé'; return pro ? `${esc(pr.name)} · ${esc(v.viewer || '')}` : `<span class="blur">${esc(pr.name)}</span> <span class="muted">· ${esc(pr.org)}, ${esc(pr.country)}</span>`; };
  return head('Audience', 'Qui regarde ton profil et tes vidéos. Les recruteurs voient que tu as un profil actif ; toi, tu vois où concentrer tes relances.', pro ? '' : `<button class="btn primary" data-action="goPlans" data-arg="joueur">Voir qui m’a consulté</button>`) + `
  <div class="grid g4"><div class="card kpi"><span class="v">${recent.filter(v => v.kind === 'profil').length}</span><span class="l">Vues du profil (30 j)</span></div><div class="card kpi"><span class="v">${progs.size}</span><span class="l">Programmes différents (30 j)</span></div><div class="card kpi"><span class="v">${vids.length}</span><span class="l">Lectures de vidéos</span></div><div class="card kpi"><span class="v">${tc(secs)}</span><span class="l">Temps de visionnage</span></div></div>
  <div class="grid g2" style="margin-top:16px;align-items:start"><section class="card"><h3>Dernières consultations ${pro ? '' : '<span class="pill">Identités réservées à l’offre Pro</span>'}</h3><div class="list">${vs.slice(0, 12).map(v => `<div class="row"><span class="pill ${v.kind === 'video' ? 'info' : ''}">${v.kind === 'video' ? 'Vidéo' : 'Profil'}</span><span class="grow small">${who(v)}${v.kind === 'video' && v.seconds ? ` · ${tc(v.seconds)} regardées` : ''}</span><span class="small muted">${fdate(v.date)}</span></div>`).join('') || '<div class="empty">Personne n’a encore consulté ton profil.</div>'}</div></section>
  <section class="card"><h3>Vidéos les plus regardées</h3><div class="list">${state.player.videos.map(v => `<div class="row"><span class="grow"><b>${esc(v.title)}</b> <span class="small muted">${esc(v.type)}</span></span><span class="num">${per[v.id] || 0} lecture${(per[v.id] || 0) > 1 ? 's' : ''}</span></div>`).join('') || '<div class="empty">Aucune vidéo sur ton profil.</div>'}</div>
  <div class="callout small" style="margin-top:12px">Un programme qui regarde ta vidéo en entier est le meilleur moment pour relancer : envoie un message dans les 48 h.</div></section></div>`;
}

/* ---------- Dossier ---------- */
const DOCS = [['passport','Passeport (page d’identité)','Vérifie ton identité et prépare le visa'],['transcripts','Bulletins des 2 dernières années','Exigés pour l’admission et la NCAA'],['translation','Traduction des bulletins en anglais','Souvent demandée par les universités'],['diploma','Diplôme ou attestation de réussite','À fournir dès l’obtention'],['english','Attestation de test d’anglais','Duolingo, TOEFL ou IELTS'],['club','Attestation de club ou licence','Confirme ton parcours'],['reco','Lettre de recommandation de l’entraîneur','En anglais si possible']];
function vDossier() {
  const p = state.player, d = p.docs;
  const done = DOCS.filter(([k]) => d[k] && d[k].status !== 'à fournir').length;
  return head('Dossier', 'Les pièces que demandent universités et clubs, rangées au même endroit. Les fichiers restent sur ton appareil et ne sont partagés que sur ta décision.', `<span class="pill ${done === DOCS.length ? 'ok' : 'warn'}">${done} / ${DOCS.length} pièces</span>`) + `
  <section class="card"><div class="list">${DOCS.map(([k, l, h]) => { const x = d[k] || {status:'à fournir'}; const st = x.status; return `<div class="row"><span class="dot ${st === 'vérifié' ? 'ok' : st === 'fourni' ? 'info' : 'warn'}"></span><div class="grow"><div class="t">${esc(l)}</div><div class="small muted">${esc(h)}${x.name ? ` · ${esc(x.name)} · ${fdate(x.date)}` : ''}</div></div><span class="pill ${st === 'vérifié' ? 'ok' : st === 'fourni' ? 'info' : 'warn'}">${esc(st)}</span><div class="actions"><label class="btn sm" style="cursor:pointer">${x.name ? 'Remplacer' : 'Ajouter'}<input type="file" accept="application/pdf,image/*" data-doc="${k}" hidden></label>${x.localKey ? `<button class="btn sm" data-action="downloadDoc" data-arg="${k}">Télécharger</button>` : ''}${k === 'translation' && st === 'à fournir' ? `<a class="btn sm" href="#services">Faire traduire</a>` : ''}${k === 'reco' && st === 'à fournir' ? `<span class="small muted">Ton entraîneur peut la publier depuis son espace</span>` : ''}</div></div>`; }).join('')}</div></section>
  <div class="grid g2" style="margin-top:16px"><section class="card"><h3>Vérification d’identité</h3><p class="small" style="margin:0">${p.verified.identity ? 'Ton identité est vérifiée : le badge apparaît sur ton profil et rassure les recruteurs.' : 'Ajoute ton passeport : l’équipe vérifie la correspondance avec ton profil et ajoute le badge « Identité vérifiée ».'}</p>${p.verified.identity ? '<span class="pill ok" style="margin-top:10px">Identité vérifiée</span>' : (d.passport && d.passport.status === 'fourni' ? '<button class="btn sm" style="margin-top:10px" data-action="verifyId">Simuler la vérification (équipe)</button>' : '')}</section>
  <section class="card"><h3>Partage du dossier</h3>${F('player.docsShared','Partager le dossier avec les programmes qui m’ont demandé un contact','check')}<p class="small muted" style="margin:8px 0 0">Les pièces ne sont jamais visibles dans la recherche publique.</p></section></div>`;
}

/* ---------- Abonnements ---------- */
function plansHTML(role) {
  const keys = Object.keys(PLANS).filter(k => PLANS[k].role === role);
  return `<div class="grid g${keys.length}">${keys.map(k => { const pl = PLANS[k], cur = state.plans[role] === k; return `<div class="card plan${cur ? ' current' : ''}"><div class="sec-h"><h3>${esc(pl.name)}</h3>${cur ? '<span class="pill acc">Offre actuelle</span>' : ''}</div><div class="price">${pl.price ? money2(pl.price, pl.cur) : 'Gratuit'}${pl.per ? `<span> / ${esc(pl.per)}</span>` : ''}</div>${pl.note ? `<div class="small muted">${esc(pl.note)}</div>` : ''}<ul class="feat">${pl.f.map(x => `<li>${esc(x)}</li>`).join('')}</ul>${cur ? '' : `<button class="btn ${pl.price ? 'primary' : ''}" data-action="choosePlan" data-arg="${k}">${pl.price ? 'Passer à ' + esc(pl.name) : 'Revenir à ' + esc(pl.name)}</button>`}</div>`; }).join('')}</div>`;
}
function billingHTML(filter) {
  const b = state.billing.filter(filter || (() => true));
  return `<section class="card" style="margin-top:16px"><h3>Historique de facturation (démo)</h3>${b.length ? `<div class="list">${b.map(x => `<div class="row"><span class="grow">${esc(x.label)}</span><span class="num">${money2(x.amount, x.cur)}</span><span class="small muted">${fdate(x.date)}</span></div>`).join('')}</div>` : '<div class="empty">Aucun paiement.</div>'}</section>`;
}
function vAbonnement() {
  const u = usage(), lim = plan('joueur').lim;
  return head('Abonnement', `Analyses ce mois : <b class="num">${u.analyses} / ${lim.analyses}</b> · Vidéos du profil : <b class="num">${state.player.videos.length} / ${lim.videos}</b>`) + plansHTML('joueur') + `
  <h2 style="margin:28px 0 6px">Accompagnement humain</h2><p class="muted" style="margin:0 0 14px">Forfait unique, même prix pour tous, sans commission sur la bourse ou le contrat obtenu.</p>
  <div class="grid g3">${ACC.map(a => { const owned = state.billing.some(b => b.label === 'Accompagnement ' + a.name); return `<div class="card plan${owned ? ' current' : ''}"><h3>${esc(a.name)}</h3><div class="price">${money2(a.price)}<span> une fois</span></div><ul class="feat">${a.f.map(x => `<li>${esc(x)}</li>`).join('')}</ul>${owned ? '<span class="pill acc">Souscrit</span>' : `<button class="btn" data-action="buyAcc" data-arg="${a.k}">Choisir ${esc(a.name)}</button>`}</div>`; }).join('')}</div>
  <div class="callout small" style="margin-top:16px">Règle NCAA (Bylaw 12.3.3) : un service peut diffuser ton profil aux universités si sa rémunération ne dépend pas de l’aide obtenue. D’où des prix fixes, identiques pour tous, et aucune remise liée au niveau sportif.</div>` + billingHTML(b => !/Recruteur|Licence|Club/.test(b.label));
}
function vRecAbonnement() {
  const u = usage(), lim = plan('recruteur').lim;
  return head('Abonnement recruteur', `Ce mois : <b class="num">${u.recProfiles.length} / ${lim.profiles === Infinity ? '∞' : lim.profiles}</b> profils complets consultés · <b class="num">${u.recContacts} / ${lim.contacts === Infinity ? '∞' : lim.contacts}</b> demandes de contact`) + plansHTML('recruteur') + `<div class="callout small" style="margin-top:16px">Même tarif public pour tous les programmes, sans exclusivité. Les règles NCAA encadrent les services de recrutement vendus aux universités (prix et accès identiques pour tous notamment) : conditions exactes à vérifier avant le lancement.</div>` + billingHTML(b => /Recruteur/.test(b.label));
}
function vClub() {
  const r = roster(), pro = r.filter(p => p.id === 'me' ? state.plans.joueur === 'joueur-pro' : p.demoPro).length;
  const share = pro * 9.9 * 0.2, lic = state.plans.entraineur === 'club-licence', u = usage();
  return head('Licence club', `${esc(state.coach.club)} · ${r.length} joueurs · analyses d’équipe ce mois : <b class="num">${u.teamAnalyses} / ${plan('entraineur').lim.teamAnalyses >= 999 ? '∞' : plan('entraineur').lim.teamAnalyses}</b>`) + plansHTML('entraineur') + `
  <div class="grid g3" style="margin-top:16px"><div class="card kpi"><span class="v">${pro}</span><span class="l">Joueurs Pro dans l’effectif</span></div><div class="card kpi"><span class="v">${lic ? '—' : money2(share)}</span><span class="l">${lic ? 'Pro inclus par la licence' : 'Reversé au club chaque mois (20 %)'}</span></div><div class="card kpi"><span class="v">${esc(state.coach.inviteCode)}</span><span class="l">Code d’invitation</span></div></div>
  <div class="callout small" style="margin-top:16px">Deux portes d’entrée : le club partenaire ne paie rien et touche une part des abonnements de ses joueurs ; la licence fait payer le club et offre le Pro aux joueurs. Le reversement au club doit être transparent pour les familles.</div>` + billingHTML(b => /Licence|Club/.test(b.label));
}

/* ---------- Recherches enregistrées ---------- */
function filterProspects(f, pr) {
  let list = allPlayers().map(p => ({p, r:matchScore(p, pr)}));
  if (f.gender !== 'all') list = list.filter(x => x.p.gender === f.gender);
  if (f.pos !== 'all') list = list.filter(x => x.p.position === f.pos || x.p.position2 === f.pos);
  if (n0(f.level)) list = list.filter(x => (levelOf(x.p.level) || [0, 0, 0])[2] >= n0(f.level));
  if (n0(f.minH)) list = list.filter(x => n0(x.p.height) >= n0(f.minH));
  if (f.foot !== 'all') list = list.filter(x => x.p.foot === f.foot);
  if (f.eng) list = list.filter(x => x.p.academic.englishTest && x.p.academic.englishTest !== 'Aucun');
  if (f.video) list = list.filter(x => clipCount(x.p) > 0 || (x.p.videos || []).some(v => v.visible));
  if (f.budget) list = list.filter(x => n0(x.p.project.budgetMax) >= Math.max(0, n0(pr.costAnnual) - n0(pr.avgAid)) * rate(pr.currency));
  if (f.verified) list = list.filter(x => x.p.verified && x.p.verified.identity);
  if (f.q) { const q = f.q.toLowerCase(); list = list.filter(x => (x.p.firstName + ' ' + x.p.lastName + ' ' + x.p.club + ' ' + x.p.city + ' ' + x.p.country).toLowerCase().includes(q)); }
  return list.sort((a, b) => b.r.score - a.r.score);
}
function vRecherches() {
  const pr = myProgram(), pro = plan('recruteur').lim.saved;
  return head('Recherches enregistrées', 'Une recherche enregistrée te prévient quand un nouveau profil y correspond.', pro ? '' : `<button class="btn primary" data-action="goPlans" data-arg="recruteur">Débloquer les alertes</button>`) + `<section class="card">${state.savedSearches.length ? `<div class="list">${state.savedSearches.map((s, i) => { const ids = filterProspects(s.filters, pr).map(x => x.p.id); const nw = ids.filter(id => !s.seen.includes(id)).length; return `<div class="row"><div class="grow"><div class="t">${esc(s.name)}</div><div class="small muted">${ids.length} profil${ids.length > 1 ? 's' : ''} · créée le ${fdate(s.created)}</div></div>${nw ? `<span class="pill info">${nw} nouveau${nw > 1 ? 'x' : ''}</span>` : ''}<label class="check small"><input type="checkbox" id="${fid('savedSearches.' + i + '.alert')}" data-bind="savedSearches.${i}.alert"${s.alert ? ' checked' : ''}${pro ? '' : ' disabled'}>Alerte e-mail</label><button class="btn sm primary" data-action="runSearch" data-arg="${s.id}">Voir</button><button class="btn sm icon danger" data-action="delSearch" data-arg="${s.id}" aria-label="Supprimer">✕</button></div>`; }).join('')}</div>` : '<div class="empty">Enregistre une recherche depuis Prospects.</div>'}</section>`;
}

/* ---------- Détections ---------- */
function vEvenements() {
  const r = state.role, pr = myProgram(), pro = plan('joueur').lim.audience;
  return head('Détections et stages', 'Journées de détection avec tests certifiés et matchs filmés, stages encadrés avec des académies partenaires. Événements d’exemple.') + `<div class="stack">${state.events.map(ev => {
    const full = ev.registered >= ev.capacity, recs = ev.recruiters.map(findProgram).filter(Boolean), d = new Date(ev.date + 'T12:00:00');
    let act = '';
    if (r === 'joueur') act = ev.me ? `<span class="pill ok">Inscrit</span>${ev.results ? '<span class="pill acc">Résultats publiés</span>' : `<button class="btn sm" data-action="evResults" data-arg="${ev.id}">Simuler la fin de l’événement</button>`}` : `<button class="btn primary sm" data-action="evRegister" data-arg="${ev.id}"${full ? ' disabled' : ''}>S’inscrire · ${money2(pro ? ev.proPrice : ev.price)}</button>`;
    else if (r === 'recruteur') act = ev.recruiters.includes(pr.id) ? `<span class="pill ok">Tu participes</span><button class="btn sm" data-action="evPlayers" data-arg="${ev.id}">Voir les inscrits</button>` : `<button class="btn primary sm" data-action="evAttend" data-arg="${ev.id}">Participer (gratuit)</button>`;
    else if (r === 'entraineur') act = `<button class="btn sm" data-action="evTeam" data-arg="${ev.id}">Inviter l’effectif</button>`;
    else act = `<span class="pill">${money(ev.registered * ev.price)} de billetterie</span>`;
    return `<article class="card ev"><div class="evdate">${esc(d.toLocaleDateString('fr-FR', {month:'short'}))}<b>${d.getDate()}</b>${d.getFullYear()}</div><div style="min-width:0"><h3 style="margin:0">${esc(ev.name)} <span class="pill">${esc(ev.kind || 'Détection')}</span> <span class="pill">Exemple</span></h3><div class="prog-meta" style="margin:4px 0 8px"><span>${esc(ev.city)}</span><span>${esc(ev.gender)}</span><span>${esc(ev.ages)}</span><span>${ev.registered} / ${ev.capacity} inscrits</span></div><div class="bar" style="max-width:260px;margin-bottom:10px"><i style="width:${Math.min(100, ev.registered / ev.capacity * 100)}%"></i></div><ul class="feat">${ev.includes.map(x => `<li>${esc(x)}</li>`).join('')}</ul><div class="small muted" style="margin-top:8px">Recruteurs annoncés : ${recs.map(x => esc(x.name)).join(', ') || 'à venir'}</div></div><div class="actions" style="flex-direction:column;align-items:stretch">${act}<span class="small muted">${money2(ev.price)} · ${money2(ev.proPrice)} avec Pro</span></div></article>`;
  }).join('')}</div><p class="small muted">Les entraîneurs universitaires présents restent soumis au calendrier d’évaluation de leur division.</p>`;
}

/* ---------- Services ---------- */
function vServices() {
  const cats = [...new Set(state.providers.map(s => s.cat))];
  const orders = state.orders;
  return head('Services', 'Ce qui manque souvent : une vidéo exploitable, des tests fiables, des bulletins traduits, un niveau d’anglais. Prestataires et prix fictifs.', `<button class="btn" data-action="becomeProvider">Devenir prestataire</button>`) +
  (orders.length ? `<section class="card" style="margin-bottom:16px"><h3>Mes commandes</h3><div class="tablewrap"><table><thead><tr><th>Service</th><th>Prestataire</th><th>Date</th><th>Montant</th><th>Statut</th><th></th></tr></thead><tbody>${orders.map(o => { const s = state.providers.find(x => x.id === o.providerId) || {}; return `<tr><td>${esc(s.cat || '')}</td><td>${esc(s.name || '')}</td><td>${fdate(o.date)}</td><td class="num">${money2(o.amount)}</td><td><span class="pill ${o.status === 'Livrée' ? 'ok' : 'info'}">${esc(o.status)}</span></td><td>${o.status !== 'Livrée' ? `<button class="btn sm" data-action="orderNext" data-arg="${o.id}">Étape suivante (démo)</button>` : ''}</td></tr>`; }).join('')}</tbody></table></div><p class="tiny muted" style="margin:8px 0 0">Commission de la plateforme : ${state.take} % prélevés au prestataire, rien de plus pour toi.</p></section>` : '') +
  cats.map(c => `<h2 style="margin:18px 0 10px">${esc(c)}</h2><div class="grid g3">${state.providers.filter(s => s.cat === c).map(s => `<article class="card" style="display:flex;flex-direction:column;gap:8px"><div class="sec-h"><b>${esc(s.name)}</b>${s.status === 'en validation' ? '<span class="pill warn">En validation</span>' : '<span class="pill">Exemple</span>'}</div><div class="small muted">${esc(s.zone)} · ${esc(s.delay)}</div><p class="small" style="margin:0">${esc(s.desc)}</p><div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;gap:8px"><span><b>${money2(s.price)}</b> <span class="small muted">/ ${esc(s.unit)}</span></span><button class="btn sm primary" data-action="book" data-arg="${s.id}"${s.status === 'en validation' ? ' disabled' : ''}>Réserver</button></div></article>`).join('')}</div>`).join('');
}

/* ---------- Modèle économique ---------- */
function bizCalc(b) {
  const fees = n0(b.payFees) / 100;
  const L = [];
  const proRev = n0(b.players) * n0(b.proConv) / 100 * n0(b.proPrice) * 12;
  L.push({k:'Abonnements joueurs Pro', rev:proRev, cost:proRev * fees + proRev * n0(b.partnerShareOfPro) / 100 * n0(b.partnerShare) / 100, why:'Récurrent, volume ; dépend de la valeur de l’audience et de l’analyse'});
  const accRev = n0(b.accSales) * n0(b.accPrice);
  L.push({k:'Accompagnement (forfaits)', rev:accRev, cost:accRev * (n0(b.accCostPct) / 100 + fees), why:'Cash immédiat et marge humaine ; ne passe pas à l’échelle sans équipe'});
  const clubRev = n0(b.clubs) * n0(b.teamsPerClub) * n0(b.teamPrice);
  L.push({k:'Licences club', rev:clubRev, cost:clubRev * fees, why:'Acquisition par équipe entière : un match importé crée 20 à 30 comptes'});
  const recRev = n0(b.recruiters) * n0(b.recPrice) * n0(state.settings.rateUsd) * 12;
  L.push({k:'Recruteurs Pro', rev:recRev, cost:recRev * fees, why:'Côté demande ; prix public unique, à valider avec les règles NCAA'});
  const evRev = n0(b.events) * n0(b.eventPlayers) * n0(b.eventPrice);
  L.push({k:'Journées de détection', rev:evRev, cost:n0(b.events) * n0(b.eventCost) + evRev * fees, why:'Revenu, données certifiées et contenu ; logistique lourde'});
  const mkRev = n0(b.gmv) * n0(b.take) / 100;
  L.push({k:'Commission services', rev:mkRev, cost:0, why:'Résout le manque de vidéo et de tests sans les produire soi-même'});
  const gpu = n0(b.matches) * n0(b.gpuCost);
  const rev = L.reduce((s, x) => s + x.rev, 0), direct = L.reduce((s, x) => s + x.cost, 0) + gpu;
  return {L, rev, direct, gpu, gross:rev - direct, result:rev - direct - n0(b.fixed)};
}
function bizOutHTML() {
  const c = bizCalc(state.biz), max = Math.max(1, ...c.L.map(x => x.rev));
  const H = 34 * c.L.length + 20;
  const bars = `<svg viewBox="0 0 900 ${H}" class="bizchart" role="img" aria-label="Chiffre d’affaires annuel par ligne de revenus">${c.L.map((x, i) => { const w = Math.max(2, x.rev / max * 520); const y = 10 + i * 34; return `<text x="220" y="${y + 17}" text-anchor="end" class="bl">${esc(x.k)}</text><rect x="232" y="${y + 4}" width="${w.toFixed(1)}" height="18" rx="5" class="bb"/><text x="${(240 + w).toFixed(1)}" y="${y + 17}" class="bv">${esc(money(x.rev))}</text>`; }).join('')}</svg>`;
  return `<div class="grid g4"><div class="card kpi"><span class="v">${money(c.rev)}</span><span class="l">Chiffre d’affaires annuel</span></div><div class="card kpi"><span class="v">${money(c.rev / 12)}</span><span class="l">Moyenne mensuelle</span></div><div class="card kpi"><span class="v">${c.rev ? Math.round(c.gross / c.rev * 100) : 0} %</span><span class="l">Marge brute</span></div><div class="card kpi"><span class="v" style="color:${c.result >= 0 ? 'var(--ok)' : 'var(--bad)'}">${money(c.result)}</span><span class="l">Résultat après coûts fixes</span></div></div>
  <section class="card" style="margin-top:16px"><h3>Chiffre d’affaires par ligne</h3>${bars}</section>
  <section class="card" style="margin-top:16px"><div class="tablewrap"><table><thead><tr><th>Ligne</th><th>CA annuel</th><th>Coûts directs</th><th>Marge</th><th>Part du CA</th><th>Rôle dans le modèle</th></tr></thead><tbody>${c.L.map(x => `<tr><td><b>${esc(x.k)}</b></td><td class="num">${money(x.rev)}</td><td class="num">${money(x.cost)}</td><td class="num">${money(x.rev - x.cost)}</td><td class="num">${c.rev ? Math.round(x.rev / c.rev * 100) : 0} %</td><td class="small">${esc(x.why)}</td></tr>`).join('')}<tr><td>Calcul vidéo (GPU)</td><td></td><td class="num">${money(c.gpu)}</td><td></td><td></td><td class="small">Coût par match à mesurer sur de vrais fichiers</td></tr><tr><td><b>Total</b></td><td class="num"><b>${money(c.rev)}</b></td><td class="num"><b>${money(c.direct)}</b></td><td class="num"><b>${money(c.gross)}</b></td><td></td><td></td></tr></tbody></table></div></section>`;
}
function vBusiness() {
  const B = 'biz.', n = (k, l, u, step) => F(B + k, l, 'number', {unit:u, step:step || 'any'});
  return head('Modèle économique', 'Simulateur sur 12 mois. Toutes les valeurs sont des hypothèses à remplacer par des mesures réelles.') + `
  <div id="bizOut" data-live="biz">${bizOutHTML()}</div>
  <section class="card" style="margin-top:16px"><div class="sec"><h3>Joueurs</h3><div class="form">${n('players','Joueurs actifs')}${n('proConv','Conversion vers Pro','%')}${n('proPrice','Revenu mensuel moyen par Pro','€')}${n('partnerShareOfPro','Pro venant de clubs partenaires','%')}${n('partnerShare','Part reversée au club','%')}</div></div>
  <div class="sec"><h3>Accompagnement</h3><div class="form">${n('accSales','Forfaits vendus par an')}${n('accPrice','Panier moyen','€')}${n('accCostPct','Coût direct (temps humain, montage)','%')}</div></div>
  <div class="sec"><h3>Clubs et recruteurs</h3><div class="form">${n('clubs','Clubs sous licence')}${n('teamsPerClub','Équipes par club')}${n('teamPrice','Prix par équipe et saison','€')}${n('recruiters','Programmes Recruteur Pro')}${n('recPrice','Prix mensuel Recruteur Pro','$')}</div></div>
  <div class="sec"><h3>Détections et services</h3><div class="form">${n('events','Journées par an')}${n('eventPlayers','Joueurs par journée')}${n('eventPrice','Billet moyen','€')}${n('eventCost','Coût d’une journée (terrain, staff, captation)','€')}${n('gmv','Volume de services réservés par an','€')}${n('take','Commission','%')}</div></div>
  <div class="sec"><h3>Coûts</h3><div class="form">${n('matches','Matchs analysés par an')}${n('gpuCost','Coût de calcul par match','€')}${n('payFees','Frais de paiement','%')}${n('fixed','Coûts fixes annuels (outils, hébergement, assurance, marketing)','€')}</div></div></section>
  <section class="card" style="margin-top:16px"><h3>Autres modèles possibles, non chiffrés ici</h3><div class="list">
    <div class="row"><div class="grow"><div class="t">Partenariats fédérations et districts</div><div class="small muted">Licence groupée pour des centaines de clubs, sur le modèle FFF × Rematch. Cycle de vente long, effet de masse.</div></div></div>
    <div class="row"><div class="grow"><div class="t">Données agrégées et anonymisées</div><div class="small muted">Indicateurs de niveau amateur pour clubs et académies. Exige le consentement explicite, et une base suffisante.</div></div></div>
    <div class="row"><div class="grow"><div class="t">Sponsoring et équipementiers</div><div class="small muted">Dotations liées à l’audience des vidéos, comme Nike avec Rematch. Utile une fois l’audience prouvée.</div></div></div>
    <div class="row"><div class="grow"><div class="t">Académies payant au prospect qualifié</div><div class="small muted">Rentable, mais crée un conflit d’intérêts : à afficher comme « sponsorisé » ou à refuser.</div></div></div>
    <div class="row"><div class="grow"><div class="t">Commission sur transfert ou bourse</div><div class="small muted">Écarté : interdit pour les bourses NCAA, et réservé aux agents licenciés pour les contrats.</div></div></div>
  </div></section>`;
}

