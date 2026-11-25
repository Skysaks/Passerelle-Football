# Sécurité / Security policy

## Signaler une faille

Merci de **ne pas ouvrir d'issue publique** pour un problème de sécurité.

Signale-le en privé sur GitHub : **Security → Report a vulnerability** sur ce dépôt. Indique ce qui est
touché, comment le reproduire et l'impact attendu. Accusé de réception sous 7 jours ; merci de laisser un
délai raisonnable pour corriger avant toute divulgation.

*Please report vulnerabilities privately through GitHub's "Report a vulnerability" button, never in a
public issue.*

## Périmètre

Dans le périmètre : `dist/passerelle-football.html`, les imports de fichiers (vidéo, résultats du moteur, sauvegarde JSON) et le profil public.
Hors périmètre : la plateforme d'hébergement elle-même (GitHub Pages, hébergeur de la version connectée)
et les failles de dépendances déjà suivies en amont.

## Ce qui est déjà en place

- **Aucune requête réseau à l'ouverture**, polices comprises : tout est embarqué dans le fichier. Le build
  et la CI échouent si une ressource externe réapparaît.
- **Aucun secret dans le code** : pas de clé d'API, pas de jeton, pas d'adresse personnelle ;
  `npm run verify` le contrôle à chaque push (`scripts/lib.mjs`, règles `privacyFindings`).
- Toutes les valeurs affichées passent par `esc()` ; l'état réinjecté dans la page échappe `<` pour ne jamais fermer la balise qui le contient.
- Aucune donnée réelle : joueurs, clubs et entraîneurs inventés ; les données saisies restent dans le navigateur.
- **Chaîne de build minimale** : aucune dépendance d'exécution ; une seule dépendance de développement
  (Playwright, pour les tests), contrôlée par `npm audit` à chaque exécution de la CI. Actions GitHub épinglées
  par empreinte SHA, jeton de CI en lecture seule.
