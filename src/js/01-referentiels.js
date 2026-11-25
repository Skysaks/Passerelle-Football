
"use strict";
const SOURCE = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
const IN_FRAME = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
const LS_KEY = 'passerelle-football-v1';

/* ---------- Référentiels ---------- */
const POS = ['Gardien','Défenseur central','Latéral droit','Latéral gauche','Milieu défensif','Milieu central','Milieu offensif','Ailier droit','Ailier gauche','Attaquant'];
const POS_EN = {'Gardien':'Goalkeeper','Défenseur central':'Centre-back','Latéral droit':'Right-back','Latéral gauche':'Left-back','Milieu défensif':'Defensive midfielder','Milieu central':'Central midfielder','Milieu offensif':'Attacking midfielder','Ailier droit':'Right winger','Ailier gauche':'Left winger','Attaquant':'Striker'};
const LEVELS = [
  ['national','National (3e division)',5,'National (French 3rd tier)'],
  ['n2','National 2 (4e division)',4,'National 2 (French 4th tier)'],
  ['n3','National 3 (5e division)',3.5,'National 3 (French 5th tier)'],
  ['r1','Régional 1 (6e division)',3,'Régional 1 (French 6th tier)'],
  ['u19n','U19 National',3.5,'U19 National (top French youth league)'],
  ['u17n','U17 National',3,'U17 National (top French U17 league)'],
  ['r2','Régional 2 (7e division)',2.5,'Régional 2 (French 7th tier)'],
  ['u19r','U19 Régional',2.5,'U19 Regional league'],
  ['r3','Régional 3 (8e division)',2,'Régional 3 (French 8th tier)'],
  ['district','District',1.5,'District (amateur)'],
  ['etranger','Championnat étranger',3,'Foreign league']
];
const ORGS = {
  'NCAA D1':{t:4,uni:1,ncaa:1},'NCAA D2':{t:3,uni:1,ncaa:1},'NCAA D3':{t:2,uni:1,ncaa:1,noAth:1},
  'NAIA':{t:3,uni:1},'NJCAA':{t:2.5,uni:1},'U Sports (Canada)':{t:2.5,uni:1},
  'Club semi-pro':{t:3.5},'Club amateur':{t:2.5},'Académie':{t:3}
};
const STAGES = ['À contacter','Contacté','Intérêt','Visite / essai','Offre','Engagé'];
const SL_STAGES = ['Repéré','À évaluer','Contacté','Offre envisagée','Écarté'];
const CLIP_TYPES = [
  ['but','But','1','#0b6b4d'],['passe-dec','Passe décisive','2','#2f5bd3'],['tir','Tir','3','#8a4fd1'],
  ['passe-cle','Passe clé','4','#18728f'],['dribble','Dribble réussi','5','#a8540f'],['duel','Duel gagné','6','#a33b5f'],
  ['recup','Récupération','7','#5b7d1f'],['arret','Arrêt','8','#6b5a3a'],['touche','Touche de balle','9','#5b6662']
];
const GOALS = ['Université USA','Université Canada','Club semi-pro France','Club à l’étranger','Académie'];
const DIPLOMAS = ['Bac en cours','Bac obtenu','Bac+1 en cours','Bac+2 ou plus','Autre'];
const ENG = ['Aucun','Duolingo English Test','TOEFL iBT','IELTS Academic','Cambridge (B2 First / C1)'];
const COACH_DIPLOMAS = ['Aucun','CFF 1/2/3','BMF','BEF','DES','UEFA B','UEFA A','UEFA Pro','Autre'];

const NAV = {
  joueur:[['accueil','Accueil'],['profil','Mon profil'],['videos','Vidéos'],['debouches','Débouchés'],['suivi','Suivi'],['messages','Messages'],['eligibilite','Éligibilité'],['offres','Offres'],['partage','Profil public']],
  entraineur:[['coach-accueil','Accueil'],['coach-profil','Mon profil'],['coach-effectif','Effectif'],['coach-matchs','Matchs d’équipe']],
  recruteur:[['recruteur-accueil','Accueil'],['recruteur-programme','Mon programme'],['prospects','Prospects'],['shortlist','Shortlist']],
  commun:[['annuaire','Universités et clubs'],['staffs','Entraîneurs'],['donnees','Données']]
};
const HOME = {joueur:'accueil',entraineur:'coach-accueil',recruteur:'recruteur-accueil'};
const ROLE_LABEL = {joueur:'Joueur',entraineur:'Entraîneur',recruteur:'Recruteur'};

