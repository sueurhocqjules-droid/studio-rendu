import { interpolate } from "remotion";
import calcul from "../../../sujets/pepper.calcul.json";
import { melange, paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

// Le décor suit le pas ; au retour, le lait fait redescendre le piquant jusqu'au départ
export const pasDecor = (t: number) => {
  if (t >= calcul.t_fin) {
    return 0;
  }
  if (t >= calcul.t_retour) {
    return calcul.n_max * (1 - lisse(entre(t, calcul.t_retour, calcul.t_fin - 0.4)));
  }
  return pasCompteur(t);
};

// Étape visible : 0 pour le pepperoncini, puis un cran par palier franchi
export const etapeA = (t: number) => {
  if (t >= calcul.t_fin) {
    return 0;
  }
  return calcul.paliers.filter((p) => t >= p.arrivee_s).length;
};

export const depuisEtape = (t: number) => {
  const etape = etapeA(t);
  return etape === 0 ? t : t - calcul.paliers[etape - 1].arrivee_s;
};

export const DOUX: Palette = { fond: "#E4EDC8", encre: "#24391A", accent: "#B32A12" };
const VERT: Palette = { fond: "#B9D486", encre: "#1E3312", accent: "#A3260F" };
const ROUGE: Palette = { fond: "#D9452C", encre: "#FFF1DC", accent: "#FFD23F" };
const ORANGE: Palette = { fond: "#F08A24", encre: "#2A0E04", accent: "#7E1204" };
const SANG: Palette = { fond: "#9E1B12", encre: "#FFE9C9", accent: "#FFB21E" };
const BRAISE: Palette = { fond: "#4E0C07", encre: "#FFE9C9", accent: "#FF8A1E" };
const BLANC_CHAUD: Palette = { fond: "#FFDDA6", encre: "#3A0E05", accent: "#C42E0C" };
const BLANC: Palette = { fond: "#FFF7EA", encre: "#3A0E05", accent: "#D9400F" };
export const SAUGE: Palette = { fond: "#3E5B48", encre: "#F3F0DF", accent: "#F2C14E" };

// La cuisine chauffe avec le piment : vert, rouge, orange brûlant, puis blanc chaud
const ZONES: [number, Palette][] = [
  [0, DOUX],
  [7, DOUX],
  [9, VERT],
  [12, VERT],
  [14, ROUGE],
  [18, ROUGE],
  [20, ORANGE],
  [21.5, ORANGE],
  [23, SANG],
  [24.5, SANG],
  [26, BRAISE],
  [29.5, BRAISE],
  [31, BLANC_CHAUD],
  [43, BLANC_CHAUD],
  [45, BLANC],
  [200, BLANC],
];

export const paletteA = (t: number): Palette => {
  if (t >= calcul.t_coupe && t < calcul.t_fin) {
    const bascule = entre(t, calcul.t_coupe, calcul.t_coupe + 0.25);
    const chaud = paletteEntre(ZONES, calcul.n_max);
    const plante = bascule < 1 ? melange(chaud, SAUGE, bascule) : SAUGE;
    if (t < calcul.t_retour) {
      return plante;
    }
    // Le fond glisse vers le vert doux, le texte bascule d'un coup pour rester lisible
    const part = lisse(entre(t, calcul.t_retour, calcul.t_fin - 0.4));
    const texte = part < 0.5 ? SAUGE : DOUX;
    return { ...texte, fond: melange(SAUGE, DOUX, part).fond };
  }
  return paletteEntre(ZONES, pasDecor(t));
};
