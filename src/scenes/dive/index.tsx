import { interpolate } from "remotion";
import calcul from "../../../sujets/dive.calcul.json";
import texte from "../../../sujets/dive.json";
import { grouper, nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneDive } from "./Scene";
import { paletteA, pasCompteur, pasDecor, profondeurDe } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;
const REGLE2_S = 5.2;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

// Pieds en anglais, mètres ailleurs ; trois chiffres utiles sous 100, entiers groupés au-delà
const longueur = (metres: number, langue: Langue) => {
  const sep = texte[langue].separateurs;
  const valeur = langue === "en" ? metres / calcul.pied_m : metres;
  return valeur < 100 ? nombreLocal(valeur, sep) : grouper(Math.round(valeur).toString(), sep.milliers);
};

const atmospheres = (metres: number, langue: Langue) => {
  const sep = texte[langue].separateurs;
  const atm = 1 + metres / calcul.m_par_atmosphere;
  if (atm < 10) {
    const [entier, reste] = atm.toFixed(1).split(".");
    return `${entier}${sep.decimale}${reste}`;
  }
  return grouper(Math.round(atm).toString(), sep.milliers);
};

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const seconde = Math.floor(pasCompteur(t) + 1e-9);
  let profondeur = t >= calcul.t_fond ? calcul.fond_m : profondeurDe(seconde);
  if (t >= calcul.t_remonte) {
    profondeur = Math.min(profondeurDe(pasDecor(t)), calcul.fond_m);
  }
  const epilogue = t >= calcul.t_fond && t < calcul.t_fin;
  const pression = `${atmospheres(profondeur, langue)} ${L.atm}`;
  const etiquette = epilogue ? `${L.unite} · ${pression}` : `${L.unite} · ${pression} · ${L.pli} ${t >= calcul.t_fin ? 0 : seconde}`;
  const base = { nombre: longueur(profondeur, langue), etiquette, palette };
  const regle = L.regle.map((ligne) => remplir(ligne, { pct: calcul.gain_pct }));

  if (t >= calcul.t_fin) {
    return { ...base, legende: regle, ageLegende: t - calcul.t_fin + 1, pop: 0 };
  }
  if (t >= calcul.t_remonte) {
    return { ...base, legende: L.remonte, ageLegende: t - calcul.t_remonte, pop: 0 };
  }
  if (t >= calcul.t_poids) {
    const poids = langue === "en" ? String(calcul.tonnes_us_pouce2) : nombreLocal(calcul.tonnes_cm2, L.separateurs);
    return { ...base, legende: L.poids.map((ligne) => remplir(ligne, { poids })), ageLegende: t - calcul.t_poids, pop: pop(t - calcul.t_poids) };
  }
  if (t >= calcul.t_fond) {
    const legende = L.non.map((ligne) => remplir(ligne, { regle: longueur(calcul.regle_m, langue) }));
    return { ...base, legende, ageLegende: t - calcul.t_fond, pop: pop(t - calcul.t_fond) };
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

export const dive: Sujet = {
  nom: "dive",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneDive,
};
