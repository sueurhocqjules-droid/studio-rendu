import { interpolate } from "remotion";
import calcul from "../../../sujets/wifi.calcul.json";
import texte from "../../../sujets/wifi.json";
import { nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneWifi } from "./Scene";
import { paletteA, pasCompteur, pasDecor } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

const debit = (seconde: number, langue: Langue) => {
  const L = texte[langue];
  const v = calcul.d0 * Math.pow(calcul.facteur, seconde);
  const rang = Math.min(L.unites.length - 1, Math.floor(Math.log10(v) / 3 + 1e-9));
  return { nombre: nombreLocal(v / Math.pow(1000, rang), L.separateurs), unite: L.unites[rang] };
};

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const seconde = t < calcul.t_retour ? Math.floor(pasCompteur(t) + 1e-9) : Math.round(pasDecor(t));
  const { nombre, unite } = debit(seconde, langue);
  const base = { nombre, etiquette: `${unite} · ${L.pli} ${seconde}`, palette };
  const pct = langue === "en" ? calcul.pct_texte : calcul.pct_texte.replace(".", ",");

  if (t >= calcul.t_fin) {
    return { ...base, legende: L.regle, ageLegende: t - calcul.t_fin + 1, pop: 0 };
  }
  if (t >= calcul.t_patte) {
    return { ...base, nombre: pct, etiquette: L.pct_etiquette, legende: L.garde.map((l) => remplir(l, { pct })), ageLegende: t - calcul.t_patte, pop: pop(t - calcul.t_patte) };
  }
  if (t >= calcul.t_qui) {
    return { ...base, legende: L.plein.map((l) => remplir(l, { n: calcul.n_plein })), ageLegende: t - calcul.t_qui, pop: 0 };
  }
  if (t >= calcul.t_coupe) {
    return { ...base, legende: L.attends, ageLegende: t - calcul.t_coupe, pop: pop(t - calcul.t_coupe) };
  }

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];
  const dernier = atteint?.cle === "vie";

  let legende: string[];
  let ageLegende: number;
  if (t < REGLE_S) {
    legende = L.regle;
    ageLegende = t + 1;
  } else if (!atteint && t < 7) {
    legende = L.regle2;
    ageLegende = t - REGLE_S;
  } else if (atteint && (dernier || t < atteint.arrivee_s + LEGENDE_S)) {
    legende = cle(atteint).legende;
    ageLegende = t - atteint.arrivee_s;
  } else {
    const reste = suivant.pas - seconde;
    legende = [remplir(L.suite, { cible: cle(suivant).cible }), reste === 1 ? L.restant1 : remplir(L.restant, { n: reste })];
    ageLegende = t - (atteint ? atteint.arrivee_s + LEGENDE_S : 7);
  }

  return { ...base, legende, ageLegende, pop: atteint ? pop(t - atteint.arrivee_s) : 0 };
};

export const wifi: Sujet = {
  nom: "wifi",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneWifi,
};
