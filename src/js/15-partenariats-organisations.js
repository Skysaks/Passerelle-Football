/* ========== Partenariats, affiliation, parrainage, ambassadeurs, académie, accès solidaire, organisations, opérateur ========== */
ROLE_LABEL.operateur = 'Opérateur';
HOME.operateur = 'op-accueil';
NAV.operateur = [['op-accueil','Pilotage'],['op-partenariats','Partenariats'],['op-validation','Validations'],['op-ambassadeurs','Ambassadeurs']];
NAV.joueur = [['accueil','Accueil'],['profil','Mon profil'],['videos','Vidéos'],['debouches','Débouchés'],['suivi','Suivi'],['messages','Messages'],['audience','Audience'],['dossier','Dossier'],['eligibilite','Éligibilité'],['offres','Offres reçues'],['partage','Profil public'],['avantages','Avantages partenaires'],['parrainage','Parrainage'],['formation','Académie'],['abonnement','Abonnement']];
NAV.commun = [['annuaire','Universités et clubs'],['staffs','Entraîneurs'],['evenements','Détections et stages'],['services','Services'],['organisations','Pour les organisations'],['business','Modèle économique'],['donnees','Données']];

const PARTNER_STAGES = ['Idée','À contacter','Contacté','En négociation','Signé','Refusé'];
const PARTNER_MODELS = ['Affiliation CPA','Affiliation %','Programme partenaire','Co-marketing','Revenue share','Marque blanche','Licence','Abonnement outil','Sponsoring','Mécénat','À explorer'];
const ACADEMY = [
  {id:'m1', t:'Les débouchés : NCAA, NAIA, NJCAA, U Sports, clubs', d:'Divisions, bourses, niveaux, calendrier.', min:25, free:true, l:['Les cinq familles de débouchés','Bourse sportive, académique, aide mixte','Ce que change la limite d’effectif à 28']},
  {id:'m2', t:'Ton niveau, traduit', d:'Situer ton championnat face aux divisions.', min:20, free:true, l:['Lire la pyramide française','Les signaux qu’un coach regarde','Choisir ses divisions cibles']},
  {id:'m3', t:'La vidéo qui se fait regarder', d:'Tournage, sélection, durée, carton titre.', min:30, l:['Filmer un match exploitable','Les 30 premières secondes','Match complet ou temps forts']},
  {id:'m4', t:'Écrire aux coachs', d:'Liste cible, premier e-mail, relances, appels.', min:35, l:['Construire une liste de 25 programmes','Le premier e-mail en anglais','Relancer sans insister, préparer l’appel']},
  {id:'m5', t:'Le dossier académique', d:'Bulletins, traduction, anglais, Eligibility Center.', min:30, l:['Les pièces à réunir','Choisir son test d’anglais','S’inscrire à l’Eligibility Center']},
  {id:'m6', t:'Visa et arrivée', d:'I-20, SEVIS, entretien, budget de la 1re année.', min:25, l:['Du I-20 à l’entretien','Budget réel de la première année','Assurance, banque, logement']},
  {id:'m7', t:'Comparer et négocier une offre', d:'Reste à charge, renouvellement, questions à poser.', min:30, l:['Lire une offre','Les questions qui changent tout','Répondre sans perdre l’offre']},
  {id:'m8', t:'Vivre et performer à l’étranger', d:'Rythme sport-études, récupération, intégration.', min:20, l:['Une semaine type','Tenir académiquement','Construire la suite : pro, master, emploi']}
];
const ACADEMY_PRICE = 49;

