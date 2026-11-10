import { interpolate } from "remotion";
import calcul from "../../../sujets/light.calcul.json";
import texte from "../../../sujets/light.json";
import { grouper, nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneLight } from "./Scene";
import { paletteA, pasCompteur, pasDecor } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;
const REGLE2_S = 5.2;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

const mesure = (metresParSeconde: number, langue: Langue) => {
  const sep = texte[langue].separateurs;
  if (metresParSeconde >= 1e6) {
    return { nombre: grouper(Math.round(metresParSeconde / 1000).toString(), sep.milliers), unite: "KM/S" };
  }
  if (metresParSeconde >= 1000) {
    return { nombre: nombreLocal(metresParSeconde / 1000, sep), unite: "KM/S" };
  }
  if (metresParSeconde >= 1) {
    return { nombre: nombreLocal(metresParSeconde, sep), unite: "M/S" };
  }
  if (metresParSeconde >= 0.01) {
    return { nombre: nombreLocal(metresParSeconde * 100, sep), unite: "CM/S" };
  }
  return { nombre: nombreLocal(metresParSeconde * 1000, sep), unite: "MM/S" };
};

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const seconde = Math.floor(pasCompteur(t) + 1e-9);
  const pasVitesse = t >= calcul.t_retour ? pasDecor(t) : seconde;
  const vitesse = calcul.c_m_s * Math.pow(calcul.facteur, pasVitesse);
  const { nombre, unite } = mesure(vitesse, langue);
  const epilogue = t >= calcul.t_coupe && t < calcul.t_fin;
  const etiquette = epilogue ? unite : `${unite} · ${L.pli} ${t >= calcul.t_fin ? 0 : seconde}`;
  const base = { nombre, etiquette, palette };
  const regle = L.regle.map((ligne) => remplir(ligne, { pct: calcul.perte_pct }));
  const avecMinutes = (lignes: string[]) => lignes.map((ligne) => remplir(ligne, { minutes: calcul.minutes_ecran }));

  if (t >= calcul.t_fin) {
    return { ...base, legende: regle, ageLegende: t - calcul.t_fin + 1, pop: 0 };
  }
  if (t >= calcul.t_patte) {
    return { ...base, legende: avecMinutes(L.chat), ageLegende: t - calcul.t_patte, pop: pop(t - calcul.t_patte) };
  }
  if (t >= calcul.t_qui) {
    return { ...base, legende: avecMinutes(L.qui), ageLegende: t - calcul.t_qui, pop: 0 };
  }
  if (t >= calcul.t_coupe) {
    return { ...base, legende: L.vide, ageLegende: t - calcul.t_coupe, pop: pop(t - calcul.t_coupe) };
  }

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];
  const dernier = atteint?.cle === "escargot";

  let legende: string[];
  let ageLegende: number;
  if (t < REGLE_S) {
    legende = regle;
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

export const light: Sujet = {
  nom: "light",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneLight,
};
