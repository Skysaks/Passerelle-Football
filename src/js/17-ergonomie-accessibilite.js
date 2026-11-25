/* ========== UX, lisibilité, accessibilité ========== */
const ICONS = {
  home:'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z', user:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  video:'M4 6h11a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM16 10l5-3v10l-5-3', compass:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z',
  kanban:'M4 4h4v16H4zM10 4h4v10h-4zM16 4h4v7h-4z', mail:'M3 6h18v12H3zM3 7l9 6 9-6', chart:'M4 20V10M10 20V4M16 20v-7M2 20h20',
  folder:'M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z', check:'M9 12l2 2 4-4M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  euro:'M17 7a6 6 0 1 0 0 10M4 10h9M4 14h9', globe:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  gift:'M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-2-4-6-3-5-1s5 1 5 1c0 0 4 1 5-1s-3-3-5 1', users:'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 11a3 3 0 1 0 0-6M22 21a6 6 0 0 0-5-6',
  book:'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5', card:'M3 6h18v12H3zM3 10h18', shield:'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  search:'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5', calendar:'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4', tool:'M14.5 6.5l3-3a4 4 0 0 1-5 5L5 16a2 2 0 1 0 3 3l7.5-7.5a4 4 0 0 1 5-5l-3 3-3-.5z',
  building:'M4 21V4h10v17M14 9h6v12M8 8h2M8 12h2M8 16h2M2 21h20', settings:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4',
  bell:'M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 21a2 2 0 0 0 4 0', more:'M4 6h16M4 12h16M4 18h16', star:'M12 3l2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.3 9.4l6-.9z',
  handshake:'M3 12l4-4 5 3 5-3 4 4-9 7zM8 15l2 2M11 13l3 3', id:'M3 5h18v14H3zM8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5 16a3 3 0 0 1 6 0M14 9h5M14 13h4', plus:'M12 5v14M5 12h14', arrow:'M5 12h14M13 6l6 6-6 6', bolt:'M13 2L4 14h7l-1 8 9-12h-7z'
};
function icon(k, size) { return `<svg class="ic" width="${size || 18}" height="${size || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${ICONS[k] || ICONS.more}"/></svg>`; }
const NAV_GROUPS = {
  joueur:[['', [['accueil','Accueil','home'],['profil','Mon profil','user'],['videos','Vidéos','video']]],
    ['Recrutement', [['debouches','Débouchés','compass'],['suivi','Mes candidatures','kanban'],['messages','Messages','mail'],['offres','Offres reçues','euro'],['audience','Audience','chart']]],
    ['Préparer le départ', [['dossier','Dossier','folder'],['eligibilite','Éligibilité','check'],['formation','Académie','book'],['avantages','Avantages','gift']]],
    ['Partager', [['partage','Profil public','globe'],['parrainage','Parrainage','users']]],
    ['Compte', [['abonnement','Abonnement','card']]]],
  entraineur:[['', [['coach-accueil','Accueil','home'],['coach-profil','Mon profil','user'],['coach-effectif','Effectif','users'],['coach-matchs','Matchs d’équipe','video'],['club','Licence club','card']]]],
  recruteur:[['', [['recruteur-accueil','Accueil','home'],['recruteur-programme','Mon programme','building'],['prospects','Prospects','search'],['recherches','Recherches enregistrées','star'],['shortlist','Shortlist','kanban'],['recruteur-abonnement','Abonnement','card']]]],
  operateur:[['', [['op-accueil','Pilotage','chart'],['op-partenariats','Partenariats','handshake'],['op-validation','Validations','shield'],['op-ambassadeurs','Ambassadeurs','users']]]],
  commun:[['Ressources', [['annuaire','Universités et clubs','building'],['staffs','Entraîneurs','id'],['evenements','Détections et stages','calendar'],['services','Services','tool'],['organisations','Pour les organisations','handshake'],['business','Modèle économique','chart'],['donnees','Réglages et données','settings']]]]
};
Object.keys(NAV_GROUPS).forEach(r => { NAV[r] = NAV_GROUPS[r].flatMap(g => g[1].map(([k, l]) => [k, l])); });
const TABS = {joueur:['accueil','profil','videos','debouches'], entraineur:['coach-accueil','coach-effectif','coach-matchs','club'], recruteur:['recruteur-accueil','prospects','shortlist','recherches'], operateur:['op-accueil','op-partenariats','op-validation','business']};
const SHORT = {'coach-matchs':'Matchs','coach-accueil':'Accueil','recruteur-accueil':'Accueil','recherches':'Alertes','op-accueil':'Pilotage','op-partenariats':'Partenaires','op-validation':'Validations','business':'Modèle','club':'Licence'};
function routeInfo(k) { for (const r of Object.keys(NAV_GROUPS)) for (const [, items] of NAV_GROUPS[r]) for (const [kk, l, ic] of items) if (kk === k) return {k, l, ic, role:r}; return {k, l:k, ic:'more', role:''}; }
const IS_MAC = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');
let saveState = 'saved';
function saveLabel() { return saveState === 'pending' ? 'Enregistrement…' : state.savedAt ? 'Enregistré' : ''; }
function updateSaveStatus() { const el = $('#saveStatus'); if (el) { el.textContent = saveLabel(); el.classList.toggle('pending', saveState === 'pending'); } }
const saveV3 = save;
save = function () { saveV3(); saveState = 'saved'; updateSaveStatus(); };
saveSoon = function () { saveState = 'pending'; updateSaveStatus(); clearTimeout(saveTimer); saveTimer = setTimeout(save, 400); };

