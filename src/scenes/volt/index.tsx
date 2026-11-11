import { interpolate } from "remotion";
import calcul from "../../../sujets/volt.calcul.json";
import texte from "../../../sujets/volt.json";
import { nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneVolt } from "./Scene";
import { paletteA, pasCompteur, pasDecor, tensionDe } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;
const REGLE2_S = 5.2;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

// Une décimale sous 100 V, puis kilovolts et mégavolts à trois chiffres utiles
const mesure = (volts: number, langue: Langue) => {
  const sep = texte[langue].separateurs;
  if (volts >= 1e6) {
    return { nombre: nombreLocal(volts / 1e6, sep), unite: "MV" };
  }
  if (volts >= 1000) {
    return { nombre: nombreLocal(volts / 1000, sep), unite: "KV" };
  }
  if (volts >= 100) {
    return { nombre: Math.round(volts).toString(), unite: "V" };
  }
  const [entier, reste] = volts.toFixed(1).split(".");
  return { nombre: `${entier}${sep.decimale}${reste}`, unite: "V" };
};

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const seconde = Math.floor(pasCompteur(t) + 1e-9);
  const pas = t >= calcul.t_retour ? pasDecor(t) : seconde;
  const { nombre, unite } = mesure(tensionDe(pas), langue);
  const epilogue = t >= calcul.t_haut && t < calcul.t_fin;
  const etiquette = epilogue ? unite : `${unite} · ${L.pli} ${t >= calcul.t_fin ? 0 : seconde}`;
  const base = { nombre, etiquette, palette };
  const v0 = mesure(calcul.v0, langue).nombre;
  const regle = L.regle.map((ligne) => remplir(ligne, { pct: calcul.hausse_pct, v0 }));

  if (t >= calcul.t_fin) {
    return { ...base, legende: regle, ageLegende: t - calcul.t_fin + 1, pop: 0 };
  }
  if (t >= calcul.t_retour) {
    return { ...base, legende: L.retour, ageLegende: t - calcul.t_retour, pop: 0 };
  }
  if (t >= calcul.t_maison) {
    const legende = L.maison.map((ligne) => remplir(ligne, { annees: calcul.annees }));
    return { ...base, legende, ageLegende: t - calcul.t_maison, pop: pop(t - calcul.t_maison) };
  }
  if (t >= calcul.t_haut) {
    return { ...base, legende: L.haut, ageLegende: t - calcul.t_haut, pop: pop(t - calcul.t_haut) };
  }

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];
  const dernier = atteint === calcul.paliers[calcul.paliers.length - 1];

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
    legende = [remplir(L.suite, { cible: cle(suivant).cible }), reste === 1 ? L.restant1 : remplir(L.restant, { n: reste })];
    ageLegende = t - (atteint ? atteint.arrivee_s + LEGENDE_S : REGLE2_S);
  }

  return { ...base, legende, ageLegende, pop: atteint ? pop(t - atteint.arrivee_s) : 0 };
};

export const volt: Sujet = {
  nom: "volt",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneVolt,
};
