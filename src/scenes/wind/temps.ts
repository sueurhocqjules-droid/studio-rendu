import { interpolate } from "remotion";
import calcul from "../../../sujets/wind.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

// Le décor est une fonction du pas : quand le pas redescend, tout ce qui s'est envolé revient à sa place
export const pasDecor = (t: number) => {
  if (t >= calcul.t_retour) {
    return calcul.n_max * (1 - lisse(entre(t, calcul.t_retour, calcul.t_fin)));
  }
  return Math.min(t + 0.5 * Math.min(t / 2, 1), calcul.n_max);
};

export const vitesseKmh = (n: number) => calcul.depart_kmh * Math.pow(calcul.facteur, n);

const JOUR: Palette = { fond: "#A8DDF0", encre: "#15303F", accent: "#C8361F" };
const GRIS: Palette = { fond: "#7C8E99", encre: "#14202A", accent: "#FFE27A" };
const ORAGE: Palette = { fond: "#2B3640", encre: "#F4F1E6", accent: "#FFD23F" };
const NEPTUNE: Palette = { fond: "#1646A8", encre: "#F4F1E6", accent: "#8CF0E0" };
const PLASMA: Palette = { fond: "#C83E16", encre: "#FFF4D8", accent: "#FFE14A" };
export const BRULANT: Palette = { fond: "#7A1420", encre: "#FFF4D8", accent: "#FFD23F" };
const VIDE: Palette = { fond: "#04050E", encre: "#F4F1E6", accent: "#FFD23F" };

const ZONES: [number, Palette][] = [
  [0, JOUR],
  [12, JOUR],
  [16, GRIS],
  // Bascule courte : l'encre passe du sombre au clair, un mélange long rendrait le compteur illisible
  [26.7, GRIS],
  [27.2, ORAGE],
  [37, ORAGE],
  [40, NEPTUNE],
  [44, NEPTUNE],
  [48, PLASMA],
  [55, PLASMA],
  [57, BRULANT],
  [59.5, BRULANT],
  [60, VIDE],
  [200, VIDE],
];

export const paletteA = (t: number) => paletteEntre(ZONES, pasDecor(t));
