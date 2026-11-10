import { interpolate } from "remotion";
import calcul from "../../../sujets/walk.calcul.json";
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

export const partRetour = (t: number) => {
  const u = interpolate(t, [calcul.t_retour, calcul.t_fin], [0, 1], borne);
  return u * u * (3 - 2 * u);
};

// Le pas du compteur avance par secondes entières
export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

// Le décor glisse sans à-coups. Tout en dépend : au retour, il repart à l'envers jusqu'à la porte
export const pasDecor = (t: number) => {
  const aller = Math.min(t + 0.5 * Math.min(t / 2, 1), calcul.n_max);
  return aller * (1 - partRetour(t));
};

export const vitesse = (pas: number) => Math.min(calcul.depart_ms * Math.pow(calcul.gain, pas), calcul.lumiere_ms);

// Distance parcourue au pas donné, plafonnée à celle du moment où la lumière est atteinte
export const distanceA = (pas: number) =>
  Math.min((calcul.depart_ms * (Math.pow(calcul.gain, pas) - 1)) / Math.log(calcul.gain), calcul.distance_finale_m);

const MATIN: Palette ={ fond: "#FFD9A0", encre: "#2C1E2F", accent: "#B5301A" };
const HAUT: Palette = { fond: "#2B4C7E", encre: "#FFF1DC", accent: "#FFB454" };
const ESPACE: Palette = { fond: "#0B0C16", encre: "#F4EFE6", accent: "#FF8A3D" };

const ZONES: [number, Palette][] = [
  [0, MATIN],
  [secondeDe("son") + 2, MATIN],
  [secondeDe("son") + 6, HAUT],
  [secondeDe("liberation") - 2, HAUT],
  [secondeDe("liberation") + 1, ESPACE],
  [200, ESPACE],
];

export const paletteA = (t: number) => paletteEntre(ZONES, pasDecor(t));
