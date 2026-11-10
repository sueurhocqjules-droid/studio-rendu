# studio-rendu

Moteur de rendu de Shorts « What If ... Every Second? » : chaque vidéo est un vrai calcul animé par le code ([Remotion](https://www.remotion.dev/)), sans voix ni musique extérieure.

- `sujets/<nom>.json` : textes par langue et références sourcées ; `sujets/<nom>.calcul.json` : paliers calculés par `scripts/calcul_<nom>.py`
- `src/scenes/<nom>/` : l'animation de chaque sujet, `src/cadre/` : le cadre commun
- Rendu : `python scripts/rendre.py Rice-En:rice-en` en local, ou le workflow `Rendre` sur GitHub

Ce dépôt ne contient que le rendu. Aucune publication ni aucun identifiant ici.

Tous droits réservés.