function navListHTML(route, role) {
  const groups = [...NAV_GROUPS[role], ...NAV_GROUPS.commun], n = unread(role);
  return groups.map(([g, items], gi) => `${g ? `<h2 class="lbl" id="ng-${gi}">${esc(g)}</h2>` : ''}<ul role="list"${g ? ` aria-labelledby="ng-${gi}"` : ''}>${items.map(([k, l, ic]) => `<li><a href="#${k}"${k === route ? ' aria-current="page"' : ''}>${icon(ic)}<span class="nl">${esc(l)}</span>${k === HOME[role] && n ? `<span class="badge" aria-label="${n} notifications non lues">${n}</span>` : ''}</a></li>`).join('')}</ul>`).join('');
}
function roleSegHTML() { return `<div class="rolebox"><span class="lbl" id="roleLbl">Voir en tant que</span><div class="seg" role="group" aria-labelledby="roleLbl">${Object.keys(ROLE_LABEL).map(r => `<button type="button" data-action="role" data-arg="${r}" aria-pressed="${state.role === r}">${ROLE_LABEL[r]}</button>`).join('')}</div></div>`; }
shell = function (content, route) {
  const role = state.role, n = unread(role);
  return `<button class="skip" data-action="skip">Aller au contenu</button>
  <div class="app"><aside class="side" aria-label="Navigation principale">
    <div class="brand"><div class="logo"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M3 17c4-8 14-8 18 0"/><path d="M7 17v-4M12 17v-6M17 17v-4"/></svg></div><b>Passerelle</b></div>
    ${roleSegHTML()}
    <nav class="nav" aria-label="Pages">${navListHTML(route, role)}</nav>
    <p class="demo-note">Prototype : universités, clubs, entraîneurs et joueurs d’exemple sont fictifs. Tes saisies restent dans ce navigateur.</p>
  </aside>
  <div class="mainwrap"><header class="topbar">
    <div class="tb-brand"><div class="logo"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M3 17c4-8 14-8 18 0"/><path d="M7 17v-4M12 17v-6M17 17v-4"/></svg></div><b>Passerelle</b><span class="pill">${ROLE_LABEL[role]}</span></div>
    <button type="button" class="search-btn" data-action="palette" aria-label="Rechercher ou aller à une page" aria-keyshortcuts="${IS_MAC ? 'Meta+K' : 'Control+K'}">${icon('search')}<span>Rechercher ou aller à…</span><kbd>${IS_MAC ? '⌘K' : 'Ctrl K'}</kbd></button>
    <span class="savest" id="saveStatus">${saveLabel()}</span>
    <button type="button" class="iconbtn" data-action="notifs" aria-label="Notifications${n ? ', ' + n + ' non lues' : ''}">${icon('bell', 20)}${n ? `<span class="badge" aria-hidden="true">${n}</span>` : ''}</button>
  </header>
  <main class="main" id="main" tabindex="-1">${content}</main></div></div>
  <nav class="tabbar" aria-label="Navigation rapide">${TABS[role].map(k => { const i = routeInfo(k); return `<a href="#${k}"${k === route ? ' aria-current="page"' : ''}>${icon(i.ic, 22)}<span>${esc(SHORT[k] || i.l)}</span>${k === HOME[role] && n ? '<span class="dotbadge" aria-hidden="true"></span>' : ''}</a>`; }).join('')}<button type="button" data-action="moreMenu" aria-label="Toutes les pages">${icon('more', 22)}<span>Plus</span></button></nav>`;
};

