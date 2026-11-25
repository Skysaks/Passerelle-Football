# Architecture

Passerelle Football est une application monopage en JavaScript sans dépendance (≈ 3 500 lignes), livrée en un seul fichier HTML (`dist/passerelle-football.html`, ≈ 490 Ko). Ce document décrit la chaîne de build, l'organisation par registres, la persistance et ses migrations, les niveaux de preuve et les moteurs.

## De `src/` à `dist/`

```
src/*.html ───────┐
src/styles/*.css  ├─ scripts/build.mjs ──► dist/passerelle-football.html
src/fonts/*.woff2 ┤     • <link rel="stylesheet"> → <style> (url() des polices → data:font/woff2)
src/js/*.js ──────┘     • <script src> d'un même data-bundle → un seul <script>
```

- Le gabarit référence les fichiers comme une page web classique ; les balises qui partagent un `data-bundle` sont concaténées dans l'ordre, sans séparateur. Le résultat est un script classique unique : les déclarations d'un module sont visibles de tous, comme dans un fichier d'un seul tenant.
- `npm run build -- --check` reconstruit en mémoire et compare octet par octet avec `dist/passerelle-football.html` ; la CI échoue au moindre écart.
- `scripts/lib.mjs` porte aussi les contrôles : ressources externes (balises `src`/`href`, `url()`, `@import`, `import()`) et données personnelles (adresses, jetons, liens privés, termes locaux d'un fichier `.prive-termes.txt` jamais publié).

## Modules

| Fichier | Rôle |
|---|---|
| `01-referentiels.js` | rôles, niveaux, postes, débouchés, clé de stockage |
| `02-utilitaires.js` | échappement, dates, identifiants, formats |
| `03-donnees-exemple.js` | joueur, effectif, programmes et entraîneurs fictifs |
| `04-etat-calculs.js` | état, chargement (`localStorage` puis graine JSON), sauvegarde ; calculs métier (complétude, plan de la semaine) |
| `05-formulaires-coquille.js` | champs de formulaire, coquille (rail, barre du haut, sélecteur de rôle) |
| `06-vues-joueur.js · 07-vues-entraineur-recruteur.js · 08-vues-communes.js` | vues des trois rôles ; `VIEWS` et `render()` |
| `09-fenetres-messages.js · 10-analyse-video-fichiers.js` | fenêtres, messagerie, analyse simulée, vidéo, fichiers |
| `11-actions.js · 12-evenements.js` | table `ACT` des actions et délégation d'événements |
| `13-… à 16-…` | médias, offres, audience, dossier, détections, services, abonnements, partenariats, académie, organisations, opérateur |
| `17-ergonomie-accessibilite.js` | fenêtres accessibles, toasts avec annulation, validation sous les champs, palette de commandes, thème, `afterRender` |
| `18-moteur-video.js` | import des résultats du moteur, choix du joueur, refus motivé, coût par match, vue opérateur ; migration de schéma 5 |
| `19-preuves-statistiques.js` | niveaux de preuve, population de référence, indice de preuve, graphiques SVG, feuille de match ; migration 6 |
| `20-profil-public.js` | profil public multilingue, aperçu et personnalisation |
| `21-video-studio.js` | projecteur, ralenti, annotation, studio de montage, chapitres |
| `22-apparence-accueil.js` | apparence, objectif du joueur, accueil composé de blocs |
| `23-moteurs-plateforme.js` | moteurs de cohérence, de priorités et de correspondance ; calibrage ; données de démonstration (schéma 8) |
| `24-qr-rapport-de-match.js` | encodeur QR code, rapport de match, validation des feuilles par l'entraîneur |
| `25-demarrage.js` | premier rendu, détection des capacités de l'hébergeur |

## Registres et extension

Le socle (modules 01 à 12) définit deux tables :

- `VIEWS` : une fonction par page (`#accueil`, `#profil`, `#stats`…), appelée par `render()` selon l'ancre de l'URL et le rôle courant ;
- `ACT` : une fonction par `data-action` ; `12-evenements.js` délègue tous les clics et changements vers elle.

Les modules suivants **ajoutent** leurs vues et actions (`Object.assign(ACT, {…})`) au lieu de modifier le socle ; quand ils doivent changer un comportement commun, ils enveloppent la fonction existante (par exemple `save`, pour invalider le cache des moteurs à chaque écriture). L'ordre de concaténation du gabarit est donc significatif : un module ne peut s'appuyer que sur ceux qui le précèdent.

## Persistance et migrations

```
démarrage ── localStorage["passerelle-football-v1"] ──┐
           └─ <script id="state-seed" type="application/json"> ─┴─► migrate5 → migrate6 → … → état courant
```

- L'état complet est sérialisé en JSON après chaque action.
- Il porte un numéro de schéma (`schema`) ; chaque évolution du modèle arrive avec sa fonction de migration, idempotente (`if (s.schema >= 5) return s`).
- En version hébergée, l'état peut être réinjecté dans la balise `state-seed` du fichier lui-même : la page se republie avec ses données (échappement de `<` pour ne jamais fermer la balise).

## Niveaux de preuve

| Rang | Niveau | Source |
|---|---|---|
| 0 | Déclaré | saisi par le joueur |
| 1 | Justifié | document déposé |
| 2 | Validé par l'entraîneur | feuille de match confirmée par le club |
| 3 | Mesuré sur vidéo | moteur, actions validées une à une |
| 4 | Certifié | test encadré (détection, stage, partenaire) |

L'**indice de preuve** agrège ces rangs ; la recherche des recruteurs peut exiger un niveau minimal.

## Moteurs

- **Cohérence** (`coherenceChecks`) : règles explicites sur les données déclarées (minutes > matchs × 95, buts et passes décisives > 3 par match, statistiques sans feuilles de match correspondantes…), classées en alerte ou blocage.
- **Priorités** : chaque action possible est estimée en gain pour le profil et en temps ; le plan de la semaine les trie.
- **Correspondance** : adéquation sportive entre un joueur et un programme, par paliers, à partir des mesures disponibles.
- **Calibrage** : l'opérateur règle les seuils de confiance au-delà desquels une action détectée est proposée à la validation.

Les calculs lourds sont mis en cache par version des données : toute écriture incrémente la version et invalide le cache.

## Tests

| Fichier | Vérifie |
|---|---|
| `tests/build.test.mjs` | `dist/` à jour, document complet (langue, encodage, viewport, titre, description), aucune ressource externe, aucun fichier orphelin dans `src/`, aucune donnée personnelle |
| `tests/e2e/app.spec.mjs` | ouverture hors ligne sans erreur ni requête, absence de débordement horizontal, parcours de toutes les pages du joueur, des points de vue entraîneur et recruteur, de la palette de commandes et de la barre d'onglets mobile ; en 1440 × 900 et en 390 × 844 tactile |

Les parcours sont décrits dans `build.config.json` (`e2e.flows`), ce qui garde le fichier de test générique.
