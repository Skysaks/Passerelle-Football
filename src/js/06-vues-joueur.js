/* ---------- Vues joueur ---------- */
function vAccueil() {
  const p = state.player, c = playerCompleteness(p), top = ranked(p).slice(0, 4);
  const clips = playerClips('me').filter(x => x.status === 'validé').length;
  const replies = state.messages.filter(m => m.dir === 'in').length;
  const notifs = state.notifications.filter(n => n.to === 'joueur').slice(0, 5);
  return head(`Bonjour ${p.firstName || ''}`.trim(), 'Où tu en es, et ce qu’il reste à faire.', `<a class="btn" href="#partage">Voir mon profil public</a><a class="btn primary" href="#videos">Importer un match</a>`) + `
  <div class="grid g4">
    <a class="card kpi" href="#profil" style="text-decoration:none;color:inherit">${ring(c.pct)}<span class="l">Profil complété</span></a>
    <a class="card kpi" href="#videos" style="text-decoration:none;color:inherit"><span class="v">${clips}</span><span class="l">Clips validés</span></a>
    <a class="card kpi" href="#suivi" style="text-decoration:none;color:inherit"><span class="v">${Object.keys(p.pipeline).length}</span><span class="l">Programmes suivis</span></a>
    <a class="card kpi" href="#audience" style="text-decoration:none;color:inherit"><span class="v">${state.views.filter(v => v.playerId === 'me' && v.kind === 'profil' && v.date >= new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10)).length}</span><span class="l">Vues du profil (30 j) · ${replies} réponse${replies > 1 ? 's' : ''} de coachs</span></a>
  </div>
  <div class="grid g2" style="margin-top:16px">
    <section class="card"><h3>Prochaines actions</h3><div class="list">${nextActions(p).map(a => `<a class="row" href="#${a.r}" style="text-decoration:none;color:inherit"><span class="dot warn"></span><span class="grow">${esc(a.t)}</span><span class="muted">›</span></a>`).join('') || '<div class="empty">Tout est à jour.</div>'}</div></section>
    <section class="card"><h3>Meilleures correspondances <a class="btn sm" href="#debouches">Tout voir</a></h3><div class="list">${top.map(({pr, r}) => `<div class="row"><div class="score ${scoreClass(r.score)}">${r.score}</div><div class="grow"><div class="t">${esc(pr.name)}</div><div class="small muted">${esc(pr.org)} · ${esc(pr.city)}, ${esc(pr.country)}</div></div><button class="btn sm" data-action="viewProgram" data-arg="${pr.id}">Fiche</button></div>`).join('')}</div></section>
  </div>
  <section class="card" style="margin-top:16px"><h3>Notifications ${notifs.some(n => !n.read) ? `<button class="btn sm" data-action="readAll" data-arg="joueur">Tout marquer comme lu</button>` : ''}</h3><div class="list">${notifs.map(n => `<div class="row"><span class="dot ${n.read ? '' : 'info'}" style="${n.read ? 'background:var(--line)' : ''}"></span><span class="grow">${esc(n.text)}</span><span class="small muted">${fdate(n.date)}</span></div>`).join('') || '<div class="empty">Aucune notification.</div>'}</div></section>`;
}

