import { interpolate } from "remotion";
import calcul from "../../../sujets/coin.calcul.json";
import texte from "../../../sujets/coin.json";
import { grouper, nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneCoin } from "./Scene";
import { paletteA, pasCompteur, pasDecor } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;
const REGLE2_S = 5.2;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

// La chance s'écrit 1/x : à la fin de la boucle, 1/1 est exactement ce que la pièce valait
const chance = (x: number, langue: Langue) => {
  const L = texte[langue];
  if (x < 1e6) {
    return { nombre: `1/${grouper(x.toString(), L.separateurs.milliers)}`, unite: L.chance };
  }
  const unite = L.unites.find((u) => x < u.max) ?? L.unites[L.unites.length - 1];
  const part = x / unite.diviseur;
  return { nombre: `1/${nombreLocal(part, L.separateurs)}`, unite: part < 2 ? unite.nom1 : unite.nom };
};

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const seconde = Math.floor(pasCompteur(t) + 1e-9);
  const x = t >= calcul.t_retour ? Math.max(1, Math.round(Math.pow(2, pasDecor(t)))) : Math.pow(2, seconde);
  const mesure = chance(x, langue);
  const epilogue = t >= calcul.t_coupe && t < calcul.t_fin;
  const etiquette = epilogue ? mesure.unite : `${mesure.unite} · ${L.pli} ${t >= calcul.t_fin ? 0 : seconde}`;
  const base = { nombre: mesure.nombre, etiquette, palette };

  if (t >= calcul.t_fin) {
    return { ...base, legende: L.regle, ageLegende: t - calcul.t_fin + 1, pop: 0 };
  }
  if (t >= calcul.t_patte) {
    return { ...base, legende: L.chat, ageLegende: t - calcul.t_patte, pop: pop(t - calcul.t_patte) };
  }
  if (t >= calcul.t_qui) {
    return { ...base, legende: L.qui, ageLegende: t - calcul.t_qui, pop: 0 };
  }
  if (t >= calcul.t_coupe) {
    return { ...base, legende: L.vide, ageLegende: t - calcul.t_coupe, pop: pop(t - calcul.t_coupe) };
  }

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];
  const dernier = atteint?.cle === "bigbang";

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

export const coin: Sujet = {
  nom: "coin",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneCoin,
};
