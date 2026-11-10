import type { Sujet } from "./cadre/types";
import { ball } from "./scenes/ball";
import { clone } from "./scenes/clone";
import { coffee } from "./scenes/coffee";
import { coin } from "./scenes/coin";
import { dollar } from "./scenes/dollar";
import { flood } from "./scenes/flood";
import { gravity } from "./scenes/gravity";
import { ice } from "./scenes/ice";
import { light } from "./scenes/light";
import { moon } from "./scenes/moon";
import { mosquito } from "./scenes/mosquito";
import { paper } from "./scenes/paper";
import { rice } from "./scenes/rice";
import { spin } from "./scenes/spin";
import { volume } from "./scenes/volume";
import { walk } from "./scenes/walk";
import { wind } from "./scenes/wind";

// Les props d'une composition sont sérialisées : on passe le nom, et le sujet se retrouve ici
export const SUJETS: Sujet[] = [paper, dollar, ball, coffee, walk, rice, gravity, ice, mosquito, moon, flood, wind, volume, spin, clone, coin, light];

export const sujetNomme = (nom: string) => {
  const sujet = SUJETS.find((s) => s.nom === nom);
  if (!sujet) {
    throw new Error(`Sujet inconnu : ${nom}`);
  }
  return sujet;
};
