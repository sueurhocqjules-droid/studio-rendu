import { interpolate } from "remotion";
import calcul from "../../../sujets/moon.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

// Après la naissance, le compteur remonte de 24 000 km jusqu'à la distance d'aujourd'hui : la boucle se referme
export const pasCompteur = (t: number) => {
  if (t >= calcul.t_naissance) {
    return calcul.n_naissance * (1 - lisse(entre(t, calcul.t_naissance + 0.4, calcul.t_fin)));
  }
  return pasA(Math.min(t, calcul.t_limite), calcul.n_max);
};

// La marée et le zoom : ils retombent à zéro quand la Lune n'existe plus
export const pasDecor = (t: number) => {
  if (t >= calcul.t_naissance) {
    return 0;
  }
  if (t >= calcul.t_anneaux) {
    return calcul.n_max * (1 - lisse(entre(t, calcul.t_anneaux, calcul.t_naissance - 0.3)));
  }
  return Math.min(t + 0.5 * Math.min(t / 2, 1), calcul.n_max);
};

export const pasLune = (t: number) => (t >= calcul.t_naissance ? pasCompteur(t) : Math.min(t + 0.5 * Math.min(t / 2, 1), calcul.n_max));

export const distanceKm = (n: number) => calcul.depart_km * Math.pow(calcul.facteur, n);

export const mareeM = (n: number) => calcul.maree_depart_m * Math.pow(calcul.facteur, -3 * n);

const RAYON_DEPART_PX = 34;

// Taille vue depuis la surface de la Terre, au téléobjectif : 34 px aujourd'hui, tout l'écran à la fin
export const rayonLunePx = (n: number) =>
  (RAYON_DEPART_PX * (calcul.depart_km - calcul.rayon_terre_km)) / (distanceKm(n) - calcul.rayon_terre_km);

const NUIT: Palette = { fond: "#0E1A33", encre: "#F4EFE6", accent: "#FFD27A" };
const MAREE: Palette = { fond: "#1B1430", encre: "#F4EFE6", accent: "#FF9A5A" };
const RUPTURE: Palette = { fond: "#2A0F1E", encre: "#F4EFE6", accent: "#FF6A4A" };

const ZONES: [number, Palette][] = [
  [0, NUIT],
  [30, NUIT],
  [42, MAREE],
  [52, MAREE],
  [58, RUPTURE],
  [200, RUPTURE],
];

export const paletteA = (t: number) => paletteEntre(ZONES, pasDecor(t));
