import { interpolate, interpolateColors } from "remotion";
import calcul from "../../../sujets/thick.calcul.json";
import { melange, paletteEntre, pasA } from "../../cadre/rythme";
import type { Palette } from "../../cadre/types";

const borne = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const entre = (n: number, de: number, a: number) => interpolate(n, [de, a], [0, 1], borne);

export const lisse = (x: number) => x * x * (3 - 2 * x);

export const pasCompteur = (t: number) => pasA(Math.min(t, calcul.t_limite), calcul.n_max);

// Le décor suit le pas ; au retour, tout se rembobine jusqu'à l'eau
export const pasDecor = (t: number) => {
  if (t >= calcul.t_retour) {
    return calcul.n_max * (1 - lisse(entre(t, calcul.t_retour, calcul.t_fin)));
  }
  return Math.min(t + 0.5 * Math.min(t / 2, 1), calcul.n_max);
};

// Pas où chaque matière prend la scène (0 : l'eau)
export const DEBUTS: [string, number][] = [["eau", 0], ...calcul.paliers.map((p) => [p.cle, p.pas] as [string, number])];

const PALETTES: Record<string, Palette> = {
  eau: { fond: "#CFE8EE", encre: "#10303A", accent: "#1F6F8E" },
  huile: { fond: "#DCD38F", encre: "#2C2A10", accent: "#5E5C0E" },
  miel: { fond: "#F2B33D", encre: "#2A1704", accent: "#6E3605" },
  lave: { fond: "#2A1410", encre: "#FFE7C2", accent: "#FF7A2A" },
  brai: { fond: "#4A4038", encre: "#F4EEE4", accent: "#E8B24A" },
  verre: { fond: "#BFD9CC", encre: "#173229", accent: "#2A6E50" },
  glace: { fond: "#E3EEF5", encre: "#0E2A40", accent: "#2F6C9F" },
  sel: { fond: "#EBCFC6", encre: "#3A1E1A", accent: "#94392C" },
  granit: { fond: "#9A9794", encre: "#121212", accent: "#4A1308" },
  manteau: { fond: "#B8390B", encre: "#FFF3E0", accent: "#FFD166" },
};

const ESPACE: Palette = { fond: "#140E0B", encre: "#FFF3E0", accent: "#FF9A3D" };

// Couleur de la matière elle-même, dans le verre et la carafe
export const MATIERES: Record<string, string> = {
  eau: "#4FB3D9",
  huile: "#B5A01E",
  miel: "#D9820B",
  lave: "#FF5A14",
  brai: "#17120F",
  verre: "#76C2A0",
  glace: "#B9DDF2",
  sel: "#F6DCD3",
  granit: "#8F8B88",
  manteau: "#E2531A",
};

// Bascule courte, centrée sur l'arrivée du palier
const GLISSE = 0.4;
const zones: [number, Palette][] = DEBUTS.flatMap(([cle, pas], i) => {
  const suivant = DEBUTS[i + 1]?.[1] ?? 200;
  return [
    [pas, PALETTES[cle]],
    [suivant - GLISSE, PALETTES[cle]],
  ] as [number, Palette][];
});

const pointsCouleur = DEBUTS.flatMap(([cle, pas], i) => {
  const suivant = DEBUTS[i + 1]?.[1] ?? 200;
  return [
    [pas, cle],
    [suivant - GLISSE, cle],
  ] as [number, string][];
});

export const couleurMatiere = (n: number) =>
  interpolateColors(
    n,
    pointsCouleur.map(([p]) => p),
    pointsCouleur.map(([, cle]) => MATIERES[cle]),
  );

// Matière dominante au pas n, et poids de son apparition (0 à 1)
export const matiereA = (n: number) => {
  let courante = DEBUTS[0][0];
  for (const [cle, pas] of DEBUTS) {
    if (n >= pas - GLISSE / 2) {
      courante = cle;
    }
  }
  return courante;
};

export const presence = (cle: string, n: number) => {
  const i = DEBUTS.findIndex(([c]) => c === cle);
  const debut = DEBUTS[i][1];
  const fin = DEBUTS[i + 1]?.[1] ?? 200;
  const entree = i === 0 ? 1 : entre(n, debut - GLISSE, debut);
  const sortie = 1 - entre(n, fin - GLISSE, fin);
  return Math.min(entree, sortie);
};

// Recul vers la Terre : 0 dans la cuisine, 1 quand le verre n'est plus qu'un point sur la croûte
export const recul = (t: number) => {
  if (t < calcul.t_coupe) {
    return 0;
  }
  if (t < calcul.t_retour) {
    return lisse(entre(t, calcul.t_coupe, calcul.t_coupe + 1.6));
  }
  return 1 - lisse(entre(t, calcul.t_retour, calcul.t_retour + 1.6));
};

export const paletteA = (t: number): Palette => {
  // Au retour, une seule bascule de la nuit vers l'eau : le texte reste lisible pendant le rembobinage
  if (t >= calcul.t_retour) {
    const part = lisse(entre(t, calcul.t_retour, calcul.t_fin));
    const texte = part < 0.5 ? ESPACE : PALETTES.eau;
    return { fond: interpolateColors(part, [0, 1], [ESPACE.fond, PALETTES.eau.fond]), encre: texte.encre, accent: texte.accent };
  }
  const base = paletteEntre(zones, pasDecor(t));
  const r = recul(t);
  return r > 0 ? melange(base, ESPACE, r) : base;
};
