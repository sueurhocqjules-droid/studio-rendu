import { interpolate } from "remotion";
import calcul from "../../../sujets/walk.calcul.json";
import texte from "../../../sujets/walk.json";
import { grouper, nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneWalk } from "./Scene";
import { distanceA, paletteA, pasCompteur, pasDecor, vitesse } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

const allure = (ms: number, langue: Langue) => {
  const L = texte[langue];
  const valeur = ms * L.par_ms;
  const unite = L.unites.find((u) => valeur < u.max) ?? L.unites[L.unites.length - 1];
  const part = valeur / unite.diviseur;
  return { nombre: nombreLocal(part, L.separateurs), unite: part < 2 ? unite.nom1 : unite.nom };
};

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);

  if (t >= calcul.t_fin) {
    const depart = allure(calcul.depart_ms, langue);
    return {
      nombre: depart.nombre,
      etiquette: `${depart.unite} · ${L.pli} 0`,
      legende: L.regle,
      ageLegende: t - calcul.t_fin + 1,
      pop: 0,
      palette,
    };
  }

  if (t >= calcul.t_clefs) {
    const reste = distanceA(pasDecor(t)) * L.par_metre;
    const retour = t >= calcul.t_retour;
    const debut = retour ? calcul.t_retour : calcul.t_clefs;
    return {
      nombre: grouper(Math.round(reste).toString(), L.separateurs.milliers),
      etiquette: L.loin,
      legende: retour ? L.retour.map((ligne) => remplir(ligne, { n: Math.round(calcul.retour_s) })) : L.clefs,
      ageLegende: t - debut,
      pop: pop(t - debut),
      palette,
    };
  }

  const pas = pasCompteur(t);
  const seconde = Math.floor(pas + 1e-9);
  const courant = allure(vitesse(pas), langue);
  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];

  let legende: string[];
  let ageLegende: number;
  if (t < REGLE_S) {
    legende = L.regle;
    ageLegende = t + 1;
  } else if (atteint && t < atteint.arrivee_s + LEGENDE_S) {
    legende = cle(atteint).legende;
    ageLegende = t - atteint.arrivee_s;
  } else {
    const reste = suivant.pas - seconde;
    legende = [
      remplir(L.suite, { cible: cle(suivant).cible }),
      reste === 1 ? L.restant1 : remplir(L.restant, { n: reste }),
    ];
    ageLegende = t - (atteint ? atteint.arrivee_s + LEGENDE_S : REGLE_S);
  }

  return {
    nombre: courant.nombre,
    etiquette: `${courant.unite} · ${L.pli} ${seconde}`,
    legende,
    ageLegende,
    pop: atteint ? pop(t - atteint.arrivee_s) : 0,
    palette,
  };
};

export const walk: Sujet = {
  nom: "walk",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneWalk,
};
