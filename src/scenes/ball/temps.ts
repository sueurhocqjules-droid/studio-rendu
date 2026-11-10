import { interpolate } from "remotion";
import calcul from "../../../sujets/ball.calcul.json";
import { paletteEntre } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const HOOP_M = calcul.depart_m;
export const HAUTEUR_MIN_CAM = 3.7;
export const MARGE_CAM = 1.12;

export const hauteurPic = (rebond: number) => calcul.depart_m * Math.pow(calcul.gain, rebond);

// Rebond en cours, compté à partir de 1. Le pic du rebond n arrive à 0,5 n - 0,25 s
export const rebondA = (t: number) => Math.min(Math.floor(t / calcul.rebond_s) + 1, calcul.n_max);

// Position dans le rebond, de 0 (sol) à 1 (sol suivant)
export const phaseA = (t: number) => (t / calcul.rebond_s) % 1;

const chuteA = (t: number) => {
  const u = interpolate(t, [calcul.t_chute, calcul.t_panier], [0, 1], borne);
  const lisse = Math.pow(u, 1.3);
  return Math.exp(Math.log(calcul.h_max_m) * (1 - lisse) + Math.log(HOOP_M) * lisse);
};

// Hauteur du ballon en mètres, à tout instant
export const hauteurBallon = (t: number) => {
  if (t < calcul.t_iss) {
    const p = phaseA(t);
    return hauteurPic(rebondA(t)) * 4 * p * (1 - p);
  }
  if (t < calcul.t_chute) {
    return calcul.h_max_m;
  }
  if (t < calcul.t_panier) {
    return chuteA(t);
  }
  const apres = t - calcul.t_panier;
  if (apres < calcul.chute_fin_s) {
    const p = apres / calcul.chute_fin_s;
    return HOOP_M * (1 - p * p);
  }
  let reste = apres - calcul.chute_fin_s;
  for (const d of calcul.rebonds_fin_s) {
    if (reste < d) {
      const p = reste / d;
      return ((9.81 * d * d) / 8) * 4 * p * (1 - p);
    }
    reste -= d;
  }
  return 0;
};

// Hauteur que la caméra doit montrer. Tout le reste de la scène en découle
export const hauteurCamera = (t: number) => {
  if (t < calcul.t_iss) {
    return Math.max(HAUTEUR_MIN_CAM, hauteurPic(2 * t + 0.5) * MARGE_CAM);
  }
  if (t < calcul.t_chute) {
    return calcul.h_max_m * MARGE_CAM;
  }
  if (t < calcul.t_panier) {
    return Math.max(HAUTEUR_MIN_CAM, chuteA(t) * MARGE_CAM);
  }
  return HAUTEUR_MIN_CAM;
};

// Vitesse du ballon qui retombe, gravité réelle, sans air
export const vitesseChute = (h: number) =>
  Math.sqrt(2 * calcul.gm * (1 / (calcul.rayon_m + h) - 1 / (calcul.rayon_m + calcul.h_max_m)));

const JOUR: Palette = { fond: "#9CCFEA", encre: "#14110D", accent: "#7A1F0A" };
const HAUT: Palette = { fond: "#4E90CF", encre: "#FFFDF6", accent: "#FFE36B" };
const NUIT: Palette = { fond: "#0E1A36", encre: "#F3EAD7", accent: "#FF9A3D" };
const ESPACE: Palette = { fond: "#070B18", encre: "#F3EAD7", accent: "#FF9A3D" };

// Rangée par altitude montrée : la palette vaut à la montée comme à la descente
const ZONES: [number, Palette][] = [
  [0, JOUR],
  [85, JOUR],
  [86.5, HAUT],
  [100, HAUT],
  [104, NUIT],
  [112, NUIT],
  [116, ESPACE],
  [200, ESPACE],
];

export const paletteA = (t: number) => {
  const equivalent = Math.log(hauteurCamera(t) / calcul.depart_m) / Math.log(calcul.gain);
  return paletteEntre(ZONES, equivalent);
};
