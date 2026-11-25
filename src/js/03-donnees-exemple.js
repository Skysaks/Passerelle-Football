/* ---------- Données d'exemple (fictives) ---------- */
function blankPlayer() {
  return {id:uid(), demo:false, firstName:'', lastName:'', gender:'', birthDate:'', nationality:'', nationality2:'', city:'', country:'France', languages:'', email:'', phone:'',
    guardian:{name:'', email:'', phone:'', consent:false},
    position:'', position2:'', foot:'', height:'', weight:'', club:'', level:'', league:'', jersey:'', teamId:'',
    stats:{season:'2025-2026', matches:'', minutes:'', goals:'', assists:'', cleanSheets:''},
    physical:{sprint30:'', vma:'', jump:'', yoyo:'', testDate:''},
    academic:{diploma:'', gradYear:'', average:'', specialties:'', englishTest:'', englishScore:'', studyField:''},
    project:{goals:[], availableFrom:'', budgetMax:'', regions:'', notes:''},
    eligibility:{proContract:false, paidBeyond:false, agentOnAid:false, ncaaRegistered:false, ncaaId:'', passport:false},
    visibility:{searchable:true, showContacts:false, showAcademic:true, showPhysical:true, showStats:true},
    links:{highlight:'', instagram:'', other:''},
    bio:'', strengths:'', history:[], endorsements:[], statsValidated:false, pipeline:{}, demoClips:0,
    videos:[], docs:{}, verified:{identity:false}, testsCertified:null, videosVerified:false, docsShared:false};
}
function P(o) { const b = blankPlayer(); for (const k in o) { if (o[k] && typeof o[k] === 'object' && !Array.isArray(o[k]) && b[k] && typeof b[k] === 'object') Object.assign(b[k], o[k]); else b[k] = o[k]; } return b; }
function staff(name, role, email, phone, languages, notes) { return {id:uid(), name, role, email, phone:phone || '', languages:languages || '', social:'', notes:notes || ''}; }
function prog(o) { return Object.assign({id:uid(), demo:true, name:'', type:'Université', org:'', country:'', region:'', city:'', gender:'Masculin', conference:'', website:'', rosterSize:'', intlShare:'', currency:'USD', costAnnual:'', avgAid:'', gpaMin:'', englishRequired:true, englishMin:'', majors:'', deadline:'', facilities:'', notes:'', verifiedAt:'', sourceUrl:'', needs:{}, staff:[]}, o); }

