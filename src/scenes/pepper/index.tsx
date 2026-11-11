import { interpolate } from "remotion";
import calcul from "../../../sujets/pepper.calcul.json";
import texte from "../../../sujets/pepper.json";
import { grouper, nombreLocal, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { ScenePepper } from "./Scene";
import { paletteA, pasCompteur, pasDecor } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;
const REGLE2_S = 5.2;

const pop = (age: number) => interpolate(age, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });

const mesure = (shu: number, langue: Langue) => {
  const L = texte[langue];
  const echelle = [...(L.echelles as [number, string][])].reverse().find(([seuil]) => shu >= seuil);
  if (!echelle) {
    return { nombre: grouper(Math.round(shu).toString(), L.separateurs.milliers), unite: L.unite };
  }
  return { nombre: nombreLocal(shu / echelle[0], L.separateurs), unite: echelle[1] };
};

type Cle = keyof (typeof texte)["en"]["paliers"];

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const seconde = Math.floor(pasCompteur(t) + 1e-9);
  const pasPiquant = t >= calcul.t_retour ? pasDecor(t) : seconde;
  const shu = calcul.depart_shu * Math.pow(calcul.facteur, pasPiquant);
  const { nombre, unite } = mesure(shu, langue);
  const epilogue = t >= calcul.t_coupe && t < calcul.t_fin;
  const etiquette = epilogue ? unite : `${unite} · ${L.pli} ${t >= calcul.t_fin ? 0 : seconde}`;
  const base = { nombre, etiquette, palette };
  const regle = L.regle.map((ligne) => remplir(ligne, { pct: calcul.hausse_pct }));

  if (t >= calcul.t_fin) {
    return { ...base, legende: regle, ageLegende: t - calcul.t_fin + 1, pop: 0 };
  }
  if (t >= calcul.t_lait) {
    return { ...base, legende: L.lait, ageLegende: t - calcul.t_lait, pop: 0 };
  }
  if (t >= calcul.t_seve) {
    return { ...base, legende: L.seve, ageLegende: t - calcul.t_seve, pop: 0 };
  }
  if (t >= calcul.t_coupe) {
    return { ...base, legende: L.pas, ageLegende: t - calcul.t_coupe, pop: pop(t - calcul.t_coupe) };
  }

  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const valeurs = (cle: string) => ({
    x: calcul.fois[cle as keyof typeof calcul.fois] ?? "",
    annee: calcul.annees[cle as keyof typeof calcul.annees] ?? "",
  });
  const textes = (p: { cle: string }) => {
    const brut = L.paliers[p.cle as Cle];
    return {
      cible: remplir(brut.cible, valeurs(p.cle)),
      legende: brut.legende.map((ligne) => remplir(ligne, valeurs(p.cle))),
    };
  };
  const dernier = atteint?.cle === "rtx";

  let legende: string[];
  let ageLegende: number;
  if (t < REGLE_S) {
    legende = regle;
    ageLegende = t + 1;
  } else if (t < REGLE2_S) {
    legende = L.regle2;
    ageLegende = t - REGLE_S;
  } else if (atteint && (dernier || t < atteint.arrivee_s + LEGENDE_S)) {
    legende = textes(atteint).legende;
    ageLegende = t - atteint.arrivee_s;
  } else {
    const reste = suivant.pas - seconde;
    legende = [remplir(L.suite, { cible: textes(suivant).cible }), reste === 1 ? L.restant1 : remplir(L.restant, { n: reste })];
    ageLegende = t - (atteint ? atteint.arrivee_s + LEGENDE_S : REGLE2_S);
  }

  return { ...base, legende, ageLegende, pop: atteint ? pop(t - atteint.arrivee_s) : 0 };
};

export const pepper: Sujet = {
  nom: "pepper",
  dureeS: calcul.duree_s,
  etat,
  Scene: ScenePepper,
};
