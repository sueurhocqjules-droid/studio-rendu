import { interpolate } from "remotion";
import calcul from "../../../sujets/sneeze.calcul.json";
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

export const vitesse = (pas: number) => calcul.v0_m_s * Math.pow(calcul.facteur, pas);

const p = (cle: string) => calcul.paliers.find((x) => x.cle === cle)?.pas ?? 0;

// De la savane au ciel, puis l'espace : le fond s'assombrit à mesure que l'éternuement quitte la Terre
const SAVANE: Palette = { fond: "#F6E3B4", encre: "#2B2112", accent: "#2F8F6B" };
const PISTE: Palette = { fond: "#DCE6E8", encre: "#1C2328", accent: "#C8322B" };
const CIEL: Palette = { fond: "#8FCBEA", encre: "#11283A", accent: "#B4271F" };
const HAUT: Palette = { fond: "#3B7BB4", encre: "#FFF7E6", accent: "#BFF5DC" };
const SOLEIL: Palette = { fond: "#3A1A12", encre: "#FFF2DC", accent: "#FFB23F" };
const ESPACE: Palette = { fond: "#0F1424", encre: "#FFF2DC", accent: "#8DF0C4" };
const LUNE: Palette = { fond: "#15181F", encre: "#FFF2DC", accent: "#8DF0C4" };

const ZONES: [number, Palette][] = [
  [0, SAVANE],
  [p("guepard") + 1.2, SAVANE],
  [p("guepard") + 1.8, PISTE],
  [p("f1") + 1.2, PISTE],
  [p("f1") + 1.8, CIEL],
  [p("balle") + 1.2, CIEL],
  [p("balle") + 1.8, HAUT],
  [p("liberation") + 1.2, HAUT],
  [p("liberation") + 1.8, SOLEIL],
  [p("sonde") + 1.2, SOLEIL],
  [p("sonde") + 1.8, ESPACE],
  [p("tour") + 1.2, ESPACE],
  [p("tour") + 1.8, LUNE],
  [200, LUNE],
];

export const paletteA = (t: number) => paletteEntre(ZONES, pasDecor(t));
