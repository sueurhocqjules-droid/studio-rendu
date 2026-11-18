import { interpolate } from "remotion";
import calcul from "../../../sujets/popcorn.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

// Le décor suit le pas un peu en avance, comme le compteur
export const pasDecor = (t: number) => Math.min(t + 0.5 * Math.min(t / 2, 1), calcul.n_max);

export const kcalA = (pas: number) => calcul.k0_kcal * Math.pow(calcul.facteur, pas);

// Une palette par décor : salle de cinéma, savane, océan, nuit en mer, cuisine, pelouse, Paris au soir, pique-nique, carte, espace
export const CINEMA: Palette = { fond: "#5A0E1A", encre: "#FFF1D6", accent: "#FFC53D" };
const PALETTES: Record<string, Palette> = {
  elephant: { fond: "#F2B84B", encre: "#2B1806", accent: "#9E1F14" },
  baleine: { fond: "#1D5C86", encre: "#FFF6E4", accent: "#FFD166" },
  titanic: { fond: "#132849", encre: "#FFF4E0", accent: "#F4B942" },
  vie: { fond: "#F5E3BF", encre: "#2A1A0C", accent: "#B8321F" },
  stade: { fond: "#2F7D3A", encre: "#FFFDF2", accent: "#FFE066" },
  paris: { fond: "#EE9B6B", encre: "#26110A", accent: "#5E1634" },
  hotdogs: { fond: "#FBE0A6", encre: "#2A1406", accent: "#C21A2E" },
  usa: { fond: "#9FCDE4", encre: "#0F1F2E", accent: "#A8182C" },
  monde: { fond: "#0E1430", encre: "#FFF4DC", accent: "#FFC53D" },
};

export const paletteDe = (cle: string) => PALETTES[cle] ?? CINEMA;

const ZONES: [number, Palette][] = [
  [0, CINEMA],
  ...calcul.paliers.flatMap((p, i): [number, Palette][] => [
    [p.pas - 0.6, i === 0 ? CINEMA : PALETTES[calcul.paliers[i - 1].cle]],
    [p.pas, PALETTES[p.cle]],
  ]),
  [200, PALETTES.monde],
];

export const paletteA = (t: number): Palette => {
  if (t < calcul.t_limite + 0.1 || t >= calcul.t_fin) {
    return paletteEntre(ZONES, t >= calcul.t_fin ? 0 : pasDecor(t));
  }
  if (t < calcul.t_vrai) {
    return PALETTES.monde;
  }
  // Retour au réel : la salle de cinéma du tout premier plan, jusqu'à la boucle
  return CINEMA;
};
