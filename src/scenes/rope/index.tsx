import { interpolate } from "remotion";
import calcul from "../../../sujets/rope.calcul.json";
import texte from "../../../sujets/rope.json";
import { nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneRope } from "./Scene";
import { paletteA, pasCompteur } from "./temps";

const LEGENDE_S = 2.6;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

const mesure = (metres: number, langue: Langue) => {
  const L = texte[langue];
  const unite = L.unites.find((u) => metres < u.max) ?? L.unites[L.unites.length - 1];
  const part = metres / unite.metres;
  return { nombre: nombreLocal(part, L.separateurs), unite: part < 2 ? unite.nom1 : unite.nom };
};

const longueur = (seconde: number) => calcul.l0_m * Math.pow(calcul.facteur, seconde);

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const regle = { legende: L.regle, ageLegende: t + 1, pop: 0 };

  if (t >= calcul.t_retour) {
    const { nombre, unite } = mesure(longueur(0), langue);
    return { nombre, etiquette: `${unite} · ${L.pli} 0`, palette, ...regle, ageLegende: t - calcul.t_retour + 1 };
  }
  if (t >= calcul.t_coupe) {
    const { nombre, unite } = mesure(longueur(calcul.n_max), langue);
    const base = { nombre, etiquette: `${unite} · ${L.pli} ${calcul.n_max}`, palette };
    if (t >= calcul.t_patte) {
      return { ...base, legende: L.noeud, ageLegende: t - calcul.t_patte, pop: pop(t - calcul.t_patte) };
    }
    if (t >= calcul.t_qui) {
      return { ...base, legende: L.bout.map((l) => remplir(l, { n: calcul.n_bout })), ageLegende: t - calcul.t_qui, pop: pop(t - calcul.t_qui) };
    }
    return { ...base, legende: L.jour.map((l) => remplir(l, { h: calcul.heures })), ageLegende: t - calcul.t_coupe, pop: pop(t - calcul.t_coupe) };
  }

  const seconde = Math.floor(pasCompteur(t) + 1e-9);
  const { nombre, unite } = mesure(longueur(seconde), langue);
  const base = { nombre, etiquette: `${unite} · ${L.pli} ${seconde}`, palette };

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];
  const dernier = atteint?.cle === "voyager";

  // Le premier palier tombe vite : la règle reste affichée jusqu'à lui
  if (!atteint) {
    return { ...base, ...regle };
  }
  let legende: string[];
  let ageLegende: number;
  if (dernier || t < atteint.arrivee_s + LEGENDE_S) {
    legende = cle(atteint).legende;
    ageLegende = t - atteint.arrivee_s;
  } else {
    const reste = suivant.pas - seconde;
    legende = [remplir(L.suite, { cible: cle(suivant).cible }), reste === 1 ? L.restant1 : remplir(L.restant, { n: reste })];
    ageLegende = t - (atteint.arrivee_s + LEGENDE_S);
  }

  return { ...base, legende, ageLegende, pop: pop(t - atteint.arrivee_s) };
};

export const rope: Sujet = {
  nom: "rope",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneRope,
};
