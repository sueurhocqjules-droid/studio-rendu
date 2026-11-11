import { interpolate, interpolateColors } from "remotion";
import calcul from "../../../sujets/time.calcul.json";
import { pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

export const P = calcul.pas;

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

// Le décor suit le pas : au rembobinage, il redescend jusqu'à la matinée du départ
export const pasDecor = (t: number) => {
  if (t >= calcul.t_retour) {
    return calcul.n_max * (1 - lisse(entre(t, calcul.t_retour, calcul.t_fin)));
  }
  return Math.min(t + 0.5 * Math.min(t / 2, 1), calcul.n_max);
};

// Temps réel écoulé depuis le départ : intégrale de facteur^n, en secondes
const LN = Math.log(calcul.facteur);
export const reel = (n: number) => (Math.pow(calcul.facteur, n) - 1) / LN;

// Secondes réelles par seconde de vidéo, mesurées sur le décor (vaut aussi au rembobinage)
export const debit = (t: number) => {
  const h = 1 / 60;
  return Math.abs(reel(pasDecor(t + h)) - reel(pasDecor(Math.max(t - h, 0)))) / (t - Math.max(t - h, 0) + h);
};

// Tout ce qui alterne (jour, nuit, saisons) se fond en moyenne avant d'aller plus vite qu'un cycle toutes les quelques secondes
export const ampliJour = (t: number) => 1 - entre(debit(t) / calcul.jour_s, 0.12, 0.4);
export const ampliSaison = (t: number) => 1 - entre(debit(t) / calcul.an_s, 0.15, 0.4);

export const heureA = (t: number) => (((calcul.heure_depart + reel(pasDecor(t)) / calcul.heure_s) % 24) + 24) % 24;
export const anneeA = (t: number) => {
  const jours = calcul.jour_depart + reel(pasDecor(t)) / calcul.jour_s;
  const an = calcul.an_s / calcul.jour_s;
  return ((jours % an) + an) % an / an;
};

const JOUR = "#9FD0E0";
const AUBE = "#EE9F63";
const NUIT_CIEL = "#1E2A3E";
const CREPUSCULE = "#E39B62";
const OCRE = "#D6A35E";
const GLACE = "#86A9B2";
const FOUGERE = "#D9CB8C";
const ESPACE = "#141B26";
const GEANT = "#B8401C";
export const SOMBRE = "#2A0E08";

const cielZone = (n: number) =>
  interpolateColors(
    n,
    [0, 13, 15.5, P.vie, P.vie + 2, P.pyramide + 1, P.pyramide + 3, P.sapiens + 2, P.sapiens + 4, P.dinos + 1, P.dinos + 2.5, P.terre - 0.5, P.terre + 1.5],
    [JOUR, JOUR, CREPUSCULE, CREPUSCULE, OCRE, OCRE, GLACE, GLACE, FOUGERE, FOUGERE, ESPACE, ESPACE, GEANT],
  );

// 0 le jour, 1 la nuit
export const nuitA = (h: number) => interpolate(h, [0, 5, 7, 17, 19, 24], [1, 1, 0, 0, 1, 1], borne);

const cielHeure = (h: number) => interpolateColors(h, [0, 5, 6.5, 8, 16.5, 18, 19.5, 24], [NUIT_CIEL, NUIT_CIEL, AUBE, JOUR, JOUR, AUBE, NUIT_CIEL, NUIT_CIEL]);

// Le ciel s'assombrit autour de l'horloge pendant le retournement
export const sombreA = (t: number) => entre(t, calcul.t_limite + 0.3, calcul.t_limite + 1) * (1 - entre(t, calcul.t_retour, calcul.t_retour + 0.6));

export const cielA = (t: number) => {
  const n = pasDecor(t);
  const ciel = interpolateColors(ampliJour(t), [0, 1], [cielZone(n), cielHeure(heureA(t))]);
  return interpolateColors(sombreA(t), [0, 1], [ciel, SOMBRE]);
};

const clarte = (couleur: string) => {
  const canaux = couleur.startsWith("#")
    ? [1, 3, 5].map((i) => parseInt(couleur.slice(i, i + 2), 16))
    : (couleur.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
  return 0.3 * canaux[0] + 0.59 * canaux[1] + 0.11 * canaux[2];
};

// L'encre bascule d'un coup selon la clarté du ciel, pour rester lisible de jour comme de nuit
export const paletteA = (t: number): Palette => {
  const fond = cielA(t);
  return clarte(fond) > 135 ? { fond, encre: "#1A1410", accent: "#9A2E0E" } : { fond, encre: "#FFF4E0", accent: "#FFC94A" };
};
