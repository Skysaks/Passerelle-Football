/* ===================== Profil public séduisant et personnalisable ===================== */
const PROFILE_ACCENTS = [['gazon', 'Gazon', '#0b6b4d'], ['ocean', 'Océan', '#1f4fbf'], ['brique', 'Brique', '#b03a24'], ['violet', 'Violet', '#6a3fc4'], ['or', 'Or', '#8a5a00'], ['nuit', 'Nuit', '#1d2a44']];
const PROFILE_SECTIONS_V6 = [['video', 'Vidéo'], ['why', 'Pourquoi moi'], ['numbers', 'Chiffres'], ['radar', 'Profil et zones'], ['clips', 'Actions filmées'], ['history', 'Parcours'], ['academics', 'Scolarité'], ['physical', 'Tests physiques'], ['reference', 'Référence'], ['proof', 'Preuves'], ['contact', 'Contact']];
const FEATURE_CHOICES = [['distance90', 'Distance / 90'], ['passAcc', 'Passes réussies'], ['top', 'Vitesse max'], ['sprints90', 'Sprints / 90'], ['ga90', 'Buts + PD / 90'], ['carries90', 'Conduites / 90'], ['sprint30', 'Sprint 30 m'], ['vma', 'VMA'], ['goals', 'Buts (saison)'], ['assists', 'Passes déc. (saison)'], ['minutes', 'Minutes (saison)'], ['height', 'Taille']];
const T = {
  en:{yrs:'yrs', cm:'cm', foot:{Droit:'Right-footed', Gauche:'Left-footed', 'Les deux':'Two-footed'}, available:'Available', classOf:'Class of', proof:'Proof index', watch:'Watch highlights', contact:'Contact', video:'Video', why:'Why recruit me', numbers:'Key numbers', season:'Season', perf:'Measured performance', radar:'Profile vs', zones:'Where I play', clips:'Filmed actions', history:'Career', academics:'Academics', physical:'Physical testing', reference:'Coach reference', proofs:'How this profile is verified', contactH:'Contact', matches:'Matches', minutes:'Minutes', goals:'Goals', assists:'Assists', basis:'Measured on', on:'matches', min:'min', percentile:'percentile', none:'Not measured yet', gpa:'GPA (est.)', english:'English test', major:'Intended major', ncaa:'Eligibility', ncaaOk:'No professional contract, amateur status', grad:'Graduation', footer:'Profile hosted on Passerelle. Every number shows how it was obtained.', vs:'vs', shortSample:'short sample', langs:'Languages'},
  fr:{yrs:'ans', cm:'cm', foot:{Droit:'Pied droit', Gauche:'Pied gauche', 'Les deux':'Deux pieds'}, available:'Disponible', classOf:'Promotion', proof:'Indice de preuve', watch:'Voir les temps forts', contact:'Contacter', video:'Vidéo', why:'Pourquoi me recruter', numbers:'Chiffres clés', season:'Saison', perf:'Performance mesurée', radar:'Profil vs', zones:'Où je joue', clips:'Actions filmées', history:'Parcours', academics:'Scolarité', physical:'Tests physiques', reference:'Référence d’entraîneur', proofs:'Comment ce profil est vérifié', contactH:'Contact', matches:'Matchs', minutes:'Minutes', goals:'Buts', assists:'Passes déc.', basis:'Mesuré sur', on:'matchs', min:'min', percentile:'centile', none:'Pas encore mesuré', gpa:'GPA (estimé)', english:'Test d’anglais', major:'Études visées', ncaa:'Éligibilité', ncaaOk:'Aucun contrat professionnel, statut amateur', grad:'Diplôme', footer:'Profil hébergé sur Passerelle. Chaque chiffre indique comment il a été obtenu.', vs:'vs', shortSample:'échantillon court', langs:'Langues'},
  es:{yrs:'años', cm:'cm', foot:{Droit:'Diestro', Gauche:'Zurdo', 'Les deux':'Ambidiestro'}, available:'Disponible', classOf:'Promoción', proof:'Índice de prueba', watch:'Ver highlights', contact:'Contactar', video:'Vídeo', why:'Por qué ficharme', numbers:'Cifras clave', season:'Temporada', perf:'Rendimiento medido', radar:'Perfil vs', zones:'Dónde juego', clips:'Acciones filmadas', history:'Trayectoria', academics:'Estudios', physical:'Tests físicos', reference:'Referencia del entrenador', proofs:'Cómo se verifica este perfil', contactH:'Contacto', matches:'Partidos', minutes:'Minutos', goals:'Goles', assists:'Asistencias', basis:'Medido en', on:'partidos', min:'min', percentile:'percentil', none:'Aún no medido', gpa:'GPA (est.)', english:'Test de inglés', major:'Estudios previstos', ncaa:'Elegibilidad', ncaaOk:'Sin contrato profesional, estatus amateur', grad:'Graduación', footer:'Perfil alojado en Passerelle. Cada cifra indica cómo se obtuvo.', vs:'vs', shortSample:'muestra corta', langs:'Idiomas'}
};
const POS_ES = {'Gardien':'Portero', 'Défenseur central':'Central', 'Latéral droit':'Lateral derecho', 'Latéral gauche':'Lateral izquierdo', 'Milieu défensif':'Mediocentro defensivo', 'Milieu central':'Mediocentro', 'Milieu offensif':'Mediapunta', 'Ailier droit':'Extremo derecho', 'Ailier gauche':'Extremo izquierdo', 'Attaquant':'Delantero'};
const GROUP_ES = {GK:'porteros', DEF:'defensas', MIL:'centrocampistas', ATT:'delanteros'};
const CLIP_EN = {but:'Goal', 'passe-dec':'Assist', tir:'Shot', 'passe-cle':'Key pass', dribble:'Dribble', duel:'Duel won', recup:'Ball recovery', arret:'Save', touche:'Touch', passe:'Pass', conduite:'Ball carry', controle:'First touch'};
const CLIP_ES = {but:'Gol', 'passe-dec':'Asistencia', tir:'Tiro', 'passe-cle':'Pase clave', dribble:'Regate', duel:'Duelo ganado', recup:'Recuperación', arret:'Parada', touche:'Toque', passe:'Pase', conduite:'Conducción', controle:'Control'};

