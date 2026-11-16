import { interpolate } from "remotion";
import calcul from "../../../sujets/candle.calcul.json";
import texte from "../../../sujets/candle.json";
import { nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneCandle } from "./Scene";
import { paletteA, pasCompteur, pasDecor } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

const puissance = (seconde: number, langue: Langue) => {
  const L = texte[langue];
  const w = calcul.p0_w * Math.pow(calcul.facteur, seconde);
  const rang = Math.min(L.unites.length - 1, Math.floor(Math.log10(w) / 3 + 1e-9));
  return { nombre: nombreLocal(w / Math.pow(1000, rang), L.separateurs), unite: L.unites[rang] };
};

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const seconde = t < calcul.t_retour ? Math.floor(pasCompteur(t) + 1e-9) : Math.round(pasDecor(t));
  const { nombre, unite } = puissance(seconde, langue);
  const base = { nombre, etiquette: `${unite} · ${L.pli} ${seconde}`, palette };

  if (t >= calcul.t_fin) {
    return { ...base, legende: L.regle, ageLegende: t - calcul.t_fin + 1, pop: 0 };
  }
  if (t >= calcul.t_patte) {
    return { ...base, legende: L.fusion, ageLegende: t - calcul.t_patte, pop: 0 };
  }
  if (t >= calcul.t_qui) {
    return { ...base, legende: L.vrai.map((l) => remplir(l, { k: calcul.textes.k[langue] })), ageLegende: t - calcul.t_qui, pop: pop(t - calcul.t_qui) };
  }
  if (t >= calcul.t_coupe) {
    return { ...base, legende: L.cire.map((l) => remplir(l, { h: calcul.textes.h[langue] })), ageLegende: t - calcul.t_coupe, pop: pop(t - calcul.t_coupe) };
  }

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];
  const dernier = atteint?.cle === "soleil";

  let legende: string[];
  let ageLegende: number;
  if (t < REGLE_S) {
    legende = L.regle;
    ageLegende = t + 1;
  } else if (atteint && (dernier || t < Math.max(atteint.arrivee_s, REGLE_S) + LEGENDE_S)) {
    legende = cle(atteint).legende;
    ageLegende = t - Math.max(atteint.arrivee_s, REGLE_S);
  } else {
    const reste = suivant.pas - seconde;
    legende = [remplir(L.suite, { cible: cle(suivant).cible }), reste === 1 ? L.restant1 : remplir(L.restant, { n: reste })];
    ageLegende = t - (atteint ? Math.max(atteint.arrivee_s, REGLE_S) + LEGENDE_S : REGLE_S);
  }

  return { ...base, legende, ageLegende, pop: atteint ? pop(t - atteint.arrivee_s) : 0 };
};

export const candle: Sujet = {
  nom: "candle",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneCandle,
};
