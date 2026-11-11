import { interpolate } from "remotion";
import calcul from "../../../sujets/heart.calcul.json";
import { melange, paletteEntre } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

const image = (t: number) => Math.min(Math.max(Math.round(t * calcul.fps), 0), calcul.tables.pas.length - 1);

// Tout vient des tables du calcul, image par image
export const pasA = (t: number) => calcul.tables.pas[image(t)];
export const hzAffiche = (t: number) => calcul.tables.hz[image(t)];
export const psiA = (t: number) => calcul.tables.psi[image(t)];
export const hzContinu = (t: number) => calcul.f0_hz * Math.pow(calcul.facteur, pasA(t));

// Palier atteint (index dans calcul.paliers), -1 avant le premier ; au retour, on suit le pas qui redescend
export const indexPalier = (t: number) => {
  const montee = t < calcul.t_limite;
  const pas = pasA(t);
  let index = -1;
  calcul.paliers.forEach((p, i) => {
    if (montee ? t >= p.arrivee_s : pas >= p.pas) {
      index = i;
    }
  });
  return index;
};

const CREME: Palette = { fond: "#FBEFE3", encre: "#3B0D16", accent: "#C8102E" };
const ROSE: Palette = { fond: "#F5C6C6", encre: "#3B0D16", accent: "#A30F27" };
const ROUGE: Palette = { fond: "#C8102E", encre: "#FFF3E8", accent: "#FFD9B8" };
const BORDEAUX: Palette = { fond: "#6E0F22", encre: "#FFF3E8", accent: "#FF9DAA" };
const NUIT: Palette = { fond: "#24080F", encre: "#FFF3E8", accent: "#FF7A8C" };
export const SALLE: Palette = { fond: "#2B170C", encre: "#FFF3E8", accent: "#F2C14E" };

// Le cœur rougit, puis s'assombrit quand on commence à l'entendre
const ZONES: [number, Palette][] = [
  [0, CREME],
  [9, CREME],
  [11, ROSE],
  [19, ROSE],
  [21, ROUGE],
  [25.6, ROUGE],
  [27, BORDEAUX],
  [34, BORDEAUX],
  [40, NUIT],
  [200, NUIT],
];

// Part de la salle de concert : elle arrive au La, s'efface au début du retour
export const partSalle = (t: number) =>
  t < calcul.t_limite ? 0 : entre(t, calcul.t_limite, calcul.t_limite + 0.4) * (1 - entre(t, calcul.t_retour, calcul.t_retour + 1.2));

export const paletteA = (t: number) => {
  const base = paletteEntre(ZONES, pasA(t));
  const salle = partSalle(t);
  return salle > 0 ? melange(base, SALLE, salle) : base;
};
