import { interpolate } from "remotion";
import calcul from "../../../sujets/dollar.calcul.json";
import texte from "../../../sujets/dollar.json";
import { remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { montant } from "./montant";
import { SceneDollar } from "./Scene";
import { paletteA, pasDollar } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const depart = montant(1, langue);

  if (t >= calcul.t_fin) {
    return {
      nombre: depart.nombre,
      etiquette: `${depart.unite} · ${L.pli} 0`,
      legende: L.regle,
      ageLegende: t - calcul.t_fin + 1,
      pop: 0,
      palette,
    };
  }

  if (t >= calcul.t_egal) {
    return {
      nombre: depart.nombre,
      etiquette: `${depart.unite} · ${L.pli} ${calcul.pas_max}`,
      legende: L.egal,
      ageLegende: t - calcul.t_egal,
      pop: interpolate(t - calcul.t_egal, [0, 0.25], [1, 0], { extrapolateRight: "clamp" }),
      palette,
    };
  }

  if (t >= calcul.t_prix) {
    const fortune = montant(calcul.fortune_finale_usd, langue);
    return {
      nombre: fortune.nombre,
      etiquette: `${fortune.unite} · ${L.bonbon}`,
      legende: L.prix,
      ageLegende: t - calcul.t_prix,
      pop: interpolate(t - calcul.t_prix, [0, 0.25], [1, 0], { extrapolateRight: "clamp" }),
      palette,
    };
  }

  const pas = pasDollar(t);
  const pasEntier = Math.floor(pas + 1e-6);
  const courant = montant(Math.pow(2, pas), langue);
  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];

  let legende: string[];
  let ageLegende: number;
  if (t < REGLE_S) {
    legende = L.regle;
    ageLegende = t + 1;
  } else if (atteint && t < atteint.arrivee_s + LEGENDE_S) {
    legende = cle(atteint).legende.map((ligne) => remplir(ligne, { n: atteint.pas }));
    ageLegende = t - atteint.arrivee_s;
  } else {
    const reste = suivant.pas - pasEntier;
    legende = [
      remplir(L.suite, { cible: cle(suivant).cible }),
      reste === 1 ? L.restant1 : remplir(L.restant, { n: reste }),
    ];
    ageLegende = t - (atteint ? atteint.arrivee_s + LEGENDE_S : REGLE_S);
  }

  return {
    nombre: courant.nombre,
    etiquette: `${courant.unite} · ${L.pli} ${pasEntier}`,
    legende,
    ageLegende,
    pop: atteint ? interpolate(t - atteint.arrivee_s, [0, 0.3], [1, 0], { extrapolateRight: "clamp" }) : 0,
    palette,
  };
};

export const dollar: Sujet = {
  nom: "dollar",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneDollar,
};
