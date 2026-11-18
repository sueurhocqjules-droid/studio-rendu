import { interpolate } from "remotion";
import calcul from "../../../sujets/rope.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

export const pasDecor = (t: number) => {
  if (t >= calcul.t_retour) {
    return 0;
  }
  return Math.min(t + 0.5, calcul.n_max);
};


// Échelle de la scène : le pas qui fait doubler le lacet, avec la même montée que le compteur
export const pasEchelle = (t: number) => {
  if (t >= calcul.t_retour) {
    return 0;
  }
  return pasCompteur(t);
};

const p = (cle: string) => calcul.paliers.find((x) => x.cle === cle)?.pas ?? 0;

// La rue, la pelouse, le désert, la neige, la mer de la Manche, puis l'espace qui s'assombrit
const RUE: Palette = { fond: "#ECE6D8", encre: "#1F1B16", accent: "#D2401F" };
const PELOUSE: Palette = { fond: "#BFE3A5", encre: "#1B2A14", accent: "#C2361C" };
const DESERT: Palette = { fond: "#F2D49B", encre: "#2A1C0A", accent: "#B5321A" };
const NEIGE: Palette = { fond: "#DCEBF5", encre: "#14202B", accent: "#C2361C" };
const MANCHE: Palette = { fond: "#7FB7CF", encre: "#0F1E28", accent: "#B5241A" };
const ORBITE: Palette = { fond: "#14213A", encre: "#FFF3E2", accent: "#FF8A4C" };
const NOIR: Palette = { fond: "#080B12", encre: "#FFF3E2", accent: "#FF8A4C" };

const ZONES: [number, Palette][] = [
  [0, RUE],
  [p("bus") + 0.8, RUE],
  [p("bus") + 1.4, PELOUSE],
  [p("terrain") + 0.8, PELOUSE],
  [p("terrain") + 1.4, DESERT],
  [p("burj") + 0.8, DESERT],
  [p("burj") + 1.4, NEIGE],
  [p("everest") + 0.8, NEIGE],
  [p("everest") + 1.4, MANCHE],
  [p("parislondres") + 0.8, MANCHE],
  [p("parislondres") + 1.4, ORBITE],
  [p("lune") + 0.8, ORBITE],
  [p("lune") + 1.4, NOIR],
  [200, NOIR],
];

export const paletteA = (t: number) => paletteEntre(ZONES, pasDecor(t));
