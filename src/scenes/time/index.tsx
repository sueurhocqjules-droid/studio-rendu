import { interpolate } from "remotion";
import calcul from "../../../sujets/time.calcul.json";
import texte from "../../../sujets/time.json";
import { grouper, nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneTime } from "./Scene";
import { paletteA, pasCompteur, pasDecor } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;
const REGLE2_S = 5.2;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

type Unites = Record<string, string>;

// Durée réelle d'une seconde, dans la plus grande unité que la langue sait dire
const mesure = (secondes: number, langue: Langue) => {
  const L = texte[langue];
  const noms = L.unites as Unites;
  const unite = [...calcul.unites].reverse().find(([cle, seuil]) => secondes >= Number(seuil) && noms[String(cle)]) ?? calcul.unites[0];
  return { nombre: nombreLocal(secondes / Number(unite[2]), L.separateurs), unite: noms[String(unite[0])] };
};

type Cle = keyof (typeof texte)["en"]["paliers"];

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const seconde = Math.floor(pasCompteur(t) + 1e-9);
  const pas = t >= calcul.t_retour ? pasDecor(t) : seconde;
  const { nombre, unite } = mesure(Math.pow(calcul.facteur, pas), langue);
  const epilogue = t >= calcul.t_coupe && t < calcul.t_fin;
  const etiquette = epilogue ? unite : `${unite} · ${L.pli} ${t >= calcul.t_fin ? 0 : seconde}`;
  const base = { nombre, etiquette, palette };

  if (t >= calcul.t_fin) {
    return { ...base, legende: L.regle, ageLegende: t - calcul.t_fin + 1, pop: 0 };
  }
  if (t >= calcul.t_retour) {
    return { ...base, legende: L.retour, ageLegende: t - calcul.t_retour, pop: 0 };
  }
  if (t >= calcul.t_coupe) {
    const sep = L.separateurs;
    const valeurs = {
      age: nombreLocal(calcul.univers_ga, sep),
      age_ma: grouper(calcul.univers_ma.toString(), sep.milliers),
      pct: calcul.univers_pct,
    };
    return { ...base, legende: L.part.map((ligne) => remplir(ligne, valeurs)), ageLegende: t - calcul.t_coupe, pop: 0 };
  }
  if (t >= calcul.t_limite) {
    return { ...base, legende: L.univers, ageLegende: t - calcul.t_limite, pop: pop(t - calcul.t_limite) };
  }

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s);
  const textes = (p: { cle: string }) => L.paliers[p.cle as Cle];

  let legende: string[];
  let ageLegende: number;
  if (t < REGLE_S) {
    legende = L.regle;
    ageLegende = t + 1;
  } else if (t < REGLE2_S) {
    legende = L.regle2;
    ageLegende = t - REGLE_S;
  } else if (atteint && (!suivant || t < atteint.arrivee_s + LEGENDE_S)) {
    legende = textes(atteint).legende;
    ageLegende = t - atteint.arrivee_s;
  } else {
    const prochain = suivant ?? calcul.paliers[0];
    const reste = prochain.pas - seconde;
    legende = [remplir(L.suite, { cible: textes(prochain).cible }), reste === 1 ? L.restant1 : remplir(L.restant, { n: reste })];
    ageLegende = t - (atteint ? atteint.arrivee_s + LEGENDE_S : REGLE2_S);
  }

  return { ...base, legende, ageLegende, pop: atteint ? pop(t - atteint.arrivee_s) : 0 };
};

export const time: Sujet = {
  nom: "time",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneTime,
};
