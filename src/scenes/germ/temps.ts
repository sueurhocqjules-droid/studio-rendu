import { interpolate } from "remotion";
import calcul from "../../../sujets/germ.calcul.json";
import { melange, paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

// Nombre de divisions déjà faites, continu : la masse vaut m0 x 2^pas
export const pasCompteur = (t: number) => (t >= calcul.t_retour ? 0 : pasA(Math.min(t, calcul.t_limite), calcul.n_max));

const MICRO: Palette = { fond: "#DDEFE2", encre: "#12301E", accent: "#2E8B57" };
const BANC: Palette = { fond: "#F2E9D8", encre: "#2A2116", accent: "#2F8A4E" };
const CUISINE: Palette = { fond: "#F2D98A", encre: "#2B2210", accent: "#2F6E3E" };
const SALON: Palette = { fond: "#C6E05A", encre: "#142410", accent: "#7A2E10" };
const ESPACE: Palette = { fond: "#0E1F2A", encre: "#F2F7EC", accent: "#9BE36B" };
const FAMINE: Palette = { fond: "#8C8A80", encre: "#1C1B17", accent: "#F2EEDC" };
const GELOSE: Palette = { fond: "#2B2A26", encre: "#F4EAD0", accent: "#E8C46A" };

const ZONES: [number, Palette][] = [
  [0, MICRO],
  [17, MICRO],
  [20, BANC],
  [29, BANC],
  [32, CUISINE],
  [48, CUISINE],
  [52, SALON],
  [200, SALON],
];

export const paletteA = (t: number): Palette => {
  if (t >= calcul.t_retour + 0.5) {
    return MICRO;
  }
  if (t >= calcul.t_point) {
    return melange(FAMINE, GELOSE, entre(t, calcul.t_point, calcul.t_point + 0.4));
  }
  if (t >= calcul.t_patte) {
    return melange(ESPACE, FAMINE, entre(t, calcul.t_patte, calcul.t_patte + 1.2));
  }
  if (t >= calcul.t_qui) {
    return melange(SALON, ESPACE, entre(t, calcul.t_qui, calcul.t_qui + 0.4));
  }
  return paletteEntre(ZONES, pasCompteur(t));
};