function migrate3(s) {
  if (s.schema >= 3) return s;
  const P0 = s.player;
  if (!P0.referral) P0.referral = {code:(P0.firstName || 'JOUEUR').toUpperCase().slice(0, 6) + '-' + (hashStr(P0.id + P0.lastName) % 9000 + 1000), invites: P0.demo ? [{id:uid(), name:'Hugo F.', email:'hugo@exemple.fr', status:'Pro', date:'2026-10-21'},{id:uid(), name:'Nathan B.', email:'nathan@exemple.fr', status:'Inscrit', date:'2026-11-09'},{id:uid(), name:'Enzo M.', email:'enzo@exemple.fr', status:'Invité', date:'2026-11-19'}] : []};
  if (!P0.academy) P0.academy = {owned:false, done: P0.demo ? {m1:true, m2:true} : {}};
  s.perks = s.perks || [
    {id:'k1', cat:'Prêt à partir', name:'AssurÉtudes Monde', what:'Assurance santé pour études à l’étranger', offer:'5 % de remise', proOffer:'10 % de remise', model:'Commission sur la prime', avg:60, clicks:14, conv:2, code:'PASS-ASSUR'},
    {id:'k2', cat:'Prêt à partir', name:'VireMonde', what:'Transferts d’argent en devises', offer:'Frais réduits sur le premier transfert', proOffer:'Frais réduits sur le premier transfert', model:'Montant fixe par nouveau client', avg:10, clicks:9, conv:3, code:'PASS-VIRE'},
    {id:'k3', cat:'Prêt à partir', name:'CampusLodge', what:'Logement étudiant près du campus', offer:'Frais de dossier offerts', proOffer:'Frais de dossier offerts', model:'Montant fixe par réservation', avg:30, clicks:5, conv:0, code:'PASS-LODGE'},
    {id:'k4', cat:'Prêt à partir', name:'SimVoyage', what:'Forfait mobile international', offer:'1 mois offert', proOffer:'2 mois offerts', model:'Montant fixe par activation', avg:8, clicks:6, conv:1, code:'PASS-SIM'},
    {id:'k5', cat:'Préparation', name:'PrépaTest', what:'Préparation Duolingo English Test et TOEFL', offer:'20 % de remise', proOffer:'30 % de remise', model:'Commission sur la vente', avg:12, clicks:11, conv:2, code:'PASS-ENG'},
    {id:'k6', cat:'Club', name:'CamIA Club', what:'Caméra IA pour filmer les matchs du club', offer:'200 € de remise pour ton club', proOffer:'200 € de remise pour ton club', model:'Crédit par caméra vendue', avg:80, clicks:4, conv:0, code:'PASS-CAM'},
    {id:'k7', cat:'Équipement', name:'Crampons & Co', what:'Crampons, gants, protège-tibias', offer:'15 % de remise', proOffer:'20 % de remise', model:'Commission sur la vente', avg:5, clicks:19, conv:4, code:'PASS-GEAR'}
  ];
  s.partners = s.partners || [
    {id:uid(), name:'Veo', cat:'Caméra IA', model:'Programme partenaire', stage:'À contacter', value:3000, benefit:'Remise sur la caméra pour un club parrainé', revenue:'Crédit sur les caméras vendues aux clubs inscrits, conditions à négocier', contact:'Portail partenaires', next:'Candidater au programme partenaire', notes:'Programme de parrainage public avec remise de 200 € sur la caméra.', real:true, source:'https://www.veo.com/raf'},
    {id:uid(), name:'Trace', cat:'Caméra IA', model:'À explorer', stage:'Idée', value:0, benefit:'', revenue:'', contact:'', next:'Vérifier l’existence d’un programme partenaire', notes:'', real:true, source:''},
    {id:uid(), name:'Wise', cat:'Transferts d’argent', model:'Affiliation CPA', stage:'À contacter', value:1500, benefit:'Transferts en devises à moindre coût', revenue:'Montant fixe par nouveau client qui fait un transfert multidevise', contact:'Programme d’affiliation en ligne', next:'Créer le compte affilié', notes:'Interdit : sites de codes promo et enchères sur la marque.', real:true, source:'https://wise.com/gb/blog/affiliate-onboarding-guide'},
    {id:uid(), name:'APRIL International', cat:'Assurance santé études', model:'Affiliation %', stage:'À contacter', value:4000, benefit:'Assurance santé adaptée aux étudiants expatriés', revenue:'Commission selon le contrat d’affiliation', contact:'Équipe partenariats', next:'Demander les conditions', notes:'Vérifier si la présentation d’offres impose une immatriculation ORIAS.', real:true, source:'https://www.april-international.com/fr/aide/contact-individual/programme-affiliation'},
    {id:uid(), name:'ACS', cat:'Assurance santé études', model:'Affiliation %', stage:'Idée', value:3000, benefit:'Assurance santé et assistance', revenue:'Pourcentage de la prime, jusqu’à 30 % selon un annuaire tiers (à confirmer)', contact:'', next:'Comparer avec APRIL', notes:'', real:true, source:'https://www.postaffiliatepro.com/affiliate-program-directory/acs-affiliate-program-2/'},
    {id:uid(), name:'Rematch', cat:'Vidéo amateur', model:'Co-marketing', stage:'Idée', value:0, benefit:'Importer ses highlights Rematch dans le profil', revenue:'Acquisition, pas de revenu direct', contact:'', next:'Proposer une intégration croisée', notes:'Partenaire vidéo de la FFF, rejoint par Nike.', real:true, source:'https://www.fff.fr/article/13022-nike-rejoint-le-dispositif-fff-rematch.html'},
    {id:uid(), name:'Agents FIFA licenciés', cat:'Agents', model:'Abonnement outil', stage:'Idée', value:2400, benefit:'Orientation vers un agent licencié pour les profils pros', revenue:'Abonnement à l’outil de recherche, jamais de part sur un transfert', contact:'', next:'Tester avec 3 agents', notes:'Seul un agent licencié peut fournir des services d’agent, rémunérés selon un contrat de représentation : aucune commission de mise en relation.', real:true, source:'https://inside.fifa.com/en/transfer-system/agents/faq-agents'},
    {id:uid(), name:'District de football (exemple)', cat:'Institution', model:'Licence', stage:'Idée', value:12000, benefit:'Accès pour tous les clubs du district', revenue:'Licence territoriale annuelle', contact:'', next:'Préparer une offre pilote', notes:'Précédent public : partenariat Veo avec le District de la Sarthe.', real:false, source:'https://www.veo.co/fr/partnership-basic/district-sarthe-football'},
    {id:uid(), name:'Academia Atlântico (exemple)', cat:'Académie', model:'Revenue share', stage:'En négociation', value:4100, benefit:'Stage d’été encadré', revenue:'15 % du prix des stages vendus', contact:'r.santos@atlantico.example', next:'Valider le contrat de stage', notes:'', real:false, source:''},
    {id:uid(), name:'Lycées sport-études (exemple)', cat:'Établissement', model:'Licence', stage:'Idée', value:6000, benefit:'Outil pour les sections sportives', revenue:'Licence établissement', contact:'', next:'Identifier 5 sections', notes:'', real:false, source:''},
    {id:uid(), name:'Entreprises locales (mécénat)', cat:'Mécénat', model:'Mécénat', stage:'Idée', value:24000, benefit:'Accès solidaire Pro et détections financés', revenue:'Financement de places solidaires', contact:'', next:'Créer la structure d’intérêt général', notes:'La réduction d’impôt suppose de passer par une structure éligible (fonds de dotation ou association), distincte de la société.', real:false, source:''},
    {id:uid(), name:'Équipementier régional (exemple)', cat:'Sponsoring', model:'Sponsoring', stage:'Idée', value:5000, benefit:'Dotations pour les joueurs des détections', revenue:'Naming des journées de détection', contact:'', next:'Dossier de sponsoring', notes:'', real:false, source:''}
  ];
  s.ambassadors = s.ambassadors || [
    {id:uid(), name:'Thomas R.', univ:'Bayshore College (exemple)', country:'États-Unis', since:'2025', calls:6, contents:3, status:'Actif'},
    {id:uid(), name:'Camille D.', univ:'Seaview University (exemple)', country:'États-Unis', since:'2026', calls:4, contents:5, status:'Actif'},
    {id:uid(), name:'Yassine K.', univ:'Lakeside Community College (exemple)', country:'États-Unis', since:'2026', calls:2, contents:1, status:'Actif'}
  ];
  s.ambRates = s.ambRates || {call:40, content:60};
  s.ambApps = s.ambApps || [{id:uid(), name:'Inès G.', kind:'Créatrice de contenu', detail:'Compte Instagram foot féminin', date:'2026-11-17', status:'en attente'}];
  s.solidarity = s.solidarity || [];
  if (!s.events.some(e => e.id === 'e4')) s.events.push({id:'e4', kind:'Stage', name:'Stage d’été Algarve', city:'Faro (Portugal)', date:'2027-07-05', gender:'Mixte', ages:'15 à 19 ans', price:690, proPrice:640, capacity:40, registered:12, recruiters:['p10'], includes:['6 jours d’entraînement encadré','Hébergement et repas','Match filmé et analysé','Partenaire : Academia Atlântico (exemple), 15 % reversés à la plateforme'], me:false, results:false});
  s.biz = Object.assign({perkUsers:15, perkConv:20, perkCommission:18, wlOrgs:6, wlPrice:1800, schools:8, schoolPrice:900, agents:10, agentPrice:49, sponsors:3, sponsorAmount:8000, sponsorCostPct:40, academySales:300, academyPrice:49, campPlayers:40, campPrice:690, campShare:15}, s.biz);
  s.notifications.push({id:uid(), to:'operateur', text:'1 candidature d’ambassadeur et des prestataires à valider.', date:'2026-11-18', read:false});
  s.schema = 3;
  return s;
}
const migrateV2 = migrate;
migrate = s => migrate3(migrateV2(s));

