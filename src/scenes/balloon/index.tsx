import { interpolate } from "remotion";
import calcul from "../../../sujets/balloon.calcul.json";
import texte from "../../../sujets/balloon.json";
import { grouper, nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneBalloon } from "./Scene";
import { paletteA, pasCompteur, pasDecor } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

const volume = (seconde: number, langue: Langue) => {
  const L = texte[langue];
  const m3 = calcul.v0_m3 * Math.pow(calcul.facteur, seconde);
  const unite = L.unites.find((u) => m3 / u.m3 < u.max) ?? L.unites[L.unites.length - 1];
  return { nombre: nombreLocal(m3 / unite.m3, L.separateurs), unite: unite.nom };
};

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const seconde = t < calcul.t_retour ? Math.floor(pasCompteur(t) + 1e-9) : Math.max(0, Math.round(pasDecor(t) - 0.5));
  const { nombre, unite } = volume(seconde, langue);
  const base = { nombre, etiquette: `${unite} · ${L.pli} ${seconde}`, palette };

  if (t >= calcul.t_fin) {
    return { ...base, legende: L.regle, ageLegende: t - calcul.t_fin + 1, pop: 0 };
  }
  if (t >= calcul.t_patte) {
    return { ...base, legende: L.souffle, ageLegende: t - calcul.t_patte, pop: 0 };
  }
  if (t >= calcul.t_qui) {
    return { ...base, legende: L.pop, ageLegende: t - calcul.t_qui, pop: pop(t - calcul.t_qui) };
  }
  if (t >= calcul.t_coupe) {
    const d = langue === "en" ? grouper(String(calcul.d_mi), ",") : grouper(String(calcul.d_km), ".");
    return { ...base, legende: L.vide.map((l) => remplir(l, { d })), ageLegende: t - calcul.t_coupe, pop: pop(t - calcul.t_coupe) };
  }

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];
  const dernier = atteint?.cle === "atmosphere";

  let legende: string[];
  let ageLegende: number;
  if (t < REGLE_S) {
    legende = L.regle;
    ageLegende = t + 1;
  } else if (atteint && (dernier || t < atteint.arrivee_s + LEGENDE_S + 0.2)) {
    legende = cle(atteint).legende;
    ageLegende = t - Math.max(atteint.arrivee_s, REGLE_S);
  } else if (t < 7) {
    legende = L.regle2;
    ageLegende = t - 5.3;
  } else {
    const reste = suivant.pas - seconde;
    legende = [remplir(L.suite, { cible: cle(suivant).cible }), reste === 1 ? L.restant1 : remplir(L.restant, { n: reste })];
    ageLegende = t - (atteint && atteint.arrivee_s > 5 ? atteint.arrivee_s + LEGENDE_S : 7);
  }

  return { ...base, legende, ageLegende, pop: atteint ? pop(t - atteint.arrivee_s) : 0 };
};

export const balloon: Sujet = {
  nom: "balloon",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneBalloon,
};
