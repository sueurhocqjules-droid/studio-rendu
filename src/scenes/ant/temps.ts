import { interpolate } from "remotion";
import calcul from "../../../sujets/ant.calcul.json";
import { melange, paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

// Le décor suit le pas un peu en avance, comme le compteur
export const pasDecor = (t: number) => Math.min(t + 0.5 * Math.min(t / 2, 1), calcul.n_max);

export const chargeA = (pas: number) => calcul.m0_kg * Math.pow(calcul.facteur, pas);

// Une palette par décor : sous-bois, bureau, cuisine, salon, parc, jungle, port, Paris au soir, océan, canyon de nuit
const SOUS_BOIS: Palette = { fond: "#DDE8B4", encre: "#1C2610", accent: "#A7310E" };
const BUREAU: Palette = { fond: "#EBD3A2", encre: "#2A1B0A", accent: "#9C2A0C" };
const CUISINE: Palette = { fond: "#F4EEDF", encre: "#1E2228", accent: "#B23A12" };
const SALON: Palette = { fond: "#F2C49B", encre: "#2B160A", accent: "#7E1F10" };
const PARC: Palette = { fond: "#BCDCEB", encre: "#102230", accent: "#A12D10" };
const JUNGLE: Palette = { fond: "#A9CF8C", encre: "#13240C", accent: "#8A1F0C" };
const PORT: Palette = { fond: "#8EC7DC", encre: "#0B1C26", accent: "#9C200A" };
const SOIR: Palette = { fond: "#EFA266", encre: "#22100A", accent: "#5A1406" };
const OCEAN: Palette = { fond: "#2D5C7C", encre: "#FFF6E4", accent: "#FFC857" };
const CANYON: Palette = { fond: "#4A2235", encre: "#FFF2E0", accent: "#FFB347" };
export const TERRE: Palette = { fond: "#4B3324", encre: "#FFF3DE", accent: "#9BD36A" };

const ZONES: [number, Palette][] = [
  [0, SOUS_BOIS],
  [3.4, SOUS_BOIS],
  [4, BUREAU],
  [9.4, BUREAU],
  [10, CUISINE],
  [15.4, CUISINE],
  [16, SALON],
  [19.4, SALON],
  [20, PARC],
  [26.4, PARC],
  [27, JUNGLE],
  [31.4, JUNGLE],
  [32, PORT],
  [36.4, PORT],
  [37, SOIR],
  [39.4, SOIR],
  [40, OCEAN],
  [45.4, OCEAN],
  [46, CANYON],
  [200, CANYON],
];

export const paletteA = (t: number): Palette => {
  if (t < calcul.t_limite + 0.1 || t >= calcul.t_fin) {
    return paletteEntre(ZONES, t >= calcul.t_fin ? 0 : pasDecor(t));
  }
  if (t < calcul.t_vrai) {
    return CANYON;
  }
  if (t < calcul.t_nombre) {
    return SOUS_BOIS;
  }
  if (t < calcul.t_retour) {
    return TERRE;
  }
  // Le retour fond la terre dans le sous-bois du début, le texte bascule à mi-chemin
  const part = lisse(entre(t, calcul.t_retour, calcul.t_fin));
  const fond = melange(TERRE, SOUS_BOIS, part).fond;
  return part < 0.5 ? { ...TERRE, fond } : { ...SOUS_BOIS, fond };
};