/* ---------- Fenêtres accessibles ---------- */
let modalReturn = null;
openModal = function (title, body, wide) {
  const m = $('#modal'); m.removeAttribute('role'); m.removeAttribute('aria-modal');
  if (m.hidden) { const a = document.activeElement; modalReturn = a && a !== document.body ? (a.id ? {id:a.id} : a.dataset && a.dataset.action ? {action:a.dataset.action, arg:a.dataset.arg} : null) : null; }
  m.innerHTML = `<div class="sheet${wide ? ' wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><div class="sheet-h"><h2 id="modalTitle">${esc(title)}</h2><button type="button" class="btn sm icon" data-action="closeModal" aria-label="Fermer la fenêtre">✕</button></div><div class="sheet-b">${body}</div></div>`;
  m.hidden = false; document.body.classList.add('modal-open');
  const f = m.querySelector('.sheet-b input:not([type=hidden]):not([disabled]),.sheet-b select,.sheet-b textarea,.sheet-b button:not([disabled]),.sheet-b a[href]') || m.querySelector('[data-action="closeModal"]');
  if (f) {
    const sh = m.querySelector('.sheet'), fr = f.getBoundingClientRect(), sr = sh.getBoundingClientRect();
    // Fenêtre longue : si le premier élément actif est hors de vue, on garde le haut visible et le focus sur « Fermer ».
    if (fr.bottom > sr.bottom - 4) { sh.scrollTop = 0; (m.querySelector('[data-action="closeModal"]') || f).focus({preventScroll:true}); } else f.focus();
  }
  hydrateMedia();
};
function restoreFocus() {
  if (!modalReturn) return; let el = null;
  if (modalReturn.id) el = document.getElementById(modalReturn.id);
  else if (modalReturn.action) el = document.querySelector(`[data-action="${modalReturn.action}"]${modalReturn.arg != null ? `[data-arg="${CSS.escape(modalReturn.arg)}"]` : ''}`);
  if (el) el.focus({preventScroll:true}); modalReturn = null;
}
closeModal = function () { const m = $('#modal'); m.hidden = true; m.innerHTML = ''; document.body.classList.remove('modal-open'); render(); restoreFocus(); };
function confirmModal(title, text, okLabel, fn) { ui.confirmFn = fn; openModal(title, `<p style="margin:0">${esc(text)}</p><div class="actions"><button type="button" class="btn" data-action="closeModal">Annuler</button><button type="button" class="btn danger-fill" data-action="confirmOk">${esc(okLabel)}</button></div>`); }
document.addEventListener('keydown', e => {
  const m = $('#modal'); if (m.hidden || e.key !== 'Tab') return;
  const f = [...m.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),video[controls],[tabindex]:not([tabindex="-1"])')].filter(x => x.offsetParent !== null || x === document.activeElement);
  if (!f.length) return; const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
window.addEventListener('hashchange', () => { const m = $('#modal'); if (!m.hidden) { m.hidden = true; m.innerHTML = ''; document.body.classList.remove('modal-open'); modalReturn = null; } afterRender(); });

/* ---------- Toasts avec annulation ---------- */
let toastExpire = null;
toast = function (t, opt) {
  opt = opt || {}; const el = $('#toast');
  if (toastExpire) { const f = toastExpire; toastExpire = null; f(); }
  el.innerHTML = `<span>${esc(t)}</span>${opt.action ? `<button type="button" class="toast-btn" data-action="toastAction">${esc(opt.action.label)}</button>` : ''}`;
  ui.toastFn = opt.action ? opt.action.fn : null; toastExpire = opt.onExpire || null; el.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; ui.toastFn = null; if (toastExpire) { const f = toastExpire; toastExpire = null; f(); } }, opt.ms || (opt.action ? 7000 : 3500));
};
function undoable(label, onExpire) {
  const snap = JSON.stringify(state);
  return () => toast(label, {action:{label:'Annuler', fn:() => { toastExpire = null; state = JSON.parse(snap); save(); const m = $('#modal'); if (!m.hidden) { m.hidden = true; m.innerHTML = ''; document.body.classList.remove('modal-open'); } render(); toast('Action annulée.'); }}, onExpire});
}
function wrapUndo(name, label) { const orig = ACT[name]; ACT[name] = function (...a) { const done = undoable(typeof label === 'function' ? label(...a) : label); orig.apply(this, a); done(); }; }
[['delHistory','Saison retirée.'],['delMatch','Match supprimé.'],['delClip','Clip supprimé.'],['delMsg','Message supprimé.'],['delOffer','Offre retirée.'],['unfollow','Programme retiré du suivi.'],['slDel','Joueur retiré de la shortlist.'],['delSearch','Recherche supprimée.'],['delStaff','Personne retirée du staff.']].forEach(([n, l]) => wrapUndo(n, l));

