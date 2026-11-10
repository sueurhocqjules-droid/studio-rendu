import { interpolate, interpolateColors } from "remotion";
import calcul from "../../../sujets/ice.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

// La couleur d'un objet suit le froid : une liste de [pas, couleur]
export const teinte = (n: number, etapes: [number, string][]) =>
  interpolateColors(
    Math.min(Math.max(n, etapes[0][0]), etapes[etapes.length - 1][0]),
    etapes.map(([p]) => p),
    etapes.map(([, c]) => c),
  );

// L'été revient d'un coup au retournement : le compteur et le décor repartent de zéro
export const pasCompteur = (t: number) => (t >= calcul.t_fonte ? 0 : pasA(Math.min(t, calcul.t_limite), calcul.n_max));

export const pasDecor = (t: number) => {
  if (t >= calcul.t_fonte) {
    return 0;
  }
  return Math.min(t + 0.5 * Math.min(t / 2, 1), calcul.n_max);
};

export const celsius = (seconde: number) => Math.max(calcul.depart_c - calcul.perte_c * seconde, calcul.zero_c);

export const kelvin = (n: number) => Math.max(-calcul.zero_c - calcul.perte_c * n, 0);

const ETE: Palette = { fond: "#FFD27A", encre: "#3A1A08", accent: "#B5301A" };
const NEIGE: Palette = { fond: "#DCEEF2", encre: "#12324A", accent: "#B5301A" };
const POLAIRE: Palette = { fond: "#16304F", encre: "#EAF6FF", accent: "#7FD3FF" };
const NUIT: Palette = { fond: "#050814", encre: "#EAF6FF", accent: "#7FD3FF" };
const ATOMES: Palette = { fond: "#0B1E33", encre: "#EAF6FF", accent: "#7FD3FF" };

const ZONES: [number, Palette][] = [
  [0, ETE],
  [4, ETE],
  [13, NEIGE],
  [20.5, NEIGE],
  [22.5, POLAIRE],
  [49, POLAIRE],
  [53, NUIT],
  [64, NUIT],
  [65, ATOMES],
  [200, ATOMES],
];

export const paletteA = (t: number) => paletteEntre(ZONES, pasDecor(t));
