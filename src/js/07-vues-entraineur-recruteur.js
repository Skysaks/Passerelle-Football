/* ---------- Vues entraîneur ---------- */
function roster() { return allPlayers(true).filter(p => p.teamId === 'team1'); }
function vCoachAccueil() {
  const c = state.coach, r = roster(), tm = state.matches.filter(m => m.team);
  const pend = tm.flatMap(m => m.clips).filter(x => x.status === 'proposé').length;
  const notifs = state.notifications.filter(n => n.to === 'entraineur');
  return head(`Bonjour ${c.firstName}`, esc(c.teamName), `<button class="btn primary" data-action="addMatch" data-arg="team">Importer un match d’équipe</button>`) + `
  <div class="grid g4"><div class="card kpi">${ring(coachCompleteness(c))}<span class="l">Mon profil</span></div><div class="card kpi"><span class="v">${r.length}</span><span class="l">Joueurs dans l’effectif</span></div><div class="card kpi"><span class="v">${tm.length}</span><span class="l">Matchs importés</span></div><div class="card kpi"><span class="v">${pend}</span><span class="l">Clips à valider</span></div></div>
  <div class="grid g2" style="margin-top:16px"><section class="card"><h3>Effectif <a class="btn sm" href="#coach-effectif">Gérer</a></h3><div class="list">${r.map(p => `<div class="row"><div class="grow"><div class="t">${esc(p.firstName)} ${esc(p.lastName)}</div><div class="small muted">${esc(p.position)} · profil ${playerCompleteness(p).pct} %</div></div>${p.statsValidated ? '<span class="pill ok">Stats validées</span>' : '<span class="pill">Stats à valider</span>'}</div>`).join('')}</div></section>
  <section class="card"><h3>Notifications</h3><div class="list">${notifs.map(n => `<div class="row"><span class="dot ${n.read ? '' : 'info'}" style="${n.read ? 'background:var(--line)' : ''}"></span><span class="grow">${esc(n.text)}</span><span class="small muted">${fdate(n.date)}</span></div>`).join('') || '<div class="empty">Rien de neuf.</div>'}</div>
  <div class="callout" style="margin-top:12px">Code d’invitation de l’effectif : <b class="num">${esc(c.inviteCode)}</b>. Chaque joueur qui le saisit reçoit son compte avec ses clips.</div></section></div>`;
}
function vCoachProfil() {
  const B = 'coach.';
  return head('Mon profil d’entraîneur', 'Ton profil appuie les recommandations que tu donnes à tes joueurs.', `<span data-live="ccomp">${ring(coachCompleteness(state.coach))}</span>`) + `<div class="stack"><section class="card"><div class="sec"><h3>Identité</h3><div class="form">${F(B+'firstName','Prénom')}${F(B+'lastName','Nom')}${F(B+'email','E-mail','email')}${F(B+'phone','Téléphone','tel')}${F(B+'languages','Langues')}${F(B+'licence','N° de licence ou d’éducateur')}</div></div></section>
  <section class="card"><div class="sec"><h3>Poste actuel</h3><div class="form">${F(B+'club','Club')}${F(B+'role','Fonction','select',{options:['Entraîneur principal','Entraîneur adjoint','Entraîneur des gardiens','Préparateur physique','Directeur technique','Responsable de la formation']})}${F(B+'categories','Catégories encadrées')}${F(B+'teamName','Nom de l’équipe')}</div></div>
  <div class="sec"><h3>Formation et méthode</h3><div class="form">${F(B+'diplomas','Diplôme le plus élevé','select',{options:COACH_DIPLOMAS})}${F(B+'experienceYears','Années d’expérience','number')}${F(B+'system','Système préféré',undefined,{ph:'4-3-3'})}${F(B+'philosophy','Philosophie de jeu','textarea',{wide:true})}${F(B+'bio','Parcours','textarea',{wide:true})}</div></div></section></div>`;
}
function vCoachEffectif() {
  const r = roster();
  return head('Effectif', 'Valide les statistiques, recommande tes joueurs et suis leurs profils.', `<button class="btn primary" data-action="addPlayer">Ajouter un joueur</button>`) + `
  <section class="card"><div class="tablewrap"><table><thead><tr><th>Joueur</th><th>Poste</th><th>Âge</th><th>Profil</th><th>Clips</th><th>Stats validées</th><th>Vidéos confirmées</th><th></th></tr></thead><tbody>${r.map(p => `<tr><td><b>${esc(p.firstName)} ${esc(p.lastName)}</b><div class="small muted">${esc(levelLabel(p.level))}</div></td><td>${esc(p.position)}</td><td class="num">${ageAt(p.birthDate) ?? '—'}</td><td style="min-width:120px"><div class="bar"><i style="width:${playerCompleteness(p).pct}%"></i></div><span class="small num">${playerCompleteness(p).pct} %</span></td><td class="num">${clipCount(p)}</td><td><label class="check"><input type="checkbox" data-action-change="validateStats" data-arg="${p.id}"${p.statsValidated ? ' checked' : ''}><span class="small">${p.statsValidated ? 'Oui' : 'Non'}</span></label></td><td><label class="check"><input type="checkbox" data-action-change="videosVerified" data-arg="${p.id}"${p.videosVerified ? ' checked' : ''}><span class="small">${p.videosVerified ? 'Oui' : 'Non'}</span></label></td><td><div class="actions"><button class="btn sm" data-action="endorse" data-arg="${p.id}">Recommander</button><button class="btn sm" data-action="openProspect" data-arg="${p.id}">Voir</button></div></td></tr>`).join('')}</tbody></table></div></section>`;
}
function vCoachMatchs() {
  if (ui.matchId && state.matches.find(m => m.id === ui.matchId)) return vMatch();
  ui.matchId = null;
  const tm = state.matches.filter(m => m.team);
  return head('Matchs d’équipe', 'Un match importé : chaque joueur de l’effectif reçoit ses clips dans son compte.', `<button class="btn primary" data-action="addMatch" data-arg="team">Importer un match d’équipe</button>`) + `<div class="grid g2">${tm.map(m => matchCard(m, null)).join('') || '<div class="empty">Aucun match d’équipe.</div>'}</div>`;
}

