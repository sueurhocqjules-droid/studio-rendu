import { interpolate } from "remotion";
import calcul from "../../../sujets/ant.calcul.json";
import texte from "../../../sujets/ant.json";
import { nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneAnt } from "./Scene";
import { chargeA, paletteA, pasCompteur } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;
const REGLE2_S = 5.2;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

// Milligrammes, grammes, livres puis tonnes courtes en anglais ; mg, g, kg puis tonnes en espagnol et portugais
const mesure = (kg: number, langue: Langue) => {
  const L = texte[langue];
  const sep = L.separateurs;
  if (kg < 0.001) {
    return { nombre: nombreLocal(kg * 1e6, sep), unite: L.unites.mg };
  }
  if (langue === "en") {
    const livres = kg / calcul.livre_kg;
    if (livres < 1) {
      return { nombre: nombreLocal(kg * 1000, sep), unite: L.unites.g };
    }
    if (livres < 2000) {
      return { nombre: nombreLocal(livres, sep), unite: L.unites.petit };
    }
    return { nombre: nombreLocal(kg / calcul.tonne_courte_kg, sep), unite: L.unites.grand };
  }
  if (kg < 1) {
    return { nombre: nombreLocal(kg * 1000, sep), unite: L.unites.g };
  }
  if (kg < 1000) {
    return { nombre: nombreLocal(kg, sep), unite: L.unites.petit };
  }
  return { nombre: nombreLocal(kg / 1000, sep), unite: L.unites.grand };
};

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const sep = L.separateurs;
  const seconde = t >= calcul.t_retour ? 0 : Math.floor(pasCompteur(t) + 1e-9);
  const enVrai = t >= calcul.t_vrai && t < calcul.t_retour;
  const { nombre, unite } = mesure(chargeA(enVrai ? 0 : seconde), langue);
  const regle = L.regle;
  const rapport = String(calcul.rapport);
  const parPersonne = nombreLocal(calcul.par_personne_millions, sep).slice(0, 3);
  const base = { nombre, etiquette: enVrai ? unite : `${unite} · ${L.pli} ${seconde}`, palette };

  if (t >= calcul.t_retour) {
    return { ...base, legende: regle, ageLegende: t >= calcul.t_fin ? t - calcul.t_fin + 1 : t - calcul.t_retour, pop: 0 };
  }
  if (t >= calcul.t_chacun) {
    const [n, etiquette] = L.chacun_compteur.map((ligne) => remplir(ligne, { par_personne: parPersonne }));
    const legende = L.chacun.map((ligne) => remplir(ligne, { par_personne: parPersonne }));
    return { nombre: n, etiquette, palette, legende, ageLegende: t - calcul.t_chacun, pop: pop(t - calcul.t_chacun) };
  }
  if (t >= calcul.t_nombre) {
    const [n, etiquette] = L.nombre_compteur;
    return { nombre: n, etiquette, palette, legende: L.nombre, ageLegende: t - calcul.t_nombre, pop: pop(t - calcul.t_nombre) };
  }
  if (t >= calcul.t_vrai) {
    const legende = L.vrai.map((ligne) => remplir(ligne, { rapport }));
    return { ...base, legende, ageLegende: t - calcul.t_vrai, pop: pop(t - calcul.t_vrai) };
  }

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];
  const dernier = atteint?.cle === "barrage";

  let legende: string[];
  let ageLegende: number;
  if (t < REGLE_S) {
    legende = regle;
    ageLegende = t + 1;
  } else if (t < REGLE2_S && (!atteint || t >= atteint.arrivee_s + LEGENDE_S)) {
    legende = L.regle2;
    ageLegende = t - REGLE_S;
  } else if (atteint && (dernier || t < atteint.arrivee_s + LEGENDE_S)) {
    legende = cle(atteint).legende;
    ageLegende = t - atteint.arrivee_s;
  } else {
    const reste = suivant.pas - seconde;
    legende = [reste === 1 ? L.dans1 : remplir(L.dans, { n: reste }), cle(suivant).cible];
    ageLegende = t - (atteint ? atteint.arrivee_s + LEGENDE_S : REGLE2_S);
  }

  return { ...base, legende, ageLegende, pop: atteint ? pop(t - atteint.arrivee_s) : 0 };
};

export const ant: Sujet = {
  nom: "ant",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneAnt,
};
