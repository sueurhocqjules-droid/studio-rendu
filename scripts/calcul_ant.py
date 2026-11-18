"""Calcule les paliers du sujet ant : une fourmi devient deux fois plus forte chaque seconde.

La charge de départ est la vraie charge maximale d'une fourmi coupe-feuille (8,78 fois sa masse).
La charge vaut charge0 x 2^n à la seconde n. Chaque palier tombe à la première seconde
où la fourmi peut soulever la référence.

Usage : python scripts/calcul_ant.py
Entrée : sujets/ant.json (références sourcées)
Sortie : sujets/ant.calcul.json (secondes, retournement, textes de description)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "ant.json").read_text(encoding="utf-8"))

MONTEE_S = 0.5  # la seconde n est atteinte à n - 0,5 s
FACTEUR = 2
fourmi = sujet["fourmi"]
M0 = fourmi["masse_kg"] * fourmi["rapport_charge"]

paliers = []
for cle, ref in sujet["references"].items():
    pas = math.ceil(math.log(ref["kg"] / M0) / math.log(FACTEUR))
    paliers.append({
        "cle": cle,
        "kg": ref["kg"],
        "hauteur_m": ref["hauteur_m"],
        "pas": pas,
        "arrivee_s": pas - MONTEE_S,
        "source": ref["source"],
    })
paliers.sort(key=lambda palier: palier["pas"])
assert paliers[-1]["cle"] == "barrage", paliers[-1]
assert len({palier["pas"] for palier in paliers}) == len(paliers), "deux paliers sur la même seconde"
assert all(b["pas"] - a["pas"] >= 3 for a, b in zip(paliers, paliers[1:])), "paliers trop serrés"

n_max = paliers[-1]["pas"]
t_limite = n_max - MONTEE_S
t_vrai = t_limite + 3.6
t_nombre = t_vrai + 3.8
t_chacun = t_nombre + 3.8
t_retour = t_chacun + 3.4
t_fin = t_retour + 1.6
duree = t_fin + 0.6
assert 62 <= duree <= 75, duree

par_personne = sujet["fourmis_terre"]["nombre"] / sujet["humains"]["nombre"] / 1e6
rapport_arrondi = round(fourmi["rapport_charge"])


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


def decimal(valeur, langue):
    texte = f"{valeur:.2f}"
    return texte.replace(".", ",") if langue == "pt" else texte


descriptions = {}
for langue in ("en", "es", "pt"):
    valeurs = {
        "n_oeuf": seconde("oeuf"),
        "n_humain": seconde("humain"),
        "n_liberte": seconde("liberte"),
        "n_barrage": seconde("barrage"),
        "rapport_exact": decimal(fourmi["rapport_charge"], langue),
        "par_personne": f"{par_personne:.1f}".replace(".", "," if langue == "pt" else "."),
    }
    descriptions[langue] = sujet[langue]["description"].format(**valeurs)

sortie = {
    "n_max": n_max,
    "m0_kg": M0,
    "facteur": FACTEUR,
    "livre_kg": sujet["livre_kg"],
    "tonne_courte_kg": sujet["tonne_courte_kg"],
    "fourmi_longueur_m": fourmi["longueur_m"],
    "rapport": rapport_arrondi,
    "par_personne_millions": round(par_personne, 2),
    "paliers": paliers,
    "t_limite": t_limite,
    "t_vrai": t_vrai,
    "t_nombre": t_nombre,
    "t_chacun": t_chacun,
    "t_retour": t_retour,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": descriptions,
    "son": {
        "duree_s": duree,
        "tics": [s - 1 for s in range(1, n_max + 1)],
        "paliers": [palier["arrivee_s"] for palier in paliers],
        "retournements": [t_vrai, t_nombre, t_chacun],
        "fin": t_fin,
        "base_hz": 82,
        "tic_hz": 1320,
        # Un grondement qui s'alourdit avec la charge, puis un fourmillement aigu quand elles sont des milliards
        "bourdon": [
            [0, 330, 0.03],
            [20, 160, 0.10],
            [40, 70, 0.22],
            [t_limite, 55, 0.32],
            [t_vrai - 0.01, 55, 0.32],
            [t_vrai, 330, 0.03],
            [t_nombre, 660, 0.08],
            [t_chacun, 880, 0.10],
            [t_retour, 330, 0.04],
            [duree, 330, 0],
        ],
    },
}
(RACINE / "sujets" / "ant.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for palier in paliers:
    print(f"seconde {palier['pas']:>2} à {palier['arrivee_s']:>5.1f} s : {palier['cle']:<12} {palier['kg']:>12.4g} kg, charge {M0 * FACTEUR ** palier['pas']:>12.4g} kg")
print(f"charge de départ {M0 * 1e6:.1f} mg, {par_personne:.2f} millions de fourmis par personne, durée {duree:.1f} s")
