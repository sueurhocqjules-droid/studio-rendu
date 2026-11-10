import { interpolate } from "remotion";
import calcul from "../../../sujets/light.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

// Le décor est une fonction du pas : au retour, la lumière retrouve sa vitesse
export const pasDecor = (t: number) => {
  if (t >= calcul.t_retour) {
    return calcul.n_max * (1 - lisse(entre(t, calcul.t_retour, calcul.t_fin)));
  }
  return Math.min(t + 0.5 * Math.min(t / 2, 1), calcul.n_max);
};

const JAUNE: Palette = { fond: "#FFE9A8", encre: "#1E2A3A", accent: "#B8320F" };
const SABLE: Palette = { fond: "#E9B65A", encre: "#2A1C0A", accent: "#8E1E0C" };
const OCEAN: Palette = { fond: "#12506B", encre: "#FFF4D8", accent: "#FFD23F" };
const PETROLE: Palette = { fond: "#0D3647", encre: "#FFF4D8", accent: "#FFD23F" };
const NUIT: Palette = { fond: "#0B2230", encre: "#FFF4D8", accent: "#FFD23F" };
const NOIR: Palette = { fond: "#08090D", encre: "#F4F1E6", accent: "#FFD23F" };

// Le monde s'éteint à mesure que la lumière traîne ; la bascule d'encre reste courte
const ZONES: [number, Palette][] = [
  [0, JAUNE],
  [7, JAUNE],
  [12, SABLE],
  [17.4, SABLE],
  [17.9, OCEAN],
  [32, OCEAN],
  [37, PETROLE],
  [45, PETROLE],
  [53, NUIT],
  [57, NUIT],
  [62, NOIR],
  [200, NOIR],
];

export const paletteA = (t: number) => paletteEntre(ZONES, pasDecor(t));