/* ---------- Avantages partenaires ---------- */
function vAvantages() {
  const pro = state.plans.joueur === 'joueur-pro', cats = [...new Set(state.perks.map(k => k.cat))];
  return head('Avantages partenaires', 'Ce dont tu as besoin pour partir, à meilleur prix. Partenaires d’exemple : aucune offre réelle.') + `
  <div class="callout small" style="margin-bottom:16px">Transparence : Passerelle peut percevoir une commission quand tu utilises une offre. Ça ne change pas ton prix, et nous listons aussi les options qui ne nous rapportent rien quand elles te conviennent mieux.</div>
  ${cats.map(c => `<h2 style="margin:18px 0 10px">${esc(c)}${c === 'Prêt à partir' ? ' <span class="small muted" style="font-weight:400">assurance, argent, logement, téléphone</span>' : ''}</h2><div class="grid g3">${state.perks.filter(k => k.cat === c).map(k => `<article class="card" style="display:flex;flex-direction:column;gap:8px"><div class="sec-h"><b>${esc(k.name)}</b><span class="pill">Exemple</span></div><div class="small muted">${esc(k.what)}</div><div style="font-size:1.125rem;font-weight:650">${esc(pro ? k.proOffer : k.offer)}</div>${!pro && k.proOffer !== k.offer ? `<div class="small muted">Avec Pro : ${esc(k.proOffer)}</div>` : ''}<div class="actions" style="margin-top:auto">${ui.revealed && ui.revealed[k.id] ? `<span class="pill acc num">${esc(k.code)}</span><button class="btn sm" data-action="perkUsed" data-arg="${k.id}">J’ai utilisé l’offre</button>` : `<button class="btn sm primary" data-action="perkReveal" data-arg="${k.id}">Voir le code</button>`}</div></article>`).join('')}</div>`).join('')}`;
}