/* ---------- Validation sous les champs ---------- */
function invalid(id, msg) {
  const el = document.getElementById(id); if (!el) { toast(msg); return false; }
  el.setAttribute('aria-invalid', 'true');
  let er = document.getElementById(id + '-err');
  if (!er) { er = document.createElement('p'); er.id = id + '-err'; er.className = 'field-err'; el.insertAdjacentElement('afterend', er); }
  er.textContent = msg; el.setAttribute('aria-describedby', er.id); el.focus(); return false;
}
document.addEventListener('input', e => { const el = e.target; if (el.dataset && el.dataset.num && el.value.trim() !== '' && isNaN(Number(el.value.trim().replace(/\s/g, '').replace(',', '.')))) return; if (el.getAttribute && el.getAttribute('aria-invalid') === 'true') { el.removeAttribute('aria-invalid'); const er = document.getElementById(el.id + '-err'); if (er) er.remove(); el.removeAttribute('aria-describedby'); } });
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function guard(name, check) { const orig = ACT[name]; ACT[name] = function (...a) { if (check(...a) === false) return; return orig.apply(this, a); }; }
guard('saveVideoLink', () => /^https?:\/\/\S+$/.test(($('#vl_url') || {}).value || '') || invalid('vl_url', 'Colle un lien complet, commençant par https://'));
guard('invite', () => (($('#inv_n') || {}).value || '').trim() ? (EMAIL.test((($('#inv_e') || {}).value || '').trim()) || invalid('inv_e', 'Indique une adresse e-mail valide, par exemple prenom@exemple.fr')) : invalid('inv_n', 'Indique le prénom de ton filleul.'));
guard('orgLead', () => (($('#org_n') || {}).value || '').trim() ? (EMAIL.test((($('#org_e') || {}).value || '').trim()) || invalid('org_e', 'Indique une adresse e-mail valide.')) : invalid('org_n', 'Indique le nom de l’organisation.'));
guard('createPlayer', () => (($('#np_f') || {}).value || '').trim() ? ((($('#np_l') || {}).value || '').trim() ? true : invalid('np_l', 'Indique le nom du joueur.')) : invalid('np_f', 'Indique le prénom du joueur.'));
guard('solSend', () => (($('#sol_m') || {}).value || '').trim() ? true : invalid('sol_m', 'Écris quelques lignes : elles aident à attribuer les places.'));
guard('becomeProviderOk', () => (($('#bp_n') || {}).value || '').trim() ? true : invalid('bp_n', 'Indique le nom de ton activité.'));
guard('saveEndorse', () => (($('#en_t') || {}).value || '').trim() ? true : invalid('en_t', 'Écris la recommandation avant de la publier.'));

