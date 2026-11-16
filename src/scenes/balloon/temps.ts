import { interpolate } from "remotion";
import calcul from "../../../sujets/balloon.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

const FIN = calcul.n_max + 0.5;

// Pas continu du décor : la caméra recule de la racine cubique de 3 chaque seconde
export const pasDecor = (t: number) => {
  if (t >= calcul.t_fin) {
    return 0.5;
  }
  if (t >= calcul.t_retour) {
    return FIN + (0.5 - FIN) * lisse(entre(t, calcul.t_retour, calcul.t_fin - 0.3));
  }
  return Math.min(t + 0.5, FIN);
};

const CHAMBRE: Palette = { fond: "#F6E7D2", encre: "#2A1B12", accent: "#C0392B" };
const CIEL: Palette = { fond: "#9CD3EE", encre: "#10283A", accent: "#C0392B" };
const HAUT: Palette = { fond: "#3E7CB8", encre: "#FFF6E5", accent: "#FFD166" };
const ORBITE: Palette = { fond: "#0F1E3A", encre: "#F4F6FF", accent: "#FFD166" };

const ZONES: [number, Palette][] = [
  [0, CHAMBRE],
  [9, CHAMBRE],
  [12, CIEL],
  [27, CIEL],
  [31, HAUT],
  [37, HAUT],
  [41, ORBITE],
  [200, ORBITE],
];

const VIDE: Palette = { fond: "#020205", encre: "#F4F6FF", accent: "#FF6B6B" };

export const paletteA = (t: number) => (t >= calcul.t_limite + 1 && t < calcul.t_qui + 0.3 ? VIDE : paletteEntre(ZONES, pasDecor(t)));