function demoState() {
  const me = P({id:'me', demo:true, firstName:'Lucas', lastName:'Martin', gender:'Homme', birthDate:'2007-05-14', nationality:'Française', city:'Toulouse', country:'France', languages:'Français, anglais (B2), espagnol (A2)', email:'lucas.martin@exemple.fr', phone:'06 00 00 00 00',
    position:'Milieu central', position2:'Milieu défensif', foot:'Droit', height:180, weight:72, club:'US Exemple Toulouse', level:'n3', league:'National 3, groupe Occitanie', jersey:8, teamId:'team1',
    stats:{season:'2025-2026', matches:26, minutes:2140, goals:5, assists:7, cleanSheets:''},
    physical:{sprint30:4.05, vma:18.5, jump:55, yoyo:'19.2', testDate:'2026-09-12'},
    academic:{diploma:'Bac obtenu', gradYear:2025, average:13.4, specialties:'Maths, SES', englishTest:'Duolingo English Test', englishScore:115, studyField:'Business / gestion du sport'},
    project:{goals:['Université USA','Université Canada','Club semi-pro France'], availableFrom:'2027-08-01', budgetMax:8000, regions:'Indifférent', notes:''},
    eligibility:{proContract:false, paidBeyond:false, agentOnAid:false, ncaaRegistered:false, ncaaId:'', passport:true},
    links:{highlight:'', instagram:'@lucas.m8', other:''},
    bio:'Milieu box-to-box, gros volume de course, bon jeu long. Capitaine des U19 en 2024-2025. Cherche un cursus business avec du football à haut niveau.',
    strengths:'',
    history:[{season:'2025-2026', club:'US Exemple Toulouse', level:'National 3', category:'Seniors', apps:26},{season:'2024-2025', club:'US Exemple Toulouse', level:'U19 National', category:'U19', apps:22}],
    endorsements:[{id:uid(), coach:'Karim Benali', club:'US Exemple Toulouse', date:'2026-10-02', text:'Lucas est un milieu fiable, exigeant avec lui-même, qui a gagné sa place en seniors N3 à 18 ans. Je le recommande sans réserve pour un cursus sport-études.'}],
    statsValidated:true,
    pipeline:{p1:'Intérêt', p2:'Offre', p3:'Contacté', p4:'À contacter'}});
  const others = [
    P({id:'o1', demo:true, firstName:'Hugo', lastName:'Ferrand', gender:'Homme', birthDate:'2008-02-03', nationality:'Française', city:'Blagnac', position:'Défenseur central', foot:'Gauche', height:189, weight:81, club:'US Exemple Toulouse', level:'u19n', teamId:'team1', stats:{matches:24, minutes:2010, goals:3, assists:1}, physical:{sprint30:4.2, vma:17.5, jump:61}, academic:{diploma:'Bac en cours', gradYear:2026, average:12.1, englishTest:'Aucun'}, project:{goals:['Université USA'], availableFrom:'2027-08-01', budgetMax:6000}, bio:'Défenseur gaucher, bon dans les airs, relance propre.', demoClips:14}),
    P({id:'o2', demo:true, firstName:'Inès', lastName:'Garcia', gender:'Femme', birthDate:'2007-09-21', nationality:'Française', nationality2:'Espagnole', city:'Montpellier', position:'Attaquant', foot:'Droit', height:168, weight:58, club:'Montpellier Exemple Féminin', level:'r1', stats:{matches:20, minutes:1650, goals:17, assists:6}, physical:{sprint30:4.35, vma:16, jump:48}, academic:{diploma:'Bac obtenu', gradYear:2025, average:14.6, englishTest:'TOEFL iBT', englishScore:92}, project:{goals:['Université USA'], availableFrom:'2027-01-10', budgetMax:10000}, bio:'Attaquante rapide, finition des deux pieds.', demoClips:22}),
    P({id:'o3', demo:true, firstName:'Mamadou', lastName:'Ndiaye', gender:'Homme', birthDate:'2006-11-30', nationality:'Sénégalaise', city:'Dakar', country:'Sénégal', position:'Ailier gauche', foot:'Droit', height:176, weight:69, club:'AS Exemple Dakar', level:'etranger', league:'Ligue 2 sénégalaise', stats:{matches:22, minutes:1720, goals:8, assists:9}, physical:{sprint30:3.95, vma:19}, academic:{diploma:'Bac obtenu', gradYear:2024, average:12.8, englishTest:'Duolingo English Test', englishScore:105}, project:{goals:['Université USA','Club à l’étranger'], availableFrom:'2027-08-01', budgetMax:3000}, bio:'Ailier percutant, très rapide, 1 contre 1.', demoClips:18}),
    P({id:'o4', demo:true, firstName:'Pablo', lastName:'Ruiz', gender:'Homme', birthDate:'2007-03-08', nationality:'Espagnole', city:'Valence', country:'Espagne', position:'Gardien', foot:'Droit', height:191, weight:84, club:'CD Ejemplo Valencia', level:'etranger', league:'Tercera Federación', stats:{matches:25, minutes:2250, goals:0, assists:0, cleanSheets:9}, physical:{jump:66}, academic:{diploma:'Bac obtenu', gradYear:2025, average:15.2, englishTest:'IELTS Academic', englishScore:6.5}, project:{goals:['Université USA','Université Canada'], availableFrom:'2027-08-01', budgetMax:12000}, bio:'Gardien grand, bon jeu au pied.', demoClips:11}),
    P({id:'o5', demo:true, firstName:'Yanis', lastName:'Bouzid', gender:'Homme', birthDate:'2008-06-17', nationality:'Française', city:'Colomiers', position:'Latéral droit', foot:'Droit', height:174, weight:66, club:'US Exemple Toulouse', level:'u19n', teamId:'team1', stats:{matches:21, minutes:1780, goals:1, assists:5}, physical:{sprint30:4.0, vma:19.5}, academic:{diploma:'Bac en cours', gradYear:2026, average:11.2, englishTest:'Aucun'}, project:{goals:['Club semi-pro France','Université USA'], availableFrom:'2027-08-01', budgetMax:4000}, bio:'Latéral offensif, centres précis.', demoClips:9}),
    P({id:'o6', demo:true, firstName:'Sofia', lastName:'Almeida', gender:'Femme', birthDate:'2008-01-12', nationality:'Portugaise', city:'Porto', country:'Portugal', position:'Milieu offensif', foot:'Gauche', height:165, weight:55, club:'Clube Exemplo Porto', level:'etranger', league:'Campeonato Nacional II', stats:{matches:18, minutes:1440, goals:6, assists:11}, academic:{diploma:'Bac en cours', gradYear:2026, average:16.1, englishTest:'Cambridge (B2 First / C1)', englishScore:'C1'}, project:{goals:['Université USA'], availableFrom:'2027-08-01', budgetMax:15000}, bio:'Meneuse de jeu, vision et coups de pied arrêtés.', demoClips:16})
  ];
  const programs = [
    prog({id:'p1', name:'Northfield State University', type:'Université', org:'NCAA D2', country:'États-Unis', region:'Ohio', city:'Northfield', gender:'Masculin', conference:'Great Lakes Athletic (exemple)', website:'', rosterSize:28, intlShare:42, currency:'USD', costAnnual:38000, avgAid:22000, gpaMin:2.5, englishMin:'Duolingo 100 / TOEFL 71', majors:'Business, Sport management, Engineering', deadline:'2027-03-01', verifiedAt:'', needs:{'Milieu central':2,'Défenseur central':1},
      staff:[staff('Daniel Reyes','Entraîneur principal','d.reyes@northfield.example','+1 000 000 0000','Anglais, espagnol'), staff('Mark Ellison','Entraîneur adjoint / recrutement','m.ellison@northfield.example','','Anglais')]}),
    prog({id:'p2', name:'Bayshore College', type:'Université', org:'NAIA', country:'États-Unis', region:'Floride', city:'Bayshore', gender:'Masculin', conference:'Sun Coast (exemple)', rosterSize:30, intlShare:55, costAnnual:32000, avgAid:20000, gpaMin:2.0, englishMin:'Duolingo 95', majors:'Business, Kinésiologie', deadline:'2027-04-15', needs:{'Ailier gauche':2,'Attaquant':1,'Milieu central':1},
      staff:[staff('Tom Whitaker','Entraîneur principal','t.whitaker@bayshore.example','','Anglais'), staff('Luis Ortega','Coordinateur du recrutement','l.ortega@bayshore.example','','Anglais, espagnol, portugais')]}),
    prog({id:'p3', name:'Granite Valley University', type:'Université', org:'NCAA D1', country:'États-Unis', region:'Colorado', city:'Granite Valley', gender:'Masculin', conference:'Mountain (exemple)', rosterSize:28, intlShare:30, costAnnual:62000, avgAid:30000, gpaMin:2.3, englishMin:'TOEFL 80', majors:'Ingénierie, Économie', deadline:'2027-01-15', needs:{'Défenseur central':1,'Gardien':1},
      staff:[staff('Andrew Collins','Entraîneur principal','a.collins@granitevalley.example','','Anglais'), staff('Ben Okafor','Entraîneur adjoint','b.okafor@granitevalley.example','','Anglais')]}),
    prog({id:'p4', name:'Lakeside Community College', type:'Université', org:'NJCAA', country:'États-Unis', region:'Texas', city:'Lakeside', gender:'Masculin', conference:'Region XIV (exemple)', rosterSize:26, intlShare:50, costAnnual:18000, avgAid:9000, gpaMin:2.0, englishMin:'Duolingo 85', majors:'Associate degrees, transfert vers 4 ans', deadline:'2027-05-01', needs:{'Milieu défensif':1,'Latéral droit':1,'Ailier gauche':1},
      staff:[staff('Rick Alvarez','Entraîneur principal','r.alvarez@lakeside.example','','Anglais, espagnol')]}),
    prog({id:'p5', name:'Pinecrest University', type:'Université', org:'NCAA D3', country:'États-Unis', region:'Pennsylvanie', city:'Pinecrest', gender:'Féminin', conference:'Keystone (exemple)', rosterSize:30, intlShare:4, costAnnual:58000, avgAid:28000, gpaMin:3.0, englishMin:'TOEFL 90', majors:'Liberal arts, Biologie', deadline:'2027-01-01', notes:'Pas de bourse sportive en D3 : aides au mérite académique uniquement.', needs:{'Attaquant':1,'Milieu offensif':1},
      staff:[staff('Rachel Moore','Entraîneure principale','r.moore@pinecrest.example','','Anglais')]}),
    prog({id:'p6', name:'Université de Rivière-Claire', type:'Université', org:'U Sports (Canada)', country:'Canada', region:'Québec', city:'Rivière-Claire', gender:'Masculin', conference:'RSEQ (exemple)', rosterSize:26, intlShare:20, currency:'CAD', costAnnual:26000, avgAid:6000, gpaMin:'', englishRequired:false, englishMin:'Cursus en français', majors:'Administration, STAPS', deadline:'2027-03-01', needs:{'Milieu central':1,'Gardien':1},
      staff:[staff('Julien Tremblay','Entraîneur-chef','j.tremblay@riviereclaire.example','','Français, anglais')]}),
    prog({id:'p7', name:'Seaview University', type:'Université', org:'NCAA D1', country:'États-Unis', region:'Caroline du Nord', city:'Seaview', gender:'Féminin', conference:'Atlantic Coast (exemple)', rosterSize:28, intlShare:18, costAnnual:54000, avgAid:32000, gpaMin:2.3, englishMin:'TOEFL 79', majors:'Communication, Business', deadline:'2027-02-01', needs:{'Attaquant':2,'Milieu offensif':1},
      staff:[staff('Kate Henderson','Entraîneure principale','k.henderson@seaview.example','','Anglais'), staff('Ana Lima','Adjointe, recrutement international','a.lima@seaview.example','','Anglais, portugais, espagnol')]}),
    prog({id:'p8', name:'AS Exemple Occitanie', type:'Club', org:'Club semi-pro', country:'France', region:'Occitanie', city:'Montauban', gender:'Masculin', conference:'National 2', currency:'EUR', costAnnual:'', avgAid:'', englishRequired:false, englishMin:'', majors:'', notes:'Contrat fédéral possible, emploi aménagé.', needs:{'Milieu central':1,'Ailier droit':1},
      staff:[staff('Stéphane Roux','Entraîneur principal','s.roux@asexemple.example','05 00 00 00 00','Français')]}),
    prog({id:'p9', name:'FC Exemple Bruxelles', type:'Club', org:'Club amateur', country:'Belgique', region:'Bruxelles', city:'Bruxelles', gender:'Masculin', conference:'Division 3 nationale', currency:'EUR', englishRequired:false, needs:{'Milieu défensif':1,'Défenseur central':1},
      staff:[staff('Koen Peeters','Entraîneur principal','k.peeters@fcexemple.example','','Français, néerlandais, anglais')]}),
    prog({id:'p10', name:'Academia Atlântico', type:'Académie', org:'Académie', country:'Portugal', region:'Algarve', city:'Faro', gender:'Mixte', currency:'EUR', costAnnual:9000, avgAid:2000, englishRequired:false, majors:'Programme football + lycée international', notes:'Académie privée, détections trimestrielles.', needs:{'Ailier gauche':1,'Attaquant':1},
      staff:[staff('Rui Costa Santos','Directeur sportif','r.santos@atlantico.example','','Portugais, anglais, français')]})
  ];
  const m1Clips = [['but',1260,4],['passe-dec',2210,5],['passe-cle',540,4],['tir',3120,3],['dribble',3710,3],['recup',980,3],['duel',1690,2],['passe-cle',4480,4],['recup',5020,3]].map(([type,t,rating]) => ({id:uid(), type, t, dur:10, rating, inReel:rating >= 4, origin:'manuel', status:'validé', playerId:'me'}));
  m1Clips.push({id:uid(), type:'tir', t:2580, dur:10, rating:0, inReel:false, origin:'ia', status:'proposé', playerId:'me'}, {id:uid(), type:'duel', t:4010, dur:10, rating:0, inReel:false, origin:'ia', status:'proposé', playerId:'me'});
  const m2Clips = [['me','recup',820],['me','passe-cle',1900],['o1','duel',640],['o1','but',3300],['o5','passe-dec',3300],['o5','dribble',2400],['me','touche',4100]].map(([pid,type,t]) => ({id:uid(), type, t, dur:10, rating:0, inReel:false, origin:'ia', status:'proposé', playerId:pid}));
  return {
    version:1, savedAt:0, role:'joueur', theme:'',
    settings:{rateUsd:0.90, rateCad:0.66},
    player:me, others,
    coach:{firstName:'Karim', lastName:'Benali', club:'US Exemple Toulouse', role:'Entraîneur principal', categories:'Seniors N3, U19 National', diplomas:'BEF', experienceYears:11, system:'4-3-3', philosophy:'Pressing haut, possession orientée vers l’avant, formation des jeunes vers les seniors.', email:'k.benali@usexemple.example', phone:'06 00 00 00 01', languages:'Français, arabe, anglais', bio:'Ancien milieu de N2, éducateur au club depuis 2015.', licence:'', teamName:'US Exemple Toulouse, Seniors N3', inviteCode:'USX-N3-' + (hashStr('team1') % 9000 + 1000)},
    recruiter:{name:'Daniel Reyes', role:'Entraîneur principal', email:'d.reyes@northfield.example', programId:'p1'},
    programs,
    matches:[
      {id:'m1', playerId:'me', team:false, title:'US Exemple Toulouse – FC Démo Albi', date:'2026-11-08', opponent:'FC Démo Albi', competition:'National 3', source:'demo', link:'', fileName:'', duration:5400, width:1920, height:1080, quality:{fixed:true, wide:true, numbers:true, light:true}, qualityScore:0, aiPick:null, clips:m1Clips, reel:[]},
      {id:'m2', playerId:'', team:true, title:'US Exemple Toulouse – Stade Exemple Rodez B', date:'2026-11-15', opponent:'Stade Exemple Rodez B', competition:'National 3', source:'demo', link:'', fileName:'', duration:5400, width:3840, height:2160, quality:{fixed:true, wide:true, numbers:false, light:true}, qualityScore:0, aiPick:null, clips:m2Clips, reel:[]}
    ],
    messages:[
      {id:uid(), programId:'p1', coachName:'Daniel Reyes', coachEmail:'d.reyes@northfield.example', subject:'2027 Central midfielder, Lucas Martin (National 3, France)', body:'Dear Coach Reyes, …', status:'envoyé', dir:'out', date:'2026-10-20'},
      {id:uid(), programId:'p1', coachName:'Daniel Reyes', coachEmail:'d.reyes@northfield.example', subject:'Re: 2027 Central midfielder', body:'Thanks Lucas. Could you send one full match and your transcripts? We are recruiting two central midfielders for fall 2027.', status:'reçu', dir:'in', date:'2026-10-28'}
    ],
    offers:[{id:uid(), programId:'p2', cost:32000, athletic:14000, academic:6000, other:0, currency:'USD', deadline:'2027-02-01', notes:'Offre verbale, à confirmer par écrit.'}],
    notifications:[
      {id:uid(), to:'joueur', text:'Northfield State University a consulté ton profil.', date:'2026-11-20', read:false},
      {id:uid(), to:'joueur', text:'Ton entraîneur a validé tes statistiques de la saison.', date:'2026-11-02', read:true},
      {id:uid(), to:'entraineur', text:'2 joueurs de ton effectif ont des clips en attente de validation.', date:'2026-11-16', read:false}
    ],
    shortlist:[{playerId:'me', stage:'À évaluer', note:'Volume de course intéressant, revoir un match complet.'},{playerId:'o3', stage:'Repéré', note:''}]
  };
}

