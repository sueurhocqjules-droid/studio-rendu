import { interpolateColors } from "remotion";
import type { Palette } from "./types";

// Pas courant de la règle : il monte pendant la première demi-seconde, puis le chiffre reste lisible
export const pasA = (t: number, max: number) => {
  const entier = Math.floor(t);
  const avance = Math.min((t - entier) / 0.5, 1);
  return Math.min(entier + 1 - Math.pow(1 - avance, 3), max);
};

// Le fond glisse d'une zone à l'autre, le texte bascule d'un coup à mi-chemin pour rester lisible
export const paletteEntre = (zones: [number, Palette][], pas: number): Palette => {
  const suivante = zones.findIndex(([p]) => p > pas);
  if (suivante <= 0) {
    return zones[zones.length - 1][1];
  }
  const [debut, a] = zones[suivante - 1];
  const [fin, b] = zones[suivante];
  const part = (pas - debut) / (fin - debut);
  const texteDe = part < 0.5 ? a : b;
  return {
    fond: interpolateColors(part, [0, 1], [a.fond, b.fond]),
    encre: texteDe.encre,
    accent: texteDe.accent,
  };
};

export const melange = (a: Palette, b: Palette, part: number): Palette => {
  const canal = (cle: keyof Palette) => interpolateColors(part, [0, 1], [a[cle], b[cle]]);
  return { fond: canal("fond"), encre: canal("encre"), accent: canal("accent") };
};
