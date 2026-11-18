import { interpolate } from "remotion";
import calcul from "../../../sujets/popcorn.calcul.json";
import texte from "../../../sujets/popcorn.json";
import { nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { ScenePopcorn } from "./Scene";
import { kcalA, paletteA, pasCompteur } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;
const REGLE2_S = 5.2;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

// Calories en chiffres jusqu'au million, puis millions, milliards (mil millones, bilhões) et billions
const mesure = (kcal: number, langue: Langue) => {
  const L = texte[langue];
  const sep = L.separateurs;
  if (kcal < 1e6) {
    return { nombre: nombreLocal(Math.round(kcal), sep), unite: L.unites.unite };
  }
  if (kcal < 1e9) {
    return { nombre: nombreLocal(kcal / 1e6, sep), unite: L.unites.millions };
  }
  if (kcal < 1e12) {
    return { nombre: nombreLocal(kcal / 1e9, sep), unite: L.unites.milliards };
  }
  return { nombre: nombreLocal(kcal / 1e12, sep), unite: L.unites.billions };
};

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const seconde = t >= calcul.t_retour ? 0 : Math.floor(pasCompteur(t) + 1e-9);
  const enVrai = t >= calcul.t_vrai && t < calcul.t_retour;
  const { nombre, unite } = mesure(kcalA(enVrai ? 0 : seconde), langue);
  const pct = String(calcul.pct_jour);
  const base = { nombre, etiquette: enVrai ? unite : `${unite} · ${L.pli} ${seconde}`, palette };

  if (t >= calcul.t_retour) {
    return { ...base, legende: L.regle, ageLegende: t >= calcul.t_fin ? t - calcul.t_fin + 1 : t - calcul.t_retour, pop: 0 };
  }
  if (t >= calcul.t_film) {
    return { ...base, legende: L.film, ageLegende: t - calcul.t_film, pop: pop(t - calcul.t_film) };
  }
  if (t >= calcul.t_jour) {
    const [n, etiquette] = L.jour_compteur.map((ligne) => remplir(ligne, { pct }));
    const legende = L.jour.map((ligne) => remplir(ligne, { pct }));
    return { nombre: n, etiquette, palette, legende, ageLegende: t - calcul.t_jour, pop: pop(t - calcul.t_jour) };
  }
  if (t >= calcul.t_vrai) {
    return { ...base, legende: L.vrai, ageLegende: t - calcul.t_vrai, pop: pop(t - calcul.t_vrai) };
  }

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];
  const dernier = atteint?.cle === calcul.paliers[calcul.paliers.length - 1].cle;

  let legende: string[];
  let ageLegende: number;
  if (t < REGLE_S) {
    legende = L.regle;
    ageLegende = t + 1;
  } else if (t < REGLE2_S && (!atteint || t >= atteint.arrivee_s + LEGENDE_S)) {
    legende = L.regle2;
    ageLegende = t - REGLE_S;
  } else if (atteint && (dernier || t < atteint.arrivee_s + LEGENDE_S)) {
    legende = cle(atteint).legende;
    ageLegende = t - atteint.arrivee_s;
  } else {
    const reste = suivant.pas - seconde;
    legende = [reste === 1 ? L.dans1 : remplir(L.dans, { n: reste }), cle(suivant).cible];
    ageLegende = t - (atteint ? atteint.arrivee_s + LEGENDE_S : REGLE2_S);
  }

  return { ...base, legende, ageLegende, pop: atteint ? pop(t - atteint.arrivee_s) : 0 };
};

export const popcorn: Sujet = {
  nom: "popcorn",
  dureeS: calcul.duree_s,
  etat,
  Scene: ScenePopcorn,
};
