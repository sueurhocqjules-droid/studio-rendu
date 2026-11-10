import type { ComponentType } from "react";

export type Langue = "en" | "es" | "pt";

export type Palette = { fond: string; encre: string; accent: string };

// Ce que le cadre affiche à un instant donné. Chaque sujet le calcule à sa façon.
export type Etat = {
  nombre: string;
  etiquette: string;
  legende: string[];
  // Secondes écoulées depuis l'apparition de la légende : anime son entrée
  ageLegende: number;
  // 0 à 1 : le compteur grossit un instant à chaque nouveau palier
  pop: number;
  palette: Palette;
};

export type SceneProps = { t: number; langue: Langue };

export type Sujet = {
  nom: string;
  dureeS: number;
  etat: (t: number, langue: Langue) => Etat;
  Scene: ComponentType<SceneProps>;
};