function look(p) {
  p.look = Object.assign({accent:'gazon', custom:'', cover:'terrain', layout:'impact', featured:['distance90', 'passAcc', 'top', 'ga90'], pitch:['', '', ''], lang:'en', order:PROFILE_SECTIONS_V6.map(s => s[0]), hidden:[], photo:'', coverImg:''}, p.look || {});
  PROFILE_SECTIONS_V6.forEach(([k]) => { if (!p.look.order.includes(k)) p.look.order.push(k); });
  return p.look;
}
function hexLum(h) { const c = h.replace('#', '').match(/../g).map(x => parseInt(x, 16) / 255).map(x => x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
function ensureDark(hex) { // garantit un contraste >= 4,5 avec du texte blanc
  if (!/^#[0-9a-f]{6}$/i.test(hex || '')) return '#0b6b4d';
  let c = hex.replace('#', '').match(/../g).map(x => parseInt(x, 16));
  for (let i = 0; i < 20 && 1.05 / (hexLum('#' + c.map(x => x.toString(16).padStart(2, '0')).join('')) + .05) < 4.6; i++) c = c.map(x => Math.round(x * .9));
  return '#' + c.map(x => x.toString(16).padStart(2, '0')).join('');
}
function profileAccent(p) { const L = look(p); if (L.accent === 'club' && L.custom) return ensureDark(L.custom); return (PROFILE_ACCENTS.find(a => a[0] === L.accent) || PROFILE_ACCENTS[0])[2]; }
function posL(pos, lang) { return lang === 'en' ? (POS_EN[pos] || pos) : lang === 'es' ? (POS_ES[pos] || pos) : pos; }
function initials(p) { return ((p.firstName || '?')[0] + (p.lastName || '')[0]).toUpperCase(); }

function seductionChecks(p) {
  const L = look(p), mo = metricsOf(p), featuredMeasured = L.featured.filter(k => MET[k] ? mo.v[k] != null : true).length;
  return [
    {ok:!!L.photo, t:'Une photo de toi', r:'partage', a:'lookPhoto'},
    {ok:(p.videos || []).some(v => v.visible && v.featured), t:'Une vidéo à la une (temps forts de 2 à 4 min)', r:'videos'},
    {ok:L.pitch.filter(x => (x || '').trim()).length >= 3, t:'Trois arguments courts en tête de profil', r:'partage'},
    {ok:featuredMeasured >= 3, t:'Au moins 3 chiffres clés renseignés', r:'stats'},
    {ok:!!metricsOf(p).basis, t:'Des données mesurées sur vidéo', r:'videos'},
    {ok:(p.endorsements || []).length > 0, t:'Une référence de ton entraîneur', r:'profil'},
    {ok:!!p.project.availableFrom, t:'Ta date de disponibilité', r:'profil'},
    {ok:proofIndex(p) >= 60, t:'Indice de preuve d’au moins 60', r:'stats'}
  ];
}

function ordinal(n, lang) { if (lang === 'en') { const v = n % 100; return n + (v >= 11 && v <= 13 ? 'th' : ({1:'st', 2:'nd', 3:'rd'}[n % 10] || 'th')); } return lang === 'es' ? n + 'º' : n + 'e'; }
function featuredTile(p, k, mo, lang) {
  const t = T[lang];
  if (MET[k]) { const m = MET[k], v = mo.v[k]; const lbl = lang === 'en' ? m.en : lang === 'es' ? m.es : m.l;
    return `<div class="pp2-key"><b>${v == null ? '—' : m.f(v)}${v != null && m.u ? `<small>${m.u === '%' ? '%' : ' ' + m.u}</small>` : ''}</b><span>${esc(lbl)}</span>${v != null ? `<em>${ordinal(mo.pct[k], lang)} ${t.percentile} · ${proofPill(mo.proof[k], lang)}</em>` : `<em>${t.none}</em>`}</div>`; }
  const map = {goals:[p.stats.goals, t.goals], assists:[p.stats.assists, t.assists], minutes:[p.stats.minutes, t.minutes], height:[p.height ? p.height + ' cm' : '', lang === 'en' ? 'Height' : lang === 'es' ? 'Altura' : 'Taille']};
  const [v, l] = map[k] || ['', k];
  const pf = k === 'height' ? 'declare' : p.statsValidated ? 'coach' : 'declare';
  return `<div class="pp2-key"><b>${esc(v || '—')}</b><span>${esc(l)}${k !== 'height' ? ' · ' + esc(p.stats.season) : ''}</span><em>${proofPill(pf, lang)}</em></div>`;
}

profileDoc = function (p, opt) {
  opt = opt || {}; const L = look(p), lang = T[L.lang] ? L.lang : 'en', t = T[lang], v = p.visibility;
  const mo = metricsOf(p), lv = levelOf(p.level), age = ageAt(p.birthDate), gpa = gpaFrom20(p.academic.average);
  const avail = p.project.availableFrom ? new Date(p.project.availableFrom) : null;
  const season = avail ? (avail.getMonth() >= 6 ? (lang === 'en' ? 'Fall ' : lang === 'es' ? 'Otoño ' : 'Automne ') : (lang === 'en' ? 'Spring ' : lang === 'es' ? 'Primavera ' : 'Printemps ')) + avail.getFullYear() : '';
  const acc = profileAccent(p), pi = proofIndex(p);
  const clips = playerClips(p.id).filter(c => c.status === 'validé');
  const byType = CLIP_TYPES.map(c => [c[0], c[1], clips.filter(x => x.type === c[0]).length]).filter(x => x[2]);
  const flags = [p.nationality, p.nationality2].filter(Boolean).join(' / ');
  const coverStyle = L.cover === 'photo' && L.coverImg ? ` style="background-image:linear-gradient(180deg,rgba(0,0,0,.15),rgba(0,0,0,.72)),url('${L.coverImg}')"` : '';
  const S = {};
  const vids = publicVideosHTML(p, opt.export);
  S.video = vids ? `<section class="pp2-sec" id="pp-video">${vids.replace('<h3>Video</h3>', `<h2>${t.video}</h2>`)}</section>` : '';
  const pitch = L.pitch.filter(x => (x || '').trim());
  S.why = pitch.length ? `<section class="pp2-sec"><h2>${t.why}</h2><ul class="pp2-why">${pitch.map(x => `<li><span aria-hidden="true">✓</span>${esc(x)}</li>`).join('')}</ul></section>` : (p.bio ? `<section class="pp2-sec"><h2>${t.why}</h2><p>${esc(p.bio)}</p></section>` : '');
  const perf = METRICS.filter(m => m.src === 'moteur' && mo.v[m.k] != null);
  S.numbers = v.showStats ? `<section class="pp2-sec"><h2>${t.numbers}</h2>
    <div class="pp2-two"><div><h3>${t.season} ${esc(p.stats.season)} ${proofPill(p.statsValidated ? 'coach' : 'declare', lang)}</h3><table><tr><th>${t.matches}</th><th>${t.minutes}</th><th>${t.goals}</th><th>${t.assists}</th></tr><tr><td>${esc(p.stats.matches || '—')}</td><td>${esc(p.stats.minutes || '—')}</td><td>${esc(p.stats.goals || 0)}</td><td>${esc(p.stats.assists || 0)}</td></tr></table></div>
    ${perf.length ? `<div><h3>${t.perf} ${proofPill('moteur', lang)}</h3><table class="pp2-perf"><colgroup><col style="width:46%"><col style="width:22%"><col></colgroup>${perf.map(m => `<tr><th>${esc(lang === 'en' ? m.en : lang === 'es' ? m.es : m.l)}</th><td>${m.f(mo.v[m.k])}${m.u ? ' ' + m.u : ''}</td><td class="pp2-pc"><span class="pp2-bar"><i style="width:${mo.pct[m.k]}%"></i></span>${mo.pct[m.k]}</td></tr>`).join('')}</table><p class="pp2-note">${t.basis} ${mo.basis.matches} ${t.on}, ${mo.basis.minutes} ${t.min}${mo.basis.matches < 3 ? ` · ${t.shortSample}` : ''}.</p></div>` : ''}</div></section>` : '';
  const hm = heatOf(p), glab = lang === 'en' ? GROUP_EN[mo.g] : lang === 'es' ? GROUP_ES[mo.g] : GROUP_LABEL[mo.g];
  S.radar = mo.basis || hm ? `<section class="pp2-sec"><div class="pp2-two"><div><h2>${t.radar} ${esc(glab)}</h2>${radarSVG([{label:p.firstName, values:radarValues(mo)}], lang, 300)}</div>${hm ? `<div><h2>${t.zones}</h2>${heatSVG(hm, lang)}</div>` : ''}</div></section>` : '';
  S.clips = byType.length ? `<section class="pp2-sec"><h2>${t.clips}</h2><div class="pp2-chips">${byType.map(([k, l, n]) => `<span><b>${n}</b> ${esc(lang === 'en' ? CLIP_EN[k] || l : lang === 'es' ? CLIP_ES[k] || l : l)}</span>`).join('')}</div></section>` : '';
  S.history = p.history.length ? `<section class="pp2-sec"><h2>${t.history}</h2><ol class="pp2-tl">${p.history.map(h => `<li><b>${esc(h.season)}</b><span>${esc(h.club)} · ${esc(h.level)}${h.category ? ' · ' + esc(h.category) : ''}${h.apps ? ` · ${esc(h.apps)} ${t.matches.toLowerCase()}` : ''}</span></li>`).join('')}</ol></section>` : '';
  S.academics = v.showAcademic ? `<section class="pp2-sec"><h2>${t.academics}</h2><div class="pp2-facts">${p.academic.diploma ? `<div><span>${t.grad}</span><b>${esc(lang === 'en' && p.academic.diploma === 'Bac obtenu' ? 'French Baccalauréat' : p.academic.diploma)}${p.academic.gradYear ? ' ' + esc(p.academic.gradYear) : ''}</b></div>` : ''}${gpa != null ? `<div><span>${t.gpa}</span><b>${gpa.toFixed(1)} / 4</b></div>` : ''}${p.academic.englishTest && p.academic.englishTest !== 'Aucun' ? `<div><span>${t.english}</span><b>${esc(p.academic.englishTest)}${p.academic.englishScore ? ' · ' + esc(p.academic.englishScore) : ''}</b></div>` : ''}${p.academic.studyField ? `<div><span>${t.major}</span><b>${esc(p.academic.studyField)}</b></div>` : ''}${!p.eligibility.proContract && !p.eligibility.paidBeyond ? `<div><span>${t.ncaa}</span><b>${t.ncaaOk}</b></div>` : ''}${p.languages ? `<div><span>${t.langs}</span><b>${esc(p.languages)}</b></div>` : ''}</div></section>` : '';
  S.physical = v.showPhysical && (p.physical.sprint30 || p.physical.vma || p.physical.jump) ? `<section class="pp2-sec"><h2>${t.physical} ${proofPill(p.testsCertified ? 'certifie' : 'declare', lang)}</h2><div class="pp2-facts">${p.physical.sprint30 ? `<div><span>${lang === 'en' ? '30 m sprint' : 'Sprint 30 m'}</span><b>${String(p.physical.sprint30).replace('.', lang === 'en' ? '.' : ',')} s</b></div>` : ''}${p.physical.vma ? `<div><span>${lang === 'en' ? 'Max aerobic speed' : lang === 'es' ? 'VAM' : 'VMA'}</span><b>${esc(p.physical.vma)} km/h</b></div>` : ''}${p.physical.jump ? `<div><span>${lang === 'en' ? 'Vertical jump' : lang === 'es' ? 'Salto vertical' : 'Détente'}</span><b>${esc(p.physical.jump)} cm</b></div>` : ''}${p.physical.yoyo ? `<div><span>Yo-Yo IR1</span><b>${esc(p.physical.yoyo)}</b></div>` : ''}</div></section>` : '';
  S.reference = p.endorsements.length ? `<section class="pp2-sec"><h2>${t.reference}</h2>${p.endorsements.map(e => `<blockquote class="pp2-quote"><p>“${esc(e.text)}”</p><footer>${esc(e.coach)} · ${esc(e.club)}</footer></blockquote>`).join('')}</section>` : '';
  S.proof = `<section class="pp2-sec"><h2>${t.proofs}</h2><div class="pp2-proofs">${proofItems(p).map(i => `<div><span>${esc(lang === 'fr' ? i.l : ({'Identité':'Identity', 'Statistiques de saison':'Season stats', 'Tests physiques':'Physical tests', 'Données de match mesurées':'Measured match data', 'Actions en vidéo':'Filmed actions', 'Scolarité':'Academics', 'Référence d’entraîneur':'Coach reference'}[i.l] || i.l))}</span>${proofPill(i.lvl, lang)}</div>`).join('')}</div></section>`;
  S.contact = v.showContacts ? `<section class="pp2-sec"><h2>${t.contactH}</h2><p>${esc(p.email)}${p.phone ? ' · ' + esc(p.phone) : ''}${p.links.instagram ? ' · ' + esc(p.links.instagram) : ''}</p></section>` : '';
  const order = L.layout === 'dossier' ? ['why', 'academics', 'numbers', 'video', 'radar', 'reference', 'history', 'physical', 'clips', 'proof', 'contact'] : L.order;
  const body = order.filter(k => !L.hidden.includes(k)).map(k => S[k] || '').join('');
  return `<article class="pp2 lay-${esc(L.layout)}" style="--pa:${acc}" lang="${lang}">
  <header class="pp2-hero cover-${esc(L.cover)}"${coverStyle}>
    <div class="pp2-id"><div class="pp2-av">${L.photo ? `<img src="${L.photo}" alt="">` : `<span>${esc(initials(p))}</span>`}</div>
      <div class="pp2-name"><div class="pp2-kick">${esc(posL(p.position, lang))}${p.position2 ? ' / ' + esc(posL(p.position2, lang)) : ''}${avail ? ` · ${t.classOf} ${avail.getFullYear()}` : ''}</div><h1>${esc(p.firstName)} ${esc(p.lastName)}</h1>
      <div class="pp2-meta">${[p.club, lv ? (lang === 'en' ? lv[3] || lv[1] : lv[1]) : '', flags, age != null ? age + ' ' + t.yrs : '', p.height ? p.height + ' cm' : '', t.foot[p.foot] || ''].filter(Boolean).map(esc).join(' · ')}</div></div></div>
    <div class="pp2-badges">${avail ? `<span class="pp2-b">${t.available} · ${esc(season)}</span>` : ''}<span class="pp2-b">${t.proof} <b>${pi}</b>/100</span>${p.verified && p.verified.identity ? `<span class="pp2-b">✓ ID</span>` : ''}${p.statsValidated ? `<span class="pp2-b">✓ ${lang === 'en' ? 'Coach-verified stats' : lang === 'es' ? 'Datos validados' : 'Stats validées'}</span>` : ''}</div>
    ${opt.export ? '' : `<div class="pp2-cta">${S.video ? `<a class="pp2-btn" href="#pp-video" data-action="ppScroll">${t.watch}</a>` : ''}${v.showContacts && p.email ? `<a class="pp2-btn ghost" href="mailto:${esc(p.email)}">${t.contact}</a>` : ''}</div>`}
  </header>
  ${L.featured.length ? `<div class="pp2-keys">${L.featured.slice(0, 4).map(k => featuredTile(p, k, mo, lang)).join('')}</div>` : ''}
  ${body}
  <footer class="pp2-foot">${t.footer}</footer></article>`;
};

/* ---------- Page « Profil public » : aperçu + personnalisation ---------- */
const vPartageV5 = VIEWS.partage;
VIEWS.partage = function () {
  const p = state.player, L = look(p), B = 'player.visibility.', pi = proofIndex(p), checks = seductionChecks(p), ok = checks.filter(c => c.ok).length;
  const link = `passerelle.app/p/${(hashStr(p.id + p.lastName) % 1e8).toString(36)}`;
  const seg = (key, opts, lbl) => `<div><span class="lbl2" id="lk_${key}">${lbl}</span><div class="seg" role="group" aria-labelledby="lk_${key}">${opts.map(([v, l]) => `<button type="button" data-action="lookSet" data-arg="${key}|${v}" aria-pressed="${L[key] === v}">${esc(l)}</button>`).join('')}</div></div>`;
  return head('Profil public', `La page que voient les recruteurs. Privée par défaut, partagée par lien : ${esc(link)}`, `<button class="btn" data-action="copyLink">Copier le lien</button><button class="btn" data-action="exportProfile">Exporter en HTML</button>`) + `
  <div class="share-grid">
    <div class="share-prev">${profileDoc(p)}</div>
    <div class="stack share-side">
      <section class="card"><h3>Ce qu’un recruteur voit en 10 secondes <span class="pill ${ok >= 6 ? 'ok' : ok >= 4 ? 'warn' : ''}">${ok} / ${checks.length}</span></h3><div class="list">${checks.map(c => `<div class="row"><span class="adot${c.ok ? ' on' : ''}" aria-hidden="true">${c.ok ? '✓' : ''}</span><span class="grow small">${esc(c.t)}<span class="sr">${c.ok ? ' : fait' : ' : à faire'}</span></span>${c.ok ? '' : c.a ? `<button class="btn sm" data-action="${c.a}">Ajouter</button>` : `<a class="btn sm" href="#${c.r}">Faire</a>`}</div>`).join('')}</div></section>
      <section class="card"><h3>Apparence du profil</h3><div class="prefs">
        <div><span class="lbl2" id="lk_acc">Couleur</span><div class="swatches" role="group" aria-labelledby="lk_acc">${PROFILE_ACCENTS.map(([k, l, c]) => `<button type="button" class="sw" style="--c:${c}" data-action="lookSet" data-arg="accent|${k}" aria-pressed="${L.accent === k}" aria-label="${l}" title="${l}"></button>`).join('')}<label class="sw sw-custom" title="Couleur du club" style="--c:${L.custom || '#888888'}"><input type="color" data-look-color value="${esc(L.custom || '#0b6b4d')}" aria-label="Couleur du club"><span aria-hidden="true">+</span></label></div></div>
        ${seg('cover', [['terrain', 'Terrain'], ['degrade', 'Dégradé'], ['sombre', 'Sombre'], ['photo', 'Photo']], 'Bandeau')}
        ${seg('layout', [['impact', 'Impact'], ['dossier', 'Dossier universitaire']], 'Mise en page')}
        ${seg('lang', [['en', 'English'], ['fr', 'Français'], ['es', 'Español']], 'Langue du profil')}
        <div class="actions"><label class="btn sm" style="cursor:pointer">${L.photo ? 'Changer la photo' : 'Ajouter une photo'}<input type="file" accept="image/*" data-look-img="photo" hidden></label><label class="btn sm" style="cursor:pointer">Image du bandeau<input type="file" accept="image/*" data-look-img="coverImg" hidden></label>${L.photo ? '<button class="btn sm" data-action="lookClear" data-arg="photo">Retirer la photo</button>' : ''}</div>
      </div></section>
      <section class="card"><h3>Pourquoi moi <span class="small muted">3 lignes, en ${L.lang === 'fr' ? 'français' : L.lang === 'es' ? 'espagnol' : 'anglais'}</span></h3><div class="form" style="grid-template-columns:minmax(0,1fr)">${[0, 1, 2].map(i => F(`player.look.pitch.${i}`, `Argument ${i + 1}`, 'text', {ph:['Box-to-box midfielder, 10+ km a match', '82% pass accuracy measured on video', 'Captain U19, starter in National 3 at 18'][i]})).join('')}</div>
        ${caps.sample ? '<button class="btn sm" data-action="lookPitchAI">Proposer à partir de mes données</button>' : '<button class="btn sm" data-action="lookPitchAuto">Proposer à partir de mes données</button>'}</section>
      <section class="card"><h3>Chiffres clés <span class="small muted">4 maximum</span></h3><div class="chips">${FEATURE_CHOICES.map(([k, l]) => `<label class="chipbox"><input type="checkbox" data-action-change="lookFeat" data-arg="${k}"${L.featured.includes(k) ? ' checked' : ''}${!L.featured.includes(k) && L.featured.length >= 4 ? ' disabled' : ''}>${esc(l)}</label>`).join('')}</div></section>
      <section class="card"><h3>Sections</h3><p class="small muted" style="margin:0 0 8px">${L.layout === 'dossier' ? 'La mise en page « Dossier universitaire » impose son ordre ; tu peux masquer des sections.' : 'Ordre d’affichage et visibilité.'}</p><div class="list">${L.order.map((k, i) => { const lbl = (PROFILE_SECTIONS_V6.find(s => s[0] === k) || [k, k])[1]; const hid = L.hidden.includes(k); return `<div class="row"><label class="check grow" style="padding:0"><input type="checkbox" data-action-change="lookHide" data-arg="${k}"${hid ? '' : ' checked'}>${esc(lbl)}</label><button class="btn sm icon" data-action="lookMove" data-arg="${k}|-1" aria-label="Monter ${esc(lbl)}"${i === 0 ? ' disabled' : ''}>↑</button><button class="btn sm icon" data-action="lookMove" data-arg="${k}|1" aria-label="Descendre ${esc(lbl)}"${i === L.order.length - 1 ? ' disabled' : ''}>↓</button></div>`; }).join('')}</div></section>
      <section class="card"><h3>Ce que voient les visiteurs</h3><div class="form" style="grid-template-columns:1fr">${F(B + 'showStats', 'Statistiques', 'check', {rerender:1})}${F(B + 'showPhysical', 'Données physiques', 'check', {rerender:1})}${F(B + 'showAcademic', 'Scolarité', 'check', {rerender:1})}${F(B + 'showContacts', 'Coordonnées', 'check', {rerender:1})}${F(B + 'searchable', 'Visible dans la recherche des recruteurs', 'check', {rerender:1})}</div></section>
      <section class="card"><h3>Indice de preuve <span class="pill ${pi >= 60 ? 'ok' : 'warn'}">${pi} / 100</span></h3><div class="list">${proofItems(p).map(i => `<div class="row"><span class="grow small">${esc(i.l)}${i.hint ? `<span class="muted"> · ${esc(i.hint)}</span>` : ''}</span>${proofPill(i.lvl)}${PROOF[i.lvl].r < 2 ? `<a class="btn sm" href="#${i.r}">Renforcer</a>` : ''}</div>`).join('')}</div></section>
    </div></div>`;
};

function pitchAuto(p) {
  const mo = metricsOf(p), out = [];
  const pos = POS_EN[p.position] || p.position;
  if (mo.v.distance90 != null) out.push(`${pos} covering ${(mo.v.distance90 / 1000).toFixed(1)} km per 90 (measured on video)`);
  else out.push(`${pos}${p.foot ? ', ' + ({Droit:'right', Gauche:'left', 'Les deux':'two'}[p.foot] || '') + '-footed' : ''}${p.height ? ', ' + p.height + ' cm' : ''}`);
  if (mo.v.passAcc != null) out.push(`${Math.round(mo.v.passAcc)}% pass accuracy, ${mo.pct.passAcc}th percentile among ${GROUP_EN[mo.g]}`);
  else if (mo.v.ga90 != null) out.push(`${(n0(p.stats.goals) + n0(p.stats.assists))} goals + assists in ${p.stats.matches || '?'} matches this season`);
  const lv = levelOf(p.level);
  out.push(`${lv ? (lv[3] || lv[1]) : 'Senior football'} starter at ${ageAt(p.birthDate) ?? '?'}${p.academic.englishScore ? ` · ${p.academic.englishTest} ${p.academic.englishScore}` : ''}`);
  return out.slice(0, 3);
}
async function downscaleImage(file, max, square) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
    if (square) { const s = Math.min(sw, sh); sx = (sw - s) / 2; sy = (sh - s) / 3; sw = sh = s; }
    const k = Math.min(1, max / Math.max(sw, sh)), c = document.createElement('canvas'); c.width = Math.round(sw * k); c.height = Math.round(sh * k);
    c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', .78);
  } finally { URL.revokeObjectURL(url); }
}
document.addEventListener('change', async e => {
  const el = e.target; if (!el || !el.matches) return;
  if (el.matches('input[data-look-img]')) {
    const f = el.files && el.files[0]; if (!f) return; if (!/^image\//.test(f.type)) { toast('Choisis une image.'); return; }
    const k = el.dataset.lookImg; try { look(state.player)[k] = await downscaleImage(f, k === 'photo' ? 360 : 1400, k === 'photo'); if (k === 'coverImg') look(state.player).cover = 'photo'; save(); render(); toast(k === 'photo' ? 'Photo ajoutée.' : 'Image du bandeau ajoutée.'); } catch (err) { toast('Image illisible.'); }
    el.value = '';
  } else if (el.matches('input[data-look-color]')) { const L = look(state.player); L.custom = el.value; L.accent = 'club'; save(); render(); }
});
Object.assign(ACT, {
  lookSet(a) { const [k, v] = String(a).split('|'); const L = look(state.player); L[k] = v; if (k === 'cover' && v === 'photo' && !L.coverImg) toast('Ajoute une image du bandeau.'); save(); render(); },
  lookClear(k) { look(state.player)[k] = ''; save(); render(); },
  lookPhoto() { const i = document.querySelector('input[data-look-img="photo"]'); if (i) i.click(); else location.hash = 'partage'; },
  lookMove(a) { const [k, d] = String(a).split('|'); const o = look(state.player).order, i = o.indexOf(k), j = i + +d; if (i < 0 || j < 0 || j >= o.length) return; [o[i], o[j]] = [o[j], o[i]]; save(); render(); const b = document.querySelector(`[data-action="lookMove"][data-arg="${k}|${d}"]`); if (b && !b.disabled) b.focus(); },
  lookPitchAuto() { const L = look(state.player), s = pitchAuto(state.player); L.pitch = s; L.lang = 'en'; save(); render(); toast('Trois arguments proposés à partir de tes données : relis-les et ajuste-les.'); },
  async lookPitchAI() {
    const p = state.player, mo = metricsOf(p);
    toast('Rédaction en cours…');
    try {
      const facts = {position:p.position, club:p.club, level:levelLabel(p.level), age:ageAt(p.birthDate), height:p.height, foot:p.foot, season:p.stats, measured:Object.fromEntries(Object.entries(mo.v).map(([k, v]) => [k, Math.round(v * 10) / 10])), percentiles:mo.pct, positionGroup:GROUP_EN[mo.g], english:p.academic.englishTest + ' ' + p.academic.englishScore, bio:p.bio};
      const r = await caps.sample(`Write exactly 3 short lines (max 70 characters each) in English for the top of a football recruiting profile. Use only these facts, no invention, no superlatives that the data does not support. One line per item, no bullets, no numbering.\n${JSON.stringify(facts)}`, {modelTier:'quick'});
      const lines = String((r && r.text) || '').split('\n').map(x => x.replace(/^[-•\d.\s]+/, '').trim()).filter(Boolean).slice(0, 3);
      if (lines.length) { const L = look(p); L.pitch = lines.concat(['', '', '']).slice(0, 3); L.lang = 'en'; save(); render(); toast('Arguments proposés : relis-les.'); } else ACT.lookPitchAuto();
    } catch (e) { ACT.lookPitchAuto(); }
  },
  ppScroll(a, el, e) { const t = (el.closest('.pp2') || document).querySelector('#pp-video'); if (t) { if (e) e.preventDefault(); t.scrollIntoView({behavior:prefersReduced() ? 'auto' : 'smooth', block:'start'}); } }
});
Object.assign(CHANGE_ACT, {
  lookFeat(k, el) { const L = look(state.player); if (el.checked) { if (L.featured.length < 4 && !L.featured.includes(k)) L.featured.push(k); } else L.featured = L.featured.filter(x => x !== k); save(); render(); },
  lookHide(k, el) { const L = look(state.player); L.hidden = el.checked ? L.hidden.filter(x => x !== k) : [...new Set([...L.hidden, k])]; save(); render(); }
});

const PP2_CSS = `.pp2{--accent:var(--pa);--line:#e2e8e5;--muted:#55625d;--ink2:#14201b;background:#fff;color:var(--ink2);border-radius:18px;overflow:hidden;border:1px solid #e2e8e5;font-size:.9375rem;line-height:1.55}
.pp2 h1{font-size:clamp(1.75rem,1.4rem + 1.6vw,2.5rem);line-height:1.05;margin:2px 0 6px;color:#fff;letter-spacing:-.01em}
.pp2 h2{font-size:.8125rem;text-transform:uppercase;letter-spacing:.09em;color:var(--pa);margin:0 0 10px}
.pp2 h3{font-size:.875rem;margin:0 0 8px;color:var(--ink2);display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.pp2 p{margin:0}
.pp2-hero{position:relative;color:#fff;padding:28px 26px 22px;background:linear-gradient(135deg,var(--pa),color-mix(in srgb,var(--pa) 55%,#000));background-size:cover;background-position:center}
.pp2-hero.cover-terrain{background-image:repeating-linear-gradient(90deg,transparent 0 46px,rgba(255,255,255,.05) 46px 92px),linear-gradient(135deg,var(--pa),color-mix(in srgb,var(--pa) 55%,#000))}
.pp2-hero.cover-sombre{background:linear-gradient(135deg,#0d1311,#1d2723)} .pp2-hero.cover-sombre .pp2-av{background:var(--pa)}
.pp2-id{display:flex;gap:18px;align-items:center;flex-wrap:wrap}
.pp2-av{width:92px;height:92px;border-radius:50%;flex:none;overflow:hidden;display:grid;place-items:center;background:rgba(255,255,255,.16);border:3px solid rgba(255,255,255,.85);font-weight:750;font-size:2rem;letter-spacing:.02em}
.pp2-av img{width:100%;height:100%;object-fit:cover}
.pp2-name{min-width:0;flex:1}
.pp2-kick{font-size:.8125rem;font-weight:650;text-transform:uppercase;letter-spacing:.08em;opacity:.9}
.pp2-meta{opacity:.92;font-size:.9375rem}
.pp2-badges{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
.pp2-b{background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:4px 12px;font-size:.8125rem;font-weight:600}
.pp2-cta{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
.pp2-btn{display:inline-flex;align-items:center;min-height:2.75rem;padding:0 18px;border-radius:999px;background:#fff;color:var(--pa);font-weight:700;text-decoration:none}
.pp2-btn.ghost{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.8)}
.pp2-keys{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,9.5rem),1fr));border-bottom:1px solid var(--line)}
.pp2-key{padding:16px 18px;border-right:1px solid var(--line);display:flex;flex-direction:column;gap:2px;min-width:0}
.pp2-key:last-child{border-right:0}
.pp2-key b{font-size:1.75rem;line-height:1.1;font-variant-numeric:tabular-nums;color:var(--ink2)} .pp2-key b small{font-size:.9375rem;font-weight:600;color:var(--muted)}
.pp2-key span{font-size:.8125rem;color:var(--muted);font-weight:600} .pp2-key em{font-style:normal;font-size:.75rem;color:var(--muted);display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.pp2-sec{padding:20px 26px;border-bottom:1px solid var(--line)}
.pp2-two{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,17rem),1fr));gap:20px;align-items:start}
.pp2 table{width:100%;border-collapse:collapse;font-size:.875rem;table-layout:fixed;color:var(--ink2)} .pp2 th,.pp2 td{padding:7px 8px;border-bottom:1px solid var(--line);text-align:left;overflow-wrap:anywhere;color:var(--ink2)} .pp2 th{color:var(--muted);font-weight:600;background:#f4f7f5;white-space:normal}
.pp2-pc{display:flex;gap:8px;align-items:center;font-variant-numeric:tabular-nums} .pp2-perf td:nth-child(2){white-space:nowrap}
.pp2-bar{flex:1;height:6px;border-radius:3px;background:#e9eeeb;overflow:hidden} .pp2-bar i{display:block;height:100%;background:var(--pa)}
.pp2-note{font-size:.75rem;color:var(--muted);margin-top:6px!important}
.pp2-why{list-style:none;margin:0;padding:0;display:grid;gap:8px} .pp2-why li{display:flex;gap:10px;font-size:1.0625rem;font-weight:600;line-height:1.35} .pp2-why li span{color:var(--pa);font-weight:800}
.pp2-chips{display:flex;flex-wrap:wrap;gap:8px} .pp2-chips span{border:1px solid var(--line);border-radius:999px;padding:4px 12px;font-size:.875rem} .pp2-chips b{color:var(--pa)}
.pp2-tl{list-style:none;margin:0;padding:0 0 0 14px;border-left:2px solid color-mix(in srgb,var(--pa) 40%,#fff);display:grid;gap:10px} .pp2-tl li{position:relative;display:flex;flex-direction:column} .pp2-tl li::before{content:"";position:absolute;left:-21px;top:6px;width:10px;height:10px;border-radius:50%;background:var(--pa)} .pp2-tl span{color:var(--muted);font-size:.875rem}
.pp2-facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr));gap:10px} .pp2-facts div{border:1px solid var(--line);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column} .pp2-facts span{font-size:.75rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.05em}
.pp2-quote{margin:0;padding:16px 18px;border-radius:14px;background:color-mix(in srgb,var(--pa) 7%,#fff);border-left:4px solid var(--pa)} .pp2-quote p{font-size:1rem;font-style:italic} .pp2-quote footer{margin-top:8px;font-size:.8125rem;color:var(--muted);font-weight:600}
.pp2-proofs{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr));gap:8px} .pp2-proofs div{display:flex;justify-content:space-between;gap:8px;align-items:center;font-size:.875rem;border-bottom:1px dashed var(--line);padding:4px 0}
.pp2-foot{padding:14px 26px;font-size:.75rem;color:var(--muted)}
.pp2 .radar{width:100%;max-width:320px;height:auto;display:block;margin:0 auto}
.pp2 .heat svg{width:100%;height:auto;border-radius:10px;display:block}
.pp2 .vmedia video,.pp2 .vmedia .thumb{border-radius:12px}
.pp2 .proof{font-size:.75rem}
.proof{display:inline-flex;align-items:center;gap:5px;font-size:.75rem;font-weight:650;padding:2px 8px;border-radius:999px;white-space:nowrap;border:1px solid}
.proof .pdot{width:7px;height:7px;border-radius:50%;background:currentColor}
.proof-declare{color:#5b6662;border-color:#cfd6d3;background:#f4f6f5} .proof-document{color:#2445a8;border-color:#c6d3f3;background:#f0f4fd} .proof-coach{color:#7a4900;border-color:#ecd3a5;background:#fdf6ea} .proof-moteur{color:#11683a;border-color:#b9dfc8;background:#eef8f2} .proof-certifie{color:#fff;border-color:#11683a;background:#11683a}
@media (max-width:560px){.pp2-hero{padding:22px 18px 18px}.pp2-sec{padding:18px}.pp2-av{width:72px;height:72px;font-size:1.5rem}.pp2-key{padding:12px 14px}.pp2-key b{font-size:1.4rem}}`;
(function () { const st = document.createElement('style'); st.id = 'pp2css'; st.textContent = PP2_CSS; document.head.appendChild(st); })();
profileExportHTML = function () {
  const p = state.player, L = look(p);
  return `<!DOCTYPE html><html lang="${esc(L.lang || 'en')}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(p.firstName)} ${esc(p.lastName)} · ${L.lang === 'fr' ? 'Profil de recrutement' : L.lang === 'es' ? 'Perfil de reclutamiento' : 'Recruiting profile'}</title><style>body{margin:0;background:#eef2f0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}main{max-width:880px;margin:24px auto;padding:0 12px}.tiny{font-size:.75rem}.muted{color:#55625d}${PP2_CSS}</style></head><body><main>${profileDoc(p, {export:true})}</main></body></html>`;
};

