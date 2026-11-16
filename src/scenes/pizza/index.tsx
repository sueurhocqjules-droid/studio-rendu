import { interpolate } from "remotion";
import calcul from "../../../sujets/pizza.calcul.json";
import texte from "../../../sujets/pizza.json";
import { nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { ScenePizza } from "./Scene";
import { paletteA, pasCompteur, zoomA } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;
const REGLE2_S = 5.2;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

// Masse en grammes avec le préfixe SI qui garde un nombre lisible
const masse = (coupes: number, langue: Langue) => {
  const L = texte[langue];
  const grammes = (calcul.masse_kg * 1000) / Math.pow(calcul.k, coupes);
  const rang = Math.min(L.unites.length - 1, Math.max(0, Math.ceil(-Math.log10(grammes) / 3 - 1e-9)));
  return { nombre: nombreLocal(grammes * Math.pow(1000, rang), L.separateurs), unite: L.unites[rang] };
};

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const coupes = t < calcul.t_retour ? Math.floor(pasCompteur(t) + 1e-9) : Math.round(zoomA(t));
  const { nombre, unite } = masse(coupes, langue);
  const base = { nombre, etiquette: `${unite} · ${L.pli} ${coupes}`, palette };

  if (t >= calcul.t_fin) {
    return { ...base, legende: L.regle, ageLegende: t - calcul.t_fin + 1, pop: 0 };
  }
  if (t >= calcul.t_patte) {
    return { ...base, legende: L.total.map((l) => remplir(l, { n: calcul.septillions })), ageLegende: t - calcul.t_patte, pop: pop(t - calcul.t_patte) };
  }
  if (t >= calcul.t_qui) {
    return { ...base, legende: L.grec, ageLegende: t - calcul.t_qui, pop: 0 };
  }
  if (t >= calcul.t_coupe) {
    return { ...base, legende: L.stop, ageLegende: t - calcul.t_coupe, pop: pop(t - calcul.t_coupe) };
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
  } else if (atteint && (dernier || t < atteint.arrivee_s + LEGENDE_S)) {
    legende = cle(atteint).legende;
    ageLegende = t - atteint.arrivee_s;
  } else if (t < REGLE2_S + 1.2 && !atteint) {
    legende = L.regle2;
    ageLegende = t - REGLE_S;
  } else {
    const reste = suivant.pas - coupes;
    legende = [remplir(L.suite, { cible: cle(suivant).cible }), reste === 1 ? L.restant1 : remplir(L.restant, { n: reste })];
    ageLegende = t - (atteint ? atteint.arrivee_s + LEGENDE_S : REGLE2_S);
  }

  return { ...base, legende, ageLegende, pop: atteint ? pop(t - atteint.arrivee_s) : 0 };
};

export const pizza: Sujet = {
  nom: "pizza",
  dureeS: calcul.duree_s,
  etat,
  Scene: ScenePizza,
};
