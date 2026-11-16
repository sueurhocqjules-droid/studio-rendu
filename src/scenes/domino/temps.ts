import { interpolate } from "remotion";
import calcul from "../../../sujets/domino.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

const FIN_FOCUS = calcul.n_max + 0.5;
const REEL = 6;

// Le focus est le numéro (continu) du domino qui occupe le centre ; la caméra recule d'un facteur 1,5 par seconde
export const focusA = (t: number) => {
  if (t < calcul.t_coupe) {
    return Math.min(t + 0.5, FIN_FOCUS);
  }
  if (t < calcul.t_qui) {
    return FIN_FOCUS + (0.3 - FIN_FOCUS) * lisse(entre(t, calcul.t_coupe + 0.6, calcul.t_coupe + 2.4));
  }
  if (t < calcul.t_patte) {
    return 0.3 + (FIN_FOCUS - 0.3) * lisse(entre(t, calcul.t_qui, calcul.t_qui + 1.8));
  }
  if (t < calcul.t_retour) {
    return FIN_FOCUS + (REEL - FIN_FOCUS) * lisse(entre(t, calcul.t_patte, calcul.t_patte + 1.8));
  }
  return REEL + (0.5 - REEL) * lisse(entre(t, calcul.t_retour, calcul.t_fin));
};

// Horloge de la chaîne : le domino k bascule à partir de k - 1. Après l'épilogue, tout est relevé et le premier repart
export const horloge = (t: number) => (t >= calcul.t_patte ? t - calcul.duree_s : t);

const TABLE: Palette = { fond: "#F2E2C4", encre: "#22170D", accent: "#B8321F" };
const SAVANE: Palette = { fond: "#F6C65B", encre: "#2A1B05", accent: "#8E2A0E" };
const RIO: Palette = { fond: "#8FD0E8", encre: "#0E2433", accent: "#B23A0C" };
const DESERT: Palette = { fond: "#F0B27A", encre: "#2B160A", accent: "#7A1E0E" };
const CIEL: Palette = { fond: "#3F78B5", encre: "#FFF6E5", accent: "#FFD166" };
const STRATO: Palette = { fond: "#13284D", encre: "#FFF6E5", accent: "#FFD166" };
const ESPACE: Palette = { fond: "#05070D", encre: "#F4F1E6", accent: "#FFD166" };

const ZONES: [number, Palette][] = [
  [0, TABLE],
  [13, TABLE],
  [16, SAVANE],
  [20.5, SAVANE],
  [22.5, RIO],
  [27.5, RIO],
  [29.5, DESERT],
  [32, DESERT],
  [34, CIEL],
  [37, CIEL],
  [39.5, STRATO],
  [41, STRATO],
  [42.5, ESPACE],
  [200, ESPACE],
];

export const SOLS: [number, string][] = [
  [0, "#B5713A"],
  [13, "#B5713A"],
  [16, "#9AA344"],
  [20.5, "#9AA344"],
  [22.5, "#3E8A4F"],
  [27.5, "#3E8A4F"],
  [29.5, "#D49A5A"],
  [32, "#D49A5A"],
  [34, "#56677A"],
  [39.5, "#2E5E86"],
  [42.5, "#1F4F7A"],
];

export const paletteA = (t: number) => paletteEntre(ZONES, focusA(t));