/* ---------- Parrainage et ambassadeurs ---------- */
function vParrainage() {
  const p = state.player, r = p.referral, pro = r.invites.filter(i => i.status === 'Pro').length, ins = r.invites.filter(i => i.status !== 'Invité').length;
  const engaged = Object.values(p.pipeline).includes('Engagé'), applied = state.ambApps.some(a => a.playerId === 'me');
  const link = `passerelle.app/r/${r.code}`;
  return head('Parrainage', 'Invite tes coéquipiers : chaque filleul qui passe Pro vous offre un mois de Pro à tous les deux.') + `
  <div class="grid g3"><div class="card kpi"><span class="v">${r.invites.length}</span><span class="l">Invitations envoyées</span></div><div class="card kpi"><span class="v">${ins}</span><span class="l">Filleuls inscrits</span></div><div class="card kpi"><span class="v">${pro}</span><span class="l">Mois de Pro gagnés</span></div></div>
  <div class="grid g2" style="margin-top:16px;align-items:start"><section class="card"><h3>Ton code</h3><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="pill acc num" style="font-size:1rem;padding:6px 12px">${esc(r.code)}</span><span class="small muted num">${esc(link)}</span><button class="btn sm" data-action="copyRef">Copier le lien</button></div>
    <div class="form" style="margin-top:14px"><div class="field"><label for="inv_n">Prénom du filleul</label><input type="text" id="inv_n"></div><div class="field"><label for="inv_e">E-mail</label><input type="email" id="inv_e"></div></div><div class="actions" style="margin-top:10px"><button class="btn primary" data-action="invite">Inviter</button></div></section>
  <section class="card"><h3>Tes filleuls</h3><div class="list">${r.invites.map(i => `<div class="row"><span class="grow"><b>${esc(i.name)}</b> <span class="small muted">${esc(i.email)} · ${fdate(i.date)}</span></span><span class="pill ${i.status === 'Pro' ? 'ok' : i.status === 'Inscrit' ? 'info' : ''}">${esc(i.status)}</span>${i.status !== 'Pro' ? `<button class="btn sm" data-action="inviteNext" data-arg="${i.id}">Étape suivante (démo)</button>` : ''}</div>`).join('') || '<div class="empty">Aucune invitation.</div>'}</div></section></div>
  <div class="grid g2" style="margin-top:16px"><section class="card"><h3>Devenir ambassadeur</h3><p class="small" style="margin:0 0 10px">Une fois engagé dans une université, réponds aux questions des futurs joueurs (appel de 20 min) et partage ton quotidien. Rémunération fixe par appel ou par contenu, jamais liée au recrutement d’un joueur.</p>${applied ? '<span class="pill info">Candidature envoyée</span>' : engaged ? '<button class="btn primary sm" data-action="ambApply" data-arg="Joueur engagé">Candidater</button>' : '<span class="pill">Disponible après ton engagement</span>'}<p class="tiny muted" style="margin:10px 0 0">Athlète NCAA en activité : une rémunération de ce type relève du NIL et doit respecter les règles de ton université.</p></section>
  <section class="card"><h3>Éducateurs et créateurs de contenu</h3><p class="small" style="margin:0 0 10px">Programme d’affiliation : 20 % des abonnements Pro souscrits avec ton code pendant 12 mois, versés chaque mois. Mention obligatoire du partenariat dans tes publications.</p>${state.ambApps.some(a => a.playerId === 'me' && a.kind === 'Affilié') ? '<span class="pill info">Demande envoyée</span>' : '<button class="btn sm" data-action="ambApply" data-arg="Affilié">Rejoindre le programme</button>'}</section></div>`;
}

/* ---------- Académie ---------- */
function academyAccess() { return state.player.academy.owned || state.plans.joueur === 'joueur-pro' || state.billing.some(b => /Accompagnement/.test(b.label)); }
function vFormation() {
  const a = state.player.academy, acc = academyAccess(), done = ACADEMY.filter(m => a.done[m.id]).length;
  const total = ACADEMY.reduce((s, m) => s + m.min, 0);
  return head('Académie Passerelle', `Le parcours complet, en ${ACADEMY.length} modules et environ ${Math.round(total / 60 * 10) / 10} h. Les deux premiers sont gratuits.`, acc ? '<span class="pill ok">Accès complet</span>' : `<button class="btn primary" data-action="buyAcademy">Débloquer · ${money2(ACADEMY_PRICE)}</button>`) + `
  <div class="card" style="margin-bottom:16px"><div class="sec-h"><b>Progression</b><span class="num">${done} / ${ACADEMY.length}</span></div><div class="bar" style="margin-top:8px;height:8px"><i style="width:${done / ACADEMY.length * 100}%"></i></div><p class="tiny muted" style="margin:8px 0 0">Inclus dans Pro et dans tous les accompagnements. Plan de cours d’exemple.</p></div>
  <div class="grid g2">${ACADEMY.map((m, i) => { const open = acc || m.free; return `<article class="card" style="display:flex;flex-direction:column;gap:8px"><div class="sec-h"><span class="small muted num">Module ${i + 1} · ${m.min} min</span>${a.done[m.id] ? '<span class="pill ok">Terminé</span>' : m.free ? '<span class="pill">Gratuit</span>' : open ? '' : '<span class="pill">Verrouillé</span>'}</div><h3 style="margin:0">${esc(m.t)}</h3><p class="small muted" style="margin:0">${esc(m.d)}</p><ul class="feat small">${m.l.map(x => `<li>${esc(x)}</li>`).join('')}</ul><div class="actions" style="margin-top:auto">${open ? `<button class="btn sm ${a.done[m.id] ? '' : 'primary'}" data-action="modDone" data-arg="${m.id}">${a.done[m.id] ? 'Marquer non terminé' : 'Marquer comme terminé'}</button>` : `<button class="btn sm" data-action="buyAcademy">Débloquer</button>`}</div></article>`; }).join('')}</div>`;
}

/* ---------- Accès solidaire (ajouté à Abonnement) ---------- */
function solidarityHTML() {
  const app = state.solidarity.find(x => x.playerId === 'me');
  return `<h2 style="margin:28px 0 6px">Accès solidaire</h2><section class="card"><p style="margin:0 0 10px">Pro gratuit pendant 12 mois, financé par des entreprises mécènes, pour les joueurs dont la famille ne peut pas payer. Places limitées, attribuées sur deux critères simples.</p>${app ? `<span class="pill ${app.status === 'acceptée' ? 'ok' : app.status === 'refusée' ? 'bad' : 'info'}">Demande ${esc(app.status)}</span>` : '<button class="btn" data-action="solApply">Faire une demande</button>'}<p class="tiny muted" style="margin:10px 0 0">Nous ne demandons ni revenus ni justificatifs fiscaux : seulement deux réponses oui/non et quelques lignes de motivation.</p></section>`;
}

