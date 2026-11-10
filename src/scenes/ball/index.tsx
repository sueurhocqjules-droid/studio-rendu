import { interpolate } from "remotion";
import calcul from "../../../sujets/ball.calcul.json";
import texte from "../../../sujets/ball.json";
import { longueurLocale, remplir } from "../../cadre/format";
import type { Etat, Langue, Sujet } from "../../cadre/types";
import { SceneBall } from "./Scene";
import { hauteurBallon, hauteurPic, HOOP_M, paletteA, vitesseChute } from "./temps";

const LEGENDE_S = 2.6;
const REGLE_S = 2.6;

const pop = (age: number, duree = 0.3) => interpolate(age, [0, duree], [1, 0], { extrapolateRight: "clamp" });

const etat = (t: number, langue: Langue): Etat => {
  const L = texte[langue];
  const palette = paletteA(t);
  const longueur = (m: number) => longueurLocale(m, L.unites, L.separateurs);

  if (t >= calcul.t_fin) {
    const depart = longueur(HOOP_M);
    return {
      nombre: depart.nombre,
      etiquette: `${depart.unite} · ${L.pli} 0`,
      legende: L.regle,
      ageLegende: t - calcul.t_fin + 1,
      pop: 0,
      palette,
    };
  }

  if (t >= calcul.t_panier) {
    return {
      nombre: "2",
      etiquette: L.points,
      legende: L.panier,
      ageLegende: t - calcul.t_panier,
      pop: pop(t - calcul.t_panier, 0.4),
      palette,
    };
  }

  if (t >= calcul.t_chute) {
    const h = hauteurBallon(t);
    const courant = longueur(h);
    const mach = (vitesseChute(h) / calcul.vitesse_son).toFixed(1).replace(".", L.separateurs.decimale);
    const legende = t >= calcul.t_mach ? L.mach.map((ligne) => remplir(ligne, { mach: calcul.mach })) : L.chute;
    return {
      nombre: courant.nombre,
      etiquette: `${courant.unite} · MACH ${mach}`,
      legende,
      ageLegende: t - (t >= calcul.t_mach ? calcul.t_mach : calcul.t_chute),
      pop: t >= calcul.t_mach ? 0 : pop(t - calcul.t_chute),
      palette,
    };
  }

  // Le compteur garde le record : il arrive sur la hauteur du rebond à l'instant du pic
  const dernierPic = Math.floor(2 * t + 0.5);
  const avance = 2 * t + 0.5 - dernierPic;
  const pas = t < 0.25 ? 4 * t : Math.min(dernierPic + 1 - Math.pow(1 - avance, 3), calcul.n_max);
  const courant = longueur(hauteurPic(pas));
  const atteint = [...calcul.paliers].reverse().find((p) => t >= p.arrivee_s);
  const suivant = calcul.paliers.find((p) => t < p.arrivee_s) ?? calcul.paliers[calcul.paliers.length - 1];
  const cle = (p: { cle: string }) => L.paliers[p.cle as keyof typeof L.paliers];
  const rebond = Math.floor(pas + 1e-9);

  let legende: string[];
  let ageLegende: number;
  if (t < REGLE_S) {
    legende = L.regle;
    ageLegende = t + 1;
  } else if (atteint && t < atteint.arrivee_s + LEGENDE_S) {
    legende = cle(atteint).legende;
    ageLegende = t - atteint.arrivee_s;
  } else {
    const reste = suivant.pas - rebond;
    legende = [
      remplir(L.suite, { cible: cle(suivant).cible }),
      reste === 1 ? L.restant1 : remplir(L.restant, { n: reste }),
    ];
    ageLegende = t - (atteint ? atteint.arrivee_s + LEGENDE_S : REGLE_S);
  }

  return {
    nombre: courant.nombre,
    etiquette: `${courant.unite} · ${L.pli} ${rebond}`,
    legende,
    ageLegende,
    pop: atteint ? pop(t - atteint.arrivee_s) : 0,
    palette,
  };
};

export const ball: Sujet = {
  nom: "ball",
  dureeS: calcul.duree_s,
  etat,
  Scene: SceneBall,
};
