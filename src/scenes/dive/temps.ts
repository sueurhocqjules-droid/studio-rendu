import { interpolate } from "remotion";
import calcul from "../../../sujets/dive.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

export const profondeurDe = (pas: number) => calcul.depart_m * Math.pow(calcul.facteur, pas);

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_fond), calcul.n_regle);

// Le décor suit le pas : le sous-marin descend d'un cran par seconde, bute au fond, puis remonte d'un trait
export const pasDecor = (t: number) => {
  if (t >= calcul.t_remonte) {
    return calcul.pas_fond * (1 - lisse(entre(t, calcul.t_remonte, calcul.t_fin)));
  }
  return Math.min(t + 0.5 * Math.min(t / 2, 1), calcul.pas_fond);
};

const SURFACE: Palette = { fond: "#3CC6C3", encre: "#05283A", accent: "#7A2208" };
const LAGON: Palette = { fond: "#1F9AB0", encre: "#03202E", accent: "#5C1600" };
const BLEU: Palette = { fond: "#14629B", encre: "#F6F1E2", accent: "#FFC83A" };
const MARINE: Palette = { fond: "#0C335E", encre: "#F6F1E2", accent: "#FFC83A" };
const ABYSSE: Palette = { fond: "#06182F", encre: "#F6F1E2", accent: "#FFC83A" };
const NUIT: Palette = { fond: "#020509", encre: "#F6F1E2", accent: "#8CF2C9" };

// L'eau s'assombrit avec la profondeur : turquoise, bleu, marine, puis le noir des abysses
const ZONES: [number, Palette][] = [
  [0, SURFACE],
  [8, SURFACE],
  [15, LAGON],
  [19, LAGON],
  [24, BLEU],
  [30, BLEU],
  [35, MARINE],
  [39, MARINE],
  [44, ABYSSE],
  [47, ABYSSE],
  [51, NUIT],
  [200, NUIT],
];

export const paletteA = (t: number) => paletteEntre(ZONES, pasDecor(t));
