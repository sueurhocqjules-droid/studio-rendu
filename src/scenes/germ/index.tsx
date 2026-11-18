import { interpolate } from "remotion";
import calcul from "../../../sujets/germ.calcul.json";
import texte from "../../../sujets/germ.json";
import { nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneGerm } from "./Scene";
import { paletteA, pasCompteur } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

const masse = (seconde: number, langue: Langue) => {
  const L = texte[langue];
  const kg = calcul.m0_kg * Math.pow(calcul.facteur, seconde);
  const unite = L.unites.find((u) => kg / u.kg < u.max) ?? L.unites[L.unites.length - 1];
  return { nombre: nombreLocal(kg / unite.kg, L.separateurs), unite: unite.nom };
};

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const seconde = Math.floor(pasCompteur(t) + 1e-9);
  const { nombre, unite } = masse(seconde, langue);
  const base = { nombre, etiquette: `${unite} · ${L.pli} ${seconde}`, palette };

  if (t >= calcul.t_fin) {
    return { ...base, legende: L.regle, ageLegende: t - calcul.t_fin + 1, pop: 0 };
  }
  if (t >= calcul.t_retour) {
    return { ...base, legende: L.regle, ageLegende: t - calcul.t_retour, pop: 0 };
  }
  if (t >= calcul.t_point) {
    return { ...base, legende: L.point, ageLegende: t - calcul.t_point, pop: 0 };
  }
  if (t >= calcul.t_patte) {
    return { ...base, legende: L.faim, ageLegende: t - calcul.t_patte, pop: 0 };
  }
  if (t >= calcul.t_qui) {
    return { ...base, legende: L.terre.map((l) => remplir(l, { h: calcul.h_texte })), ageLegende: t - calcul.t_qui, pop: pop(t - calcul.t_qui) };
  }
  if (t >= calcul.t_coupe) {
    return { ...base, legende: L.vraie, ageLegende: t - calcul.t_coupe, pop: 0 };
  }

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];
  const dernier = atteint?.cle === "toi";

  let legende: string[];
  let ageLegende: number;
  if (t < REGLE_S) {
    legende = L.regle;
    ageLegende = t + 1;
  } else if (atteint && (dernier || t < Math.max(atteint.arrivee_s, REGLE_S) + LEGENDE_S)) {
    legende = cle(atteint).legende;
    ageLegende = t - Math.max(atteint.arrivee_s, REGLE_S);
  } else if (!atteint) {
    legende = L.regle2;
    ageLegende = t - REGLE_S;
  } else {
    const reste = suivant.pas - seconde;
    legende = [remplir(L.suite, { cible: cle(suivant).cible }), reste === 1 ? L.restant1 : remplir(L.restant, { n: reste })];
    ageLegende = t - (Math.max(atteint.arrivee_s, REGLE_S) + LEGENDE_S);
  }

  return { ...base, legende, ageLegende, pop: atteint ? pop(t - atteint.arrivee_s) : 0 };
};

export const germ: Sujet = {
  nom: "germ",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneGerm,
};
