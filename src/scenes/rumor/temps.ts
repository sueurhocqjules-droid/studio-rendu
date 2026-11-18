import { interpolate } from "remotion";
import calcul from "../../../sujets/rumor.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

// Le décor avance d'une demi-seconde sur le compteur ; au retour, tout reprend à la seconde 0
export const pasDecor = (t: number) => {
  if (t >= calcul.t_retour) {
    return 0;
  }
  return Math.min(t + 0.5, calcul.n_max);
};

// Nombre de personnes qui savent pour un pas non entier : interpolé en échelle log entre deux secondes
export const saventA = (pas: number) => {
  const bas = Math.floor(pas);
  const haut = Math.min(bas + 1, calcul.savent.length - 1);
  const part = pas - bas;
  return Math.exp(Math.log(calcul.savent[bas]) * (1 - part) + Math.log(calcul.savent[haut]) * part);
};

// Une salle de classe au papier crème, puis le bâtiment, la mer, la pelouse, la ville de nuit, et la Terre
const PAPIER: Palette = { fond: "#F3E9D2", encre: "#1D2B24", accent: "#D2463C" };
const BRIQUE: Palette = { fond: "#E7B48C", encre: "#2A140C", accent: "#B3261E" };
const MER: Palette = { fond: "#2C7DA0", encre: "#FFF7E8", accent: "#FFD25A" };
const PELOUSE: Palette = { fond: "#3E8E4B", encre: "#FFF8E8", accent: "#FFD25A" };
const NUIT: Palette = { fond: "#1B2233", encre: "#FFF4E0", accent: "#FF6B57" };
const SOIR: Palette = { fond: "#3A2A3F", encre: "#FFF4E0", accent: "#FFC145" };
const ESPACE: Palette = { fond: "#0D1720", encre: "#FFF4E0", accent: "#FF6B57" };

const p = (cle: string) => calcul.paliers.find((x) => x.cle === cle)?.pas ?? 0;

const ZONES: [number, Palette][] = [
  [0, PAPIER],
  [p("classe"), PAPIER],
  [p("classe") + 0.6, BRIQUE],
  [p("ecole"), BRIQUE],
  [p("ecole") + 0.6, MER],
  [p("paquebot"), MER],
  [p("paquebot") + 0.6, PELOUSE],
  [p("stade"), PELOUSE],
  [p("stade") + 0.6, NUIT],
  [p("ville"), NUIT],
  [p("ville") + 0.6, SOIR],
  [p("inde"), SOIR],
  [p("inde") + 0.6, ESPACE],
  [200, ESPACE],
];

export const paletteA = (t: number) => paletteEntre(ZONES, pasDecor(t));