/* ---------- Suppressions : annuler au lieu de cliquer deux fois ---------- */
Object.assign(ACT, {
  toastAction() { const f = ui.toastFn; ui.toastFn = null; $('#toast').hidden = true; if (f) f(); },
  confirmOk() { const f = ui.confirmFn; ui.confirmFn = null; const m = $('#modal'); m.hidden = true; m.innerHTML = ''; document.body.classList.remove('modal-open'); if (f) f(); },
  delProgram(id) { const pr = findProgram(id); if (!pr) return; const done = undoable(`« ${pr.name || 'Programme'} » supprimé.`); state.programs = state.programs.filter(p => p.id !== id); delete state.player.pipeline[id]; save(); const m = $('#modal'); m.hidden = true; m.innerHTML = ''; document.body.classList.remove('modal-open'); render(); done(); },
  partnerDel(i) { const x = state.partners[+i]; if (!x) return; const done = undoable(`« ${x.name} » retiré du pipeline.`); state.partners.splice(+i, 1); save(); render(); done(); },
  delVideo(id) {
    const p = state.player, v = p.videos.find(x => x.id === id); if (!v) return;
    const done = undoable(`Vidéo « ${v.title} » supprimée.`, async () => { if (findVideo(id)) return; if (v.localKey) { try { await IDB.del(v.localKey); } catch (e) {} } if (v.assetId && caps.assets) { try { await caps.assets.delete(v.assetId); } catch (e) {} } });
    p.videos = p.videos.filter(x => x.id !== id); if (v.featured && p.videos[0]) p.videos[0].featured = true; save(); render(); done();
  },
  reset() { confirmModal('Revenir aux données d’exemple ?', 'Toutes tes saisies (profil, programmes, messages, réglages) seront remplacées par les exemples. Pense à exporter tes données avant.', 'Remplacer mes données', () => { state = migrate(demoState()); save(); location.hash = 'accueil'; render(); toast('Données d’exemple restaurées.'); }); },
  skip() { const m = $('#main'); if (m) m.focus(); },
  moreMenu() { openModal('Toutes les pages', `${roleSegHTML()}<nav class="nav navsheet" aria-label="Toutes les pages">${navListHTML(currentRoute(), state.role)}</nav>`); },
  notifs() { const list = state.notifications.filter(n => n.to === state.role); openModal('Notifications', `${list.some(n => !n.read) ? '<div class="actions"><button type="button" class="btn sm" data-action="readAllPanel">Tout marquer comme lu</button></div>' : ''}<ul class="list" role="list">${list.map(n => `<li class="row"><span class="dot ${n.read ? 'read' : 'info'}" aria-hidden="true"></span><span class="grow">${n.read ? '' : '<span class="sr">Non lue : </span>'}${esc(n.text)}</span><span class="small muted">${fdate(n.date)}</span></li>`).join('') || '<li class="empty">Aucune notification.</li>'}</ul>`); },
  readAllPanel() { state.notifications.filter(n => n.to === state.role).forEach(n => n.read = true); save(); ACT.notifs(); render(); },
  palette() { openPalette(); },
  palGo(i) { runPalette(+i); },
  secJump(t) { const h = [...document.querySelectorAll('#main h3')].find(x => x.textContent.trim().startsWith(t)); if (h) { const card = h.closest('.card') || h; card.scrollIntoView({behavior:prefersReduced() ? 'auto' : 'smooth', block:'start'}); const f = card.querySelector('input,select,textarea'); if (f) setTimeout(() => f.focus({preventScroll:true}), prefersReduced() ? 0 : 350); } },
  nextField() { focusNextMissing(); },
  setTheme(v) { state.theme = v; applyPrefs(); save(); render(); },
  setSize(v) { state.textSize = v; applyPrefs(); save(); render(); }
});
function prefersReduced() { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }

