import type { Sujet } from "./cadre/types";
import { ball } from "./scenes/ball";
import { clone } from "./scenes/clone";
import { coffee } from "./scenes/coffee";
import { coin } from "./scenes/coin";
import { dive } from "./scenes/dive";
import { dollar } from "./scenes/dollar";
import { flood } from "./scenes/flood";
import { gravity } from "./scenes/gravity";
import { heart } from "./scenes/heart";
import { ice } from "./scenes/ice";
import { light } from "./scenes/light";
import { moon } from "./scenes/moon";
import { mosquito } from "./scenes/mosquito";
import { paper } from "./scenes/paper";
import { pepper } from "./scenes/pepper";
import { rice } from "./scenes/rice";
import { spin } from "./scenes/spin";
import { time } from "./scenes/time";
import { volt } from "./scenes/volt";
import { volume } from "./scenes/volume";
import { walk } from "./scenes/walk";
import { wind } from "./scenes/wind";

// Les props d'une composition sont sérialisées : on passe le nom, et le sujet se retrouve ici
export const SUJETS: Sujet[] = [paper, dollar, ball, coffee, walk, rice, gravity, ice, mosquito, moon, flood, wind, volume, spin, clone, coin, light, pepper, time, heart, dive, volt];

export const sujetNomme = (nom: string) => {
  const sujet = SUJETS.find((s) => s.nom === nom);
  if (!sujet) {
    throw new Error(`Sujet inconnu : ${nom}`);
  }
  return sujet;
};