/* ---------- Pour les organisations ---------- */
const ORG_OFFERS = [
  {t:'Académies et agences de placement', p:'1 800 € / an', d:'Passerelle en marque blanche pour vos athlètes : profils, vidéo, matching, suivi, jusqu’à 50 athlètes actifs.'},
  {t:'Lycées sport-études et sections sportives', p:'900 € / an', d:'Profils et vidéos pour vos élèves, tableau de bord de l’établissement, atelier orientation.'},
  {t:'Districts et ligues', p:'Sur devis', d:'Licence territoriale pour tous les clubs affiliés, analyses incluses, données agrégées anonymisées.'},
  {t:'Agents licenciés FIFA', p:'49 € / mois', d:'Recherche avancée de profils semi-pros. Abonnement à l’outil, aucune commission sur les transactions.'},
  {t:'Universités et clubs recruteurs', p:'Gratuit ou Recruteur Pro', d:'Fiche programme vérifiée, besoins publiés, participation aux détections.'},
  {t:'Marques et entreprises', p:'Sur devis', d:'Sponsoring des journées de détection, mécénat de l’accès solidaire, dotations.'}
];
function vOrganisations() {
  return head('Pour les organisations', 'Les offres pour celles et ceux qui accompagnent les joueurs. Tarifs indicatifs du prototype.') + `<div class="grid g3">${ORG_OFFERS.map(o => `<article class="card plan"><h3>${esc(o.t)}</h3><div class="price" style="font-size:1.375rem">${esc(o.p)}</div><p class="small" style="margin:0">${esc(o.d)}</p></article>`).join('')}</div>
  <section class="card" style="margin-top:16px"><h3>Nous contacter</h3><div class="form"><div class="field"><label for="org_n">Organisation</label><input type="text" id="org_n"></div><div class="field"><label for="org_t">Type</label><select id="org_t">${ORG_OFFERS.map(o => `<option>${esc(o.t)}</option>`).join('')}</select></div><div class="field"><label for="org_c">Nom du contact</label><input type="text" id="org_c"></div><div class="field"><label for="org_e">E-mail</label><input type="email" id="org_e"></div><div class="field wide"><label for="org_m">Votre besoin</label><textarea id="org_m" rows="3"></textarea></div></div><div class="actions" style="margin-top:10px"><button class="btn primary" data-action="orgLead">Envoyer</button></div><p class="tiny muted" style="margin:8px 0 0">La demande arrive dans le pipeline Partenariats de l’opérateur.</p></section>`;
}

