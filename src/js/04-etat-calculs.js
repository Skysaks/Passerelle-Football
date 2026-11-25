/* ---------- État ---------- */
let state;
const ui = {matchId:null, clipFilter:'all', tagPlayer:null, pick:null, debouches:{type:'all', country:'all', org:'all'}, prospects:{gender:'all', pos:'all', level:'0', minH:'', foot:'all', eng:false, video:false, budget:false, verified:false, q:''}, annuaire:{type:'all', country:'all', q:''}, staffQ:'', compare:[], aiBusy:false};
const caps = {sample:null, downloads:null, artifact:null, assets:null};
const videoURLs = {};
const PC = {stopAt:null, reel:null, idx:0, rec:null, chunks:[]};

function readSeed() { try { const t = $('#state-seed').textContent.trim(); return t ? JSON.parse(t) : null; } catch (e) { return null; } }
function readLocal() { try { const t = localStorage.getItem(LS_KEY); return t ? JSON.parse(t) : null; } catch (e) { return null; } }
function load() {
  const a = readSeed(), b = readLocal();
  let s = (a && b) ? ((b.savedAt || 0) >= (a.savedAt || 0) ? b : a) : (a || b);
  state = migrate(s && s.version === 1 ? s : demoState());
  if (!state.settings) state.settings = {rateUsd:0.9, rateCad:0.66};
}
let saveTimer = null;
function save() { state.savedAt = Date.now(); try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {} }
function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 300); }

/* ---------- Calculs métier ---------- */
const PLAYER_REQ = ['firstName','lastName','gender','birthDate','nationality','city','email','position','foot','height','weight','club','level','stats.matches','stats.minutes','stats.goals','stats.assists','physical.sprint30','physical.vma','academic.diploma','academic.average','academic.englishTest','project.availableFrom','project.budgetMax','bio','strengths'];
function playerCompleteness(p) {
  let ok = 0, tot = PLAYER_REQ.length + 4, missing = [];
  PLAYER_REQ.forEach(k => { if (has(get(k, p))) ok++; else missing.push(k); });
  if (p.project.goals.length) ok++; else missing.push('project.goals');
  if (p.history.length) ok++; else missing.push('history');
  if (p.academic.englishTest && p.academic.englishTest !== 'Aucun' && has(p.academic.englishScore)) ok++; else missing.push('academic.englishScore');
  const clips = playerClips(p.id).filter(c => c.status === 'validé').length;
  if (clips || p.demoClips) ok++; else missing.push('clips');
  return {pct:Math.round(ok / tot * 100), missing};
}
const PROG_REQ = ['name','type','org','country','region','city','gender','conference','website','rosterSize','intlShare','currency','costAnnual','avgAid','gpaMin','englishMin','majors','deadline','verifiedAt','sourceUrl'];
function programCompleteness(pr) {
  const isUni = ORGS[pr.org] && ORGS[pr.org].uni;
  const req = isUni ? PROG_REQ : ['name','type','org','country','region','city','gender','conference','website','verifiedAt','sourceUrl'];
  let ok = req.filter(k => has(pr[k])).length, tot = req.length + 3;
  if (pr.staff.length) ok++;
  if (pr.staff.length && pr.staff.every(s => has(s.email) && has(s.role))) ok++;
  if (Object.values(pr.needs || {}).some(v => n0(v) > 0)) ok++;
  return Math.round(ok / tot * 100);
}
const COACH_REQ = ['firstName','lastName','club','role','categories','diplomas','experienceYears','system','philosophy','email','phone','languages','bio','licence'];
function coachCompleteness(c) { return Math.round(COACH_REQ.filter(k => has(c[k])).length / COACH_REQ.length * 100); }
function staffCompleteness(s) { const k = ['name','role','email','phone','languages','social']; return Math.round(k.filter(x => has(s[x])).length / k.length * 100); }

function allPlayers(includeHidden) { const arr = [state.player, ...state.others]; return includeHidden ? arr : arr.filter(p => p.visibility.searchable && !((ageAt(p.birthDate) ?? 99) < 15 && !(p.guardian && p.guardian.consent))); }
function findPlayer(id) { return allPlayers(true).find(p => p.id === id); }
function findProgram(id) { return state.programs.find(p => p.id === id); }
function playerMatches(pid) { return state.matches.filter(m => m.playerId === pid || (m.team && m.clips.some(c => c.playerId === pid))); }
function playerClips(pid) { return state.matches.flatMap(m => m.clips.filter(c => c.playerId === pid)); }
function clipCount(p) { return playerClips(p.id).filter(c => c.status === 'validé').length || p.demoClips || 0; }

