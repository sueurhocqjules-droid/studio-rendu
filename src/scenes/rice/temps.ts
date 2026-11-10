import { interpolate } from "remotion";
import calcul from "../../../sujets/rice.calcul.json";
import { melange, paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Le pas du compteur avance par secondes entières, et repart de zéro quand le grain retombe
export const pasCompteur = (t: number) => (t >= calcul.t_chute ? 0 : pasA(Math.min(t, calcul.t_limite), calcul.n_max));

// La caméra recule sans à-coups
export const pasDecor = (t: number) => {
  if (t >= calcul.t_chute) {
    return 0;
  }
  return Math.min(t + 0.5 * Math.min(t / 2, 1), calcul.n_max);
};

// Rayon du tas conique, en mètres
const rayonCone = (n: number) => Math.cbrt((3 * calcul.volume_grain_m3 * Math.pow(2, n)) / (Math.PI * calcul.pente));

// Au début les grains sont étalés sur la case, pas encore en tas
const rayonEtale = (n: number) => 0.0026 * Math.pow(2, n / 2);

export const rayon = (n: number) => {
  if (n >= 12) {
    return rayonCone(n);
  }
  if (n <= 7) {
    return Math.max(rayonEtale(n), 0.014);
  }
  const part = (n - 7) / 5;
  return Math.exp(Math.log(rayonEtale(7)) * (1 - part) + Math.log(rayonCone(12)) * part);
};

export const RAYON_ECRAN = 210;
export const ECHELLE_MAX = 15000;

// Pixels par mètre : le tas garde la même taille à l'écran, c'est le monde qui rapetisse
export const echelle = (n: number) => Math.min(ECHELLE_MAX, RAYON_ECRAN / rayon(n));

const BOIS: Palette = { fond: "#6B4226", encre: "#FFF4DD", accent: "#F2B53A" };
const PARQUET: Palette = { fond: "#8F5B35", encre: "#FFF4DD", accent: "#FFD27A" };
const SAVANE: Palette = { fond: "#C89B3C", encre: "#2B1C0E", accent: "#7A2E12" };
const OCEAN: Palette = { fond: "#1E6F8E", encre: "#F5FBF7", accent: "#FFD24A" };
const SABLE: Palette = { fond: "#E3B66B", encre: "#3A2510", accent: "#A33A16" };
const RIZIERE: Palette = { fond: "#4E8C3A", encre: "#F7F4DF", accent: "#FFE27A" };
const CARTE: Palette = { fond: "#2E4A36", encre: "#F7F4DF", accent: "#FFB454" };
const CIEL: Palette = { fond: "#15233B", encre: "#F4EFE6", accent: "#8FC7FF" };
const ESPACE: Palette = { fond: "#0B0C16", encre: "#F4EFE6", accent: "#FF8A3D" };

const ZONES: [number, Palette][] = [
  [0, BOIS],
  [14, BOIS],
  [17, PARQUET],
  [23, PARQUET],
  [25, SAVANE],
  [29.5, SAVANE],
  [31, OCEAN],
  [44, OCEAN],
  [46, SABLE],
  [50, SABLE],
  [52, RIZIERE],
  [60, RIZIERE],
  [62, CARTE],
  [200, CARTE],
];

export const partEntre = (t: number, de: number, a: number) => interpolate(t, [de, a], [0, 1], borne);

export const paletteA = (t: number) => {
  const monde = paletteEntre(ZONES, pasDecor(t));
  const ciel = melange(monde, CIEL, partEntre(t, calcul.t_limite - 0.3, calcul.t_limite));
  const espace = melange(ciel, ESPACE, partEntre(t, calcul.t_planete - 0.3, calcul.t_planete));
  return melange(espace, BOIS, partEntre(t, calcul.t_chute - 0.4, calcul.t_chute));
};
