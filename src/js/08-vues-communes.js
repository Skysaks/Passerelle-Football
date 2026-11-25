/* ---------- Vues communes ---------- */
function vAnnuaire() {
  const f = ui.annuaire, countries = [...new Set(state.programs.map(x => x.country).filter(Boolean))];
  let list = state.programs.map((pr, i) => ({pr, i}));
  if (f.type !== 'all') list = list.filter(x => x.pr.type === f.type);
  if (f.country !== 'all') list = list.filter(x => x.pr.country === f.country);
  if (f.q) { const q = f.q.toLowerCase(); list = list.filter(x => (x.pr.name + ' ' + x.pr.city + ' ' + x.pr.region + ' ' + x.pr.org).toLowerCase().includes(q)); }
  return head('Universités et clubs', 'La base de débouchés : chaque fiche complète améliore le matching. Les fiches marquées « Exemple » sont fictives.', `<button class="btn primary" data-action="newProgram">Ajouter un programme</button>`) + `
  <div class="filters"><div class="field"><label for="af_q">Recherche</label><input type="search" id="af_q" data-ui="annuaire.q" value="${esc(f.q)}" placeholder="Nom, ville, division"></div><div class="field"><label for="af_t">Type</label><select id="af_t" data-ui="annuaire.type"><option value="all">Tous</option>${['Université','Club','Académie'].map(t => `<option${f.type === t ? ' selected' : ''}>${t}</option>`).join('')}</select></div><div class="field"><label for="af_c">Pays</label><select id="af_c" data-ui="annuaire.country"><option value="all">Tous</option>${countries.map(c => `<option${f.country === c ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select></div></div>
  <section class="card"><div class="tablewrap"><table><thead><tr><th>Nom</th><th>Type</th><th>Division</th><th>Lieu</th><th>Genre</th><th>Internationaux</th><th>Reste à charge / an</th><th>Staff</th><th>Fiche complète</th><th></th></tr></thead><tbody>${list.map(({pr}) => { const c = programCompleteness(pr); const net = ORGS[pr.org] && ORGS[pr.org].uni ? money(Math.max(0, n0(pr.costAnnual) - n0(pr.avgAid)), pr.currency) : '—'; return `<tr><td><b>${esc(pr.name || 'Sans nom')}</b> ${pr.demo ? '<span class="pill">Exemple</span>' : ''}</td><td>${esc(pr.type)}</td><td>${esc(pr.org)}</td><td>${esc(pr.city)}${pr.city && pr.country ? ', ' : ''}${esc(pr.country)}</td><td>${esc(pr.gender)}</td><td class="num">${pr.intlShare !== '' ? esc(pr.intlShare) + ' %' : '—'}</td><td class="num">${net}</td><td class="num">${pr.staff.length}</td><td style="min-width:120px"><div class="bar"><i style="width:${c}%"></i></div><span class="small num">${c} %</span></td><td><div class="actions"><button class="btn sm" data-action="editProgram" data-arg="${pr.id}">Compléter</button><button class="btn sm" data-action="viewProgram" data-arg="${pr.id}">Fiche</button></div></td></tr>`; }).join('')}</tbody></table></div></section>`;
}
function programForm(i) {
  const B = `programs.${i}.`, pr = state.programs[i], isUni = ORGS[pr.org] && ORGS[pr.org].uni;
  return `<section class="card"><div class="sec"><h3>Identité</h3><div class="form">
    ${F(B+'name','Nom')}${F(B+'type','Type','select',{options:['Université','Club','Académie'],noEmpty:true})}${F(B+'org','Division / statut','select',{options:Object.keys(ORGS)})}${F(B+'gender','Programme','select',{options:['Masculin','Féminin','Mixte'],noEmpty:true})}
    ${F(B+'country','Pays')}${F(B+'region','État / région')}${F(B+'city','Ville')}${F(B+'conference', isUni ? 'Conférence' : 'Championnat')}
    ${F(B+'website','Site officiel','url')}${F(B+'rosterSize','Taille de l’effectif','number')}${F(B+'intlShare','Part d’internationaux','number',{unit:'%'})}
  </div></div>
  <div class="sec"><h3>${isUni ? 'Coûts, aides et admission' : 'Conditions'}</h3><div class="form">
    ${F(B+'currency','Devise','select',{options:['USD','CAD','EUR'],noEmpty:true})}${F(B+'costAnnual', isUni ? 'Coût annuel total (frais, logement, repas)' : 'Coût annuel éventuel','number')}${F(B+'avgAid', isUni ? 'Aide moyenne accordée' : 'Indemnités / aides','number')}
    ${isUni ? F(B+'gpaMin','GPA minimum','number',{step:'0.1'}) + F(B+'englishRequired','Test d’anglais exigé','check') + F(B+'englishMin','Score d’anglais minimum') + F(B+'majors','Diplômes proposés',undefined,{wide:true}) : F(B+'majors','Formation ou emploi proposé',undefined,{wide:true})}
    ${F(B+'deadline','Date limite de candidature','date')}${F(B+'facilities','Installations')}
  </div></div>
  <div class="sec"><div class="sec-h"><h3>Besoins par poste</h3><span class="small muted">Départs prévus ou places ouvertes</span></div><div class="form">${POS.map(p => F(B+'needs.'+p, p, 'number', {min:0})).join('')}</div></div>
  <div class="sec"><div class="sec-h"><h3>Staff et entraîneurs</h3><button class="btn sm" data-action="addStaff" data-arg="${i}">Ajouter une personne</button></div>
    ${pr.staff.length ? pr.staff.map((s, si) => `<div class="card" style="box-shadow:none;background:var(--surface-2)"><div class="sec-h" style="margin-bottom:10px"><b>${esc(s.name || 'Nouvelle personne')}</b><span class="small muted">Fiche ${staffCompleteness(s)} %</span><button class="btn sm danger" data-action="delStaff" data-arg="${i}:${si}">Retirer</button></div><div class="form">${F(B+'staff.'+si+'.name','Nom')}${F(B+'staff.'+si+'.role','Fonction','select',{options:['Entraîneur principal','Entraîneure principale','Entraîneur-chef','Entraîneur adjoint','Entraîneur adjoint / recrutement','Coordinateur du recrutement','Entraîneur des gardiens','Directeur sportif','Autre']})}${F(B+'staff.'+si+'.email','E-mail','email')}${F(B+'staff.'+si+'.phone','Téléphone','tel')}${F(B+'staff.'+si+'.languages','Langues')}${F(B+'staff.'+si+'.social','Réseau (X, LinkedIn)')}${F(B+'staff.'+si+'.notes','Notes','textarea',{wide:true,rows:2})}</div></div>`).join('') : '<div class="empty">Ajoute l’entraîneur principal et la personne chargée du recrutement.</div>'}
  </div>
  <div class="sec"><h3>Fiabilité</h3><div class="form">${F(B+'sourceUrl','Source (page effectif, staff)','url')}${F(B+'verifiedAt','Vérifié le','date')}${F(B+'notes','Notes','textarea',{wide:true,rows:2})}</div></div></section>`;
}
function vStaffs() {
  const q = ui.staffQ.toLowerCase();
  let rows = state.programs.flatMap(pr => pr.staff.map((s, si) => ({s, pr, si})));
  const c = state.coach;
  const clubRow = {s:{name:c.firstName + ' ' + c.lastName, role:c.role, email:c.email, phone:c.phone, languages:c.languages, social:''}, pr:{name:c.club, org:'Club formateur', country:'France', id:''}, si:-1};
  rows = [clubRow, ...rows];
  if (q) rows = rows.filter(x => (x.s.name + ' ' + x.s.role + ' ' + x.pr.name + ' ' + (x.s.languages || '')).toLowerCase().includes(q));
  return head('Entraîneurs', 'Tous les staffs des universités, clubs et académies, plus les entraîneurs formateurs inscrits.') + `
  <div class="filters"><div class="field" style="max-width:360px"><label for="sf_q">Recherche</label><input type="search" id="sf_q" data-ui="staffQ" value="${esc(ui.staffQ)}" placeholder="Nom, fonction, programme, langue"></div></div>
  <section class="card"><div class="tablewrap"><table><thead><tr><th>Nom</th><th>Fonction</th><th>Programme</th><th>Langues</th><th>E-mail</th><th>Fiche</th><th></th></tr></thead><tbody>${rows.map(({s, pr, si}) => `<tr><td><b>${esc(s.name)}</b></td><td>${esc(s.role)}</td><td>${esc(pr.name)}<div class="small muted">${esc(pr.org)} · ${esc(pr.country)}</div></td><td class="small">${esc(s.languages)}</td><td class="small">${esc(s.email)}</td><td class="num small">${staffCompleteness(s)} %</td><td><div class="actions">${pr.id ? `<button class="btn sm" data-action="compose" data-arg="${pr.id}:${si}">Écrire</button><button class="btn sm" data-action="editProgram" data-arg="${pr.id}">Compléter</button>` : `<a class="btn sm" href="#coach-profil">Profil</a>`}</div></td></tr>`).join('')}</tbody></table></div></section>`;
}
function vDonnees() {
  return head('Données', 'Taux de change, sauvegarde, import et remise à zéro.') + `<div class="grid g2" style="align-items:start">
  <section class="card"><h3>Offres actives (démo)</h3><div class="form">${F('plans.joueur','Joueur','select',{options:Object.keys(PLANS).filter(k => PLANS[k].role === 'joueur').map(k => [k, PLANS[k].name]),noEmpty:true})}${F('plans.entraineur','Club','select',{options:Object.keys(PLANS).filter(k => PLANS[k].role === 'entraineur').map(k => [k, PLANS[k].name]),noEmpty:true})}${F('plans.recruteur','Recruteur','select',{options:Object.keys(PLANS).filter(k => PLANS[k].role === 'recruteur').map(k => [k, PLANS[k].name]),noEmpty:true})}</div><p class="small muted" style="margin:8px 0 0">Change d’offre sans paiement pour tester les limites.</p></section>
  <section class="card"><h3>Taux de change</h3><div class="form">${F('settings.rateUsd','1 USD en euros','number',{step:'0.01',help:'Saisi à la main : mets-le à jour.'})}${F('settings.rateCad','1 CAD en euros','number',{step:'0.01'})}</div></section>
  <section class="card"><h3>Sauvegarde</h3><p class="small muted" style="margin-top:0">Tes saisies sont gardées dans ce navigateur. Exporte-les pour les garder ailleurs ou les ouvrir sur un autre appareil.</p><div class="actions">${caps.artifact ? '<button class="btn primary" data-action="saveArtifact">Enregistrer dans l’artefact</button>' : ''}<button class="btn" data-action="exportJSON">Exporter (JSON)</button><label class="btn" style="cursor:pointer">Importer un fichier<input type="file" accept="application/json,.json" data-import="1" hidden></label><button class="btn danger" data-action="reset">Revenir aux données d’exemple</button></div>${caps.artifact ? '<p class="tiny muted">« Enregistrer dans l’artefact » publie une nouvelle version de la page avec tes données : elles s’ouvrent alors sur tous tes appareils.</p>' : ''}</section>
  <section class="card" style="grid-column:1/-1"><h3>Ce qui est réel et ce qui est simulé</h3><div class="tablewrap"><table><thead><tr><th>Fonction</th><th>Dans ce prototype</th></tr></thead><tbody>
    <tr><td>Profils joueur, entraîneur, programmes, staffs</td><td><span class="pill ok">Réel</span> saisie complète et sauvegarde locale</td></tr>
    <tr><td>Lecture d’un match et marquage des actions</td><td><span class="pill ok">Réel</span> avec ton fichier vidéo, sans envoi</td></tr>
    <tr><td>Vidéo des temps forts</td><td><span class="pill ok">Réel</span> aperçu et export WebM si le navigateur le permet</td></tr>
    <tr><td>Analyse automatique (détection des actions)</td><td><span class="pill warn">Simulé</span> propositions générées pour la démonstration</td></tr>
    <tr><td>Matching et score</td><td><span class="pill ok">Réel</span> calcul transparent, pondérations à calibrer</td></tr>
    <tr><td>Envoi d’e-mails</td><td><span class="pill info">Assisté</span> rédaction ici, envoi depuis ta messagerie</td></tr>
    <tr><td>Demandes de contact recruteur → joueur</td><td><span class="pill warn">Simulé</span> sur ce seul appareil</td></tr>
    <tr><td>Vidéos du profil</td><td><span class="pill ok">Réel</span> stockées sur l’appareil ; hébergées avec l’artefact jusqu’à 20 Mo dans la version en ligne</td></tr>
    <tr><td>Dossier (pièces justificatives)</td><td><span class="pill ok">Réel</span> fichiers gardés sur l’appareil ; vérification d’identité simulée</td></tr>
    <tr><td>Abonnements, détections, services</td><td><span class="pill warn">Simulé</span> paiements de démonstration, limites d’offre réellement appliquées</td></tr>
    <tr><td>Audience du profil</td><td><span class="pill ok">Réel</span> consultations et lectures enregistrées depuis l’espace Recruteur</td></tr>
    <tr><td>Modèle économique</td><td><span class="pill ok">Réel</span> calcul ; toutes les valeurs sont des hypothèses</td></tr>
    <tr><td>Avantages partenaires et affiliation</td><td><span class="pill warn">Simulé</span> partenaires fictifs ; clics et conversions comptés localement</td></tr>
    <tr><td>Parrainage, ambassadeurs, accès solidaire</td><td><span class="pill warn">Simulé</span> circuits complets entre rôles, sur ce seul appareil</td></tr>
    <tr><td>Pipeline partenariats (Opérateur)</td><td><span class="pill ok">Réel</span> outil de suivi utilisable ; entreprises réelles listées comme cibles, sans accord</td></tr>
  </tbody></table></div></section></div>`;
}

const VIEWS = {accueil:vAccueil, profil:vProfil, videos:vVideos, debouches:vDebouches, suivi:vSuivi, messages:vMessages, eligibilite:vEligibilite, offres:vOffres, partage:vPartage,
  'coach-accueil':vCoachAccueil, 'coach-profil':vCoachProfil, 'coach-effectif':vCoachEffectif, 'coach-matchs':vCoachMatchs,
  'recruteur-accueil':vRecAccueil, 'recruteur-programme':vRecProgramme, prospects:vProspects, shortlist:vShortlist,
  annuaire:vAnnuaire, staffs:vStaffs, donnees:vDonnees};

let lastRoute = null;
function render() {
  const route = currentRoute();
  if (route !== lastRoute && lastRoute !== null && route !== 'videos' && route !== 'coach-matchs') ui.matchId = null;
  const ae = document.activeElement, fidv = ae && ae.id, sel = (() => { try { return ae && typeof ae.selectionStart === 'number' ? [ae.selectionStart, ae.selectionEnd] : null; } catch (e) { return null; } })();
  const scroll = window.scrollY;
  $('#app').innerHTML = shell((VIEWS[route] || vAccueil)(), route);
  if (fidv) { const el = document.getElementById(fidv); if (el && el !== document.body) { el.focus({preventScroll:true}); if (sel && el.setSelectionRange) try { el.setSelectionRange(sel[0], sel[1]); } catch (e) {} } }
  if (route === lastRoute) window.scrollTo(0, scroll); else window.scrollTo(0, 0);
  lastRoute = route;
  document.title = 'Passerelle Football';
  bindVideo(); hydrateMedia();
}
function rerenderSoon() { setTimeout(render, 0); }

/* ---------- Rafraîchissements ciblés ---------- */
function refreshLive() {
  document.querySelectorAll('[data-live]').forEach(el => {
    const k = el.dataset.live;
    if (k === 'pcomp') el.innerHTML = ring(playerCompleteness(state.player).pct);
    else if (k === 'ccomp') el.innerHTML = ring(coachCompleteness(state.coach));
    else if (k.startsWith('prcomp-')) { const pr = state.programs[+k.slice(7)]; if (pr) el.innerHTML = ring(programCompleteness(pr)); }
    else if (k === 'biz') el.innerHTML = bizOutHTML();
    else if (k === 'mq') { const m = curMatch(); if (m) { const q = qualityScore(m); el.textContent = q + ' / 100'; el.className = 'pill ' + (q >= 70 ? 'ok' : q >= 45 ? 'warn' : 'bad'); } }
    else if (k === 'gpa') { const g = gpaFrom20(state.player.academic.average); el.textContent = g != null ? g.toFixed(2) + ' / 4' : '—'; }
    else if (k.startsWith('off-')) {
      const [, kind, i] = k.split('-'); const o = state.offers[+i]; if (!o) return;
      const net = Math.max(0, n0(o.cost) - n0(o.athletic) - n0(o.academic) - n0(o.other)), eur = net * rate(o.currency);
      if (kind === 'net') el.textContent = money(net, o.currency); else if (kind === 'eur') el.innerHTML = `<b>${money(eur)}</b>`; else el.textContent = money(eur * 4);
    }
  });
}

