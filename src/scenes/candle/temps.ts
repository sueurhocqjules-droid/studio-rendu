import { interpolate } from "remotion";
import calcul from "../../../sujets/candle.calcul.json";
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
    return calcul.n_max * (1 - lisse(entre(t, calcul.t_retour, calcul.t_fin - 0.2)));
  }
  return Math.min(t + 0.5, calcul.n_max);
};

// La pièce est noire, puis la lumière l'emporte : la palette bascule du sombre au blanc brûlant
const NUIT: Palette = { fond: "#16110D", encre: "#FFF1D6", accent: "#FFB347" };
const BRAISE: Palette = { fond: "#4A1E0E", encre: "#FFF1D6", accent: "#FFC857" };
const ORANGE: Palette = { fond: "#C2501B", encre: "#FFF6E5", accent: "#FFE08A" };
const AMBRE: Palette = { fond: "#F29B30", encre: "#2A1405", accent: "#7A1E0E" };
const BLANC: Palette = { fond: "#FFF2C4", encre: "#2A1405", accent: "#B5341F" };

const ZONES: [number, Palette][] = [
  [0, NUIT],
  [10, NUIT],
  [14, BRAISE],
  [19, BRAISE],
  [23, ORANGE],
  [30, ORANGE],
  [35, AMBRE],
  [38.5, AMBRE],
  [41, BLANC],
  [200, BLANC],
];

export const paletteA = (t: number) => paletteEntre(ZONES, pasDecor(t));
