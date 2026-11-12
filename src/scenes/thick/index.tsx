import { interpolate } from "remotion";
import calcul from "../../../sujets/thick.calcul.json";
import texte from "../../../sujets/thick.json";
import { grouper, nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneThick } from "./Scene";
import { paletteA, pasCompteur, pasDecor } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 3.5;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

// Combien de fois l'eau : chiffres entiers jusqu'au million, puis trois chiffres utiles et le mot de la langue
const mesure = (fois: number, langue: Langue) => {
  const L = texte[langue];
  const sep = L.separateurs;
  if (fois < 1e6) {
    return { nombre: grouper(Math.round(fois).toString(), sep.milliers), echelle: "" };
  }
  const exposant = Math.floor(Math.log10(fois) + 1e-9);
  const [puissance, nom] = [...L.echelles].reverse().find(([p]) => (p as number) <= exposant) as [number, string];
  const reste = fois / Math.pow(10, puissance);
  if (reste < 1000) {
    return { nombre: nombreLocal(reste, sep), echelle: nom };
  }
  const chiffres = Math.floor(Math.log10(reste)) + 1;
  const arrondi = Math.round(reste / Math.pow(10, chiffres - 3)) * Math.pow(10, chiffres - 3);
  return { nombre: grouper(arrondi.toString(), sep.milliers), echelle: nom };
};

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const seconde = Math.floor(pasCompteur(t) + 1e-9);
  const pas = t >= calcul.t_retour ? Math.floor(pasDecor(t) + 1e-9) : seconde;
  const { nombre, echelle } = mesure(Math.pow(calcul.facteur, pas), langue);
  const unite = `${echelle ? `${echelle} ` : ""}X ${L.eau}`;
  const epilogue = t >= calcul.t_coupe && t < calcul.t_fin;
  const etiquette = epilogue ? unite : `${unite} · ${L.pli} ${t >= calcul.t_fin ? 0 : seconde}`;
  const base = { nombre, etiquette, palette };

  if (t >= calcul.t_retour) {
    return { ...base, legende: L.regle, ageLegende: t - calcul.t_retour, pop: 0 };
  }
  if (t >= calcul.t_flux) {
    return { ...base, legende: L.flux, ageLegende: t - calcul.t_flux, pop: pop(t - calcul.t_flux) };
  }
  if (t >= calcul.t_coupe) {
    return { ...base, legende: L.sous, ageLegende: t - calcul.t_coupe, pop: pop(t - calcul.t_coupe) };
  }

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];
  const dernier = atteint?.cle === "manteau";

  let legende: string[];
  let ageLegende: number;
  if (t < REGLE_S && !atteint) {
    legende = L.regle;
    ageLegende = t + 1;
  } else if (atteint && (dernier || t < atteint.arrivee_s + LEGENDE_S)) {
    legende = cle(atteint).legende;
    ageLegende = t - atteint.arrivee_s;
  } else {
    const reste = suivant.pas - seconde;
    legende = [
      remplir(L.suite, { cible: cle(suivant).cible }),
      reste === 1 ? L.restant1 : remplir(L.restant, { n: reste }),
    ];
    ageLegende = t - (atteint ? atteint.arrivee_s + LEGENDE_S : REGLE_S);
  }

  return { ...base, legende, ageLegende, pop: atteint ? pop(t - atteint.arrivee_s) : 0 };
};

export const thick: Sujet = {
  nom: "thick",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneThick,
};
