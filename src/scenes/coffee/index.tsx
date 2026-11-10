import { interpolate } from "remotion";
import calcul from "../../../sujets/coffee.calcul.json";
import texte from "../../../sujets/coffee.json";
import { grouper, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneCoffee } from "./Scene";
import { paletteA, pasChaleur, temperature } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const pas = pasChaleur(t);
  const celsius = temperature(pas);
  const valeur = L.unite === "°F" ? (celsius * 9) / 5 + 32 : celsius;
  const nombre = grouper(Math.round(valeur).toString(), L.separateurs.milliers);
  const seconde = Math.floor(pas + 1e-9);

  if (t >= calcul.t_fin) {
    return {
      nombre,
      etiquette: `${L.unite} · ${L.pli} 0`,
      legende: L.regle,
      ageLegende: t - calcul.t_fin + 1,
      pop: 0,
      palette,
    };
  }

  if (t >= calcul.t_souffle) {
    return {
      nombre,
      etiquette: `${L.unite} · ${L.pli} ${seconde}`,
      legende: L.souffle,
      ageLegende: t - calcul.t_souffle,
      pop: pop(t - calcul.t_souffle),
      palette,
    };
  }

  if (t >= calcul.t_reacteur) {
    const gw = calcul.gw.toFixed(2).replace(".", L.separateurs.decimale);
    return {
      nombre,
      etiquette: `${L.unite} · ${gw} GW`,
      legende: L.reacteur,
      ageLegende: t - calcul.t_reacteur,
      pop: pop(t - calcul.t_reacteur),
      palette,
    };
  }

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
    nombre,
    etiquette: `${L.unite} · ${L.pli} ${seconde}`,
    legende,
    ageLegende,
    pop: atteint ? pop(t - atteint.arrivee_s) : 0,
    palette,
  };
};

export const coffee: Sujet = {
  nom: "coffee",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneCoffee,
};