/* ---------- Profil guidé ---------- */
const PROFILE_SECTIONS = [
  ['Vidéos du profil','Vidéos',[]],
  ['Identité','Identité',['firstName','lastName','gender','birthDate','nationality','city','email']],
  ['Football','Football',['position','foot','height','weight','club','level']],
  ['Statistiques de la saison','Stats',['stats.matches','stats.minutes','stats.goals','stats.assists']],
  ['Données physiques','Physique',['physical.sprint30','physical.vma']],
  ['Scolarité et anglais','Scolarité',['academic.diploma','academic.average','academic.englishTest']],
  ['Projet','Projet',['project.availableFrom','project.budgetMax']],
  ['Présentation','Présentation',['bio','strengths']],
  ['Confidentialité','Confidentialité',[]]
];
function sectionNavHTML() {
  const p = state.player;
  const secs = PROFILE_SECTIONS.map(([h, l, keys]) => ({h, l, miss:keys.filter(k => !has(get(k, p))).length + (l === 'Projet' && !p.project.goals.length ? 1 : 0)}));
  const total = secs.reduce((a, x) => a + x.miss, 0);
  return `<nav class="secnav" aria-label="Sections du profil">${secs.map(({h, l, miss}) => `<button type="button" class="chipnav" data-action="secJump" data-arg="${esc(h)}">${esc(l)}${miss ? `<span class="cnt" aria-label="${miss} à compléter">${miss}</span>` : '<span class="okmark" aria-label="complet">✓</span>'}</button>`).join('')}<button type="button" class="btn sm primary" data-action="nextField">${icon('arrow', 16)}Prochain champ à remplir</button>
  <div class="sec-compact"><label class="sr" for="secSel">Aller à une section du profil</label><select id="secSel" data-action-change="secSel"><option value="">Sections${total ? ` · ${total} à compléter` : ' · tout est rempli'}</option>${secs.map(({h, l, miss}) => `<option value="${esc(h)}">${esc(l)}${miss ? ` · ${miss} à compléter` : ' ✓'}</option>`).join('')}</select><button type="button" class="btn sm primary" data-action="nextField" aria-label="Prochain champ à remplir">${icon('arrow', 16)}Suivant</button></div></nav>`;
}
function focusNextMissing() {
  if (currentRoute() !== 'profil') { location.hash = 'profil'; setTimeout(focusNextMissing, 60); return; }
  const p = state.player;
  const k = PLAYER_REQ.find(x => !has(get(x, p))) || (!p.project.goals.length ? 'project.goals' : null);
  if (!k) { toast('Tous les champs essentiels sont remplis.'); return; }
  const el = document.getElementById(fid('player.' + k)) || document.getElementById(fid('player.' + k) + '_0');
  if (el) { el.scrollIntoView({block:'center', behavior:prefersReduced() ? 'auto' : 'smooth'}); setTimeout(() => el.focus({preventScroll:true}), prefersReduced() ? 0 : 300); }
}
function markMissing() {
  if (currentRoute() !== 'profil') return;
  PLAYER_REQ.forEach(k => { const el = document.getElementById(fid('player.' + k)); if (el) el.classList.toggle('is-missing', !has(get(k, state.player))); });
  const nav = document.querySelector('.secnav'); if (nav) { const fresh = document.createElement('div'); fresh.innerHTML = sectionNavHTML(); nav.replaceWith(fresh.firstElementChild); }
}
const vProfilV3 = VIEWS.profil;
VIEWS.profil = () => { const out = vProfilV3(); const i = out.indexOf('<div class="stack">'); return i < 0 ? out : out.slice(0, i) + sectionNavHTML() + out.slice(i); };

