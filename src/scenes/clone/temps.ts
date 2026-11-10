import { interpolate } from "remotion";
import calcul from "../../../sujets/clone.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

// Le décor est une fonction du pas : au retour, les copies repartent dans l'ordre inverse
export const pasDecor = (t: number) => {
  if (t >= calcul.t_retour) {
    return calcul.n_max * (1 - lisse(entre(t, calcul.t_retour, calcul.t_fin)));
  }
  return Math.min(t + 0.5 * Math.min(t / 2, 1), calcul.n_max);
};

const PAPIER: Palette = { fond: "#EFE9DA", encre: "#20232A", accent: "#C8361F" };
const JAUNE: Palette = { fond: "#F2C230", encre: "#241C0A", accent: "#B32A16" };
const VERT: Palette = { fond: "#13584A", encre: "#FFF4D8", accent: "#FFD23F" };
const BLEU: Palette = { fond: "#12324F", encre: "#FFF4D8", accent: "#FFD23F" };
const NOIR: Palette = { fond: "#0B0B12", encre: "#F4F1E6", accent: "#FFD23F" };

// Bascule courte quand l'encre passe de sombre à clair, pour garder le compteur lisible
const ZONES: [number, Palette][] = [
  [0, PAPIER],
  [25, PAPIER],
  [30, JAUNE],
  [32.7, JAUNE],
  [33.2, VERT],
  [49, VERT],
  [50.5, BLEU],
  [57, BLEU],
  [60, NOIR],
  [200, NOIR],
];

export const paletteA = (t: number) => paletteEntre(ZONES, pasDecor(t));
