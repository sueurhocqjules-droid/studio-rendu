import type { Sujet } from "./cadre/types";
import { ball } from "./scenes/ball";
import { balloon } from "./scenes/balloon";
import { candle } from "./scenes/candle";
import { clone } from "./scenes/clone";
import { coffee } from "./scenes/coffee";
import { coin } from "./scenes/coin";
import { dive } from "./scenes/dive";
import { dollar } from "./scenes/dollar";
import { domino } from "./scenes/domino";
import { eye } from "./scenes/eye";
import { flood } from "./scenes/flood";
import { gravity } from "./scenes/gravity";
import { heart } from "./scenes/heart";
import { ice } from "./scenes/ice";
import { light } from "./scenes/light";
import { magnet } from "./scenes/magnet";
import { moon } from "./scenes/moon";
import { mosquito } from "./scenes/mosquito";
import { paper } from "./scenes/paper";
import { pepper } from "./scenes/pepper";
import { pizza } from "./scenes/pizza";
import { press } from "./scenes/press";
import { rice } from "./scenes/rice";
import { snowball } from "./scenes/snowball";
import { spin } from "./scenes/spin";
import { thick } from "./scenes/thick";
import { time } from "./scenes/time";
import { volt } from "./scenes/volt";
import { volume } from "./scenes/volume";
import { walk } from "./scenes/walk";
import { wifi } from "./scenes/wifi";
import { wind } from "./scenes/wind";
import { germ } from "./scenes/germ";
import { rumor } from "./scenes/rumor";
import { sneeze } from "./scenes/sneeze";
import { zoom } from "./scenes/zoom";
import { rope } from "./scenes/rope";

// Les props d'une composition sont sérialisées : on passe le nom, et le sujet se retrouve ici
export const SUJETS: Sujet[] = [paper, dollar, ball, coffee, walk, rice, gravity, ice, mosquito, moon, flood, wind, volume, spin, clone, coin, light, pepper, time, heart, dive, volt, snowball, thick, domino, pizza, eye, press, wifi, magnet, balloon, candle, germ, rumor, sneeze, zoom, rope];

export const sujetNomme = (nom: string) => {
  const sujet = SUJETS.find((s) => s.nom === nom);
  if (!sujet) {
    throw new Error(`Sujet inconnu : ${nom}`);
  }
  return sujet;
};
