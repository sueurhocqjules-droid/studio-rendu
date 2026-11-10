import { interpolate } from "remotion";
import calcul from "../../../sujets/rice.calcul.json";
import texte from "../../../sujets/rice.json";
import { grouper, nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneRice } from "./Scene";
import { paletteA, pasCompteur } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;
const REGLE2_S = 5.2;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

const compte = (grains: number, langue: Langue) => {
  const L = texte[langue];
  if (grains < 1e6) {
    return {
      nombre: grouper(grains.toString(), L.separateurs.milliers),
      unite: grains < 2 ? L.grain1 : L.grains,
    };
  }
  const unite = L.unites.find((u) => grains < u.max) ?? L.unites[L.unites.length - 1];
  const part = grains / unite.diviseur;
  return { nombre: nombreLocal(part, L.separateurs), unite: part < 2 ? unite.nom1 : unite.nom };
};

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const seconde = Math.floor(pasCompteur(t) + 1e-9);
  const courant = compte(Math.pow(2, seconde), langue);
  const base = { nombre: courant.nombre, etiquette: `${courant.unite} · ${L.pli} ${seconde}`, palette };

  if (t >= calcul.t_fin) {
    return { ...base, legende: L.regle, ageLegende: t - calcul.t_fin + 1, pop: 0 };
  }

  const fin: [number, string[]][] = [
    [calcul.t_chute, L.chute],
    [calcul.t_faim, L.faim],
    [calcul.t_boule, L.boule],
    [calcul.t_planete, L.planete],
  ];
  const etape = fin.find(([debut]) => t >= debut);
  if (etape) {
    return { ...base, legende: etape[1], ageLegende: t - etape[0], pop: pop(t - etape[0]) };
  }

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];

  let legende: string[];
  let ageLegende: number;
  if (t < REGLE_S) {
    legende = L.regle;
    ageLegende = t + 1;
  } else if (t < REGLE2_S) {
    legende = L.regle2;
    ageLegende = t - REGLE_S;
  } else if (atteint && t < atteint.arrivee_s + LEGENDE_S) {
    legende = cle(atteint).legende.map((ligne) => remplir(ligne, { annees: calcul.annees }));
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

export const rice: Sujet = {
  nom: "rice",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneRice,
};
