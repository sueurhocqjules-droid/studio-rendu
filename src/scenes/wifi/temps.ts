import { interpolate } from "remotion";
import calcul from "../../../sujets/wifi.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

export const pasDecor = (t: number) => {
  if (t >= calcul.t_fin) {
    return 0;
  }
  if (t >= calcul.t_retour) {
    return calcul.n_max * (1 - lisse(entre(t, calcul.t_retour, calcul.t_fin)));
  }
  return Math.min(t + 0.5, calcul.n_max);
};

const SALON: Palette = { fond: "#F3E6CF", encre: "#2A1E14", accent: "#C2410C" };
const RETRO: Palette = { fond: "#5D6B3A", encre: "#FFF6DF", accent: "#F2D04B" };
const MUSIQUE: Palette = { fond: "#F29E4C", encre: "#2A1405", accent: "#7A1E0E" };
const ADN: Palette = { fond: "#1F6E6A", encre: "#F4FFF9", accent: "#FFD166" };
const CINEMA: Palette = { fond: "#8E1F2A", encre: "#FFF1E6", accent: "#FFD166" };
const BIBLIO: Palette = { fond: "#E9DDC4", encre: "#22170D", accent: "#8E2A0E" };
const FIBRE: Palette = { fond: "#0F2A44", encre: "#F2FAFF", accent: "#6FD6FF" };
const COUCHANT: Palette = { fond: "#E8794A", encre: "#25110A", accent: "#FFF1C1" };

const ZONES: [number, Palette][] = [
  [0, SALON],
  [17, SALON],
  [19.5, RETRO],
  [22.5, RETRO],
  [24.5, MUSIQUE],
  [30.5, MUSIQUE],
  [32.5, ADN],
  [34.5, ADN],
  [35.5, CINEMA],
  [36.6, CINEMA],
  [37.5, BIBLIO],
  [45, BIBLIO],
  [48, FIBRE],
  [52.5, FIBRE],
  [53.5, COUCHANT],
  [200, COUCHANT],
];

export const paletteA = (t: number) => paletteEntre(ZONES, pasDecor(t));
