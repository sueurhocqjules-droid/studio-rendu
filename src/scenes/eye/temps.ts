import { interpolate } from "remotion";
import calcul from "../../../sujets/eye.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

// Le décor suit le pas ; au retour, on revient au ciel du départ
export const pasDecor = (t: number) => {
  if (t >= calcul.t_fin) {
    return 0;
  }
  if (t >= calcul.t_retour) {
    return calcul.n_max * (1 - lisse(entre(t, calcul.t_retour, calcul.t_fin)));
  }
  return Math.min(t + 0.5, calcul.n_max);
};

const JOUR: Palette = { fond: "#BFE3F2", encre: "#13314A", accent: "#B5541B" };
const ORBITE: Palette = { fond: "#2C5D8A", encre: "#FFF6E5", accent: "#FFD166" };
const NUIT: Palette = { fond: "#101B33", encre: "#FFF6E5", accent: "#FFD166" };
const ROUGE: Palette = { fond: "#2A0F14", encre: "#FFF1E6", accent: "#FF9F68" };
const GRIS: Palette = { fond: "#22252B", encre: "#F4F1E6", accent: "#E8C872" };
const NOIR: Palette = { fond: "#050505", encre: "#F4F1E6", accent: "#FF9A3C" };

const ZONES: [number, Palette][] = [
  [0, JOUR],
  [5, JOUR],
  [7, ORBITE],
  [24, ORBITE],
  [27, NUIT],
  [37, NUIT],
  [40, ROUGE],
  [45, ROUGE],
  [49, GRIS],
  [52, GRIS],
  [54.5, NOIR],
  [200, NOIR],
];

export const paletteA = (t: number) => paletteEntre(ZONES, pasDecor(t));