/* ---------- Vues recruteur ---------- */
function myProgram() { return findProgram(state.recruiter.programId) || state.programs[0]; }
function vRecAccueil() {
  const pr = myProgram(), sl = state.shortlist, needs = Object.entries(pr.needs || {}).filter(([, n]) => n0(n) > 0);
  const top = allPlayers().map(p => ({p, r:matchScore(p, pr)})).filter(x => !x.r.excluded).sort((a, b) => b.r.score - a.r.score).slice(0, 4);
  return head(`${state.recruiter.name}`, `${esc(state.recruiter.role)} · ${esc(pr.name)}`, `<a class="btn primary" href="#prospects">Chercher des prospects</a>`) + `
  <div class="grid g4"><div class="card kpi">${ring(programCompleteness(pr))}<span class="l">Fiche programme</span></div><div class="card kpi"><span class="v">${needs.reduce((s, [, n]) => s + n0(n), 0)}</span><span class="l">Places à pourvoir</span></div><div class="card kpi"><span class="v">${sl.length}</span><span class="l">Joueurs en shortlist</span></div><div class="card kpi"><span class="v">${allPlayers().length}</span><span class="l">Profils visibles</span></div></div>
  <div class="grid g2" style="margin-top:16px"><section class="card"><h3>Besoins publiés <a class="btn sm" href="#recruteur-programme">Modifier</a></h3><div class="chips">${needs.map(([pos, n]) => `<span class="pill acc">${esc(pos)} × ${n}</span>`).join('') || '<span class="muted">Aucun besoin publié.</span>'}</div></section>
  <section class="card"><h3>Meilleurs prospects pour ce programme</h3><div class="list">${top.map(({p, r}) => `<div class="row"><div class="score ${scoreClass(r.score)}">${r.score}</div><div class="grow"><div class="t">${esc(p.firstName)} ${esc(p.lastName)}</div><div class="small muted">${esc(p.position)} · ${esc(p.club)} · ${esc(p.country)}</div></div><button class="btn sm" data-action="openProspect" data-arg="${p.id}">Voir</button></div>`).join('')}</div></section></div>`;
}
function vRecProgramme() {
  const pr = myProgram(), i = state.programs.indexOf(pr);
  return head('Mon programme', 'Cette fiche alimente le matching côté joueurs : plus elle est complète, mieux ils te trouvent.', `<span data-live="prcomp-${i}">${ring(programCompleteness(pr))}</span>`) + `<div class="stack">${programForm(i)}</div>`;
}
function vProspects() {
  const pr = myProgram(), f = ui.prospects;
  const list = filterProspects(f, pr);
  return head('Prospects', `Profils de joueurs visibles, classés selon les besoins de ${esc(pr.name)}.`, `<button class="btn" data-action="saveSearch">Enregistrer la recherche</button>` + (ui.compare.length >= 2 ? `<button class="btn primary" data-action="compareShow">Comparer (${ui.compare.length})</button>` : `<span class="small muted">Coche 2 ou 3 joueurs pour les comparer</span>`)) + `
  <div class="filters">
    <div class="field"><label for="pf_q">Recherche</label><input type="search" id="pf_q" data-ui="prospects.q" value="${esc(f.q)}" placeholder="Nom, club, ville"></div>
    <div class="field"><label for="pf_g">Sexe</label><select id="pf_g" data-ui="prospects.gender"><option value="all">Tous</option>${['Homme','Femme'].map(g => `<option${f.gender === g ? ' selected' : ''}>${g}</option>`).join('')}</select></div>
    <div class="field"><label for="pf_p">Poste</label><select id="pf_p" data-ui="prospects.pos"><option value="all">Tous</option>${POS.map(x => `<option${f.pos === x ? ' selected' : ''}>${x}</option>`).join('')}</select></div>
    <div class="field"><label for="pf_l">Niveau minimum</label><select id="pf_l" data-ui="prospects.level"><option value="0">Tous</option><option value="2.5"${f.level === '2.5' ? ' selected' : ''}>Régional 2 et +</option><option value="3"${f.level === '3' ? ' selected' : ''}>Régional 1 et +</option><option value="3.5"${f.level === '3.5' ? ' selected' : ''}>National 3 / U19 Nat. et +</option><option value="4"${f.level === '4' ? ' selected' : ''}>National 2 et +</option></select></div>
    <div class="field"><label for="pf_h">Taille min. (cm)</label><input type="number" id="pf_h" data-ui="prospects.minH" value="${esc(f.minH)}"></div>
    <div class="field"><label for="pf_f">Pied</label><select id="pf_f" data-ui="prospects.foot"><option value="all">Tous</option>${['Droit','Gauche','Les deux'].map(x => `<option${f.foot === x ? ' selected' : ''}>${x}</option>`).join('')}</select></div>
    <label class="check"><input type="checkbox" id="pf_e" data-ui="prospects.eng"${f.eng ? ' checked' : ''}>Test d’anglais</label>
    <label class="check"><input type="checkbox" id="pf_v" data-ui="prospects.video"${f.video ? ' checked' : ''}>Vidéo disponible</label>
    <label class="check"><input type="checkbox" id="pf_b" data-ui="prospects.budget"${f.budget ? ' checked' : ''}>Budget compatible</label>
    <label class="check"><input type="checkbox" id="pf_id" data-ui="prospects.verified"${f.verified ? ' checked' : ''}>Identité vérifiée</label>
    <label class="check"><input type="checkbox" id="pf_m" data-ui="prospects.measured"${f.measured ? ' checked' : ''}>Données mesurées sur vidéo</label>
    <div class="field"><label for="pf_pr">Indice de preuve min.</label><select id="pf_pr" data-ui="prospects.proof"><option value="0">Tous</option>${[40, 60, 75].map(x => `<option value="${x}"${String(f.proof) === String(x) ? ' selected' : ''}>${x} et +</option>`).join('')}</select></div>
  </div>
  <div class="grid g3">${list.map(({p, r}) => { const sl = state.shortlist.find(s => s.playerId === p.id); const el = eligibility(p); const bad = el.filter(x => x.s === 'bad').length, warn = el.filter(x => x.s === 'warn').length; return `<article class="card" style="display:flex;flex-direction:column;gap:10px"><div style="display:flex;gap:12px;align-items:center"><div class="score ${scoreClass(r.score)}">${r.score}</div><div style="min-width:0"><div style="font-weight:650">${esc(p.firstName)} ${esc(p.lastName)}</div><div class="small muted">${esc(p.position)} · ${esc(p.nationality)} · ${ageAt(p.birthDate) ?? '—'} ans</div></div></div>
    <div class="prog-meta"><span>${esc(p.club)}</span><span>${esc(levelLabel(p.level))}</span><span>${esc(p.height)} cm</span><span>Pied ${esc((p.foot || '—').toLowerCase())}</span></div>
    <div class="chips"><span class="pill ${bad ? 'bad' : warn ? 'warn' : 'ok'}">Éligibilité ${bad ? 'bloquante' : warn + ' point' + (warn > 1 ? 's' : '') + ' à vérifier'}</span><span class="pill ${proofIndex(p) >= 60 ? 'ok' : ''}" title="Indice de preuve">Preuve ${proofIndex(p)}</span><span class="pill">${clipCount(p)} clips</span><span class="pill">${(p.videos || []).filter(v => v.visible).length} vidéo${(p.videos || []).filter(v => v.visible).length > 1 ? 's' : ''}</span>${p.verified && p.verified.identity ? '<span class="pill ok">ID vérifiée</span>' : ''}${p.statsValidated ? '<span class="pill ok">Stats validées</span>' : ''}${p.testsCertified ? '<span class="pill acc">Tests certifiés</span>' : ''}</div>
    <div class="actions" style="margin-top:auto"><button class="btn sm primary" data-action="openProspect" data-arg="${p.id}">Voir le profil</button>${sl ? `<span class="pill acc">${esc(sl.stage)}</span>` : `<button class="btn sm" data-action="shortlistAdd" data-arg="${p.id}">Shortlist</button>`}<label class="check small" style="margin-left:auto"><input type="checkbox" data-action-change="compareToggle" data-arg="${p.id}"${ui.compare.includes(p.id) ? ' checked' : ''}>Comparer</label></div></article>`; }).join('') || '<div class="empty">Aucun profil pour ces filtres.</div>'}</div>`;
}
function vShortlist() {
  const pr = myProgram();
  return head('Shortlist', 'Ton tableau de recrutement : statut, notes, prochaines actions.', `<button class="btn" data-action="exportCSV">Exporter en CSV</button>`) + `<section class="card">${state.shortlist.length ? `<div class="tablewrap"><table><thead><tr><th>Joueur</th><th>Poste</th><th>Score</th><th>Statut</th><th>Note</th><th></th></tr></thead><tbody>${state.shortlist.map((s, i) => { const p = findPlayer(s.playerId); if (!p) return ''; return `<tr><td><b>${esc(p.firstName)} ${esc(p.lastName)}</b><div class="small muted">${esc(p.club)}</div></td><td>${esc(p.position)}</td><td class="num">${matchScore(p, pr).score}</td><td><select id="${fid('shortlist.'+i+'.stage')}" data-bind="shortlist.${i}.stage">${SL_STAGES.map(x => `<option${x === s.stage ? ' selected' : ''}>${x}</option>`).join('')}</select></td><td style="min-width:220px"><input type="text" id="${fid('shortlist.'+i+'.note')}" data-bind="shortlist.${i}.note" value="${esc(s.note)}" placeholder="Note interne"></td><td><div class="actions"><button class="btn sm" data-action="openProspect" data-arg="${p.id}">Voir</button><button class="btn sm" data-action="requestContact" data-arg="${p.id}">Demander un contact</button><button class="btn sm icon danger" data-action="slDel" data-arg="${i}" aria-label="Retirer">✕</button></div></td></tr>`; }).join('')}</tbody></table></div>` : '<div class="empty">Ajoute des joueurs depuis Prospects.</div>'}</section>`;
}

