import { interpolate } from "remotion";
import calcul from "../../../sujets/magnet.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

// Après le magnétar, on revient directement au frigo du départ
export const pasDecor = (t: number) => (t >= calcul.t_patte ? 0 : Math.min(t + 0.5, calcul.n_max));

const CUISINE: Palette = { fond: "#CFE8E1", encre: "#13302B", accent: "#C0392B" };
const CLINIQUE: Palette = { fond: "#BFD6EA", encre: "#10253A", accent: "#B5341F" };
const LABO: Palette = { fond: "#6E7A86", encre: "#FFFFFF", accent: "#FFD23F" };
const EXPLOSION: Palette = { fond: "#E8742C", encre: "#22110A", accent: "#FFF1C1" };
const ESPACE: Palette = { fond: "#0E1A33", encre: "#F4F6FF", accent: "#9FD8FF" };

const ZONES: [number, Palette][] = [
  [0, CUISINE],
  [13, CUISINE],
  [15.5, CLINIQUE],
  [22, CLINIQUE],
  [24.5, LABO],
  [30.5, LABO],
  [32.5, EXPLOSION],
  [37, EXPLOSION],
  [40, ESPACE],
  [200, ESPACE],
];

export const paletteA = (t: number) => (t >= calcul.t_coupe && t < calcul.t_patte ? { fond: "#05060B", encre: "#F4F6FF", accent: "#9FD8FF" } : paletteEntre(ZONES, pasDecor(t)));
