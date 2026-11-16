import { interpolate } from "remotion";
import calcul from "../../../sujets/magnet.calcul.json";
import texte from "../../../sujets/magnet.json";
import { grouper, nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneMagnet } from "./Scene";
import { paletteA, pasCompteur } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const sep = L.separateurs;
  const palette = paletteA(t);
  const seconde = t < calcul.t_patte ? Math.floor(pasCompteur(t) + 1e-9) : 0;
  const champ = calcul.b0_t * Math.pow(calcul.facteur, seconde);
  const base = { nombre: nombreLocal(champ, sep), etiquette: `${L.unite} · ${L.pli} ${seconde}`, palette };

  if (t >= calcul.t_fin) {
    return { ...base, legende: L.regle, ageLegende: t - calcul.t_fin + 1, pop: 0 };
  }
  if (t >= calcul.t_patte) {
    return { ...base, legende: L.frigo, ageLegende: t - calcul.t_patte, pop: pop(t - calcul.t_patte) };
  }
  if (t >= calcul.t_qui) {
    const d = grouper(String(langue === "en" ? calcul.carte_mi : calcul.carte_km), sep.milliers);
    return { ...base, legende: L.carte.map((l) => remplir(l, { d })), ageLegende: t - calcul.t_qui, pop: 0 };
  }
  if (t >= calcul.t_coupe) {
    const k = grouper(String(calcul.k_magnetar), sep.milliers);
    return { ...base, legende: L.magnetar.map((l) => remplir(l, { k })), ageLegende: t - calcul.t_coupe, pop: pop(t - calcul.t_coupe) };
  }

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];
  const dernier = atteint?.cle === "atome";

  let legende: string[];
  let ageLegende: number;
  if (t < REGLE_S) {
    legende = L.regle;
    ageLegende = t + 1;
  } else if (!atteint && t < 6) {
    legende = L.regle2;
    ageLegende = t - REGLE_S;
  } else if (atteint && (dernier || t < atteint.arrivee_s + LEGENDE_S)) {
    legende = cle(atteint).legende;
    ageLegende = t - atteint.arrivee_s;
  } else {
    const reste = suivant.pas - seconde;
    legende = [remplir(L.suite, { cible: cle(suivant).cible }), reste === 1 ? L.restant1 : remplir(L.restant, { n: reste })];
    ageLegende = t - (atteint ? atteint.arrivee_s + LEGENDE_S : 6);
  }

  return { ...base, legende, ageLegende, pop: atteint ? pop(t - atteint.arrivee_s) : 0 };
};

export const magnet: Sujet = {
  nom: "magnet",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneMagnet,
};
