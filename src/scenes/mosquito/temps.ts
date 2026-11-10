import { interpolate } from "remotion";
import calcul from "../../../sujets/mosquito.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

const lisse = (x: number) => x * x * (3 - 2 * x);

// Au retour, tout redescend en 2,6 s : le moustique revient vers le bras
const descente = (t: number) => calcul.n_max * (1 - lisse(entre(t, calcul.t_retour, calcul.t_bras)));

export const pasCompteur = (t: number) => {
  if (t >= calcul.t_bras) {
    return 0;
  }
  if (t >= calcul.t_retour) {
    return descente(t);
  }
  return pasA(Math.min(t, calcul.t_limite), calcul.n_max);
};

export const pasDecor = (t: number) => {
  if (t >= calcul.t_bras) {
    return 0;
  }
  if (t >= calcul.t_retour) {
    return descente(t);
  }
  return Math.min(t + 0.5 * Math.min(t / 2, 1), calcul.n_max);
};

export const longueur = (n: number) => calcul.depart_m * Math.pow(2, n);

// Le moustique garde sa taille à l'écran : c'est le monde qui rétrécit, à l'échelle réelle
export const taillePx = (n: number) => interpolate(n, [0, 6], [320, 430], borne);

export const echelle = (n: number) => taillePx(n) / longueur(n);

const CHAMBRE: Palette = { fond: "#7FB7A6", encre: "#10261E", accent: "#7A1510" };
const NUIT: Palette = { fond: "#16213D", encre: "#F4EFE6", accent: "#FFC76A" };
const ESPACE: Palette = { fond: "#07080F", encre: "#F4EFE6", accent: "#FF8A3D" };

const ZONES: [number, Palette][] = [
  [0, CHAMBRE],
  [9.2, CHAMBRE],
  [9.8, NUIT],
  [22, NUIT],
  [26, ESPACE],
  [200, ESPACE],
];

export const paletteA = (t: number) => paletteEntre(ZONES, pasDecor(t));
