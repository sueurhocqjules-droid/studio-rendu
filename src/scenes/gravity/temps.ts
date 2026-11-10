import { interpolate } from "remotion";
import calcul from "../../../sujets/gravity.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

// Le compteur repart de zéro quand quelqu'un appuie sur la tare
export const pasCompteur = (t: number) => (t >= calcul.t_tare ? 0 : pasA(Math.min(t, calcul.t_limite), calcul.n_max));

export const pasDecor = (t: number) => {
  if (t >= calcul.t_tare) {
    return 0;
  }
  return Math.min(t + 0.5 * Math.min(t / 2, 1), calcul.n_max);
};

export const facteur = (n: number) => Math.pow(calcul.hausse, n);

// La hauteur de l'atmosphère varie comme 1/g
export const hauteurCiel = (n: number) => calcul.hauteur_echelle_m / facteur(n);

// Enfoncement de la pomme, en pixels sous la surface : terre, roche, manteau, noyau
export const COUCHES = { roche: 500, manteau: 2500, noyau: 6000 };

export const profondeur = (n: number) => interpolate(n, [33, 36, 37.5, 39.5, 45.5, 47], [0, 900, 1400, 3400, 6900, 9000], borne);

export const CUISINE: Palette = { fond: "#F0E0C0", encre: "#2B1C0E", accent: "#B5301A" };
const CIEL: Palette = { fond: "#8CCBE8", encre: "#10263A", accent: "#A32A16" };
const ESPACE: Palette = { fond: "#0B0C16", encre: "#F4EFE6", accent: "#FF8A3D" };
const TERRE: Palette = { fond: "#5B3A26", encre: "#FFF1D6", accent: "#FFC76A" };
const ROCHE: Palette = { fond: "#55545C", encre: "#F4EFE6", accent: "#FFC76A" };
const MANTEAU: Palette = { fond: "#A63A12", encre: "#FFF1D6", accent: "#FFD24A" };
const NOYAU: Palette = { fond: "#FFC24A", encre: "#3A1A08", accent: "#5A1E08" };

const ZONES: [number, Palette][] = [
  [0, CUISINE],
  [22.5, CUISINE],
  [23.6, CIEL],
  [26.8, CIEL],
  [27.6, ESPACE],
  [34.6, ESPACE],
  [35.6, TERRE],
  [36.8, TERRE],
  [37.5, ROCHE],
  [38.8, ROCHE],
  [39.5, MANTEAU],
  [44.8, MANTEAU],
  [45.5, NOYAU],
  [47.3, NOYAU],
  [47.9, ESPACE],
  [200, ESPACE],
];

export const paletteA = (t: number) => paletteEntre(ZONES, pasDecor(t));
