/* ---------- Actions ---------- */
const ACT = {
  role(r) { state.role = r; save(); location.hash = HOME[r]; if (currentRoute() === HOME[r]) render(); },
  closeModal() { closeModal(); },
  readAll(to) { state.notifications.filter(n => n.to === to).forEach(n => n.read = true); save(); render(); },
  addHistory() { state.player.history.push({season:'', club:'', level:'', category:'', apps:''}); save(); render(); },
  delHistory(i) { state.player.history.splice(+i, 1); save(); render(); },
  viewProgram(id) { const pr = findProgram(id); if (pr) openModal(pr.name, programReadHTML(pr), true); },
  editProgram(id) { const i = state.programs.findIndex(p => p.id === id); if (i < 0) return; openModal('Compléter : ' + (state.programs[i].name || 'programme'), `<div class="sec-h"><span data-live="prcomp-${i}">${ring(programCompleteness(state.programs[i]))}</span><button class="btn sm danger" data-action="delProgram" data-arg="${id}">Supprimer ce programme</button></div>${programForm(i)}`, true); },
  newProgram() { const pr = prog({demo:false, name:'', org:'NCAA D2', country:'États-Unis'}); state.programs.unshift(pr); save(); ACT.editProgram(pr.id); },
  delProgram(id) { const pr = findProgram(id); if (!pr) return; if ($('#modal').dataset.confirm !== id) { $('#modal').dataset.confirm = id; toast('Clique à nouveau sur « Supprimer » pour confirmer.'); return; } delete $('#modal').dataset.confirm; state.programs = state.programs.filter(p => p.id !== id); delete state.player.pipeline[id]; save(); closeModal(); toast('Programme supprimé.'); },
  addStaff(i) { state.programs[+i].staff.push(staff('', '', '', '', '')); save(); const id = state.programs[+i].id; if (!$('#modal').hidden) ACT.editProgram(id); else render(); },
  delStaff(a) { const [i, si] = a.split(':').map(Number); state.programs[i].staff.splice(si, 1); save(); if (!$('#modal').hidden) ACT.editProgram(state.programs[i].id); else render(); },
  follow(id) { state.player.pipeline[id] = 'À contacter'; save(); if (!$('#modal').hidden) { $('#modal').hidden = true; } render(); toast('Ajouté à ton suivi.'); },
  unfollow(id) { delete state.player.pipeline[id]; save(); render(); },
  stage(a) { const [id, d] = a.split(':'); const i = STAGES.indexOf(state.player.pipeline[id]); state.player.pipeline[id] = STAGES[Math.max(0, Math.min(STAGES.length - 1, i + Number(d)))]; save(); render(); },
  compose(a) { const [id, si] = String(a || '').split(':'); composeModal(id || (Object.keys(state.player.pipeline)[0] || state.programs[0].id), si != null && si !== '' ? Number(si) : 0); },
  editMsg(id) { composeModal(null, null, id); },
  delMsg(id) { state.messages = state.messages.filter(m => m.id !== id); save(); render(); },
  draftTemplate() { const pr = findProgram(draft.programId); const t = emailTemplate(pr, pr.staff[n0(draft.staffIdx)]); draft.subject = t.subject; draft.body = t.body; renderCompose(); },
  async draftAI() {
    if (!caps.sample || ui.aiBusy) return; ui.aiBusy = true; renderCompose();
    const pr = findProgram(draft.programId), s = pr.staff[n0(draft.staffIdx)] || {}, p = state.player;
    const facts = {player:{name:p.firstName + ' ' + p.lastName, age:ageAt(p.birthDate), position:POS_EN[p.position], secondPosition:POS_EN[p.position2], foot:p.foot, heightCm:p.height, club:p.club, level:(levelOf(p.level) || [])[3], stats:p.stats, statsVerifiedByCoach:p.statsValidated, physical:p.physical, academics:{diploma:p.academic.diploma, average20:p.academic.average, approxGPA:gpaFrom20(p.academic.average), englishTest:p.academic.englishTest, englishScore:p.academic.englishScore, field:p.academic.studyField}, availableFrom:p.project.availableFrom, bio:p.bio, strengths:p.strengths, highlightLink:p.links.highlight, coachReference:p.endorsements[0] ? p.endorsements[0].coach : null, email:p.email, phone:p.phone}, program:{name:pr.name, division:pr.org, needsAtPlayerPosition:n0((pr.needs || {})[p.position]), majors:pr.majors}, coach:{name:s.name, role:s.role}};
    const prompt = `You write recruiting emails from a European football (soccer) player to a college or club coach. Use ONLY the facts in the JSON below; never invent stats, achievements or contacts. If a field is empty, leave it out. Tone: direct, respectful, specific, under 170 words, in English. Mention why this program fits only from the given facts. Reply with JSON only: {"subject": "...", "body": "..."} (body uses \\n for line breaks, signed with the player's name and contacts).\n\nFACTS:\n${JSON.stringify(facts)}`;
    try {
      const res = await caps.sample(prompt, {modelTier:'quick'});
      const txt = (res && res.text) || ''; const j = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
      if (j.subject) draft.subject = j.subject; if (j.body) draft.body = j.body;
    } catch (e) { toast(e && e.code === 'not_granted' ? 'Accès à Claude refusé : modèle de base conservé.' : 'Rédaction indisponible : modèle de base conservé.'); if (e && e.code === 'not_granted') caps.sample = null; }
    ui.aiBusy = false; if (!$('#modal').hidden) renderCompose();
  },
  copyDraft() { copyText(`Subject: ${draft.subject}\n\n${draft.body}`); },
  saveDraft(status) {
    const i = state.messages.findIndex(m => m.id === draft.id); const msg = {...draft, status, date:today()}; delete msg.staffIdx;
    if (i >= 0) state.messages[i] = msg; else state.messages.push(msg);
    if (status === 'envoyé') { const st = state.player.pipeline[draft.programId]; if (!st || st === 'À contacter') state.player.pipeline[draft.programId] = 'Contacté'; }
    save(); closeModal(); toast(status === 'envoyé' ? 'Message marqué comme envoyé, programme passé en « Contacté ».' : 'Brouillon enregistré.');
  },
  addMatch(kind) {
    openModal(kind === 'team' ? 'Importer un match d’équipe' : 'Importer un match', `<div class="form">
      <div class="field wide"><label for="nm_title">Titre</label><input type="text" id="nm_title" value="${esc(state.player.club)} – " placeholder="Équipe A – Équipe B"></div>
      <div class="field"><label for="nm_date">Date</label><input type="date" id="nm_date" value="${today()}"></div>
      <div class="field"><label for="nm_comp">Compétition</label><input type="text" id="nm_comp" value="${esc(levelLabel(state.player.level).split(' (')[0])}"></div>
      <div class="field wide"><label for="nm_file">Fichier vidéo (téléphone, tablette, caméra)</label><input type="file" id="nm_file" accept="video/*"><small>Le fichier reste sur ton appareil. Tu peux aussi le choisir plus tard.</small></div>
      <div class="field wide"><label for="nm_link">Ou lien du match (Veo, YouTube…)</label><input type="url" id="nm_link" placeholder="https://"></div>
      <label class="check"><input type="checkbox" id="nm_fixed" checked>Caméra fixe ou sur trépied</label><label class="check"><input type="checkbox" id="nm_wide" checked>Plan large</label><label class="check"><input type="checkbox" id="nm_num">Numéros lisibles</label><label class="check"><input type="checkbox" id="nm_light" checked>Bonne lumière</label>
    </div>
    <div class="callout small">Conseils de tournage : trépied en hauteur au milieu du terrain, plan large sans zoom, format paysage, 1080p minimum, batterie externe pour 90 minutes.</div>
    <div class="actions"><button class="btn primary" data-action="createMatch" data-arg="${kind}">Créer le match</button></div>`);
  },
  createMatch(kind) {
    const fileEl = $('#nm_file'), file = fileEl && fileEl.files[0];
    const m = {id:uid(), playerId: kind === 'team' ? '' : 'me', team: kind === 'team', title:$('#nm_title').value || 'Match', date:$('#nm_date').value, opponent:'', competition:$('#nm_comp').value, source: file ? 'file' : $('#nm_link').value ? 'link' : 'file', link:$('#nm_link').value, fileName: file ? file.name : '', duration:0, width:0, height:0,
      quality:{fixed:$('#nm_fixed').checked, wide:$('#nm_wide').checked, numbers:$('#nm_num').checked, light:$('#nm_light').checked}, aiPick:null, clips:[], reel:[]};
    state.matches.unshift(m); if (file) videoURLs[m.id] = URL.createObjectURL(file);
    if (kind === 'team') state.notifications.unshift({id:uid(), to:'joueur', text:`Ton entraîneur a importé « ${m.title} » : lance l’analyse pour recevoir tes clips.`, date:today(), read:false});
    save(); ui.matchId = m.id; ui.clipFilter = 'all'; $('#modal').hidden = true; $('#modal').innerHTML = ''; render();
  },
  openMatch(id) { ui.matchId = id; ui.clipFilter = 'all'; render(); },
  backMatches() { PC.reel = null; ui.matchId = null; render(); },
  delMatch(id) { state.matches = state.matches.filter(m => m.id !== id); save(); render(); },
  tag(type) { addTag(type); },
  playClip(id) { playClip(id); },
  nudge(a) { const [id, d] = a.split(':'); const c = curMatch().clips.find(x => x.id === id); if (c) { c.t = Math.max(0, c.t + Number(d)); refreshClips(); } },
  rate(a) { const [id, n] = a.split(':'); const c = curMatch().clips.find(x => x.id === id); if (c) { c.rating = c.rating === +n ? 0 : +n; refreshClips(); } },
  delClip(id) { const m = curMatch(); m.clips = m.clips.filter(c => c.id !== id); m.reel = (m.reel || []).filter(x => x !== id); refreshClips(); },
  acceptClip(id) { const c = curMatch().clips.find(x => x.id === id); if (c) { c.status = 'validé'; c.rating = c.rating || 3; refreshClips(); } },
  acceptAll() { const pid = state.role === 'entraineur' ? null : 'me'; curMatch().clips.filter(c => (!pid || c.playerId === pid) && c.status === 'proposé').forEach(c => { c.status = 'validé'; c.rating = c.rating || 3; }); refreshClips(); },
  reelMove(a) { const [id, d] = a.split(':'); const m = curMatch(); reelClips(m); const i = m.reel.indexOf(id), j = i + Number(d); if (i < 0 || j < 0 || j >= m.reel.length) return; [m.reel[i], m.reel[j]] = [m.reel[j], m.reel[i]]; refreshClips(); },
  reelPlay() { reelStart(false); },
  reelRecord() { reelStart(true); },
  youtube() {
    const m = curMatch(), p = state.player, list = reelClips(m);
    const title = `${p.firstName} ${p.lastName} | ${POS_EN[p.position] || p.position} | Class of ${p.project.availableFrom ? new Date(p.project.availableFrom).getFullYear() : ''} | Highlights`;
    const desc = `${p.firstName} ${p.lastName}, ${POS_EN[p.position] || ''}, ${p.club} (${(levelOf(p.level) || [])[3] || ''}).\nHeight ${p.height} cm · ${p.foot || ''} foot · ${p.nationality}\n\n` + list.map(c => `${tc(c.t)} ${ctype(c.type)[1]}`).join('\n') + `\n\nContact: ${p.email}`;
    openModal('Préparer pour YouTube', `<div class="field"><label for="yt_t">Titre</label><input type="text" id="yt_t" value="${esc(title)}"></div><div class="field"><label for="yt_d">Description</label><textarea id="yt_d" rows="9">${esc(desc)}</textarea></div><div class="callout small">Mets la vidéo en « Non répertoriée » : seuls ceux qui ont le lien la voient. Ajoute ensuite le lien dans ton profil.</div><div class="actions"><button class="btn" data-action="copyYT">Copier titre et description</button><a class="btn primary" href="https://www.youtube.com/upload" target="_blank" rel="noopener">Ouvrir YouTube</a></div>`);
  },
  copyYT() { copyText($('#yt_t').value + '\n\n' + $('#yt_d').value); },
  aiOpen() {
    const m = curMatch(), u = usage();
    if (state.role === 'entraineur') { const lim = plan('entraineur').lim.teamAnalyses; if (u.teamAnalyses >= lim) { upsell(`Le club partenaire inclut ${lim} analyses de matchs d’équipe par mois. La licence club les rend illimitées.`, 'entraineur'); return; } }
    else { const lim = plan('joueur').lim.analyses; if (u.analyses >= lim) { upsell(`Ton offre inclut ${lim} analyse${lim > 1 ? 's' : ''} automatique${lim > 1 ? 's' : ''} par mois (le calcul vidéo a un coût réel). Le marquage manuel reste illimité.`, 'joueur'); return; } }
    ui.pick = m.aiPick; aiModal();
  },
  pick(i) { ui.pick = +i; aiModal(); },
  aiRun() { aiRun(); },
  addOffer() { state.offers.push({id:uid(), programId:(Object.keys(state.player.pipeline)[0] || state.programs[0].id), cost:'', athletic:'', academic:'', other:'', currency:'USD', deadline:'', notes:''}); save(); render(); },
  delOffer(i) { state.offers.splice(+i, 1); save(); render(); },
  copyLink() { copyText('https://' + `passerelle.app/p/${(hashStr(state.player.id + state.player.lastName) % 1e8).toString(36)}`); },
  exportProfile() { saveFile(`profil-${(state.player.lastName || 'joueur').toLowerCase()}.html`, profileExportHTML()); },
  print() { try { window.print(); } catch (e) {} },
  async aiSummary() {
    if (!caps.sample) return; const p = state.player; toast('Rédaction en cours…');
    try {
      const res = await caps.sample(`Write a 3-sentence player bio in English for a college soccer recruiting profile. Use ONLY these facts, invent nothing: ${JSON.stringify({position:POS_EN[p.position], foot:p.foot, height:p.height, club:p.club, level:(levelOf(p.level) || [])[3], stats:p.stats, strengths:p.strengths, frenchBio:p.bio, goals:p.project.goals})}. Reply with the bio text only.`, {modelTier:'quick'});
      openModal('Résumé en anglais', `<textarea id="copyArea" rows="7">${esc((res && res.text || '').trim())}</textarea><div class="actions"><button class="btn primary" data-action="copyArea">Copier</button></div><p class="tiny muted" style="margin:0">Relis-le : il doit rester fidèle à ton profil.</p>`);
    } catch (e) { toast('Rédaction indisponible.'); if (e && e.code === 'not_granted') caps.sample = null; }
  },
  copyArea() { copyText($('#copyArea').value); },
  addPlayer() {
    openModal('Ajouter un joueur à l’effectif', `<div class="form"><div class="field"><label for="np_f">Prénom</label><input type="text" id="np_f"></div><div class="field"><label for="np_l">Nom</label><input type="text" id="np_l"></div><div class="field"><label for="np_p">Poste</label><select id="np_p">${POS.map(x => `<option>${x}</option>`).join('')}</select></div><div class="field"><label for="np_g">Sexe</label><select id="np_g"><option>Homme</option><option>Femme</option></select></div><div class="field"><label for="np_b">Date de naissance</label><input type="date" id="np_b"></div><div class="field"><label for="np_e">E-mail (invitation)</label><input type="email" id="np_e"></div></div><div class="callout small">Le joueur reçoit le code ${esc(state.coach.inviteCode)} et complète lui-même son profil. S’il est mineur, le consentement parental est demandé.</div><div class="actions"><button class="btn primary" data-action="createPlayer">Ajouter</button></div>`);
  },
  createPlayer() {
    const f = $('#np_f').value.trim(), l = $('#np_l').value.trim(); if (!f || !l) { toast('Prénom et nom sont nécessaires.'); return; }
    state.others.push(P({firstName:f, lastName:l, position:$('#np_p').value, gender:$('#np_g').value, birthDate:$('#np_b').value, email:$('#np_e').value, club:state.coach.club, level:'n3', teamId:'team1'}));
    save(); closeModal(); toast(`${f} ${l} ajouté à l’effectif.`);
  },
  endorse(id) { const p = findPlayer(id); openModal(`Recommander ${p.firstName} ${p.lastName}`, `<div class="field"><label for="en_t">Recommandation</label><textarea id="en_t" rows="6" placeholder="Ce que tu as vu, sur quelle durée, à quel niveau. Factuel et précis."></textarea><small>Affichée sur son profil public, signée de ton nom et de ton club.</small></div><div class="actions"><button class="btn primary" data-action="saveEndorse" data-arg="${id}">Publier sur son profil</button></div>`); },
  saveEndorse(id) { const t = $('#en_t').value.trim(); if (!t) { toast('Écris la recommandation.'); return; } const p = findPlayer(id); p.endorsements.unshift({id:uid(), coach:state.coach.firstName + ' ' + state.coach.lastName, club:state.coach.club, date:today(), text:t}); if (p.id === 'me') state.notifications.unshift({id:uid(), to:'joueur', text:`${state.coach.firstName} ${state.coach.lastName} t’a recommandé.`, date:today(), read:false}); save(); closeModal(); toast('Recommandation publiée.'); },
  openProspect(id) {
    const p = findPlayer(id); if (!p) return;
    if (state.role === 'recruteur') {
      const u = usage(), lim = plan('recruteur').lim.profiles;
      if (!u.recProfiles.includes(id)) { if (u.recProfiles.length >= lim) { upsell(`L’offre gratuite permet ${lim} profils complets par mois. Recruteur Pro les rend illimités.`, 'recruteur'); return; } u.recProfiles.push(id); if (id === 'me') logView('profil', 'me'); save(); }
    } const pr = myProgram(); const r = matchScore(p, pr); const sl = state.shortlist.find(s => s.playerId === id);
    openModal(`${p.firstName} ${p.lastName}`, `<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><div class="score ${scoreClass(r.score)}">${r.score}</div><div class="reasons" style="flex:1">${reasonsHTML(r)}</div>${state.role === 'recruteur' ? `<div class="actions">${sl ? `<span class="pill acc">${esc(sl.stage)}</span>` : `<button class="btn sm" data-action="shortlistAdd" data-arg="${id}">Shortlist</button>`}<button class="btn sm primary" data-action="requestContact" data-arg="${id}">Demander un contact</button></div>` : ''}</div>
    ${profileDoc(p)}<div><h3 style="margin-bottom:8px">Éligibilité (déclarative)</h3><div class="list">${eligibility(p).map(i => `<div class="row"><span class="dot ${i.s}"></span><span class="grow small"><b>${esc(i.l)}</b> · ${esc(i.d)}</span></div>`).join('')}</div></div>`, true);
  },
  shortlistAdd(id) { if (!state.shortlist.some(s => s.playerId === id)) state.shortlist.push({playerId:id, stage:'Repéré', note:''}); save(); if (!$('#modal').hidden) ACT.openProspect(id); else render(); toast('Ajouté à la shortlist.'); },
  slDel(i) { state.shortlist.splice(+i, 1); save(); render(); },
  requestContact(id) {
    const p = findPlayer(id), pr = myProgram(), rc = state.recruiter;
    { const u = usage(), lim = plan('recruteur').lim.contacts; if (u.recContacts >= lim) { upsell(`L’offre gratuite permet ${lim} demandes de contact par mois.`, 'recruteur'); return; } u.recContacts++; }
    let s = state.shortlist.find(x => x.playerId === id); if (!s) { s = {playerId:id, stage:'Contacté', note:''}; state.shortlist.push(s); } else s.stage = 'Contacté';
    if (id === 'me') {
      state.notifications.unshift({id:uid(), to:'joueur', text:`${rc.name} (${pr.name}) souhaite te contacter.`, date:today(), read:false});
      state.messages.push({id:uid(), programId:pr.id, coachName:rc.name, coachEmail:rc.email, subject:`${pr.name}: interest in your profile`, body:`Hi ${p.firstName}, I watched your clips and would like to schedule a call about ${pr.name}. Could you share your availability and a full match?\n${rc.name}, ${rc.role}`, status:'reçu', dir:'in', date:today()});
      if (!state.player.pipeline[pr.id] || STAGES.indexOf(state.player.pipeline[pr.id]) < 2) state.player.pipeline[pr.id] = 'Intérêt';
    }
    save(); if (!$('#modal').hidden) { $('#modal').hidden = true; $('#modal').innerHTML = ''; } render();
    toast(id === 'me' ? 'Demande envoyée : visible dans l’espace Joueur.' : 'Demande enregistrée (démo).');
  },
  compareShow() {
    const ps = ui.compare.map(findPlayer).filter(Boolean), pr = myProgram();
    const rows = [['Score', p => matchScore(p, pr).score], ['Poste', p => p.position], ['Âge', p => ageAt(p.birthDate) ?? '—'], ['Club', p => p.club], ['Niveau', p => levelLabel(p.level)], ['Taille', p => p.height ? p.height + ' cm' : '—'], ['Pied', p => p.foot || '—'], ['Matchs / minutes', p => `${p.stats.matches || '—'} / ${p.stats.minutes || '—'}`], ['Buts / passes déc.', p => `${p.stats.goals || 0} / ${p.stats.assists || 0}`], ['Sprint 30 m', p => p.physical.sprint30 ? p.physical.sprint30 + ' s' : '—'], ['VMA', p => p.physical.vma ? p.physical.vma + ' km/h' : '—'], ['GPA estimé', p => gpaFrom20(p.academic.average) != null ? gpaFrom20(p.academic.average).toFixed(2) : '—'], ['Anglais', p => p.academic.englishTest && p.academic.englishTest !== 'Aucun' ? p.academic.englishTest + ' ' + p.academic.englishScore : '—'], ['Budget max', p => p.project.budgetMax ? money(p.project.budgetMax) : '—'], ['Clips', p => clipCount(p)], ['Stats validées', p => p.statsValidated ? 'Oui' : 'Non']];
    openModal('Comparaison', `<div class="tablewrap compare"><table><thead><tr><th></th>${ps.map(p => `<th>${esc(p.firstName)} ${esc(p.lastName)}</th>`).join('')}</tr></thead><tbody>${rows.map(([l, f]) => `<tr><th>${esc(l)}</th>${ps.map(p => `<td class="num">${esc(f(p))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`, true);
  },
  exportJSON() { saveFile('passerelle-donnees.json', JSON.stringify(state, null, 2)); },
  reset() { if ($('#app').dataset.confirmReset !== '1') { $('#app').dataset.confirmReset = '1'; toast('Clique à nouveau pour remplacer tes données par les exemples.'); setTimeout(() => delete $('#app').dataset.confirmReset, 4000); return; } delete $('#app').dataset.confirmReset; state = migrate(demoState()); save(); location.hash = 'accueil'; render(); toast('Données d’exemple restaurées.'); },
  async saveArtifact() {
    if (!caps.artifact) return; save();
    const json = JSON.stringify(state).replace(/</g, '\\u003c');
    const html = SOURCE.replace(/(<script id="state-seed" type="application\/json">)[\s\S]*?(<\/script>)/, (m0, a, b) => a + json + b);
    try { await caps.artifact.publish(html); toast('Enregistré dans l’artefact.'); }
    catch (e) { toast(e && (e.code === 'not_writer' || e.code === 'not_granted') ? 'Tu n’as pas les droits d’écriture sur cet artefact.' : e && e.code === 'conflict' ? 'Une autre version a été enregistrée entre-temps.' : 'Enregistrement impossible.'); }
  }
};
const CHANGE_ACT = {
  toggleReel(id, el) { const c = curMatch().clips.find(x => x.id === id); if (c) { c.inReel = el.checked; refreshClips(); } },
  validateStats(id, el) { const p = findPlayer(id); p.statsValidated = el.checked; if (p.id === 'me' && el.checked) state.notifications.unshift({id:uid(), to:'joueur', text:'Ton entraîneur a validé tes statistiques de la saison.', date:today(), read:false}); save(); render(); },
  compareToggle(id, el) { if (el.checked) { if (ui.compare.length >= 3) { el.checked = false; toast('Trois joueurs maximum.'); return; } ui.compare.push(id); } else ui.compare = ui.compare.filter(x => x !== id); render(); }
};

