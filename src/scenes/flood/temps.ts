import { interpolate } from "remotion";
import calcul from "../../../sujets/flood.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

// Une fois la bonde tirée, la mer redescend jusqu'au centimètre du début : la boucle se referme
export const pasCompteur = (t: number) => {
  if (t >= calcul.t_retour) {
    return calcul.n_max * (1 - lisse(entre(t, calcul.t_retour, calcul.t_fin)));
  }
  return pasA(Math.min(t, calcul.t_limite), calcul.n_max);
};

// Le décor défile sans à-coups et arrive sur chaque palier au moment où le compteur l'atteint
export const pasDecor = (t: number) => {
  if (t >= calcul.t_retour) {
    return pasCompteur(t);
  }
  return Math.min(t + 0.5 * Math.min(t / 2, 1), calcul.n_max);
};

export const hauteurM = (n: number) => calcul.depart_m * Math.pow(calcul.facteur, n);

const JOUR: Palette = { fond: "#9ADCF2", encre: "#10304A", accent: "#D9481C" };
const HAUT: Palette = { fond: "#1F5AA6", encre: "#F6F3E8", accent: "#FFD54A" };
const NUIT: Palette = { fond: "#0A1238", encre: "#F6F3E8", accent: "#FFD54A" };
const ESPACE: Palette = { fond: "#04050E", encre: "#F6F3E8", accent: "#5BE3C0" };

const ZONES: [number, Palette][] = [
  [0, JOUR],
  [34, JOUR],
  [38, HAUT],
  [44, HAUT],
  [48, NUIT],
  [53, ESPACE],
  [200, ESPACE],
];

export const paletteA = (t: number) => paletteEntre(ZONES, pasDecor(t));
