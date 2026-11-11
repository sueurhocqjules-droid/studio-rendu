import { interpolate } from "remotion";
import calcul from "../../../sujets/snowball.calcul.json";
import texte from "../../../sujets/snowball.json";
import { nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneSnowball } from "./Scene";
import { masseA, paletteCadre, pasCompteur, pasDecor } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;
const REGLE2_S = 5.2;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

// Livres puis tonnes courtes en anglais, kilos puis tonnes en espagnol et portugais
const mesure = (kg: number, langue: Langue) => {
  const L = texte[langue];
  const sep = L.separateurs;
  if (langue === "en") {
    const livres = kg / calcul.livre_kg;
    if (livres < 2000) {
      return { nombre: nombreLocal(livres, sep), unite: L.petit };
    }
    return { nombre: nombreLocal(kg / calcul.tonne_courte_kg, sep), unite: L.grand };
  }
  if (kg < 1000) {
    return { nombre: nombreLocal(kg, sep), unite: L.petit };
  }
  return { nombre: nombreLocal(kg / 1000, sep), unite: L.grand };
};

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteCadre(t);
  const seconde = Math.floor(pasCompteur(t) + 1e-9);
  const pasMasse = t >= calcul.t_retour ? pasDecor(t) : seconde;
  const { nombre, unite } = mesure(masseA(pasMasse), langue);
  const epilogue = t >= calcul.t_coupe && t < calcul.t_fin;
  const etiquette = epilogue ? unite : `${unite} · ${L.pli} ${t >= calcul.t_fin ? 0 : seconde}`;
  const base = { nombre, etiquette, palette };
  const regle = L.regle.map((ligne) => remplir(ligne, { pct: calcul.gain_pct }));

  if (t >= calcul.t_fin) {
    return { ...base, legende: regle, ageLegende: t - calcul.t_fin + 1, pop: 0 };
  }
  if (t >= calcul.t_retour) {
    return { ...base, legende: L.neige, ageLegende: t - calcul.t_retour, pop: 0 };
  }
  if (t >= calcul.t_qui) {
    const qui = L.qui.map((ligne) => remplir(ligne, { terrains: calcul.terrains[langue] }));
    return { ...base, legende: qui, ageLegende: t - calcul.t_qui, pop: pop(t - calcul.t_qui) };
  }
  if (t >= calcul.t_coupe) {
    return { ...base, legende: L.vide, ageLegende: t - calcul.t_coupe, pop: pop(t - calcul.t_coupe) };
  }

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];
  const dernier = atteint?.cle === "pyramide";

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

export const snowball: Sujet = {
  nom: "snowball",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneSnowball,
};
