import { interpolate } from "remotion";
import calcul from "../../../sujets/sneeze.calcul.json";
import texte from "../../../sujets/sneeze.json";
import { grouper, nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneSneeze } from "./Scene";
import { paletteA, pasCompteur, vitesse } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

const mesure = (metresParSeconde: number, langue: Langue) => {
  const L = texte[langue];
  const valeur = metresParSeconde * (L.facteur_unite === "mph" ? calcul.m_s_en_mph : calcul.m_s_en_kmh);
  if (valeur >= 1e6) {
    const part = valeur / 1e6;
    return { nombre: nombreLocal(part, L.separateurs), unite: part < 2 ? L.unite_million1 : L.unite_million };
  }
  if (valeur >= 100) {
    return { nombre: grouper(Math.round(valeur).toString(), L.separateurs.milliers), unite: L.unite };
  }
  return { nombre: nombreLocal(valeur, L.separateurs), unite: L.unite };
};

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const regle = { legende: L.regle, ageLegende: t + 1, pop: 0 };

  if (t >= calcul.t_retour) {
    const { nombre, unite } = mesure(vitesse(0), langue);
    return { nombre, etiquette: `${unite} · ${L.pli} 0`, palette, ...regle, ageLegende: t - calcul.t_retour + 1 };
  }
  if (t >= calcul.t_qui) {
    const { nombre } = mesure(calcul.c_m_s, langue);
    const base = { nombre, etiquette: L.lumiere_etiquette, palette };
    if (t >= calcul.t_patte) {
      return { ...base, legende: L.salud, ageLegende: t - calcul.t_patte, pop: pop(t - calcul.t_patte) };
    }
    return { ...base, legende: L.non, ageLegende: t - calcul.t_qui, pop: pop(t - calcul.t_qui) };
  }
  if (t >= calcul.t_coupe) {
    const { nombre, unite } = mesure(vitesse(calcul.n_lumiere), langue);
    const lignes = L.lumiere.map((l) => remplir(l, { n: calcul.n_lumiere }));
    return { nombre, etiquette: `${unite} · ${L.pli} ${calcul.n_lumiere}`, palette, legende: lignes, ageLegende: t - calcul.t_coupe, pop: pop(t - calcul.t_coupe) };
  }

  const seconde = Math.floor(pasCompteur(t) + 1e-9);
  const { nombre, unite } = mesure(vitesse(seconde), langue);
  const base = { nombre, etiquette: `${unite} · ${L.pli} ${seconde}`, palette };

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];
  const dernier = atteint?.cle === "lune";
  const avecLune = (lignes: string[]) => lignes.map((l) => remplir(l, { lune: calcul.lune[langue] }));

  if (t < REGLE_S) {
    return { ...base, ...regle };
  }
  let legende: string[];
  let ageLegende: number;
  if (atteint && (dernier || t < atteint.arrivee_s + LEGENDE_S)) {
    legende = avecLune(cle(atteint).legende);
    ageLegende = t - atteint.arrivee_s;
  } else if (!atteint) {
    legende = L.regle2.map((l) => remplir(l, { v0: calcul.v0[langue] }));
    ageLegende = t - REGLE_S;
  } else {
    const reste = suivant.pas - seconde;
    legende = [remplir(L.suite, { cible: cle(suivant).cible }), reste === 1 ? L.restant1 : remplir(L.restant, { n: reste })];
    ageLegende = t - (atteint.arrivee_s + LEGENDE_S);
  }

  return { ...base, legende, ageLegende, pop: atteint ? pop(t - atteint.arrivee_s) : 0 };
};

export const sneeze: Sujet = {
  nom: "sneeze",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneSneeze,
};