/* ---------- Opérateur ---------- */
function eur(x) { return x.cur === 'USD' ? n0(x.amount) * n0(state.settings.rateUsd) : n0(x.amount); }
function vOpAccueil() {
  const players = allPlayers(true), pros = players.filter(p => p.id === 'me' ? state.plans.joueur === 'joueur-pro' : p.demoPro).length;
  const cash = state.billing.reduce((s, b) => s + eur(b), 0);
  const conv = state.perks.reduce((s, k) => s + n0(k.conv), 0), clicks = state.perks.reduce((s, k) => s + n0(k.clicks), 0), comm = state.perks.reduce((s, k) => s + n0(k.conv) * n0(k.avg), 0);
  const pipe = state.partners.filter(x => x.stage !== 'Refusé' && x.stage !== 'Signé').reduce((s, x) => s + n0(x.value), 0), signed = state.partners.filter(x => x.stage === 'Signé').reduce((s, x) => s + n0(x.value), 0);
  const todo = state.providers.filter(x => x.status === 'en validation').length + (state.player.docs.passport && state.player.docs.passport.status === 'fourni' ? 1 : 0) + state.solidarity.filter(x => x.status === 'en attente').length + state.ambApps.filter(x => x.status === 'en attente').length;
  const marketGMV = state.orders.reduce((s, o) => s + n0(o.amount), 0);
  return head('Pilotage', 'Vue opérateur : revenus de démonstration, affiliation, partenariats et file de validation.', todo ? `<a class="btn primary" href="#op-validation">${todo} élément${todo > 1 ? 's' : ''} à valider</a>` : '') + `
  <div class="grid g4"><div class="card kpi"><span class="v">${players.length}</span><span class="l">Joueurs · ${pros} Pro</span></div><div class="card kpi"><span class="v">${money(cash)}</span><span class="l">Encaissé (démo)</span></div><div class="card kpi"><span class="v">${conv} / ${clicks}</span><span class="l">Conversions / clics affiliation · ${money(comm)} estimés</span></div><div class="card kpi"><span class="v">${money(signed)}</span><span class="l">Partenariats signés / an · ${money(pipe)} en cours</span></div></div>
  <div class="grid g2" style="margin-top:16px;align-items:start"><section class="card"><h3>Derniers encaissements</h3><div class="list">${state.billing.slice(0, 8).map(b => `<div class="row"><span class="grow small">${esc(b.label)}</span><span class="num">${money2(b.amount, b.cur)}</span><span class="small muted">${fdate(b.date)}</span></div>`).join('') || '<div class="empty">Aucun encaissement dans cette démo.</div>'}</div><p class="tiny muted" style="margin:8px 0 0">Volume de services réservés : ${money(marketGMV)}, dont ${money(marketGMV * state.take / 100)} de commission.</p></section>
  <section class="card"><h3>Affiliation par partenaire</h3><div class="tablewrap"><table><thead><tr><th>Offre</th><th>Clics</th><th>Conv.</th><th>Taux</th><th>Commission est.</th></tr></thead><tbody>${state.perks.map(k => `<tr><td>${esc(k.name)} <span class="small muted">· ${esc(k.model)}</span></td><td class="num">${k.clicks}</td><td class="num">${k.conv}</td><td class="num">${k.clicks ? Math.round(k.conv / k.clicks * 100) : 0} %</td><td class="num">${money(k.conv * k.avg)}</td></tr>`).join('')}</tbody></table></div></section></div>`;
}
function vOpPartenariats() {
  const f = ui.partnerStage || 'all';
  const rows = state.partners.map((x, i) => ({x, i})).filter(({x}) => f === 'all' || x.stage === f);
  const byStage = PARTNER_STAGES.map(st => [st, state.partners.filter(x => x.stage === st)]);
  return head('Partenariats', 'Le pipeline des partenaires à signer. Les noms réels sont des cibles : aucun accord n’existe. Valeurs annuelles estimées, à remplacer.', `<button class="btn primary" data-action="addPartner">Ajouter un partenaire</button>`) + `
  <div class="chips" style="margin-bottom:14px"><button class="btn sm${f === 'all' ? ' primary' : ''}" data-action="partnerFilter" data-arg="all">Tous (${state.partners.length})</button>${byStage.map(([st, l]) => `<button class="btn sm${f === st ? ' primary' : ''}" data-action="partnerFilter" data-arg="${esc(st)}">${esc(st)} · ${l.length} · ${money(l.reduce((s, x) => s + n0(x.value), 0))}</button>`).join('')}</div>
  <section class="card"><div class="tablewrap"><table><thead><tr><th>Partenaire</th><th>Catégorie</th><th>Modèle</th><th>Étape</th><th>Valeur / an (€)</th><th>Prochaine action</th><th></th></tr></thead><tbody>${rows.map(({x, i}) => { const B = `partners.${i}.`; return `<tr><td style="min-width:170px"><input type="text" id="${fid(B + 'name')}" data-bind="${B}name" value="${esc(x.name)}">${x.real ? '<span class="tiny muted">Entreprise réelle · cible</span>' : '<span class="tiny muted">Exemple</span>'}</td><td><input type="text" id="${fid(B + 'cat')}" data-bind="${B}cat" value="${esc(x.cat)}" style="min-width:130px"></td><td><select id="${fid(B + 'model')}" data-bind="${B}model" style="min-width:170px">${PARTNER_MODELS.map(m => `<option${m === x.model ? ' selected' : ''}>${m}</option>`).join('')}</select></td><td><select id="${fid(B + 'stage')}" data-bind="${B}stage" data-rerender="1" style="min-width:150px">${PARTNER_STAGES.map(m => `<option${m === x.stage ? ' selected' : ''}>${m}</option>`).join('')}</select></td><td><input type="number" id="${fid(B + 'value')}" data-bind="${B}value" value="${esc(x.value)}" style="width:110px"></td><td style="min-width:200px"><input type="text" id="${fid(B + 'next')}" data-bind="${B}next" value="${esc(x.next)}"></td><td><div class="actions"><button class="btn sm" data-action="partnerOpen" data-arg="${i}">Détails</button><button class="btn sm icon danger" data-action="partnerDel" data-arg="${i}" aria-label="Supprimer">✕</button></div></td></tr>`; }).join('')}</tbody></table></div></section>`;
}
function vOpValidation() {
  const prov = state.providers.filter(x => x.status === 'en validation'), pass = state.player.docs.passport && state.player.docs.passport.status === 'fourni';
  const sol = state.solidarity.filter(x => x.status === 'en attente'), amb = state.ambApps.filter(x => x.status === 'en attente');
  const sec = (t, body) => `<section class="card" style="margin-bottom:16px"><h3>${t}</h3>${body}</section>`;
  return head('Validations', 'Tout ce qui demande un œil humain avant publication.') +
    sec('Prestataires', prov.length ? `<div class="list">${prov.map(s => `<div class="row"><div class="grow"><div class="t">${esc(s.name)}</div><div class="small muted">${esc(s.cat)} · ${esc(s.zone)} · ${money2(s.price)} / ${esc(s.unit)}</div></div><button class="btn sm primary" data-action="provOk" data-arg="${s.id}">Publier</button><button class="btn sm danger" data-action="provNo" data-arg="${s.id}">Refuser</button></div>`).join('')}</div>` : '<div class="empty">Aucun prestataire en attente.</div>') +
    sec('Vérifications d’identité', pass ? `<div class="row"><div class="grow"><div class="t">${esc(state.player.firstName)} ${esc(state.player.lastName)}</div><div class="small muted">Passeport fourni le ${fdate(state.player.docs.passport.date)}</div></div><button class="btn sm primary" data-action="verifyId">Vérifier</button></div>` : '<div class="empty">Aucune pièce en attente.</div>') +
    sec('Accès solidaire', sol.length ? `<div class="list">${sol.map(x => `<div class="row"><div class="grow"><div class="t">${esc(x.name)}</div><div class="small muted">Bourse : ${x.scholar ? 'oui' : 'non'} · Territoire prioritaire : ${x.zone ? 'oui' : 'non'} · « ${esc(x.motivation)} »</div></div><select id="sol_${x.id}" aria-label="Financeur">${state.partners.filter(p => p.model === 'Mécénat' || p.model === 'Sponsoring').map(p => `<option>${esc(p.name)}</option>`).join('') || '<option>Fonds propre</option>'}</select><button class="btn sm primary" data-action="solOk" data-arg="${x.id}">Accepter</button><button class="btn sm danger" data-action="solNo" data-arg="${x.id}">Refuser</button></div>`).join('')}</div>` : '<div class="empty">Aucune demande.</div>') +
    sec('Ambassadeurs et affiliés', amb.length ? `<div class="list">${amb.map(x => `<div class="row"><div class="grow"><div class="t">${esc(x.name)}</div><div class="small muted">${esc(x.kind)} · ${esc(x.detail || '')} · ${fdate(x.date)}</div></div><button class="btn sm primary" data-action="ambOk" data-arg="${x.id}">Accepter</button><button class="btn sm danger" data-action="ambNo" data-arg="${x.id}">Refuser</button></div>`).join('')}</div>` : '<div class="empty">Aucune candidature.</div>');
}
function vOpAmbassadeurs() {
  const r = state.ambRates;
  const tot = state.ambassadors.reduce((s, a) => s + n0(a.calls) * n0(r.call) + n0(a.contents) * n0(r.content), 0);
  return head('Ambassadeurs', 'Joueurs déjà sur place qui répondent aux futurs joueurs. Rémunération fixe, jamais liée à un placement.', `<span class="pill acc">${money(tot)} à verser ce mois</span>`) + `
  <section class="card" style="margin-bottom:16px"><div class="form">${F('ambRates.call','Rémunération par appel de 20 min','number',{unit:'€'})}${F('ambRates.content','Rémunération par contenu publié','number',{unit:'€'})}</div><p class="tiny muted" style="margin:8px 0 0">Pour un athlète NCAA en activité, cette rémunération relève du NIL : déclarée selon les règles de son université, sans lien avec le recrutement.</p></section>
  <section class="card"><div class="tablewrap"><table><thead><tr><th>Ambassadeur</th><th>Université</th><th>Depuis</th><th>Appels</th><th>Contenus</th><th>À verser</th><th>Statut</th></tr></thead><tbody>${state.ambassadors.map((a, i) => { const B = `ambassadors.${i}.`; return `<tr><td><b>${esc(a.name)}</b></td><td>${esc(a.univ)}</td><td>${esc(a.since)}</td><td><input type="number" id="${fid(B + 'calls')}" data-bind="${B}calls" value="${esc(a.calls)}" style="width:80px" data-rerender="1"></td><td><input type="number" id="${fid(B + 'contents')}" data-bind="${B}contents" value="${esc(a.contents)}" style="width:80px"></td><td class="num">${money(n0(a.calls) * n0(r.call) + n0(a.contents) * n0(r.content))}</td><td><select id="${fid(B + 'status')}" data-bind="${B}status">${['Actif','En pause','Arrêté'].map(x => `<option${x === a.status ? ' selected' : ''}>${x}</option>`).join('')}</select></td></tr>`; }).join('')}</tbody></table></div></section>`;
}

