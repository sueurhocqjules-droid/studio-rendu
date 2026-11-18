"""Calcule les paliers du sujet popcorn : le pop-corn du cinéma grossit de 50 % chaque seconde.

On part d'un grand pop-corn de cinéma mesuré en laboratoire (1 200 kcal). Les calories valent
seau x 1,5^n à la seconde n. Chaque palier tombe à la première seconde où le pop-corn suffit
à nourrir la référence (une journée de nourriture = 2 000 kcal par personne, référence FDA).

Usage : python scripts/calcul_popcorn.py
Entrée : sujets/popcorn.json (références sourcées)
Sortie : sujets/popcorn.calcul.json (secondes, retournement, textes de description)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "popcorn.json").read_text(encoding="utf-8"))

MONTEE_S = 0.5  # la seconde n est atteinte à n - 0,5 s
FACTEUR = sujet["facteur"]
K0 = sujet["seau"]["kcal"]
JOUR = sujet["jour_kcal"]["valeur"]
refs = sujet["references"]

# Calories de chaque référence, toutes calculées ici
besoins = {
    "elephant": refs["elephant"]["kj"] / 1000 / sujet["kj_par_kcal"],
    "baleine": refs["baleine"]["kcal"],
    "titanic": refs["titanic"]["personnes"] * JOUR,
    "vie": refs["vie"]["annees"] * 365.25 * JOUR,
    "stade": refs["stade"]["personnes"] * JOUR,
    "paris": refs["paris"]["personnes"] * JOUR,
    "hotdogs": refs["hotdogs"]["nombre"] * refs["hotdogs"]["kcal_piece"],
    "usa": refs["usa"]["personnes"] * JOUR,
    "monde": refs["monde"]["personnes"] * JOUR,
}

paliers = []
for cle, kcal in besoins.items():
    pas = math.ceil(math.log(kcal / K0) / math.log(FACTEUR))
    paliers.append({
        "cle": cle,
        "kcal": kcal,
        "pas": pas,
        "arrivee_s": pas - MONTEE_S,
        "source": refs[cle]["source"],
    })
paliers.sort(key=lambda palier: palier["pas"])
assert [p["cle"] for p in paliers] == list(besoins), [p["cle"] for p in paliers]
assert all(b["pas"] - a["pas"] >= 3 for a, b in zip(paliers, paliers[1:])), "paliers trop serrés"

n_max = paliers[-1]["pas"]
t_limite = n_max - MONTEE_S
t_vrai = t_limite + 3.6
t_jour = t_vrai + 3.8
t_film = t_jour + 3.8
t_retour = t_film + 2.6
t_fin = t_retour + 1.6
duree = t_fin + 0.6
assert 62 <= duree <= 75, duree

pct = round(100 * K0 / JOUR)


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


def entier(valeur, langue):
    texte = f"{valeur:,}"
    return texte.replace(",", ".") if langue in ("es", "pt") else texte


descriptions = {}
for langue in ("en", "es", "pt"):
    valeurs = {cle: seconde(cle) for cle in besoins}
    valeurs = {f"n_{cle}": n for cle, n in valeurs.items()}
    humains = refs["monde"]["personnes"]
    milliards = f"{humains / 1e9:.1f}"
    valeurs.update({
        "seau": entier(K0, langue),
        "pct": pct,
        "humains_md": milliards.replace(".", ",") if langue == "pt" else milliards,
        "humains_mm": entier(round(humains / 1e8) * 100, langue),
    })
    descriptions[langue] = sujet[langue]["description"].format(**valeurs)

sortie = {
    "n_max": n_max,
    "k0_kcal": K0,
    "facteur": FACTEUR,
    "pct_jour": pct,
    "paliers": paliers,
    "t_limite": t_limite,
    "t_vrai": t_vrai,
    "t_jour": t_jour,
    "t_film": t_film,
    "t_retour": t_retour,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": descriptions,
    "son": {
        "duree_s": duree,
        "tics": [s - 1 for s in range(1, n_max + 1)],
        "paliers": [palier["arrivee_s"] for palier in paliers],
        "retournements": [t_vrai, t_jour, t_film],
        "fin": t_fin,
        "base_hz": 98,
        "tic_hz": 1500,
        # Un ronron de projecteur qui monte avec le tas, puis la salle retrouve son calme
        "bourdon": [
            [0, 120, 0.04],
            [20, 160, 0.08],
            [40, 220, 0.14],
            [t_limite, 300, 0.22],
            [t_vrai - 0.01, 300, 0.22],
            [t_vrai, 120, 0.04],
            [t_jour, 90, 0.08],
            [t_film, 120, 0.05],
            [duree, 120, 0],
        ],
    },
}
(RACINE / "sujets" / "popcorn.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for palier in paliers:
    print(f"seconde {palier['pas']:>2} à {palier['arrivee_s']:>5.1f} s : {palier['cle']:<9} {palier['kcal']:>12.4g} kcal, pop-corn {K0 * FACTEUR ** palier['pas']:>12.4g} kcal")
print(f"seau {K0} kcal = {pct} % d'une journée, durée {duree:.1f} s")
