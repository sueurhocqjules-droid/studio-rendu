import { interpolate } from "remotion";
import calcul from "../../../sujets/zoom.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

export const PAS_ATOME = calcul.paliers.find((p) => p.cle === "atome")?.pas ?? 0;

// Nombre de zooms x2 déjà faits : on avance par à-coups, on revient à l'atome, puis on dézoome jusqu'à la main
export const pasDecor = (t: number) => {
  if (t >= calcul.t_fin) {
    return 0;
  }
  if (t >= calcul.t_retour) {
    return PAS_ATOME * (1 - lisse(entre(t, calcul.t_retour, calcul.t_fin - 0.3)));
  }
  if (t >= calcul.t_coupe) {
    return calcul.n_max + (PAS_ATOME - calcul.n_max) * lisse(entre(t, calcul.t_coupe, calcul.t_coupe + 0.8));
  }
  return pasCompteur(t);
};

const MAIN: Palette = { fond: "#F3E6D3", encre: "#2A1E14", accent: "#B4430E" };
const PEAU: Palette = { fond: "#E2A57E", encre: "#2A1210", accent: "#6E1A0E" };
const CELLULE: Palette = { fond: "#F4D3C4", encre: "#3A1A14", accent: "#A63A22" };
const BACTERIE: Palette = { fond: "#B9C79A", encre: "#1E2A12", accent: "#3E4E12" };
const VIRUS: Palette = { fond: "#CFE3D4", encre: "#10281C", accent: "#256B4C" };
const ADN: Palette = { fond: "#1D2B3A", encre: "#F4F1E8", accent: "#F2B134" };
const VIDE: Palette = { fond: "#0B0B0E", encre: "#F4F1E8", accent: "#F2B134" };
const NOYAU: Palette = { fond: "#1A0E0A", encre: "#FFF3E6", accent: "#FFD166" };

const ZONES: [number, Palette][] = [
  [0, MAIN],
  [2, MAIN],
  [3, PEAU],
  [8, PEAU],
  [9, CELLULE],
  [14, CELLULE],
  [15, BACTERIE],
  [18, BACTERIE],
  [19, VIRUS],
  [22.5, VIRUS],
  [23.5, ADN],
  [27, ADN],
  [28, VIDE],
  [41, VIDE],
  [42.5, NOYAU],
  [200, NOYAU],
];

export const paletteA = (t: number) => paletteEntre(ZONES, pasDecor(t));
