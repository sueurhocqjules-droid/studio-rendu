import { interpolate } from "remotion";
import calcul from "../../../sujets/press.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

export const pasDecor = (t: number) => {
  if (t >= calcul.t_fin) {
    return 0;
  }
  if (t >= calcul.t_retour) {
    return calcul.n_max * (1 - lisse(entre(t, calcul.t_retour, calcul.t_fin)));
  }
  return Math.min(t + 0.5, calcul.n_max);
};

const ATELIER: Palette = { fond: "#D9D4C7", encre: "#1F1D1A", accent: "#B5481B" };
const ACIER: Palette = { fond: "#7E8A96", encre: "#FFFFFF", accent: "#FFD23F" };
const BLEU: Palette = { fond: "#1E3A52", encre: "#FFF6E5", accent: "#8FE3F2" };
const MANTEAU: Palette = { fond: "#8A2E12", encre: "#FFF1E0", accent: "#FFD23F" };
const NOYAU: Palette = { fond: "#E89A2C", encre: "#24130A", accent: "#7A1E0E" };

const ZONES: [number, Palette][] = [
  [0, ATELIER],
  [14, ATELIER],
  [18, ACIER],
  [29, ACIER],
  [32, BLEU],
  [35, BLEU],
  [37, MANTEAU],
  [41, MANTEAU],
  [43, NOYAU],
  [200, NOYAU],
];

export const paletteA = (t: number) => paletteEntre(ZONES, pasDecor(t));
