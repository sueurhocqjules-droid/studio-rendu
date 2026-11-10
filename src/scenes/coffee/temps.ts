import { interpolate } from "remotion";
import calcul from "../../../sujets/coffee.calcul.json";
import { paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const secondeDe = (cle: string) => {
  const palier = calcul.paliers.find((p) => p.cle === cle);
  if (!palier) {
    throw new Error(`Palier inconnu : ${cle}`);
  }
  return palier.pas;
};

// Tout le décor dépend de ce pas : quand on souffle, il redescend et la vidéo se rembobine d'elle-même
export const pasChaleur = (t: number) => {
  if (t < calcul.t_souffle) {
    return pasA(t, calcul.n_max);
  }
  const u = interpolate(t, [calcul.t_souffle, calcul.t_souffle + calcul.souffle_s], [0, 1], borne);
  return calcul.n_max * (1 - u * u * (3 - 2 * u));
};

export const temperature = (pas: number) => calcul.depart_c * Math.pow(calcul.gain, pas);

const clair = (v: number) => Math.round(Math.max(0, Math.min(255, v)));

// Couleur d'un corps noir, approximation de Tanner Helland
export const corpsNoir = (kelvin: number) => {
  const k = kelvin / 100;
  const r = k <= 66 ? 255 : 329.698727446 * Math.pow(k - 60, -0.1332047592);
  const g = k <= 66 ? 99.4708025861 * Math.log(k) - 161.1195681661 : 288.1221695283 * Math.pow(k - 60, -0.0755148492);
  const b = k >= 66 ? 255 : k <= 19 ? 0 : 138.5177312231 * Math.log(k - 10) - 305.0447927307;
  return `rgb(${clair(r)}, ${clair(g)}, ${clair(b)})`;
};

const CUISINE: Palette = { fond: "#EBDCC0", encre: "#2A1A10", accent: "#8A3B12" };
const FOUR: Palette = { fond: "#3A0E08", encre: "#FFE9C7", accent: "#FFB020" };
const ESPACE: Palette = { fond: "#07070F", encre: "#F7F2E8", accent: "#FFC53D" };
const BLEU: Palette = { fond: "#050A1E", encre: "#EAF2FF", accent: "#7FB6FF" };

const ZONES: [number, Palette][] = [
  [0, CUISINE],
  [secondeDe("lave") - 7, CUISINE],
  [secondeDe("lave") - 3, FOUR],
  [secondeDe("tungstene"), FOUR],
  [secondeDe("soleil") - 1, ESPACE],
  [secondeDe("rigel") - 2, ESPACE],
  [secondeDe("rigel"), BLEU],
  [200, BLEU],
];

export const paletteA = (t: number) => paletteEntre(ZONES, pasChaleur(t));
