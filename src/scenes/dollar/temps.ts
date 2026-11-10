import { interpolate } from "remotion";
import calcul from "../../../sujets/dollar.calcul.json";
import { melange, paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

export const pasDollar = (t: number) => pasA(t, calcul.pas_max);

const FEUTRE: Palette = { fond: "#0E5A41", encre: "#FFF6E6", accent: "#F5CF5E" };
const CARRELAGE: Palette = { fond: "#E9DEC7", encre: "#14352A", accent: "#A8240F" };
const GAZON: Palette = { fond: "#2F6B38", encre: "#FFF6E6", accent: "#FFE36B" };
const VILLE: Palette = { fond: "#333C48", encre: "#F3EAD7", accent: "#F2B84B" };
const CHAMPS: Palette = { fond: "#D2A646", encre: "#1B1712", accent: "#5A2A12" };
const OCEAN: Palette = { fond: "#0E2E5C", encre: "#F3EAD7", accent: "#9FE0A0" };
const ESPACE: Palette = { fond: "#070B18", encre: "#F3EAD7", accent: "#7BE08A" };
const OR: Palette = { fond: "#E8B52A", encre: "#1B1712", accent: "#5A3A00" };
const ROUGE: Palette = { fond: "#C8261C", encre: "#FFF6E6", accent: "#FFE36B" };

const ZONES: [number, Palette][] = [
  [0, FEUTRE],
  [8, FEUTRE],
  [10, CARRELAGE],
  [13, CARRELAGE],
  [15, GAZON],
  [23, GAZON],
  [25, VILLE],
  [33, VILLE],
  [35, CHAMPS],
  [43, CHAMPS],
  [46, OCEAN],
  [49, OCEAN],
  [51, ESPACE],
  [62, ESPACE],
  [62.8, OR],
];

export const paletteA = (t: number): Palette => {
  if (t >= calcul.t_fin) {
    return FEUTRE;
  }
  if (t >= calcul.t_egal) {
    return melange(ROUGE, FEUTRE, interpolate(t, [calcul.t_egal, calcul.t_egal + 0.25], [0, 1], { extrapolateRight: "clamp" }));
  }
  if (t >= calcul.t_prix) {
    return melange(OR, ROUGE, interpolate(t, [calcul.t_prix, calcul.t_prix + 0.15], [0, 1], { extrapolateRight: "clamp" }));
  }
  return paletteEntre(ZONES, pasDollar(t));
};
