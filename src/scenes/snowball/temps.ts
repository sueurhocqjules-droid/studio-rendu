import { interpolate } from "remotion";
import calcul from "../../../sujets/snowball.calcul.json";
import { melange, paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

// Le décor suit la masse un peu en avance ; au retour, la neige rend tout et la boule redevient petite
export const pasDecor = (t: number) => {
  if (t >= calcul.t_retour) {
    return calcul.n_max * (1 - lisse(entre(t, calcul.t_retour, calcul.t_fin)));
  }
  return Math.min(t + 0.5 * Math.min(t / 2, 1), calcul.n_max);
};

// Masse et diamètre réels de la boule pour un pas donné (densité constante : le diamètre suit la racine cubique)
export const masseA = (pas: number) => calcul.m0_kg * Math.pow(calcul.facteur, pas);
export const diametreA = (pas: number) => calcul.d0_m * Math.pow(calcul.facteur, pas / 3);

// 0 : montagne enneigée, 1 : montagne nue
export const nudite = (t: number) => {
  if (t >= calcul.t_retour) {
    return 1 - lisse(entre(t, calcul.t_retour, calcul.t_retour + 1.6));
  }
  return lisse(entre(t, calcul.t_coupe - 0.15, calcul.t_coupe + 0.5));
};

const GLACE: Palette = { fond: "#D3E7EE", encre: "#13222C", accent: "#B8320F" };
const CIEL: Palette = { fond: "#8FC4DA", encre: "#0E1B24", accent: "#9E1E0E" };
const OR: Palette = { fond: "#F0C46A", encre: "#2A1A08", accent: "#8E1E0C" };
const SOIR: Palette = { fond: "#E3845A", encre: "#1D0D05", accent: "#4A1606" };
const NU: Palette = { fond: "#38434B", encre: "#FFF7EA", accent: "#FFD27A" };

// Une journée de montagne : matin glacé, plein ciel, lumière dorée, soir
const ZONES: [number, Palette][] = [
  [0, GLACE],
  [10, GLACE],
  [16, CIEL],
  [27, CIEL],
  [33, OR],
  [40, OR],
  [46, SOIR],
  [200, SOIR],
];

export const paletteA = (t: number) => paletteEntre(ZONES, pasDecor(t));

export const paletteCadre = (t: number) => {
  const jour = paletteA(t);
  const nu = nudite(t);
  if (nu <= 0) {
    return jour;
  }
  // Le texte bascule d'un coup à mi-chemin pour rester lisible
  const fond = melange(jour, NU, nu).fond;
  return nu < 0.5 ? { ...jour, fond } : { ...NU, fond };
};
