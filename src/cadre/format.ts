export type Unite = { max: number; metres: number; nom: string };
export type Separateurs = { milliers: string; decimale: string };

export const grouper = (entier: string, separateur: string) =>
  entier.replace(/\B(?=(\d{3})+(?!\d))/g, separateur);

// Trois chiffres utiles, séparateurs de la langue
export const nombreLocal = (valeur: number, separateurs: Separateurs) => {
  const decimales = valeur < 0.1 ? 3 : valeur < 10 ? 2 : valeur < 100 ? 1 : 0;
  const [entier, reste] = valeur.toFixed(decimales).split(".");
  const groupe = grouper(entier, separateurs.milliers);
  return reste ? `${groupe}${separateurs.decimale}${reste}` : groupe;
};

export const longueurLocale = (metres: number, unites: Unite[], separateurs: Separateurs) => {
  const unite = unites.find((u) => metres < u.max) ?? unites[unites.length - 1];
  return { nombre: nombreLocal(metres / unite.metres, separateurs), unite: unite.nom };
};

export const remplir = (modele: string, valeurs: Record<string, string | number>) =>
  modele.replace(/\{(\w+)\}/g, (_, cle: string) => String(valeurs[cle]));
