import { interpolate } from "remotion";
import calcul from "../../../sujets/wind.calcul.json";
import texte from "../../../sujets/wind.json";
import { longueurLocale, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneWind } from "./Scene";
import { entre, paletteA, pasCompteur, vitesseKmh } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;
const REGLE2_S = 5.2;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

// Plus d'air à la coupe : le compteur tombe à zéro, puis la brise du début revient
const kmhA = (t: number) => {
  if (t >= calcul.t_retour) {
    return calcul.depart_kmh * entre(t, calcul.t_retour, calcul.t_fin);
  }
  return t >= calcul.t_coupe ? 0 : vitesseKmh(pasCompteur(t));
};

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const seconde = Math.floor(pasCompteur(t) + 1e-9);
  const kmh = kmhA(t);
  const mesure = longueurLocale(kmh, L.unites, L.separateurs);
  const nombre = kmh === 0 ? "0" : mesure.nombre;
  const epilogue = t >= calcul.t_coupe && t < calcul.t_fin;
  const etiquette = epilogue ? mesure.unite : `${mesure.unite} · ${L.pli} ${t >= calcul.t_fin ? 0 : seconde}`;
  const base = { nombre, etiquette, palette };

  if (t >= calcul.t_fin) {
    return { ...base, legende: L.regle, ageLegende: t - calcul.t_fin + 1, pop: 0 };
  }
  if (t >= calcul.t_pince) {
    return { ...base, legende: L.pince, ageLegende: t - calcul.t_pince, pop: 0 };
  }
  if (t >= calcul.t_coupe) {
    return { ...base, legende: L.vide, ageLegende: t - calcul.t_coupe, pop: pop(t - calcul.t_coupe) };
  }

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];
  const dernier = atteint?.cle === "liberation";

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

export const wind: Sujet = {
  nom: "wind",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneWind,
};
