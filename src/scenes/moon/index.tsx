import { interpolate } from "remotion";
import calcul from "../../../sujets/moon.calcul.json";
import texte from "../../../sujets/moon.json";
import { longueurLocale, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneMoon } from "./Scene";
import { distanceKm, paletteA, pasCompteur } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;
const REGLE2_S = 5.2;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const seconde = Math.floor(pasCompteur(t) + 1e-9);
  const mesure = longueurLocale(distanceKm(pasCompteur(t)) * 1000, L.unites, L.separateurs);
  // Pendant la naissance la distance remonte : le numéro de seconde n'a plus de sens, il revient à 0 pour la boucle
  const epilogue = t >= calcul.t_naissance && t < calcul.t_fin;
  const etiquette = epilogue ? mesure.unite : `${mesure.unite} · ${L.pli} ${seconde}`;
  const base = { nombre: mesure.nombre, etiquette, palette };

  if (t >= calcul.t_fin) {
    return { ...base, legende: L.regle, ageLegende: t - calcul.t_fin + 1, pop: 0 };
  }
  if (t >= calcul.t_depart) {
    return { ...base, legende: L.depart, ageLegende: t - calcul.t_depart, pop: 0 };
  }
  if (t >= calcul.t_naissance) {
    return { ...base, legende: L.naissance, ageLegende: t - calcul.t_naissance, pop: pop(t - calcul.t_naissance) };
  }
  if (t >= calcul.t_anneaux) {
    return { ...base, legende: L.anneaux, ageLegende: t - calcul.t_anneaux, pop: 0 };
  }

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];
  const dernier = atteint?.cle === "roche";

  let legende: string[];
  let ageLegende: number;
  if (t < REGLE_S) {
    legende = L.regle;
    ageLegende = t + 1;
  } else if (t < REGLE2_S) {
    legende = L.regle2;
    ageLegende = t - REGLE_S;
  } else if (atteint && (dernier || t < atteint.arrivee_s + LEGENDE_S)) {
    legende = cle(atteint).legende;
    ageLegende = t - atteint.arrivee_s;
  } else {
    const reste = suivant.pas - seconde;
    legende = [
      remplir(L.suite, { cible: cle(suivant).cible }),
      reste === 1 ? L.restant1 : remplir(L.restant, { n: reste }),
    ];
    ageLegende = t - (atteint ? atteint.arrivee_s + LEGENDE_S : REGLE2_S);
  }

  return { ...base, legende, ageLegende, pop: atteint ? pop(t - atteint.arrivee_s) : 0 };
};

export const moon: Sujet = {
  nom: "moon",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneMoon,
};
