import { interpolate } from "remotion";
import calcul from "../../../sujets/pizza.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

// Horloge des coupes : la coupe k + 1 tranche le morceau k pendant [k, k + 1). En fin de boucle, la pizza est entière
export const horloge = (t: number) => (t >= calcul.t_fin ? t - calcul.duree_s : t);

// Morceaux qui se rassemblent pendant le retour
export const rassemble = (t: number) => (t < calcul.t_retour || t >= calcul.t_fin ? 0 : lisse(entre(t, calcul.t_retour, calcul.t_fin - 0.3)));

// Niveau de zoom continu : le morceau z occupe le cadre
export const zoomA = (t: number) => {
  if (t >= calcul.t_fin) {
    return 0;
  }
  if (t >= calcul.t_retour) {
    return calcul.n_max * (1 - lisse(entre(t, calcul.t_retour + 0.2, calcul.t_fin - 0.2)));
  }
  const k = Math.floor(t);
  return Math.min(calcul.n_max, k + lisse(entre(t - k, 0.12, 0.55)));
};

const NAPPE: Palette = { fond: "#F4ECDF", encre: "#2B1A10", accent: "#C0392B" };
const FROMAGE: Palette = { fond: "#F2C14E", encre: "#2B1A10", accent: "#9C2A12" };
const LAME: Palette = { fond: "#DCEBF2", encre: "#10283A", accent: "#B8321F" };
const CHAMP: Palette = { fond: "#1C3B4A", encre: "#F6F1E6", accent: "#FFC94A" };
const MOLECULE: Palette = { fond: "#14182B", encre: "#F6F1E6", accent: "#F4B942" };
const VIDE: Palette = { fond: "#07080C", encre: "#F4F1E6", accent: "#F4B942" };

const ZONES: [number, Palette][] = [
  [0, NAPPE],
  [5, NAPPE],
  [7.5, FROMAGE],
  [13, FROMAGE],
  [16, LAME],
  [24, LAME],
  [26.5, CHAMP],
  [33, CHAMP],
  [35.5, MOLECULE],
  [41.5, MOLECULE],
  [43, VIDE],
  [200, VIDE],
];

export const paletteA = (t: number) => paletteEntre(ZONES, zoomA(t));
