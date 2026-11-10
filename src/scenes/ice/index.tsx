import { interpolate } from "remotion";
import calcul from "../../../sujets/ice.calcul.json";
import texte from "../../../sujets/ice.json";
import { grouper, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneIce } from "./Scene";
import { celsius, paletteA, pasCompteur } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;
const REGLE2_S = 5.2;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

const lecture = (seconde: number, langue: Langue) => {
  const L = texte[langue];
  const c = celsius(seconde);
  const valeur = L.unite === "°F" ? (c * 9) / 5 + 32 : c;
  const signe = valeur < -0.001 ? "−" : "";
  if (seconde >= calcul.n_max) {
    return `${signe}${Math.abs(valeur).toFixed(2).replace(".", L.separateurs.decimale)}`;
  }
  return `${signe}${grouper(Math.round(Math.abs(valeur)).toString(), L.separateurs.milliers)}`;
};

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const seconde = Math.floor(pasCompteur(t) + 1e-9);
  const base = { nombre: lecture(seconde, langue), etiquette: `${L.unite} · ${L.pli} ${seconde}`, palette };

  if (t >= calcul.t_fin) {
    return { ...base, legende: L.regle, ageLegende: t - calcul.t_fin + 1, pop: 0 };
  }
  if (t >= calcul.t_fonte) {
    return { ...base, legende: L.fonte, ageLegende: t - calcul.t_fonte, pop: pop(t - calcul.t_fonte) };
  }
  if (t >= calcul.t_tremble) {
    return { ...base, legende: L.tremble, ageLegende: t - calcul.t_tremble, pop: 0 };
  }

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];
  const dernier = atteint?.cle === "zero";

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

export const ice: Sujet = {
  nom: "ice",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneIce,
};
