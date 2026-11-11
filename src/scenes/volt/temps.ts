import { interpolate } from "remotion";
import calcul from "../../../sujets/volt.calcul.json";
import { melange, paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

// Le décor suit la tension ; au retour, la pile se vide jusqu'à sa tension de départ
export const pasDecor = (t: number) => {
  if (t >= calcul.t_fin) {
    return 0;
  }
  if (t >= calcul.t_retour) {
    return calcul.n_max * (1 - lisse(entre(t, calcul.t_retour, calcul.t_fin)));
  }
  return Math.min(t + 0.5 * Math.min(t / 2, 1), calcul.n_max);
};

export const tensionDe = (pas: number) => calcul.v0 * Math.pow(calcul.facteur, pas);

const NOIR: Palette = { fond: "#1C1510", encre: "#FFF1D6", accent: "#FFD21F" };
const CUIVRE: Palette = { fond: "#6B3517", encre: "#FFF1D6", accent: "#FFD21F" };
const ROUGE: Palette = { fond: "#7A1A12", encre: "#FFF1D6", accent: "#FFD21F" };
const NUIT: Palette = { fond: "#0E0B08", encre: "#FFF1D6", accent: "#FFD21F" };
const JAUNE: Palette = { fond: "#FFD21F", encre: "#14110D", accent: "#A3260F" };

// Noir chaud, cuivre, rouge, nuit, puis tout l'écran devient jaune électrique à l'éclair
const ZONES: [number, Palette][] = [
  [0, NOIR],
  [10, NOIR],
  [13.5, CUIVRE],
  [24, CUIVRE],
  [27.5, ROUGE],
  [39, ROUGE],
  [41.5, NUIT],
  [58, NUIT],
  [60.5, JAUNE],
  [200, JAUNE],
];

export const paletteA = (t: number) => {
  if (t >= calcul.t_retour && t < calcul.t_fin) {
    // La descente repart de la nuit, sans repasser par le jaune
    return paletteEntre(ZONES, Math.min(pasDecor(t), 50));
  }
  if (t >= calcul.t_maison) {
    const part = lisse(entre(t, calcul.t_maison, calcul.t_maison + 0.4));
    return { ...melange(JAUNE, NUIT, part), encre: part < 0.5 ? JAUNE.encre : NUIT.encre, accent: part < 0.5 ? JAUNE.accent : NUIT.accent };
  }
  return paletteEntre(ZONES, pasDecor(t));
};