function vProfil() {
  const p = state.player, c = playerCompleteness(p), B = 'player.';
  const minor = (ageAt(p.birthDate) ?? 99) < 18;
  return head('Mon profil', 'Tout ce qu’un entraîneur ou un recruteur doit voir. Chaque champ se sauvegarde automatiquement.', `<span data-live="pcomp">${ring(c.pct)}</span>${caps.sample ? `<button class="btn" data-action="aiSummary">Résumé en anglais avec Claude</button>` : ''}<a class="btn primary" href="#partage">Aperçu public</a>`) + `
  <div class="stack">
  ${badgesHTML(p) ? `<div class="badges">${badgesHTML(p)}</div>` : ''}
  ${vidSection()}
  <section class="card"><div class="sec"><div class="sec-h"><h3>Identité</h3></div><div class="form">
    ${F(B+'firstName','Prénom')}${F(B+'lastName','Nom')}${F(B+'gender','Sexe','select',{options:['Homme','Femme']})}${F(B+'birthDate','Date de naissance','date')}
    ${F(B+'nationality','Nationalité')}${F(B+'nationality2','Seconde nationalité')}${F(B+'city','Ville')}${F(B+'country','Pays')}
    ${F(B+'email','E-mail','email')}${F(B+'phone','Téléphone','tel')}${F(B+'languages','Langues parlées',undefined,{ph:'Français, anglais B2…'})}
  </div></div>
  ${minor ? `<div class="sec"><div class="sec-h"><h3>Représentant légal</h3><span class="pill warn">Mineur : consentement parental requis</span></div><div class="form">${F(B+'guardian.name','Nom du parent ou tuteur')}${F(B+'guardian.email','E-mail','email')}${F(B+'guardian.phone','Téléphone','tel')}${F(B+'guardian.consent','Le représentant légal a donné son accord écrit','check',{rerender:1})}</div>${(ageAt(p.birthDate) ?? 99) < 15 && !p.guardian.consent ? '<div class="callout warn small">Moins de 15 ans : le profil reste invisible des recruteurs tant que le consentement parental n’est pas donné (RGPD, majorité numérique à 15 ans en France).</div>' : ''}</div>` : ''}
  </section>
  <section class="card"><div class="sec"><h3>Football</h3><div class="form">
    ${F(B+'position','Poste principal','select',{options:POS})}${F(B+'position2','Poste secondaire','select',{options:POS})}${F(B+'foot','Pied fort','select',{options:['Droit','Gauche','Les deux']})}${F(B+'jersey','Numéro de maillot','number')}
    ${F(B+'height','Taille','number',{unit:'cm'})}${F(B+'weight','Poids','number',{unit:'kg'})}${F(B+'club','Club actuel')}${F(B+'level','Niveau','select',{options:LEVELS.map(l => [l[0], l[1]])})}
    ${F(B+'league','Championnat exact',undefined,{ph:'National 3, groupe Occitanie'})}
  </div></div>
  <div class="sec"><div class="sec-h"><h3>Statistiques de la saison</h3>${p.statsValidated ? '<span class="pill ok">Validées par l’entraîneur</span>' : '<span class="pill">Non validées</span>'}</div><div class="form">
    ${F(B+'stats.season','Saison')}${F(B+'stats.matches','Matchs','number')}${F(B+'stats.minutes','Minutes','number')}${F(B+'stats.goals','Buts','number')}${F(B+'stats.assists','Passes décisives','number')}${p.position === 'Gardien' ? F(B+'stats.cleanSheets','Clean sheets','number') : ''}
  </div></div>
  <div class="sec"><div class="sec-h"><h3>Parcours en club</h3><button class="btn sm" data-action="addHistory">Ajouter une saison</button></div>
    ${p.history.length ? `<div class="tablewrap"><table><thead><tr><th>Saison</th><th>Club</th><th>Niveau</th><th>Catégorie</th><th>Matchs</th><th></th></tr></thead><tbody>${p.history.map((h, i) => `<tr><td><input type="text" id="${fid(B+'history.'+i+'.season')}" data-bind="${B}history.${i}.season" value="${esc(h.season)}"></td><td><input type="text" id="${fid(B+'history.'+i+'.club')}" data-bind="${B}history.${i}.club" value="${esc(h.club)}"></td><td><input type="text" id="${fid(B+'history.'+i+'.level')}" data-bind="${B}history.${i}.level" value="${esc(h.level)}"></td><td><input type="text" id="${fid(B+'history.'+i+'.category')}" data-bind="${B}history.${i}.category" value="${esc(h.category)}"></td><td><input type="number" id="${fid(B+'history.'+i+'.apps')}" data-bind="${B}history.${i}.apps" value="${esc(h.apps)}" style="width:80px"></td><td><button class="btn sm danger" data-action="delHistory" data-arg="${i}" aria-label="Supprimer la saison">Retirer</button></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Ajoute tes saisons précédentes.</div>'}
  </div></section>
  <section class="card"><div class="sec"><h3>Données physiques</h3><div class="form">
    ${F(B+'physical.sprint30','Sprint 30 m','number',{unit:'s',step:'0.01'})}${F(B+'physical.vma','VMA','number',{unit:'km/h',step:'0.1'})}${F(B+'physical.jump','Détente verticale','number',{unit:'cm'})}${F(B+'physical.yoyo','Yo-Yo IR1 (palier)')}${F(B+'physical.testDate','Date des tests','date')}
  </div></div></section>
  <section class="card"><div class="sec"><h3>Scolarité et anglais</h3><div class="form">
    ${F(B+'academic.diploma','Diplôme','select',{options:DIPLOMAS})}${F(B+'academic.gradYear','Année d’obtention','number')}${F(B+'academic.average','Moyenne générale','number',{unit:'/20',step:'0.1'})}
    <div class="field"><label>GPA estimé</label><div style="padding:9px 0;font-weight:600" data-live="gpa">${gpaFrom20(p.academic.average) != null ? gpaFrom20(p.academic.average).toFixed(2) + ' / 4' : '—'}</div><small>Conversion indicative</small></div>
    ${F(B+'academic.specialties','Spécialités / filière')}${F(B+'academic.studyField','Projet d’études')}${F(B+'academic.englishTest','Test d’anglais','select',{options:ENG})}${F(B+'academic.englishScore','Score obtenu')}
  </div></div></section>
  <section class="card"><div class="sec"><h3>Projet</h3><div class="form">
    ${MULTI(B+'project.goals','Débouchés recherchés',GOALS)}
    ${F(B+'project.availableFrom','Départ possible à partir de','date')}${F(B+'project.budgetMax','Budget maximum par an','number',{unit:'€'})}${F(B+'project.regions','Régions ou pays préférés')}
    ${F(B+'project.notes','Contraintes (santé, famille, études…)','textarea',{wide:true,rows:2})}
  </div></div>
  <div class="sec"><h3>Présentation</h3><div class="form">
    ${F(B+'bio','Bio courte','textarea',{wide:true,rows:3,ph:'3 phrases : ton profil de joueur, ton rôle, ce que tu cherches.'})}
    ${F(B+'strengths','Points forts',undefined,{wide:true,ph:'Volume, jeu long, pressing…'})}
    ${F(B+'links.highlight','Lien vidéo temps forts','url')}${F(B+'links.instagram','Instagram')}${F(B+'links.other','Autre lien (Transfermarkt, Hudl…)','url')}
  </div></div></section>
  <section class="card"><div class="sec"><h3>Recommandations d’entraîneurs</h3>${p.endorsements.length ? p.endorsements.map(e => `<div class="callout"><div>“${esc(e.text)}”</div><div class="small muted" style="margin-top:6px">${esc(e.coach)}, ${esc(e.club)} · ${fdate(e.date)}</div></div>`).join('') : '<div class="empty">Ton entraîneur peut te recommander depuis son espace (rôle Entraîneur).</div>'}</div></section>
  <section class="card"><div class="sec"><h3>Confidentialité</h3><div class="form">
    ${F(B+'visibility.searchable','Visible par les recruteurs inscrits','check')}${F(B+'visibility.showStats','Afficher les statistiques','check')}${F(B+'visibility.showPhysical','Afficher les données physiques','check')}${F(B+'visibility.showAcademic','Afficher la scolarité','check')}${F(B+'visibility.showContacts','Afficher mes coordonnées','check')}
  </div><small class="muted">Profil privé par défaut côté public : seul un lien que tu partages l’ouvre.</small></div></section>
  </div>`;
}

function vVideos() {
  if (ui.matchId && state.matches.find(m => m.id === ui.matchId)) return vMatch();
  ui.matchId = null;
  const ms = playerMatches('me');
  return head('Vidéos', 'Importe un match complet, marque tes actions ou lance l’analyse, puis compose ta vidéo des temps forts.', `<button class="btn primary" data-action="addMatch" data-arg="player">Importer un match</button>`) + `
  <div class="callout" style="margin-bottom:16px">Le fichier vidéo reste sur ton appareil : il n’est jamais envoyé. Après un rechargement, réimporte-le pour le lire ; tes clips sont conservés.</div>
  <div class="grid g2">${ms.map(m => matchCard(m, 'me')).join('') || '<div class="empty">Aucun match.</div>'}</div>`;
}
function matchCard(m, pid) {
  const cl = m.clips.filter(c => !pid || c.playerId === pid), v = cl.filter(c => c.status === 'validé').length, pr = cl.filter(c => c.status === 'proposé').length;
  const q = qualityScore(m);
  return `<article class="card"><div style="display:flex;justify-content:space-between;gap:10px;align-items:start"><div><h3 style="margin:0">${esc(m.title)}</h3><div class="small muted">${fdate(m.date)} · ${esc(m.competition || '')}${m.team ? ' · Match d’équipe' : ''}</div></div><span class="pill ${q >= 70 ? 'ok' : q >= 45 ? 'warn' : 'bad'}">Qualité ${q}</span></div>
  <div style="display:flex;flex-wrap:wrap;gap:8px 16px;margin:14px 0" class="small"><span><b class="num">${v}</b> clips validés</span><span><b class="num">${pr}</b> à valider</span><span>${videoURLs[m.id] ? '<span class="pill ok">Vidéo chargée</span>' : m.source === 'demo' ? '<span class="pill">Démo sans fichier</span>' : '<span class="pill">Fichier à réimporter</span>'}</span></div>
  <div class="actions"><button class="btn primary sm" data-action="openMatch" data-arg="${m.id}">Ouvrir</button>${m.team ? '' : `<button class="btn sm danger" data-action="delMatch" data-arg="${m.id}">Supprimer</button>`}</div></article>`;
}
function curMatch() { return state.matches.find(m => m.id === ui.matchId); }
function vMatch() {
  const m = curMatch(), pid = state.role === 'entraineur' ? null : 'me', url = videoURLs[m.id];
  const q = qualityScore(m);
  return head(m.title, `${fdate(m.date)} · ${esc(m.competition || '')} · ${m.duration ? Math.round(m.duration / 60) + ' min' : 'durée inconnue'}${m.height ? ` · ${m.width}×${m.height}` : ''}`, `<button class="btn" data-action="backMatches">‹ Retour</button>`) + `
  <div class="grid split" id="matchGrid">
    <div class="stack">
      <div class="video-wrap">${url ? `<video id="mv" src="${url}" controls playsinline preload="metadata"></video>` : `<div class="nofile"><div><div style="font-weight:600;margin-bottom:8px">${m.source === 'demo' ? 'Match de démonstration sans fichier vidéo' : 'Réimporte le fichier pour lire ce match'}</div><label class="btn primary" style="cursor:pointer">Choisir le fichier vidéo<input type="file" accept="video/*" data-file="${m.id}" hidden></label></div></div>`}
        <div class="overlay" id="ov"><div><div class="small" style="opacity:.8;letter-spacing:.1em;text-transform:uppercase">Highlights</div><h2>${esc(state.player.firstName)} ${esc(state.player.lastName)}</h2><div>${esc(POS_EN[state.player.position] || state.player.position || '')} · ${esc(state.player.club)} · ${esc((levelOf(state.player.level) || [])[3] || '')}</div><div class="small" style="opacity:.8;margin-top:6px">Class of ${esc(String(new Date(state.player.project.availableFrom || Date.now()).getFullYear()))} · ${esc(state.player.height)} cm · ${esc(state.player.foot ? 'Foot: ' + state.player.foot : '')}</div></div></div>
      </div>
      <section class="card"><h3>Marquer une action <span class="small muted">touches 1 à 9 pendant la lecture</span></h3>${state.role === 'entraineur' ? `<div class="field" style="max-width:320px;margin-bottom:10px"><label for="tagPid">Joueur concerné</label><select id="tagPid" data-onchange="tagPlayer">${roster().map(p => `<option value="${p.id}"${ui.tagPlayer === p.id ? ' selected' : ''}>${esc(p.firstName)} ${esc(p.lastName)} · ${esc(p.position)}</option>`).join('')}</select></div>` : ''}
        <div class="tagbar">${CLIP_TYPES.map(([k, l, key, col]) => `<button class="tagbtn" data-action="tag" data-arg="${k}" ${url ? '' : 'disabled'} style="border-left:4px solid ${col}"><span>${esc(l)}</span><kbd>${key}</kbd></button>`).join('')}</div>
        <p class="small muted" style="margin:10px 0 0">Chaque marque crée un clip de 10 s, de 6 s avant à 4 s après l’instant marqué. Ajuste ensuite le début et la durée.</p>
      </section>
      <section class="card"><h3>Vidéo des temps forts</h3>
        <p class="small muted" style="margin:0 0 10px">Clips cochés « Temps forts », dans l’ordre ci-dessous, précédés d’un carton titre de 2,5 s.</p>
        <div id="reelList">${reelListHTML(m)}</div>
        <div class="actions" style="margin-top:12px"><button class="btn primary" data-action="studioOpen" ${url ? '' : 'disabled'}>Studio de montage</button><button class="btn" data-action="reelPlay" ${url ? '' : 'disabled'}>Lire l’aperçu</button><button class="btn" data-action="reelRecord" ${url ? '' : 'disabled'}>Enregistrement simple</button><button class="btn" data-action="youtube">Préparer pour YouTube</button></div>
        <p class="tiny muted" style="margin:8px 0 0">L’enregistrement WebM capture la lecture en temps réel (sans le carton titre) et ajoute la vidéo à ton profil, d’où tu peux la télécharger.</p>
      </section>
    </div>
    <div class="stack">
      ${analysisCardHTML(m)}
      ${annotationsHTML(m)}
      <section class="card"><h3>Qualité de la vidéo <span class="pill ${q >= 70 ? 'ok' : q >= 45 ? 'warn' : 'bad'}" data-live="mq">${q} / 100</span></h3><div class="form" style="grid-template-columns:1fr">
        ${F(`matches.${state.matches.indexOf(m)}.quality.fixed`, 'Caméra fixe ou sur trépied', 'check')}${F(`matches.${state.matches.indexOf(m)}.quality.wide`, 'Plan large, tout le terrain', 'check')}${F(`matches.${state.matches.indexOf(m)}.quality.numbers`, 'Numéros de maillot lisibles', 'check')}${F(`matches.${state.matches.indexOf(m)}.quality.light`, 'Bonne lumière', 'check')}
      </div></section>
      <section class="card"><h3>Clips <select id="clipFilter" data-onchange="clipFilter" aria-label="Filtrer les clips" style="width:auto;min-height:2rem;padding:4px 8px"><option value="all">Tous</option><option value="validé"${ui.clipFilter === 'validé' ? ' selected' : ''}>Validés</option><option value="proposé"${ui.clipFilter === 'proposé' ? ' selected' : ''}>À valider</option><option value="refusé"${ui.clipFilter === 'refusé' ? ' selected' : ''}>Refusés</option>${CLIP_TYPES.map(c => `<option value="${c[0]}"${ui.clipFilter === c[0] ? ' selected' : ''}>${c[1]}</option>`).join('')}</select></h3>
        <div id="clipList">${clipListHTML(m, pid)}</div></section>
    </div>
  </div>`;
}
function clipsFor(m, pid) { return m.clips.filter(c => !pid || c.playerId === pid).filter(c => ui.clipFilter === 'all' ? c.status !== 'refusé' : (c.status === ui.clipFilter || (c.type === ui.clipFilter && c.status !== 'refusé'))).sort((a, b) => a.t - b.t); }
function clipListHTML(m, pid) {
  const cl = clipsFor(m, pid);
  const pend = m.clips.filter(c => (!pid || c.playerId === pid) && c.status === 'proposé').length;
  return (pend ? `<div class="actions" style="margin-bottom:8px"><button class="btn sm" data-action="acceptAll">Valider les ${pend} propositions</button></div>` : '') + (cl.length ? cl.map(c => {
    const [, l, , col] = ctype(c.type); const pl = !pid ? findPlayer(c.playerId) : null;
    return `<div class="clip"><span class="ctype" style="background:${col}">${esc(l)}</span><div style="min-width:0"><div class="small"><b class="num">${tc(c.t)}</b> → <span class="num">${tc(c.t + c.dur)}</span>${pl ? ` · ${esc(pl.firstName)} ${esc(pl.lastName)}` : ''} ${c.status === 'proposé' ? '<span class="pill info">À valider</span>' : ''}${c.origin === 'ia' && c.status === 'validé' ? '<span class="pill">IA</span>' : ''}${c.origin === 'moteur' && c.status === 'validé' ? '<span class="pill">Moteur</span>' : ''}${c.conf != null && c.status !== 'validé' ? ` <span class="pill ${c.conf >= .7 ? 'ok' : c.conf >= .45 ? 'warn' : ''}" title="Confiance du moteur">${Math.round(c.conf * 100)} %</span>` : ''}${c.outcome === 'reussie' || c.outcome === 'perdue' ? ` <span class="pill ${c.outcome === 'reussie' ? 'ok' : 'warn'}">${c.outcome === 'reussie' ? 'Réussie' : 'Perdue'}</span>` : ''}${c.box ? ' <span class="pill" title="Le projecteur s’affichera sur le joueur">Projecteur</span>' : ''}${c.status === 'refusé' ? ` <span class="pill bad">Refusé${c.reason ? ' · ' + esc(c.reason) : ''}</span>` : ''}</div>${c.why && c.status !== 'validé' ? `<div class="tiny muted">${esc(c.why)}</div>` : ''}
      ${c.status === 'validé' ? `<div class="stars" aria-label="Note">${[1,2,3,4,5].map(n => `<button data-action="rate" data-arg="${c.id}:${n}" class="${c.rating >= n ? 'on' : ''}" aria-label="${n} étoile${n > 1 ? 's' : ''}">★</button>`).join('')}</div><label class="check small" style="padding:0"><input type="checkbox" data-action-change="toggleReel" data-arg="${c.id}"${c.inReel ? ' checked' : ''}>Temps forts</label>` : ''}</div>
      <div class="actions">${videoURLs[m.id] ? `<button class="btn sm icon" data-action="playClip" data-arg="${c.id}" aria-label="Lire">▶</button><button class="btn sm icon" data-action="nudge" data-arg="${c.id}:-2" title="Début −2 s">−2s</button><button class="btn sm icon" data-action="nudge" data-arg="${c.id}:2" title="Début +2 s">+2s</button>` : ''}${c.status === 'proposé' ? `<button class="btn sm primary" data-action="acceptClip" data-arg="${c.id}">Valider</button><button class="btn sm" data-action="rejectClip" data-arg="${c.id}">Refuser</button>` : ''}${c.status === 'refusé' ? `<button class="btn sm" data-action="restoreClip" data-arg="${c.id}">Rétablir</button>` : ''}<button class="btn sm icon danger" data-action="delClip" data-arg="${c.id}" aria-label="Supprimer">✕</button></div></div>`;
  }).join('') : '<div class="empty">Aucun clip pour ce filtre.</div>');
}
function reelClips(m) {
  const pid = state.role === 'entraineur' ? null : 'me';
  const ids = (m.reel || []).filter(id => m.clips.some(c => c.id === id && c.inReel));
  m.clips.filter(c => c.inReel && (!pid || c.playerId === pid) && !ids.includes(c.id)).sort((a, b) => b.rating - a.rating || a.t - b.t).forEach(c => ids.push(c.id));
  m.reel = ids;
  return ids.map(id => m.clips.find(c => c.id === id));
}
function reelListHTML(m) {
  const list = reelClips(m);
  if (!list.length) return '<div class="empty">Coche « Temps forts » sur tes meilleurs clips.</div>';
  const total = list.reduce((s, c) => s + c.dur, 0) + 2.5;
  return `<div class="list">${list.map((c, i) => `<div class="row" style="padding:7px 0"><span class="num muted" style="width:20px">${i + 1}</span><span class="ctype" style="background:${ctype(c.type)[3]}">${esc(ctype(c.type)[1])}</span><span class="grow small num">${tc(c.t)} · ${c.dur} s · ${'★'.repeat(c.rating)}</span><button class="btn sm icon" data-action="reelMove" data-arg="${c.id}:-1" aria-label="Monter">↑</button><button class="btn sm icon" data-action="reelMove" data-arg="${c.id}:1" aria-label="Descendre">↓</button></div>`).join('')}</div><div class="small muted" style="margin-top:6px">Durée totale : <b class="num">${tc(total)}</b> ${total > 300 ? '<span class="pill warn">Au-delà de 5 min, les coachs décrochent</span>' : total >= 120 ? '<span class="pill ok">Bonne durée</span>' : ''}</div>`;
}
function refreshClips() { const m = curMatch(); if (!m) return; const pid = state.role === 'entraineur' ? null : 'me'; const a = $('#clipList'); if (a) a.innerHTML = clipListHTML(m, pid); const b = $('#reelList'); if (b) b.innerHTML = reelListHTML(m); save(); }

function vDebouches() {
  const p = state.player, f = ui.debouches;
  const countries = [...new Set(state.programs.map(x => x.country).filter(Boolean))];
  let list = ranked(p);
  if (f.type === 'uni') list = list.filter(x => x.pr.type === 'Université'); else if (f.type === 'club') list = list.filter(x => x.pr.type !== 'Université');
  if (f.country !== 'all') list = list.filter(x => x.pr.country === f.country);
  if (f.org !== 'all') list = list.filter(x => x.pr.org === f.org);
  return head('Débouchés', 'Universités, clubs et académies classés selon ton profil. Score indicatif sur 100, à calibrer avec les résultats réels.', `<a class="btn" href="#annuaire">Ajouter un programme</a>`) + `
  <div class="filters">
    <div class="field"><label for="fd_type">Type</label><select id="fd_type" data-ui="debouches.type"><option value="all">Tous</option><option value="uni"${f.type === 'uni' ? ' selected' : ''}>Universités</option><option value="club"${f.type === 'club' ? ' selected' : ''}>Clubs et académies</option></select></div>
    <div class="field"><label for="fd_country">Pays</label><select id="fd_country" data-ui="debouches.country"><option value="all">Tous</option>${countries.map(c => `<option${f.country === c ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
    <div class="field"><label for="fd_org">Division</label><select id="fd_org" data-ui="debouches.org"><option value="all">Toutes</option>${Object.keys(ORGS).map(o => `<option${f.org === o ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></div>
  </div>
  <section class="card">${list.map(({pr, r}) => {
    const st = p.pipeline[pr.id];
    return `<div class="prog"><div class="score ${scoreClass(r.score)}">${r.score}</div><div style="min-width:0"><div class="t" style="font-weight:650">${esc(pr.name)} ${bucketPill(r)} ${pr.demo ? '<span class="pill">Exemple</span>' : ''}</div><div class="prog-meta"><span>${esc(pr.org)}</span><span>${esc(pr.city)}, ${esc(pr.country)}</span><span>${esc(pr.gender)}</span>${pr.intlShare !== '' ? `<span>${esc(pr.intlShare)} % internationaux</span>` : ''}${pr.deadline ? `<span>Date limite ${fdate(pr.deadline)}</span>` : ''}</div><div class="reasons">${reasonsHTML(r)}</div></div>
    <div class="actions" style="flex-direction:column;align-items:stretch">${st ? `<span class="pill acc">${esc(st)}</span>` : `<button class="btn sm primary" data-action="follow" data-arg="${pr.id}">Suivre</button>`}<button class="btn sm" data-action="compose" data-arg="${pr.id}">Écrire</button><button class="btn sm" data-action="viewProgram" data-arg="${pr.id}">Fiche</button></div></div>`;
  }).join('') || '<div class="empty">Aucun programme pour ces filtres.</div>'}</section>`;
}

function vSuivi() {
  const p = state.player;
  const items = Object.entries(p.pipeline).map(([id, st]) => ({pr:findProgram(id), st})).filter(x => x.pr);
  const deadlines = items.filter(x => x.pr.deadline).sort((a, b) => a.pr.deadline.localeCompare(b.pr.deadline));
  return head('Mes candidatures', 'Chaque programme avance d’une colonne à l’autre jusqu’à l’engagement.', `<a class="btn" href="#debouches">Ajouter des programmes</a>`) + `
  <div class="kanban">${STAGES.map((s, si) => { const col = items.filter(x => x.st === s); return `<div class="col"><h4><span>${esc(s)}</span><span class="num">${col.length}</span></h4>${col.map(({pr}) => { const r = matchScore(p, pr); return `<div class="kc"><div class="t">${esc(pr.name)}</div><div class="muted">${esc(pr.org)} · score ${r.score}</div><div class="actions">${si > 0 ? `<button class="btn sm icon" data-action="stage" data-arg="${pr.id}:-1" aria-label="Reculer">‹</button>` : ''}${si < STAGES.length - 1 ? `<button class="btn sm icon" data-action="stage" data-arg="${pr.id}:1" aria-label="Avancer">›</button>` : ''}<button class="btn sm" data-action="compose" data-arg="${pr.id}">Écrire</button><button class="btn sm icon danger" data-action="unfollow" data-arg="${pr.id}" aria-label="Retirer">✕</button></div></div>`; }).join('')}</div>`; }).join('')}</div>
  <section class="card" style="margin-top:16px"><h3>Dates limites</h3><div class="list">${deadlines.map(({pr, st}) => { const d = Math.ceil((new Date(pr.deadline) - new Date()) / 864e5); return `<div class="row"><span class="dot ${d < 45 ? 'bad' : d < 90 ? 'warn' : 'ok'}"></span><span class="grow"><b>${esc(pr.name)}</b> <span class="muted small">· ${esc(st)}</span></span><span class="small num">${fdate(pr.deadline)} · ${d >= 0 ? 'J−' + d : 'passée'}</span></div>`; }).join('') || '<div class="empty">Aucune date limite renseignée.</div>'}</div></section>`;
}

function vMessages() {
  const msgs = [...state.messages].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return head('Messages', 'Brouillons, envois et réponses des entraîneurs. Les e-mails partent de ta propre messagerie.', `<button class="btn primary" data-action="compose" data-arg="">Nouveau message</button>`) + `
  <section class="card"><div class="list">${msgs.map(m => { const pr = findProgram(m.programId); return `<div class="row" style="align-items:start"><span class="pill ${m.dir === 'in' ? 'info' : m.status === 'envoyé' ? 'ok' : ''}">${m.dir === 'in' ? 'Reçu' : m.status === 'envoyé' ? 'Envoyé' : 'Brouillon'}</span><div class="grow"><div class="t">${esc(m.subject)}</div><div class="small muted">${m.dir === 'in' ? 'De' : 'À'} ${esc(m.coachName)} · ${esc(pr ? pr.name : '')} · ${fdate(m.date)}</div><div class="small" style="margin-top:4px;white-space:pre-wrap">${esc(m.body.length > 220 ? m.body.slice(0, 220) + '…' : m.body)}</div></div><div class="actions">${m.dir === 'out' && m.status !== 'envoyé' ? `<button class="btn sm" data-action="editMsg" data-arg="${m.id}">Modifier</button>` : ''}${m.dir === 'in' ? `<button class="btn sm" data-action="compose" data-arg="${m.programId}">Répondre</button>` : ''}<button class="btn sm icon danger" data-action="delMsg" data-arg="${m.id}" aria-label="Supprimer">✕</button></div></div>`; }).join('') || '<div class="empty">Aucun message.</div>'}</div></section>`;
}

function vEligibilite() {
  const p = state.player, items = eligibility(p), B = 'player.eligibility.';
  return head('Éligibilité', 'Ce qui peut bloquer un départ en université américaine, et quoi faire. Informations indicatives à vérifier auprès des organismes.') + `
  <div class="grid g2" style="align-items:start"><section class="card"><h3>Diagnostic</h3><div class="list">${items.map(i => `<div class="row" style="align-items:start"><span class="dot ${i.s}" style="margin-top:7px"></span><div class="grow"><div class="t">${esc(i.l)}</div><div class="small muted">${esc(i.d)}</div></div><span class="pill ${i.s}">${{ok:'OK', warn:'À faire', bad:'Bloquant', info:'À vérifier'}[i.s]}</span></div>`).join('')}</div></section>
  <section class="card"><h3>Déclarations</h3><div class="form" style="grid-template-columns:1fr">
    ${F(B+'proContract','J’ai signé un contrat professionnel','check',{rerender:1})}${F(B+'paidBeyond','J’ai reçu une rémunération au-delà de mes frais','check',{rerender:1})}${F(B+'agentOnAid','Je paie un service ou un agent selon la bourse obtenue','check',{rerender:1})}
    ${F(B+'ncaaRegistered','Inscrit au NCAA Eligibility Center','check',{rerender:1})}${F(B+'ncaaId','Identifiant NCAA')}${F(B+'passport','Passeport valide','check',{rerender:1})}
  </div></section></div>
  <section class="card" style="margin-top:16px"><h3>Étapes du visa étudiant F-1</h3><div class="tablewrap"><table><thead><tr><th>#</th><th>Étape</th><th>Coût</th><th>Commentaire</th></tr></thead><tbody>
    <tr><td>1</td><td>Admission et formulaire I-20 délivré par l’université</td><td>—</td><td>Preuve de financement demandée</td></tr>
    <tr><td>2</td><td>Frais SEVIS I-901</td><td class="num">350 $</td><td>Payé une fois par dossier SEVIS</td></tr>
    <tr><td>3</td><td>Formulaire DS-160 et frais de demande (MRV)</td><td class="num">185 $</td><td>Avant de réserver l’entretien</td></tr>
    <tr><td>4</td><td>Visa Integrity Fee</td><td class="num">250 $</td><td>Créée en 2025 ; perception effective à confirmer</td></tr>
    <tr><td>5</td><td>Entretien au consulat américain</td><td>—</td><td>Passeport, I-20, justificatifs</td></tr>
  </tbody></table></div><p class="tiny muted" style="margin:8px 0 0">Montants relevés le 23 novembre 2026 sur des sources publiques ; à revérifier avant paiement.</p></section>`;
}

function vOffres() {
  const offers = state.offers;
  const rows = offers.map((o, i) => { const pr = findProgram(o.programId); const net = Math.max(0, n0(o.cost) - n0(o.athletic) - n0(o.academic) - n0(o.other)); const eur = net * rate(o.currency); return {o, i, pr, net, eur}; });
  const best = rows.length ? Math.min(...rows.map(r => r.eur)) : null;
  return head('Offres', 'Compare le reste à charge réel, en euros, sur un an et sur quatre ans.', `<button class="btn primary" data-action="addOffer">Ajouter une offre</button>`) + `
  <section class="card">${rows.length ? `<div class="tablewrap"><table><thead><tr><th>Programme</th><th>Devise</th><th>Coût annuel</th><th>Bourse sportive</th><th>Bourse académique</th><th>Autres aides</th><th>Reste / an</th><th>Reste / an (€)</th><th>4 ans (€)</th><th>Réponse avant</th><th></th></tr></thead><tbody>${rows.map(({o, i, pr, net, eur}) => `<tr><td><select id="${fid('offers.'+i+'.programId')}" data-bind="offers.${i}.programId" data-rerender="1">${state.programs.map(x => `<option value="${x.id}"${x.id === o.programId ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select></td><td><select id="${fid('offers.'+i+'.currency')}" data-bind="offers.${i}.currency" data-rerender="1">${['USD','CAD','EUR'].map(c => `<option${c === o.currency ? ' selected' : ''}>${c}</option>`).join('')}</select></td>${['cost','athletic','academic','other'].map(k => `<td><input type="number" id="${fid('offers.'+i+'.'+k)}" data-bind="offers.${i}.${k}" value="${esc(o[k])}" style="width:110px"></td>`).join('')}<td class="num" data-live="off-net-${i}">${money(net, o.currency)}</td><td class="num" data-live="off-eur-${i}"><b>${money(eur)}</b> ${eur === best ? '<span class="pill ok">Moins cher</span>' : ''}</td><td class="num" data-live="off-4-${i}">${money(eur * 4)}</td><td><input type="date" id="${fid('offers.'+i+'.deadline')}" data-bind="offers.${i}.deadline" value="${esc(o.deadline)}"></td><td><button class="btn sm icon danger" data-action="delOffer" data-arg="${i}" aria-label="Supprimer">✕</button></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Aucune offre pour l’instant.</div>'}
  <p class="small muted" style="margin:12px 0 0">Taux utilisés : 1 USD = ${state.settings.rateUsd} €, 1 CAD = ${state.settings.rateCad} €. <a href="#donnees">Mettre à jour les taux</a>. Vérifie si l’aide est renouvelable chaque année et à quelles conditions.</p></section>`;
}

function profileDoc(p, opt) {
  opt = opt || {}; const v = p.visibility; const vids = publicVideosHTML(p, opt.export); const lv = levelOf(p.level);
  const age = ageAt(p.birthDate); const gpa = gpaFrom20(p.academic.average);
  const cls = p.project.availableFrom ? new Date(p.project.availableFrom).getFullYear() : '';
  const clips = playerClips(p.id).filter(c => c.status === 'validé');
  const byType = CLIP_TYPES.map(c => [c[1], clips.filter(x => x.type === c[0]).length]).filter(x => x[1]);
  return `<div class="pp"><div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap"><div><h1>${esc(p.firstName)} ${esc(p.lastName)}</h1><div class="meta">${esc(POS_EN[p.position] || p.position || '')}${p.position2 ? ' / ' + esc(POS_EN[p.position2] || p.position2) : ''} · ${esc(p.club)} · ${esc(lv ? lv[3] : '')}</div><div class="meta">${cls ? 'Available from ' + esc(fdate(p.project.availableFrom)) + ' · ' : ''}${esc(p.nationality)}${p.nationality2 ? ' / ' + esc(p.nationality2) : ''}${age != null ? ' · Age ' + age : ''}</div></div><div style="text-align:right"><div style="font-size:1.875rem;font-weight:700;color:#0b6b4d">${esc(p.height)}<span style="font-size:0.875rem"> cm</span></div><div class="meta">${esc(p.weight)} kg · ${esc({Droit:'Right', Gauche:'Left', 'Les deux':'Both'}[p.foot] || '')} foot</div></div></div>
  ${badgesEN(p)}
  ${vids}
  ${p.bio ? `<h3>Profile</h3><p style="margin:0">${esc(p.bio)}</p>` : ''}${p.strengths ? `<p style="margin:6px 0 0"><b>Strengths:</b> ${esc(p.strengths)}</p>` : ''}
  ${v.showStats ? `<h3>Season ${esc(p.stats.season)}${p.statsValidated ? ' · verified by coach' : ''}</h3><table><tr><th>Matches</th><th>Minutes</th><th>Goals</th><th>Assists</th>${p.position === 'Gardien' ? '<th>Clean sheets</th>' : ''}</tr><tr><td>${esc(p.stats.matches)}</td><td>${esc(p.stats.minutes)}</td><td>${esc(p.stats.goals)}</td><td>${esc(p.stats.assists)}</td>${p.position === 'Gardien' ? `<td>${esc(p.stats.cleanSheets)}</td>` : ''}</tr></table>` : ''}
  ${v.showPhysical ? `<h3>Physical testing${p.testsCertified ? ' · certified (' + esc(p.testsCertified.event || '') + ', ' + esc(fdate(p.testsCertified.date)) + ')' : p.physical.testDate ? ' (self-reported, ' + esc(fdate(p.physical.testDate)) + ')' : ''}</h3><table><tr><th>30 m sprint</th><th>MAS</th><th>Vertical jump</th><th>Yo-Yo IR1</th></tr><tr><td>${p.physical.sprint30 ? esc(p.physical.sprint30) + ' s' : '—'}</td><td>${p.physical.vma ? esc(p.physical.vma) + ' km/h' : '—'}</td><td>${p.physical.jump ? esc(p.physical.jump) + ' cm' : '—'}</td><td>${esc(p.physical.yoyo || '—')}</td></tr></table>` : ''}
  ${p.history.length ? `<h3>Club history</h3><table><tr><th>Season</th><th>Club</th><th>Level</th><th>Apps</th></tr>${p.history.map(h => `<tr><td>${esc(h.season)}</td><td>${esc(h.club)}</td><td>${esc(h.level)}</td><td>${esc(h.apps)}</td></tr>`).join('')}</table>` : ''}
  ${v.showAcademic ? `<h3>Academics</h3><p style="margin:0">${esc(p.academic.diploma === 'Bac obtenu' ? 'French Baccalauréat' : p.academic.diploma)}${p.academic.gradYear ? ' (' + esc(p.academic.gradYear) + ')' : ''}${p.academic.average ? ` · average ${esc(p.academic.average)}/20${gpa != null ? ' (≈ ' + gpa.toFixed(1) + ' GPA, indicative)' : ''}` : ''}${p.academic.englishTest && p.academic.englishTest !== 'Aucun' ? ` · ${esc(p.academic.englishTest)} ${esc(p.academic.englishScore)}` : ''}${p.academic.studyField ? ` · intended field: ${esc(p.academic.studyField)}` : ''}</p>` : ''}
  ${byType.length ? `<h3>Tagged actions</h3><p style="margin:0">${clips.length} tagged clips: ${byType.map(([l, n]) => esc(l) + ' ' + n).join(', ')}.${p.links.highlight ? ` Highlights: ${esc(p.links.highlight)}` : ''}</p>` : (p.links.highlight ? `<h3>Video</h3><p style="margin:0">${esc(p.links.highlight)}</p>` : '')}
  ${p.endorsements.length ? `<h3>Coach reference</h3>${p.endorsements.map(e => `<p style="margin:0 0 6px">“${esc(e.text)}” <span class="meta">${esc(e.coach)}, ${esc(e.club)}</span></p>`).join('')}` : ''}
  ${v.showContacts ? `<h3>Contact</h3><p style="margin:0">${esc(p.email)} · ${esc(p.phone)}${p.links.instagram ? ' · ' + esc(p.links.instagram) : ''}</p>` : ''}
  </div>`;
}
function vPartage() {
  const p = state.player, B = 'player.visibility.';
  const link = `passerelle.app/p/${(hashStr(p.id + p.lastName) % 1e8).toString(36)}`;
  return head('Profil public', 'Une page en anglais, privée par défaut, que tu partages par lien aux entraîneurs, à ta famille et à tes amis.', `<button class="btn" data-action="copyLink">Copier le lien</button><button class="btn" data-action="exportProfile">Exporter en HTML</button>${IN_FRAME ? '' : '<button class="btn" data-action="print">Imprimer / PDF</button>'}`) + `
  <div class="grid" style="grid-template-columns:minmax(0,1fr) 280px;align-items:start">
    <div>${profileDoc(p)}</div>
    <section class="card no-print"><h3>Ce que voient les visiteurs</h3><div class="form" style="grid-template-columns:1fr">${F(B+'showStats','Statistiques','check',{rerender:1})}${F(B+'showPhysical','Données physiques','check',{rerender:1})}${F(B+'showAcademic','Scolarité','check',{rerender:1})}${F(B+'showContacts','Coordonnées','check',{rerender:1})}</div><p class="small muted">Lien (prototype) : <span class="num">${esc(link)}</span></p></section>
  </div>`;
}