/* ---------- Modèle économique étendu ---------- */
const MODELS_MAP = [
  ['Abonnement joueur Pro','Joueur ou famille','Mensuel ou annuel','Faible','Valeur perçue à prouver','Implémenté'],
  ['Accompagnement humain','Famille','Forfait fixe','Élevé','Ne passe pas à l’échelle sans équipe','Implémenté'],
  ['Licence club / club partenaire','Club ou plateforme','Par équipe / reversement 20 %','Moyen','Budgets des clubs amateurs serrés','Implémenté'],
  ['Recruteur Pro','Université','Mensuel, prix public unique','Moyen','Règles NCAA sur les services de recrutement','Implémenté'],
  ['Détections et stages','Joueur / académie partenaire','Billet, part sur les stages','Élevé','Logistique, assurance','Implémenté'],
  ['Marketplace de services','Prestataire','Commission 15 %','Moyen','Qualité des prestataires','Implémenté'],
  ['Affiliation (assurance, argent, logement…)','Partenaire','CPA ou % de la vente','Faible','Statut d’intermédiaire en assurance à vérifier','Implémenté'],
  ['Académie en ligne','Joueur','Achat unique ou inclus dans Pro','Moyen à créer, faible ensuite','Contenu à maintenir à jour','Implémenté'],
  ['Marque blanche organisations','Académie, agence, lycée','Licence annuelle','Moyen','Cannibalise l’accompagnement','Implémenté (page Organisations)'],
  ['Abonnement outil pour agents','Agent licencié','Mensuel, sans commission','Faible','Aucune part sur un transfert','Implémenté (page Organisations)'],
  ['Mécénat et accès solidaire','Entreprise','Don fléché via structure éligible','Moyen','Structure juridique distincte à créer','Implémenté'],
  ['Sponsoring des détections','Marque','Naming, dotations','Moyen','Dépend de l’audience','Dans le simulateur'],
  ['Licence territoriale','District, ligue, fédération','Annuelle','Élevé (cycle long)','Décision politique, délais','Dans le pipeline'],
  ['Données agrégées anonymisées','Clubs, académies','Abonnement données','Élevé','Consentement, volume minimal','Non implémenté'],
  ['Commission sur bourse ou transfert','—','—','—','Interdit (NCAA) ou réservé aux agents licenciés','Écarté']
];
bizCalc = function (b) {
  const fees = n0(b.payFees) / 100, L = [], rUsd = n0(state.settings.rateUsd);
  const add = (k, rev, cost, why) => L.push({k, rev, cost, why});
  const proRev = n0(b.players) * n0(b.proConv) / 100 * n0(b.proPrice) * 12;
  add('Abonnements joueurs Pro', proRev, proRev * fees + proRev * n0(b.partnerShareOfPro) / 100 * n0(b.partnerShare) / 100, 'Récurrent, volume ; dépend de la valeur de l’audience et de l’analyse');
  const accRev = n0(b.accSales) * n0(b.accPrice);
  add('Accompagnement (forfaits)', accRev, accRev * (n0(b.accCostPct) / 100 + fees), 'Cash immédiat et marge humaine ; limité par le temps de l’équipe');
  const clubRev = n0(b.clubs) * n0(b.teamsPerClub) * n0(b.teamPrice);
  add('Licences club', clubRev, clubRev * fees, 'Acquisition par équipe entière');
  const recRev = n0(b.recruiters) * n0(b.recPrice) * rUsd * 12;
  add('Recruteurs Pro', recRev, recRev * fees, 'Côté demande ; prix public unique');
  const evRev = n0(b.events) * n0(b.eventPlayers) * n0(b.eventPrice);
  add('Journées de détection', evRev, n0(b.events) * n0(b.eventCost) + evRev * fees, 'Revenu, données certifiées, contenu');
  add('Part sur les stages', n0(b.campPlayers) * n0(b.campPrice) * n0(b.campShare) / 100, 0, 'Revenu sans logistique : l’académie partenaire organise');
  add('Commission services', n0(b.gmv) * n0(b.take) / 100, 0, 'Comble le manque de vidéo et de tests');
  add('Affiliation partenaires', n0(b.players) * n0(b.perkUsers) / 100 * n0(b.perkConv) / 100 * n0(b.perkCommission), 0, 'Petit montant, coût nul, utile au joueur');
  const wl = n0(b.wlOrgs) * n0(b.wlPrice) + n0(b.schools) * n0(b.schoolPrice);
  add('Marque blanche et établissements', wl, wl * fees, 'B2B récurrent ; peut concurrencer l’accompagnement');
  const ag = n0(b.agents) * n0(b.agentPrice) * 12;
  add('Abonnements agents', ag, ag * fees, 'Outil seulement, aucune commission');
  const sp = n0(b.sponsors) * n0(b.sponsorAmount);
  add('Mécénat et sponsoring', sp, sp * n0(b.sponsorCostPct) / 100, 'Finance l’accès solidaire et les détections');
  const ac = n0(b.academySales) * n0(b.academyPrice);
  add('Académie en ligne', ac, ac * fees, 'Marge élevée une fois le contenu produit');
  const gpu = n0(b.matches) * n0(b.gpuCost);
  const rev = L.reduce((s, x) => s + x.rev, 0), direct = L.reduce((s, x) => s + x.cost, 0) + gpu;
  return {L, rev, direct, gpu, gross:rev - direct, result:rev - direct - n0(b.fixed)};
};
function vBusinessV3() {
  const B = 'biz.', n = (k, l, u) => F(B + k, l, 'number', {unit:u, step:'any'});
  return head('Modèle économique', 'Simulateur sur 12 mois, 12 lignes de revenus. Toutes les valeurs sont des hypothèses à remplacer par des mesures.') + `
  <div id="bizOut" data-live="biz">${bizOutHTML()}</div>
  <section class="card" style="margin-top:16px"><div class="sec"><h3>Joueurs</h3><div class="form">${n('players','Joueurs actifs')}${n('proConv','Conversion vers Pro','%')}${n('proPrice','Revenu mensuel moyen par Pro','€')}${n('partnerShareOfPro','Pro venant de clubs partenaires','%')}${n('partnerShare','Part reversée au club','%')}${n('academySales','Ventes de l’Académie seule')}${n('academyPrice','Prix de l’Académie','€')}</div></div>
  <div class="sec"><h3>Accompagnement</h3><div class="form">${n('accSales','Forfaits vendus par an')}${n('accPrice','Panier moyen','€')}${n('accCostPct','Coût direct','%')}</div></div>
  <div class="sec"><h3>Organisations</h3><div class="form">${n('clubs','Clubs sous licence')}${n('teamsPerClub','Équipes par club')}${n('teamPrice','Prix par équipe et saison','€')}${n('recruiters','Programmes Recruteur Pro')}${n('recPrice','Prix mensuel Recruteur Pro','$')}${n('wlOrgs','Organisations en marque blanche')}${n('wlPrice','Prix marque blanche par an','€')}${n('schools','Établissements sous licence')}${n('schoolPrice','Prix établissement par an','€')}${n('agents','Agents abonnés')}${n('agentPrice','Prix mensuel agent','€')}</div></div>
  <div class="sec"><h3>Événements, services, affiliation</h3><div class="form">${n('events','Journées de détection par an')}${n('eventPlayers','Joueurs par journée')}${n('eventPrice','Billet moyen','€')}${n('eventCost','Coût d’une journée','€')}${n('campPlayers','Joueurs en stage par an')}${n('campPrice','Prix d’un stage','€')}${n('campShare','Part reversée par l’académie','%')}${n('gmv','Services réservés par an','€')}${n('take','Commission services','%')}${n('perkUsers','Joueurs qui cliquent une offre partenaire','%')}${n('perkConv','Conversion après clic','%')}${n('perkCommission','Commission moyenne par conversion','€')}</div></div>
  <div class="sec"><h3>Mécénat et coûts</h3><div class="form">${n('sponsors','Mécènes et sponsors')}${n('sponsorAmount','Montant moyen par an','€')}${n('sponsorCostPct','Part reversée en places solidaires et dotations','%')}${n('matches','Matchs analysés par an')}${n('gpuCost','Coût de calcul par match','€')}${n('payFees','Frais de paiement','%')}${n('fixed','Coûts fixes annuels','€')}</div></div></section>
  <section class="card" style="margin-top:16px"><h3>Carte des modèles</h3><div class="tablewrap"><table><thead><tr><th>Modèle</th><th>Qui paie</th><th>Mécanique</th><th>Effort</th><th>Risque principal</th><th>Dans le prototype</th></tr></thead><tbody>${MODELS_MAP.map(r => `<tr>${r.map((c, j) => `<td class="${j === 0 ? '' : 'small'}">${j === 0 ? `<b>${esc(c)}</b>` : j === 5 ? `<span class="pill ${/Implémenté/.test(c) ? 'ok' : c === 'Écarté' ? 'bad' : ''}">${esc(c)}</span>` : esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
}
const vAbonnementV2 = vAbonnement;

