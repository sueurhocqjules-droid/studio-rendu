import { interpolate } from "remotion";
import calcul from "../../../sujets/zoom.calcul.json";
import texte from "../../../sujets/zoom.json";
import { nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneZoom } from "./Scene";
import { paletteA, pasCompteur, pasDecor } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;
// Le terrain de football apparaît une fois revenu à l'atome
const BILLE_S = 0.7;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

const grossissement = (seconde: number, langue: Langue) => {
  const L = texte[langue];
  const x = Math.pow(calcul.facteur, seconde);
  const unite = L.unites.find((u) => x / u.x < u.max) ?? L.unites[L.unites.length - 1];
  return { nombre: `×${nombreLocal(x / unite.x, L.separateurs)}`, unite: unite.nom };
};

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const seconde = t < calcul.t_coupe ? Math.floor(pasCompteur(t) + 1e-9) : Math.round(pasDecor(t));
  const { nombre, unite } = grossissement(seconde, langue);
  const base = { nombre, etiquette: `${unite} · ${L.pli} ${seconde}`, palette };
  const valeurs = {
    p: calcul.textes.p[langue],
    k: calcul.textes.k[langue],
    cm: calcul.textes.cm[langue],
    adn: calcul.textes.adn[langue],
  };

  if (t >= calcul.t_fin) {
    return { ...base, legende: L.regle, ageLegende: t - calcul.t_fin + 1, pop: 0 };
  }
  if (t >= calcul.t_patte) {
    return { ...base, legende: L.main, ageLegende: t - calcul.t_patte, pop: 0 };
  }
  if (t >= calcul.t_qui) {
    return { ...base, legende: L.vide_final.map((l) => remplir(l, valeurs)), ageLegende: t - calcul.t_qui, pop: pop(t - calcul.t_qui) };
  }
  if (t >= calcul.t_coupe + BILLE_S) {
    return { ...base, legende: L.bille.map((l) => remplir(l, valeurs)), ageLegende: t - calcul.t_coupe - BILLE_S, pop: pop(t - calcul.t_coupe - BILLE_S) };
  }

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];
  const dernier = atteint?.cle === "proton";
  const fin = atteint ? Math.max(atteint.arrivee_s, REGLE_S) + LEGENDE_S : REGLE_S;

  let legende: string[];
  let ageLegende: number;
  if (!atteint) {
    legende = t < REGLE_S ? L.regle : L.regle2;
    ageLegende = t < REGLE_S ? t + 1 : t - REGLE_S;
  } else if (dernier || t < fin) {
    legende = cle(atteint).legende.map((l) => remplir(l, valeurs));
    ageLegende = t - Math.max(atteint.arrivee_s, REGLE_S);
  } else if (atteint.cle === "atome" && Math.floor((t - fin) / 3) % 2 === 0) {
    // Dans le vide de l'atome, on le dit une fois sur deux
    legende = L.vide;
    ageLegende = (t - fin) % 3;
  } else {
    const reste = suivant.pas - seconde;
    legende = [remplir(L.suite, { cible: cle(suivant).cible }), reste === 1 ? L.restant1 : remplir(L.restant, { n: reste })];
    ageLegende = atteint.cle === "atome" ? (t - fin) % 3 : t - fin;
  }

  return { ...base, legende, ageLegende, pop: atteint ? pop(t - atteint.arrivee_s) : 0 };
};

export const zoom: Sujet = {
  nom: "zoom",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneZoom,
};
