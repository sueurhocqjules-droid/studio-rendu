import texte from "../../../sujets/dollar.json";
import { grouper, nombreLocal } from "../../cadre/format";
import type { Langue } from "../../cadre/types";

type UniteArgent = { max: number; diviseur: number; nom: string; nom1?: string };

export const montant = (valeur: number, langue: Langue) => {
  const L = texte[langue];
  const unites = L.unites as UniteArgent[];
  const unite = unites.find((u) => valeur < u.max) ?? unites[unites.length - 1];
  const part = valeur / unite.diviseur;
  const entier = unite.diviseur === 1 || Number.isInteger(part);
  return {
    nombre: `$${entier ? grouper(String(Math.round(part)), L.separateurs.milliers) : nombreLocal(part, L.separateurs)}`,
    unite: part < 2 && unite.nom1 ? unite.nom1 : unite.nom,
    seul: unite.diviseur === 1,
  };
};

// Prix affiché sur l'étiquette d'un palier, dans le format de la langue
export const prixDe = (valeur: number, langue: Langue) => {
  const prix = montant(valeur, langue);
  return prix.seul ? prix.nombre : `${prix.nombre} ${prix.unite}`;
};
