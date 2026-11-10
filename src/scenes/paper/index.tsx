import { interpolate } from "remotion";
import calcul from "../../../sujets/paper.calcul.json";
import texte from "../../../sujets/paper.json";
import { longueurLocale, nombreLocal, remplir } from "../../cadre/format";
import { melange, paletteEntre, pasA } from "../../cadre/rythme";
import type { Etat, Langue, Palette, Sujet } from "../../cadre/types";
import { ScenePaper } from "./Scene";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;

export const pliA = (t: number) => pasA(t, calcul.pli_max);

const ZONES: [number, Palette][] = [
  [0, { fond: "#F3EAD7", encre: "#1B1712", accent: "#1B1712" }],
  [12, { fond: "#F3EAD7", encre: "#1B1712", accent: "#1B1712" }],
  [14, { fond: "#9CCFEA", encre: "#0E2A47", accent: "#A8240F" }],
  [26, { fond: "#9CCFEA", encre: "#0E2A47", accent: "#A8240F" }],
  [29, { fond: "#2A62A8", encre: "#F3EAD7", accent: "#FFC53D" }],
  [31, { fond: "#2A62A8", encre: "#F3EAD7", accent: "#FFC53D" }],
  [33, { fond: "#0E1A36", encre: "#F3EAD7", accent: "#FFC53D" }],
  [37, { fond: "#070B18", encre: "#F3EAD7", accent: "#E8E2D0" }],
  [46, { fond: "#070B18", encre: "#F3EAD7", accent: "#E8E2D0" }],
  [49, { fond: "#2E1405", encre: "#FFE9C2", accent: "#FFB020" }],
  [52, { fond: "#2E1405", encre: "#FFE9C2", accent: "#FFB020" }],
  [54, { fond: "#08182A", encre: "#E6F6F7", accent: "#7CD6E8" }],
  [58, { fond: "#08182A", encre: "#E6F6F7", accent: "#7CD6E8" }],
  [61, { fond: "#0B0B12", encre: "#F3EAD7", accent: "#FFE36B" }],
  [66, { fond: "#0B0B12", encre: "#F3EAD7", accent: "#FFE36B" }],
  [68, { fond: "#2A0A10", encre: "#FFE5DC", accent: "#FF6A4D" }],
];
const MICRO: Palette = { fond: "#D6391F", encre: "#FFF6E6", accent: "#1B1712" };
const DEPART = ZONES[0][1];

const paletteA = (pli: number) => paletteEntre(ZONES, pli);

const hauteurA = (pli: number) => calcul.epaisseur_m * Math.pow(2, pli);

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const pli = pliA(t);
  const pliEntier = Math.floor(pli + 1e-6);
  const dernier = calcul.paliers[calcul.paliers.length - 1];

  if (t >= calcul.t_fin) {
    const depart = longueurLocale(calcul.epaisseur_m, L.unites, L.separateurs);
    return {
      nombre: depart.nombre,
      etiquette: `${depart.unite} · ${L.pli} 0`,
      legende: L.regle,
      ageLegende: t - calcul.t_fin + 1,
      pop: 0,
      palette: melange(MICRO, DEPART, interpolate(t, [calcul.t_fin, calcul.t_fin + 0.3], [0, 1], { extrapolateRight: "clamp" })),
    };
  }

  if (t >= calcul.t_atome) {
    const largeurNm = calcul.largeur_finale_m * 1e9;
    return {
      nombre: `${nombreLocal(largeurNm, L.separateurs)} nm`,
      etiquette: `${L.large} · ${L.pli} ${calcul.pli_max}`,
      legende: L.retournement.map((ligne) => remplir(ligne, { ratio: Math.round(calcul.ratio_atome) })),
      ageLegende: t - calcul.t_atome,
      pop: interpolate(t - calcul.t_atome, [0, 0.25], [1, 0], { extrapolateRight: "clamp" }),
      palette: melange(paletteA(calcul.pli_max), MICRO, interpolate(t, [calcul.t_atome, calcul.t_atome + 0.2], [0, 1], { extrapolateRight: "clamp" })),
    };
  }

  const longueur = longueurLocale(hauteurA(pli), L.unites, L.separateurs);
  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? dernier;
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];

  let legende: string[];
  let ageLegende: number;
  if (t < REGLE_S) {
    legende = L.regle;
    ageLegende = t + 1;
  } else if (atteint && t < atteint.arrivee_s + LEGENDE_S) {
    legende = cle(atteint).legende.map((ligne) => remplir(ligne, { n: atteint.pli }));
    ageLegende = t - atteint.arrivee_s;
  } else {
    const reste = suivant.pli - pliEntier;
    legende = [
      remplir(L.suite, { cible: cle(suivant).cible }),
      reste === 1 ? L.restant1 : remplir(L.restant, { n: reste }),
    ];
    ageLegende = t - (atteint ? atteint.arrivee_s + LEGENDE_S : REGLE_S);
  }

  return {
    nombre: longueur.nombre,
    etiquette: `${longueur.unite} · ${L.pli} ${pliEntier}`,
    legende,
    ageLegende,
    pop: atteint ? interpolate(t - atteint.arrivee_s, [0, 0.3], [1, 0], { extrapolateRight: "clamp" }) : 0,
    palette: paletteA(pli),
  };
};

export const paper: Sujet = {
  nom: "paper",
  dureeS: calcul.duree_s,
  etat,
  Scene: ScenePaper,
};
