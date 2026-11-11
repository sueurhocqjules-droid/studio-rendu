import { interpolate } from "remotion";
import calcul from "../../../sujets/heart.calcul.json";
import texte from "../../../sujets/heart.json";
import { grouper, nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneHeart } from "./Scene";
import { hzAffiche, paletteA, pasA } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;
const REGLE2_S = 5.2;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

// Sous 20 Hz, on compte en battements par minute ; au-dessus, le cœur est une note, en hertz
const mesure = (hz: number, langue: Langue) => {
  const L = texte[langue];
  if (hz < calcul.audible_hz) {
    return { nombre: grouper(Math.round(hz * 60).toString(), L.separateurs.milliers), unite: L.bpm };
  }
  return { nombre: nombreLocal(hz, L.separateurs), unite: L.hz };
};

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const seconde = Math.floor(pasA(t) + 1e-9);
  const { nombre, unite } = mesure(hzAffiche(t), langue);
  const regle = L.regle.map((ligne) => remplir(ligne, { pct: calcul.hausse_pct }));
  const base = { nombre, palette };

  if (t >= calcul.t_fin) {
    return { ...base, etiquette: `${unite} · ${L.pli} 0`, legende: regle, ageLegende: t - calcul.t_fin + 1, pop: 0 };
  }
  if (t >= calcul.t_retour) {
    return { ...base, etiquette: unite, legende: L.souffle, ageLegende: t - calcul.t_retour, pop: 0 };
  }
  if (t >= calcul.t_orchestre) {
    return { ...base, etiquette: `${unite} · ${L.note}`, legende: L.orchestre, ageLegende: t - calcul.t_orchestre, pop: 0 };
  }
  if (t >= calcul.t_limite) {
    return { ...base, etiquette: `${unite} · ${L.note}`, legende: L.joue, ageLegende: t - calcul.t_limite, pop: pop(t - calcul.t_limite) };
  }

  const etiquette = `${unite} · ${L.pli} ${seconde}`;
  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s);
  const textes = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];
  const avecAge = (lignes: string[]) => lignes.map((ligne) => remplir(ligne, { age: calcul.age_course }));

  let legende: string[];
  let ageLegende: number;
  if (t < REGLE_S) {
    legende = regle;
    ageLegende = t + 1;
  } else if (t < REGLE2_S) {
    legende = L.regle2;
    ageLegende = t - REGLE_S;
  } else if (atteint && (!suivant || t < atteint.arrivee_s + LEGENDE_S)) {
    legende = avecAge(textes(atteint).legende);
    ageLegende = t - atteint.arrivee_s;
  } else {
    const cible = suivant ?? calcul.paliers[0];
    const reste = cible.pas - seconde;
    legende = [remplir(L.suite, { cible: textes(cible).cible }), reste === 1 ? L.restant1 : remplir(L.restant, { n: reste })];
    ageLegende = t - (atteint ? atteint.arrivee_s + LEGENDE_S : REGLE2_S);
  }

  return { ...base, etiquette, legende, ageLegende, pop: atteint ? pop(t - atteint.arrivee_s) : 0 };
};

export const heart: Sujet = {
  nom: "heart",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneHeart,
};
