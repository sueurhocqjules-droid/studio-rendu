import { interpolate } from "remotion";
import calcul from "../../../sujets/coin.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

// Le décor est une fonction du pas : au retour, la pile de pièces redescend
export const pasDecor = (t: number) => {
  if (t >= calcul.t_retour) {
    return calcul.n_max * (1 - lisse(entre(t, calcul.t_retour, calcul.t_fin)));
  }
  return Math.min(t + 0.5 * Math.min(t / 2, 1), calcul.n_max);
};

const CREME: Palette = { fond: "#F3E6C8", encre: "#2A2014", accent: "#B3261E" };
const ORANGE: Palette = { fond: "#E89B3C", encre: "#2A1A0A", accent: "#9C1D12" };
const BORDEAUX: Palette = { fond: "#6B1D2E", encre: "#FFF4D8", accent: "#FFD23F" };
const SAPIN: Palette = { fond: "#1D4D3A", encre: "#FFF4D8", accent: "#FFD23F" };
const NUIT: Palette = { fond: "#14304D", encre: "#FFF4D8", accent: "#FFD23F" };
const NOIR: Palette = { fond: "#0B0B12", encre: "#F4F1E6", accent: "#FFD23F" };

// Bascule courte quand l'encre passe de sombre à clair, pour garder le compteur lisible
const ZONES: [number, Palette][] = [
  [0, CREME],
  [20, CREME],
  [26, ORANGE],
  [28.7, ORANGE],
  [29.2, BORDEAUX],
  [38, BORDEAUX],
  [42, SAPIN],
  [46, SAPIN],
  [50, NUIT],
  [55, NUIT],
  [58.5, NOIR],
  [200, NOIR],
];

export const paletteA = (t: number) => paletteEntre(ZONES, pasDecor(t));