function matchScore(p, pr) {
  const o = ORGS[pr.org] || {t:2.5};
  const parts = [], block = [];
  const g = pr.gender, pg = p.gender;
  if (g && g !== 'Mixte' && pg && ((g === 'Masculin' && pg !== 'Homme') || (g === 'Féminin' && pg !== 'Femme'))) return {score:0, parts:[], block:['Programme ' + g.toLowerCase()], excluded:true};
  const lv = levelOf(p.level); const pt = lv ? lv[2] : 2.5; const diff = pt - o.t;
  const lvl = diff >= 0 ? Math.max(0, 35 - diff * 8) : Math.max(0, 35 + diff * 16);
  parts.push({pts:lvl, max:35, good:'Niveau cohérent avec la division', bad: diff < 0 ? 'Niveau probablement en dessous de la division' : 'Division probablement en dessous de ton niveau'});
  const need = n0((pr.needs || {})[p.position]), need2 = n0((pr.needs || {})[p.position2]);
  const pos = need > 0 ? 20 : need2 > 0 ? 12 : 4;
  parts.push({pts:pos, max:20, good: need > 0 ? `${need} départ${need > 1 ? 's' : ''} prévu${need > 1 ? 's' : ''} à ton poste` : `Besoin à ton poste secondaire`, bad:'Pas de besoin déclaré à ton poste'});
  if (o.uni) {
    const intl = Math.min(15, n0(pr.intlShare) / 50 * 15);
    parts.push({pts:intl, max:15, good:`${n0(pr.intlShare)} % d’internationaux dans l’effectif`, bad:`Peu d’internationaux (${n0(pr.intlShare)} %)`});
    const net = Math.max(0, n0(pr.costAnnual) - n0(pr.avgAid)) * rate(pr.currency);
    const bud = n0(p.project.budgetMax);
    const b = !bud ? 8 : net <= bud ? 15 : Math.max(0, 15 - (net - bud) / bud * 15);
    parts.push({pts:b, max:15, good:`Reste à charge estimé ${money(net)} / an, dans ton budget`, bad:`Reste à charge estimé ${money(net)} / an, au-dessus de ton budget`});
    const gpa = gpaFrom20(p.academic.average);
    const ac = gpa == null ? 5 : (!pr.gpaMin || gpa >= n0(pr.gpaMin)) ? 10 : 3;
    parts.push({pts:ac, max:10, good:'Niveau académique suffisant', bad: gpa == null ? 'Moyenne non renseignée' : `GPA estimé ${gpa.toFixed(1)} sous le minimum (${pr.gpaMin})`});
    const engOk = !pr.englishRequired || (p.academic.englishTest && p.academic.englishTest !== 'Aucun' && has(p.academic.englishScore));
    parts.push({pts:engOk ? 5 : 1, max:5, good:'Test d’anglais OK', bad:'Test d’anglais manquant'});
    if (o.noAth) block.push('Pas de bourse sportive en NCAA D3');
  }
  const got = parts.reduce((s, x) => s + x.pts, 0), max = parts.reduce((s, x) => s + x.max, 0);
  const score = Math.round(got / max * (o.uni ? 100 : 90));
  return {score, parts, block, note: o.uni ? '' : 'Évalué sur le niveau et le poste'};
}
function reasonsHTML(r) {
  if (r.excluded) return `<span class="pill">${esc(r.block[0])}</span>`;
  const good = r.parts.filter(x => x.good && x.pts / x.max >= .7).slice(0, 3).map(x => `<span class="pill ok">${esc(x.good)}</span>`);
  const bad = r.parts.filter(x => x.bad && x.pts / x.max < .5).slice(0, 2).map(x => `<span class="pill warn">${esc(x.bad)}</span>`);
  const bl = r.block.map(b => `<span class="pill bad">${esc(b)}</span>`);
  const nt = r.note ? [`<span class="pill">${esc(r.note)}</span>`] : [];
  return [...good, ...bad, ...bl, ...nt].join('');
}
function scoreClass(s) { return s >= 70 ? 'hi' : s >= 50 ? 'mid' : 'lo'; }
function ranked(p) { return state.programs.map(pr => ({pr, r:matchScore(p, pr)})).filter(x => !x.r.excluded).sort((a, b) => b.r.score - a.r.score); }

