import { interpolate } from "remotion";
import calcul from "../../../sujets/spin.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

// Le décor est une fonction du pas : quand la Terre ralentit, le monde retombe sur le globe
export const pasDecor = (t: number) => {
  if (t >= calcul.t_retour) {
    return calcul.n_max * (1 - lisse(entre(t, calcul.t_retour, calcul.t_fin)));
  }
  return Math.min(t + 0.5 * Math.min(t / 2, 1), calcul.n_max);
};

export const vitesseKmh = (n: number) => calcul.v0_kmh * Math.pow(calcul.taux, n);

const VITESSE_DEPART = 0.7; // rad/s à l'écran, pour que la rotation reste lisible

const angleAvant = (t: number) => {
  const k = Math.log(calcul.taux);
  const tBorne = Math.min(t, calcul.t_limite);
  const montee = (VITESSE_DEPART * (Math.exp(k * tBorne) - 1)) / k;
  const pleine = VITESSE_DEPART * Math.exp(k * calcul.t_limite) * Math.max(0, t - calcul.t_limite);
  return montee + pleine;
};

// Angle du globe : la patte l'arrête net, puis il revient à un tour entier pour raccorder la boucle
export const angleGlobe = (t: number) => {
  if (t < calcul.t_patte) {
    return angleAvant(t);
  }
  const arret = angleAvant(calcul.t_patte);
  const tourEntier = Math.ceil(arret / (2 * Math.PI)) * 2 * Math.PI;
  return arret + (tourEntier - arret) * lisse(entre(t, calcul.t_retour, calcul.duree_s));
};

const MENTHE: Palette = { fond: "#CFE8D5", encre: "#1F2D2A", accent: "#C8361F" };
const AMBRE: Palette = { fond: "#F0A63A", encre: "#2A1E10", accent: "#A82412" };
const ROUGE: Palette = { fond: "#B3261E", encre: "#FFF4D8", accent: "#FFE14A" };
const BRUN: Palette = { fond: "#3B1E14", encre: "#FFF4D8", accent: "#FFB03A" };
const NOIR: Palette = { fond: "#0B0B12", encre: "#F4F1E6", accent: "#FFD23F" };

// Bascules courtes quand l'encre change de sombre à clair, pour garder le compteur lisible
const ZONES: [number, Palette][] = [
  [0, MENTHE],
  [27, MENTHE],
  [31, AMBRE],
  [43.7, AMBRE],
  [44.2, ROUGE],
  [50.5, ROUGE],
  [51.2, BRUN],
  [58, BRUN],
  [58.6, NOIR],
  [200, NOIR],
];

export const paletteA = (t: number) => paletteEntre(ZONES, pasDecor(t));