/* ---------- Palette de commandes ---------- */
function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
let palItems = [], palShown = [], palSel = 0;
function buildPalette() {
  const items = [];
  [['act:import','Importer un match','Action','video'],['act:addVideo','Ajouter une vidéo à mon profil','Action','plus'],['act:message','Écrire à un entraîneur','Action','mail'],['act:next','Compléter le prochain champ de mon profil','Action','arrow'],['act:notifs','Voir les notifications','Action','bell'],['act:theme','Changer de thème (auto, clair, sombre)','Affichage','settings'],['act:size','Texte plus grand ou normal','Affichage','settings']].forEach(([k, l, s, ic]) => items.push({k, l, s, ic}));
  ['joueur','entraineur','recruteur','operateur'].forEach(r => NAV_GROUPS[r].forEach(([g, its]) => its.forEach(([k, l, ic]) => items.push({k:'route:' + k, l, s:ROLE_LABEL[r] + (g ? ' · ' + g : ''), ic}))));
  NAV_GROUPS.commun[0][1].forEach(([k, l, ic]) => items.push({k:'route:' + k, l, s:'Ressources', ic}));
  state.programs.forEach(pr => items.push({k:'prog:' + pr.id, l:pr.name || 'Programme sans nom', s:`Programme · ${pr.org || ''} · ${pr.country || ''}`, ic:'building'}));
  allPlayers(true).forEach(p => items.push({k:'player:' + p.id, l:`${p.firstName} ${p.lastName}`, s:`Joueur · ${p.position || ''} · ${p.club || ''}`, ic:'user'}));
  return items;
}
function openPalette() {
  palItems = buildPalette(); palSel = 0;
  openModal('Rechercher ou aller à', `<div class="pal"><label for="palQ" class="sr">Rechercher une page, une action, un programme ou un joueur</label><input type="search" id="palQ" class="pal-input" role="combobox" aria-expanded="true" aria-controls="palList" aria-autocomplete="list" autocomplete="off" placeholder="Page, action, programme, joueur…"><ul id="palList" class="pal-list" role="listbox" aria-label="Résultats"></ul><p class="tiny muted" style="margin:0">↑ ↓ pour choisir · Entrée pour ouvrir · Échap pour fermer</p></div>`);
  updatePalette();
}
function updatePalette() {
  const q = norm(($('#palQ') || {}).value || '').trim(), words = q.split(/\s+/).filter(Boolean);
  palShown = (words.length ? palItems.filter(it => { const t = norm(it.l + ' ' + it.s); return words.every(w => t.includes(w)); }) : palItems.filter(it => it.k.startsWith('act:') || it.k.startsWith('route:') && routeInfo(it.k.slice(6)).role === state.role)).slice(0, 40);
  palSel = Math.min(palSel, Math.max(0, palShown.length - 1));
  const ul = $('#palList'); if (!ul) return;
  ul.innerHTML = palShown.map((it, i) => `<li id="pal-${i}" role="option" aria-selected="${i === palSel}" class="pal-item" data-action="palGo" data-arg="${i}">${icon(it.ic)}<span class="pal-t">${esc(it.l)}</span><span class="pal-s">${esc(it.s)}</span></li>`).join('') || '<li class="pal-empty" role="option" aria-disabled="true">Aucun résultat</li>';
  const inp = $('#palQ'); if (inp) inp.setAttribute('aria-activedescendant', palShown.length ? 'pal-' + palSel : '');
  const cur = document.getElementById('pal-' + palSel); if (cur) cur.scrollIntoView({block:'nearest'});
}
function runPalette(i) {
  const it = palShown[i]; if (!it) return;
  const m = $('#modal'); m.hidden = true; m.innerHTML = ''; document.body.classList.remove('modal-open'); modalReturn = null;
  const [type, val] = [it.k.slice(0, it.k.indexOf(':')), it.k.slice(it.k.indexOf(':') + 1)];
  if (type === 'route') { if (location.hash.slice(1) === val) render(); else location.hash = val; return; }
  if (type === 'prog') { render(); ACT.viewProgram(val); return; }
  if (type === 'player') { render(); ACT.openProspect(val); return; }
  if (val === 'import') { if (state.role === 'entraineur') { location.hash = 'coach-matchs'; setTimeout(() => ACT.addMatch('team'), 60); } else { location.hash = 'videos'; setTimeout(() => ACT.addMatch('player'), 60); } return; }
  if (val === 'addVideo') { state.role = 'joueur'; location.hash = 'profil'; render(); const f = document.querySelector('input[data-upload=video]'); if (f) f.click(); return; }
  if (val === 'message') { render(); ACT.compose(''); return; }
  if (val === 'next') { state.role = 'joueur'; focusNextMissing(); return; }
  if (val === 'notifs') { render(); ACT.notifs(); return; }
  if (val === 'theme') { const order = ['auto','light','dark']; state.theme = order[(order.indexOf(state.theme || 'auto') + 1) % 3]; applyPrefs(); save(); render(); toast('Thème : ' + {auto:'automatique', light:'clair', dark:'sombre'}[state.theme] + '.'); return; }
  if (val === 'size') { state.textSize = state.textSize === 'lg' ? 'md' : 'lg'; applyPrefs(); save(); render(); toast(state.textSize === 'lg' ? 'Texte agrandi.' : 'Texte normal.'); }
}
document.addEventListener('input', e => { if (e.target.id === 'palQ') { palSel = 0; updatePalette(); } });
document.addEventListener('keydown', e => {
  const k = e.key, t = e.target, typing = /input|textarea|select/i.test(t.tagName || '') || t.isContentEditable;
  if ((e.metaKey || e.ctrlKey) && k.toLowerCase() === 'k') { e.preventDefault(); openPalette(); return; }
  if (k === '/' && !typing && $('#modal').hidden) { e.preventDefault(); openPalette(); return; }
  if (t.id === 'palQ') {
    if (k === 'ArrowDown') { e.preventDefault(); palSel = Math.min(palShown.length - 1, palSel + 1); updatePalette(); }
    else if (k === 'ArrowUp') { e.preventDefault(); palSel = Math.max(0, palSel - 1); updatePalette(); }
    else if (k === 'Enter') { e.preventDefault(); runPalette(palSel); }
  }
}, true);