function eligibility(p) {
  const e = p.eligibility, items = [];
  const at = p.project.availableFrom ? new Date(p.project.availableFrom) : new Date();
  const age = ageAt(p.birthDate, at);
  items.push({l:'Âge au départ', s: p.birthDate ? 'info' : 'warn', d: p.birthDate ? `${age} ans à la date de départ visée. La NCAA D1 a adopté le 23 juin 2026 un modèle d’éligibilité fondé sur l’âge : règles exactes à vérifier avant de candidater.` : 'Renseigne ta date de naissance.'});
  items.push({l:'Statut amateur', s: e.proContract ? 'bad' : e.paidBeyond ? 'warn' : 'ok', d: e.proContract ? 'Un contrat professionnel signé peut rendre inéligible en NCAA : à faire examiner par la certification d’amateurisme.' : e.paidBeyond ? 'Une rémunération au-delà des frais réels doit être déclarée et examinée.' : 'Aucun signal bloquant déclaré.'});
  items.push({l:'Service ou agent', s: e.agentOnAid ? 'bad' : 'ok', d: e.agentOnAid ? 'Payer un service selon la bourse obtenue rend inéligible (NCAA, Bylaw 12.3.3).' : 'Aucune rémunération liée à l’aide obtenue.'});
  const gpa = gpaFrom20(p.academic.average);
  items.push({l:'Niveau académique', s: gpa == null ? 'warn' : gpa >= 2.3 ? 'ok' : gpa >= 2.0 ? 'warn' : 'bad', d: gpa == null ? 'Renseigne ta moyenne sur 20.' : `Moyenne ${p.academic.average}/20, soit environ ${gpa.toFixed(2)} de GPA (conversion indicative ; l’évaluation officielle revient à l’université et à la NCAA). Repères à vérifier : D1 2,3 et D2 2,2 sur les cours principaux.`});
  const eng = p.academic.englishTest && p.academic.englishTest !== 'Aucun';
  items.push({l:'Test d’anglais', s: eng && has(p.academic.englishScore) ? 'ok' : 'warn', d: eng ? `${p.academic.englishTest} : ${has(p.academic.englishScore) ? p.academic.englishScore : 'score à saisir'}` : 'La plupart des universités américaines en exigent un (Duolingo, TOEFL, IELTS).'});
  items.push({l:'NCAA Eligibility Center', s: e.ncaaRegistered ? 'ok' : 'warn', d: e.ncaaRegistered ? `Identifiant : ${e.ncaaId || 'à saisir'}` : 'Obligatoire pour la NCAA D1 et D2. Frais pour un étranger : environ 160 $ (à revérifier).'});
  items.push({l:'Passeport valide', s: e.passport ? 'ok' : 'warn', d: e.passport ? 'Validité à vérifier pour toute la durée du séjour.' : 'Requis pour le visa étudiant F-1.'});
  return items;
}
function nextActions(p) {
  const out = [], c = playerCompleteness(p);
  if (c.pct < 100) out.push({t:`Complète ton profil (${c.pct} %)`, r:'profil'});
  if (!(p.videos || []).some(v => v.localKey || v.assetId || v.link)) out.push({t:'Ajoute ta vidéo de temps forts au profil', r:'profil'});
  if (!playerClips(p.id).some(x => x.status === 'validé')) out.push({t:'Importe un match et marque tes actions', r:'videos'});
  if (p.docs && DOCS.some(([k]) => !p.docs[k])) out.push({t:`Complète ton dossier (${DOCS.filter(([k]) => p.docs[k]).length} / ${DOCS.length} pièces)`, r:'dossier'});
  const pend = playerClips(p.id).filter(x => x.status === 'proposé').length;
  if (pend) out.push({t:`Valide ${pend} clip${pend > 1 ? 's' : ''} proposé${pend > 1 ? 's' : ''} par l’analyse`, r:'videos'});
  eligibility(p).filter(i => i.s === 'bad' || i.s === 'warn').slice(0, 3).forEach(i => out.push({t:`Éligibilité : ${i.l}`, r:'eligibilite'}));
  const todo = Object.entries(p.pipeline).filter(([, s]) => s === 'À contacter').length;
  if (todo) out.push({t:`${todo} programme${todo > 1 ? 's' : ''} à contacter`, r:'suivi'});
  if (!Object.keys(p.pipeline).length) out.push({t:'Choisis tes premiers débouchés', r:'debouches'});
  return out;
}
function qualityScore(m) {
  let s = 0; const h = n0(m.height);
  s += h >= 1080 ? 30 : h >= 720 ? 20 : h ? 8 : 15;
  s += n0(m.duration) >= 4800 ? 10 : n0(m.duration) ? 5 : 5;
  const q = m.quality || {};
  s += q.fixed ? 15 : 0; s += q.wide ? 20 : 0; s += q.numbers ? 15 : 0; s += q.light ? 10 : 0;
  return Math.min(100, s);
}

