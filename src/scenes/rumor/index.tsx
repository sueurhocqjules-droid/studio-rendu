import { interpolate } from "remotion";
import calcul from "../../../sujets/rumor.calcul.json";
import texte from "../../../sujets/rumor.json";
import { grouper, nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneRumor } from "./Scene";
import { paletteA, pasCompteur } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;
const REGLE2_S = 5.2;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

const mesure = (personnes: number, langue: Langue) => {
  const L = texte[langue];
  const unite = L.unites.find((u) => personnes < u.max) ?? L.unites[L.unites.length - 1];
  if (unite.diviseur === 1) {
    return { nombre: grouper(Math.round(personnes).toString(), L.separateurs.milliers), unite: personnes === 1 ? unite.nom1 : unite.nom };
  }
  const part = personnes / unite.diviseur;
  return { nombre: nombreLocal(part, L.separateurs), unite: part < 2 ? unite.nom1 : unite.nom };
};

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const regle = { legende: L.regle, ageLegende: t + 1, pop: 0 };

  if (t >= calcul.t_retour) {
    const { nombre, unite } = mesure(1, langue);
    return { nombre, etiquette: `${unite} · ${L.pli} 0`, palette, ...regle, ageLegende: t - calcul.t_retour + 1 };
  }
  if (t >= calcul.t_qui) {
    const bebes = Math.floor(calcul.naissances_s * (t - calcul.t_qui));
    const base = { nombre: grouper(bebes.toString(), L.separateurs.milliers), etiquette: L.bebe_restant, palette };
    if (t >= calcul.t_patte) {
      return { ...base, legende: L.parler, ageLegende: t - calcul.t_patte, pop: pop(t - calcul.t_patte) };
    }
    const lignes = L.bebes.map((l) => remplir(l, { b: calcul.b }));
    return { ...base, legende: lignes, ageLegende: t - calcul.t_qui, pop: pop(t - calcul.t_qui) };
  }
  if (t >= calcul.t_coupe) {
    return { nombre: "0", etiquette: L.personne_restante, palette, legende: L.vide, ageLegende: t - calcul.t_coupe, pop: pop(t - calcul.t_coupe) };
  }

  const seconde = Math.floor(pasCompteur(t) + 1e-9);
  const { nombre, unite } = mesure(calcul.savent[seconde], langue);
  const base = { nombre, etiquette: `${unite} · ${L.pli} ${seconde}`, palette };

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];
  const dernier = atteint?.cle === "terre";

  let legende: string[];
  let ageLegende: number;
  if (t < REGLE_S) {
    return { ...base, ...regle };
  } else if (t < REGLE2_S && !(atteint && t >= atteint.arrivee_s)) {
    legende = L.regle2;
    ageLegende = t - REGLE_S;
  } else if (atteint && (dernier || t < atteint.arrivee_s + LEGENDE_S)) {
    legende = cle(atteint).legende;
    ageLegende = t - atteint.arrivee_s;
  } else {
    const reste = suivant.pas - seconde;
    legende = [remplir(L.suite, { cible: cle(suivant).cible }), reste === 1 ? L.restant1 : remplir(L.restant, { n: reste })];
    ageLegende = t - (atteint ? atteint.arrivee_s + LEGENDE_S : REGLE2_S);
  }

  return { ...base, legende, ageLegende, pop: atteint ? pop(t - atteint.arrivee_s) : 0 };
};

export const rumor: Sujet = {
  nom: "rumor",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneRumor,
};