/* ---------- Affichage : thème et taille du texte ---------- */
let themeByUs = false;
function applyPrefs() {
  const r = document.documentElement, t = state.theme || 'auto';
  if (t === 'light' || t === 'dark') { r.setAttribute('data-theme', t); themeByUs = true; } else if (themeByUs) { r.removeAttribute('data-theme'); themeByUs = false; }
  r.setAttribute('data-size', ['lg', 'xl'].includes(state.textSize) ? state.textSize : 'md');
}
function displayPrefsHTML() {
  const t = state.theme || 'auto', s = state.textSize || 'md';
  return `<section class="card" style="margin-bottom:16px"><h3>Affichage</h3><div class="prefs"><div><span class="lbl2" id="thLbl">Thème</span><div class="seg seg3" role="group" aria-labelledby="thLbl">${[['auto','Automatique'],['light','Clair'],['dark','Sombre']].map(([v, l]) => `<button type="button" data-action="setTheme" data-arg="${v}" aria-pressed="${t === v}">${l}</button>`).join('')}</div></div><div><span class="lbl2" id="szLbl">Taille du texte</span><div class="seg seg3" role="group" aria-labelledby="szLbl">${[['md','Normale'],['lg','Grande'],['xl','Très grande']].map(([v, l]) => `<button type="button" data-action="setSize" data-arg="${v}" aria-pressed="${s === v}">${l}</button>`).join('')}</div></div></div><p class="small muted" style="margin:10px 0 0">Raccourcis : ${IS_MAC ? '⌘K' : 'Ctrl K'} ou / pour rechercher une page, 1 à 9 pour marquer une action pendant la lecture d’un match, Échap pour fermer une fenêtre.</p></section>`;
}
const vDonneesV3 = VIEWS.donnees;
VIEWS.donnees = () => { let out = vDonneesV3().replace('<h1>Données</h1>', '<h1>Réglages et données</h1>'); const i = out.indexOf('<div class="grid g2"'); return i < 0 ? out : out.slice(0, i) + displayPrefsHTML() + out.slice(i); };

/* ---------- Après chaque rendu ---------- */
let lastRouteV4 = null;
function afterRender() {
  const route = currentRoute();
  document.body.classList.toggle('modal-open', !$('#modal').hidden);
  document.querySelectorAll('button[aria-label]:not([title])').forEach(b => b.title = b.getAttribute('aria-label'));
  document.querySelectorAll('td input:not([aria-label]), td select:not([aria-label])').forEach(el => { const td = el.closest('td'), tr = td && td.parentNode, table = td && td.closest('table'); if (!table) return; const idx = [...tr.children].indexOf(td); const th = table.querySelector(`thead th:nth-child(${idx + 1})`); const rowh = tr.querySelector('td b, td input[type=text]'); const lab = (th && th.textContent.trim()) || ''; if (lab) el.setAttribute('aria-label', lab + (rowh && rowh !== el ? ' · ' + (rowh.value || rowh.textContent || '').trim() : '')); });
  document.querySelectorAll('.pp').forEach(x => x.setAttribute('lang', 'en'));
  document.querySelectorAll('.tablewrap').forEach(w => { if (w.hasAttribute('tabindex')) return; const card = w.closest('section,.card'); const h = card && card.querySelector('h3'); w.setAttribute('tabindex', '0'); w.setAttribute('role', 'region'); w.setAttribute('aria-label', 'Tableau' + (h ? ' : ' + h.textContent.trim() : '') + ' (défilement horizontal possible)'); });
  markMissing(); updateSaveStatus();
  const h1 = document.querySelector('#main h1');
  if (h1) { document.title = h1.textContent.trim() + ' · Passerelle'; h1.setAttribute('tabindex', '-1'); }
  if (lastRouteV4 !== null && route !== lastRouteV4 && h1 && $('#modal').hidden) h1.focus({preventScroll:true});
  lastRouteV4 = route;
}
const renderV3 = render;
render = function () { renderV3(); afterRender(); };
const refreshLiveV3 = refreshLive;
refreshLive = function () { refreshLiveV3(); markMissing(); };

