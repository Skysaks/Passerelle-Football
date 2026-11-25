/* ---------- Actions : médias, offres, abonnements ---------- */
Object.assign(ACT, {
  goPlans(role) { $('#modal').hidden = true; $('#modal').innerHTML = ''; location.hash = PLAN_ROUTE[role || state.role]; render(); },
  payConfirm() { const f = ui.pay; ui.pay = null; $('#modal').hidden = true; $('#modal').innerHTML = ''; if (f) f(); save(); render(); },
  choosePlan(k) {
    const pl = PLANS[k]; if (!pl) return;
    payModal(`Offre ${pl.name}`, pl.price, pl.cur, () => { state.plans[pl.role] = k; if (pl.price) bill(`${pl.role === 'recruteur' ? 'Recruteur' : pl.role === 'entraineur' ? 'Licence club' : 'Abonnement'} ${pl.name}`, pl.price, pl.cur); toast(`Offre ${pl.name} activée.`); }, pl.per ? 'par ' + pl.per : '');
  },
  buyAcc(k) { const a = ACC.find(x => x.k === k); payModal('Accompagnement ' + a.name, a.price, 'EUR', () => { bill('Accompagnement ' + a.name, a.price); state.notifications.unshift({id:uid(), to:'joueur', text:`Accompagnement ${a.name} : un conseiller te contacte sous 48 h pour fixer la première séance.`, date:today(), read:false}); toast('Forfait souscrit.'); }, 'Paiement unique, possible en 3 fois'); },
  addVideoLink() {
    openModal('Ajouter un lien vidéo', `<div class="form"><div class="field wide"><label for="vl_url">Lien (YouTube non répertorié, Veo, Hudl, Trace…)</label><input type="url" id="vl_url" placeholder="https://"></div><div class="field"><label for="vl_t">Titre</label><input type="text" id="vl_t" value="Temps forts"></div><div class="field"><label for="vl_ty">Type</label><select id="vl_ty">${['Temps forts','Match complet','Séquence technique','Tests physiques','Présentation en anglais'].map(t => `<option>${t}</option>`).join('')}</select></div></div><p class="small muted" style="margin:0">Le lien s’ouvre dans un nouvel onglet : les lecteurs d’autres sites ne s’intègrent pas ici.</p><div class="actions"><button class="btn primary" data-action="saveVideoLink">Ajouter</button></div>`);
  },
  saveVideoLink() {
    const url = $('#vl_url').value.trim(); if (!/^https?:\/\//.test(url)) { toast('Saisis un lien complet, commençant par https://'); return; }
    const p = state.player, lim = plan('joueur').lim.videos; if (p.videos.length >= lim) { upsell(`Limite de ${lim} vidéos atteinte.`, 'joueur'); return; }
    p.videos.push({id:uid(), title:$('#vl_t').value || 'Vidéo', type:$('#vl_ty').value, date:today(), duration:0, thumb:'', featured:!p.videos.some(x => x.featured), visible:true, demo:false, source:'link', link:url, assetId:'', localKey:'', sizeMB:0});
    save(); closeModal(); toast('Lien ajouté au profil.');
  },
  playVideo(id) { playVideoModal(id); },
  featureVideo(id) { state.player.videos.forEach(v => v.featured = v.id === id); save(); render(); },
  moveVideo(a) { const [id, d] = a.split(':'); const arr = state.player.videos, i = arr.findIndex(v => v.id === id), j = i + Number(d); if (i < 0 || j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; save(); render(); },
  async downloadVideo(id) { const v = findVideo(id); try { const b = await IDB.get(v.localKey); if (b) saveFile(`${(v.title || 'video').replace(/[^\w\-]+/g, '-').toLowerCase()}.${(b.type || '').includes('mp4') ? 'mp4' : 'webm'}`, b); } catch (e) { toast('Fichier introuvable sur cet appareil.'); } },
  async delVideo(id) {
    const p = state.player, v = p.videos.find(x => x.id === id); if (!v) return;
    if ($('#app').dataset.delv !== id) { $('#app').dataset.delv = id; toast('Clique à nouveau sur ✕ pour supprimer cette vidéo.'); setTimeout(() => { if ($('#app').dataset.delv === id) delete $('#app').dataset.delv; }, 4000); return; }
    delete $('#app').dataset.delv;
    if (v.localKey) { try { await IDB.del(v.localKey); } catch (e) {} }
    if (v.assetId && caps.assets) { try { await caps.assets.delete(v.assetId); } catch (e) {} }
    p.videos = p.videos.filter(x => x.id !== id); if (v.featured && p.videos[0]) p.videos[0].featured = true; save(); render(); toast('Vidéo supprimée.');
  },
  async downloadDoc(k) { const x = state.player.docs[k]; try { const b = await IDB.get(x.localKey); if (b) saveFile(x.name, b); } catch (e) { toast('Fichier introuvable sur cet appareil.'); } },
  verifyId() { state.player.docs.passport.status = 'vérifié'; state.player.verified.identity = true; state.notifications.unshift({id:uid(), to:'joueur', text:'Ton identité est vérifiée : le badge est visible sur ton profil.', date:today(), read:false}); save(); render(); },
  runSearch(id) { const s = state.savedSearches.find(x => x.id === id); if (!s) return; Object.assign(ui.prospects, s.filters); s.seen = filterProspects(s.filters, myProgram()).map(x => x.p.id); save(); location.hash = 'prospects'; },
  delSearch(id) { state.savedSearches = state.savedSearches.filter(x => x.id !== id); save(); render(); },
  saveSearch() {
    if (!plan('recruteur').lim.saved) { upsell('Les recherches enregistrées et les alertes font partie de Recruteur Pro.', 'recruteur'); return; }
    openModal('Enregistrer la recherche', `<div class="field"><label for="ss_n">Nom</label><input type="text" id="ss_n" value="${esc((ui.prospects.pos !== 'all' ? ui.prospects.pos : 'Tous postes') + (ui.prospects.eng ? ', anglais' : ''))}"></div><label class="check"><input type="checkbox" id="ss_a" checked>M’alerter par e-mail des nouveaux profils</label><div class="actions"><button class="btn primary" data-action="saveSearchOk">Enregistrer</button></div>`);
  },
  saveSearchOk() { state.savedSearches.unshift({id:uid(), name:$('#ss_n').value || 'Recherche', filters:{...ui.prospects}, alert:$('#ss_a').checked, created:today(), seen:filterProspects(ui.prospects, myProgram()).map(x => x.p.id)}); save(); closeModal(); toast('Recherche enregistrée.'); },
  exportCSV() {
    if (!plan('recruteur').lim.csv) { upsell('L’export CSV de la shortlist fait partie de Recruteur Pro.', 'recruteur'); return; }
    const pr = myProgram(), q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [['Prénom','Nom','Poste','Club','Niveau','Âge','Taille','Score','Statut','Note','E-mail'].map(q).join(',')].concat(state.shortlist.map(s => { const p = findPlayer(s.playerId); if (!p) return null; return [p.firstName, p.lastName, p.position, p.club, levelLabel(p.level), ageAt(p.birthDate), p.height, matchScore(p, pr).score, s.stage, s.note, p.visibility.showContacts ? p.email : ''].map(q).join(','); }).filter(Boolean));
    saveFile('shortlist.csv', rows.join('\n'));
  },
  evRegister(id) {
    const ev = state.events.find(e => e.id === id), price = plan('joueur').lim.audience ? ev.proPrice : ev.price;
    payModal(ev.name, price, 'EUR', () => { ev.me = true; ev.registered++; bill('Détection · ' + ev.name, price); state.notifications.unshift({id:uid(), to:'joueur', text:`Inscription confirmée : ${ev.name}, le ${fdate(ev.date)}.`, date:today(), read:false}); toast('Inscription confirmée.'); }, `${fdate(ev.date)} · ${ev.city}`);
  },
  evResults(id) {
    const ev = state.events.find(e => e.id === id), p = state.player; ev.results = true;
    p.testsCertified = {date:ev.date, event:ev.name, sprint30:p.physical.sprint30, vma:p.physical.vma, jump:p.physical.jump};
    const r = rng(hashStr(ev.id)); const clips = Array.from({length:7}, () => ({id:uid(), type:['touche','passe-cle','recup','duel','dribble','tir'][Math.floor(r() * 6)], t:Math.floor(60 + r() * 2300), dur:10, rating:0, inReel:false, origin:'ia', status:'proposé', playerId:'me'}));
    state.matches.unshift({id:uid(), playerId:'me', team:false, title:`${ev.name} · Match 1`, date:ev.date, opponent:'', competition:'Détection', source:'demo', link:'', fileName:'', duration:2400, width:3840, height:2160, quality:{fixed:true, wide:true, numbers:true, light:true}, aiPick:null, clips, reel:[]});
    state.notifications.unshift({id:uid(), to:'joueur', text:`${ev.name} : tests certifiés publiés et 7 actions détectées dans ton match.`, date:today(), read:false});
    save(); render(); toast('Résultats publiés : tests certifiés et match ajouté à tes vidéos.');
  },
  evAttend(id) { const ev = state.events.find(e => e.id === id); ev.recruiters.push(myProgram().id); save(); render(); toast('Participation enregistrée.'); },
  evPlayers(id) {
    const ev = state.events.find(e => e.id === id);
    const ps = allPlayers().filter(p => ev.gender === 'Mixte' || (ev.gender === 'Masculin' ? p.gender === 'Homme' : p.gender === 'Femme')).filter(p => p.id !== 'me' || ev.me).slice(0, 6);
    openModal('Inscrits · ' + ev.name, `<div class="list">${ps.map(p => `<div class="row"><div class="grow"><div class="t">${esc(p.firstName)} ${esc(p.lastName)}</div><div class="small muted">${esc(p.position)} · ${esc(p.club)}</div></div><button class="btn sm" data-action="openProspect" data-arg="${p.id}">Voir</button></div>`).join('') || '<div class="empty">Aucun inscrit visible.</div>'}</div><p class="small muted" style="margin:0">Liste d’exemple. En production, seuls les joueurs ayant accepté le partage apparaissent.</p>`);
  },
  evTeam(id) { const ev = state.events.find(e => e.id === id); state.notifications.unshift({id:uid(), to:'joueur', text:`Ton entraîneur te recommande ${ev.name} (${fdate(ev.date)}).`, date:today(), read:false}); save(); toast('Invitation envoyée aux joueurs de l’effectif.'); },
  book(id) {
    const s = state.providers.find(x => x.id === id);
    openModal('Réserver · ' + s.name, `<div class="form"><div class="field"><label for="bk_d">Date souhaitée</label><input type="date" id="bk_d" value="${today()}"></div><div class="field"><label for="bk_q">Quantité (${esc(s.unit)})</label><input type="number" id="bk_q" value="1" min="1"></div><div class="field wide"><label for="bk_m">Précisions</label><textarea id="bk_m" rows="3" placeholder="Lieu du match, horaire, numéro de maillot…"></textarea></div></div><div class="actions"><button class="btn primary" data-action="bookOk" data-arg="${id}">Continuer</button></div>`);
  },
  bookOk(id) {
    const s = state.providers.find(x => x.id === id), q = Math.max(1, n0($('#bk_q').value)), d = $('#bk_d').value, amount = s.price * q;
    payModal(`${s.cat} · ${s.name}`, amount, 'EUR', () => { state.orders.unshift({id:uid(), providerId:id, date:d, qty:q, amount, status:'Payée, en attente du prestataire'}); bill(`Service · ${s.name}`, amount); toast('Commande passée.'); }, `${q} × ${money2(s.price)} · commission ${state.take} % prélevée au prestataire`);
  },
  orderNext(id) {
    const o = state.orders.find(x => x.id === id), steps = ['Payée, en attente du prestataire', 'Confirmée', 'Livrée']; o.status = steps[Math.min(2, steps.indexOf(o.status) + 1)];
    const s = state.providers.find(x => x.id === o.providerId);
    if (o.status === 'Livrée' && s && s.cat === 'Tests physiques certifiés') { const p = state.player; p.testsCertified = {date:today(), event:s.name, sprint30:p.physical.sprint30, vma:p.physical.vma, jump:p.physical.jump}; toast('Tests certifiés ajoutés à ton profil.'); }
    if (o.status === 'Livrée' && s && s.cat === 'Traduction') { state.player.docs.translation = {status:'fourni', name:'traduction-bulletins.pdf', date:today(), demo:true}; toast('Traduction ajoutée à ton dossier.'); }
    save(); render();
  },
  becomeProvider() {
    openModal('Devenir prestataire', `<div class="form"><div class="field"><label for="bp_n">Nom de l’activité</label><input type="text" id="bp_n"></div><div class="field"><label for="bp_c">Catégorie</label><select id="bp_c">${['Captation vidéo','Montage','Tests physiques certifiés','Traduction','Anglais'].map(c => `<option>${c}</option>`).join('')}</select></div><div class="field"><label for="bp_z">Zone</label><input type="text" id="bp_z" placeholder="Ville, rayon ou à distance"></div><div class="field"><label for="bp_p">Prix (€)</label><input type="number" id="bp_p"></div><div class="field"><label for="bp_u">Unité</label><input type="text" id="bp_u" value="match"></div><div class="field wide"><label for="bp_d">Description</label><textarea id="bp_d" rows="3"></textarea></div></div><div class="callout small">Validation par l’équipe avant publication : identité, assurance, exemples de travaux. Commission de ${state.take} % sur chaque commande.</div><div class="actions"><button class="btn primary" data-action="becomeProviderOk">Envoyer la candidature</button></div>`);
  },
  becomeProviderOk() { const n = $('#bp_n').value.trim(); if (!n) { toast('Indique le nom de ton activité.'); return; } state.providers.push({id:uid(), cat:$('#bp_c').value, name:n, zone:$('#bp_z').value, price:n0($('#bp_p').value), unit:$('#bp_u').value || 'prestation', delay:'À préciser', desc:$('#bp_d').value, status:'en validation'}); save(); closeModal(); toast('Candidature envoyée.'); }
});
Object.assign(CHANGE_ACT, {
  videosVerified(id, el) { const p = findPlayer(id); p.videosVerified = el.checked; if (p.id === 'me' && el.checked) state.notifications.unshift({id:uid(), to:'joueur', text:'Ton entraîneur a confirmé que c’est bien toi sur tes vidéos.', date:today(), read:false}); save(); render(); }
});
Object.assign(VIEWS, {audience:vAudience, dossier:vDossier, abonnement:vAbonnement, club:vClub, recherches:vRecherches, 'recruteur-abonnement':vRecAbonnement, evenements:vEvenements, services:vServices, business:vBusiness});
NAV.joueur = [['accueil','Accueil'],['profil','Mon profil'],['videos','Vidéos'],['debouches','Débouchés'],['suivi','Suivi'],['messages','Messages'],['audience','Audience'],['dossier','Dossier'],['eligibilite','Éligibilité'],['offres','Offres reçues'],['partage','Profil public'],['abonnement','Abonnement']];
NAV.entraineur = [['coach-accueil','Accueil'],['coach-profil','Mon profil'],['coach-effectif','Effectif'],['coach-matchs','Matchs d’équipe'],['club','Licence club']];
NAV.recruteur = [['recruteur-accueil','Accueil'],['recruteur-programme','Mon programme'],['prospects','Prospects'],['recherches','Recherches enregistrées'],['shortlist','Shortlist'],['recruteur-abonnement','Abonnement']];
NAV.commun = [['annuaire','Universités et clubs'],['staffs','Entraîneurs'],['evenements','Détections'],['services','Services'],['business','Modèle économique'],['donnees','Données']];
document.addEventListener('play', e => {
  const v = e.target; if (!v || !v.dataset || !v.dataset.vid) return;
  if (state.role === 'recruteur' && v.dataset.owner === 'me') { const start = Date.now(); logView('video', 'me', v.dataset.vid); const rec = state.views[0]; v.addEventListener('pause', () => { rec.seconds = n0(rec.seconds) + Math.round((Date.now() - start) / 1000); save(); }, {once:true}); }
}, true);

