import { interpolate } from "remotion";
import calcul from "../../../sujets/domino.calcul.json";
import texte from "../../../sujets/domino.json";
import { grouper, longueurLocale, nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneDomino } from "./Scene";
import { focusA, paletteA, pasCompteur } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;
const REGLE2_S = 5.2;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const sep = L.separateurs;
  const palette = paletteA(t);
  const enChaine = t < calcul.t_coupe;
  const numero = enChaine ? Math.floor(pasCompteur(t) + 1e-9) : Math.max(0, Math.round(focusA(t) - 0.5));
  const { nombre, unite } = longueurLocale(calcul.h0_m * Math.pow(calcul.facteur, numero), L.unites, sep);
  const base = { nombre, etiquette: `${unite} · ${L.pli} ${numero}`, palette };
  const regle = L.regle;

  if (t >= calcul.t_fin) {
    return { ...base, legende: regle, ageLegende: t - calcul.t_fin + 1, pop: 0 };
  }
  if (t >= calcul.t_patte) {
    return { ...base, legende: L.vrai, ageLegende: t - calcul.t_patte, pop: 0 };
  }
  if (t >= calcul.t_qui) {
    const annees = grouper(String(calcul.annees_energie), sep.milliers);
    return {
      ...base,
      nombre: nombreLocal(calcul.e_fin_j / 1e21, sep),
      etiquette: L.zetta,
      legende: L.energie.map((ligne) => remplir(ligne, { annees })),
      ageLegende: t - calcul.t_qui,
      pop: pop(t - calcul.t_qui),
    };
  }
  if (t >= calcul.t_coupe) {
    return {
      ...base,
      nombre: nombreLocal(calcul.e_tap_j * 1e9, sep),
      etiquette: L.nano,
      legende: L.tap.map((ligne) => remplir(ligne, { tap: calcul.tap[langue] })),
      ageLegende: t - calcul.t_coupe,
      pop: pop(t - calcul.t_coupe),
    };
  }

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];
  const dernier = atteint?.cle === "espace";

  let legende: string[];
  let ageLegende: number;
  if (t < REGLE_S) {
    legende = regle;
    ageLegende = t + 1;
  } else if (t < REGLE2_S && !atteint) {
    legende = L.regle2;
    ageLegende = t - REGLE_S;
  } else if (atteint && (dernier || t < atteint.arrivee_s + LEGENDE_S)) {
    legende = cle(atteint).legende;
    ageLegende = t - atteint.arrivee_s;
  } else {
    const reste = suivant.pas - numero;
    legende = [remplir(L.suite, { cible: cle(suivant).cible }), reste === 1 ? L.restant1 : remplir(L.restant, { n: reste })];
    ageLegende = t - (atteint ? atteint.arrivee_s + LEGENDE_S : REGLE2_S);
  }

  return { ...base, legende, ageLegende, pop: atteint ? pop(t - atteint.arrivee_s) : 0 };
};

export const domino: Sujet = {
  nom: "domino",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneDomino,
};
