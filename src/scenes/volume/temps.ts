import { interpolate } from "remotion";
import calcul from "../../../sujets/volume.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

// L'immeuble est une fonction du pas : quand le volume redescend, il se reconstruit
export const pasDecor = (t: number) => {
  if (t >= calcul.t_retour) {
    return calcul.n_max * (1 - lisse(entre(t, calcul.t_retour, calcul.t_fin)));
  }
  return Math.min(t + 0.5 * Math.min(t / 2, 1), calcul.n_max);
};

export const niveauDb = (n: number) => calcul.depart_db + calcul.db_par_s * n;

const CALME: Palette = { fond: "#F7E6BE", encre: "#2A2230", accent: "#C8361F" };
const ALERTE: Palette = { fond: "#F2B632", encre: "#2A1E10", accent: "#A82412" };
const FEU: Palette = { fond: "#D9481B", encre: "#FFF4D8", accent: "#FFE14A" };
const LAVE: Palette = { fond: "#5E0F1E", encre: "#FFF4D8", accent: "#FFB03A" };
const NOIR: Palette = { fond: "#0A0A10", encre: "#F4F1E6", accent: "#FFD23F" };

// Bascules courtes quand l'encre change de sombre à clair, pour garder le compteur lisible
const ZONES: [number, Palette][] = [
  [0, CALME],
  [22, CALME],
  [26, ALERTE],
  [43.7, ALERTE],
  [44.2, FEU],
  [50.5, FEU],
  [51.2, LAVE],
  [57.5, LAVE],
  [58, NOIR],
  [200, NOIR],
];

export const paletteA = (t: number) => paletteEntre(ZONES, pasDecor(t));
