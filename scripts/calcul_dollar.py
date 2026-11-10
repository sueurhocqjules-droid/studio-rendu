"""Calcule les paliers du sujet dollar : 1 $ qui double chaque seconde, posé à plat en billets de 1 $.

Usage : python scripts/calcul_dollar.py
Entrée : sujets/dollar.json (billet et références sourcées)
Sortie : sujets/dollar.calcul.json (secondes, temps, retournement, textes de description)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "dollar.json").read_text(encoding="utf-8"))

billet = sujet["billet"]
aire_billet = billet["largeur_m"] * billet["hauteur_m"]
MONTEE_S = 0.5  # le doublement n est atteint à n - 0,5 s


def cible_usd(reference):
    if "usd" in reference:
        return reference["usd"]
    if "m2" in reference:
        return reference["m2"] / aire_billet  # autant de billets de 1 $ que de quoi couvrir la surface
    return reference["personnes"] * reference["fortune_usd"]


paliers = []
for cle, reference in sujet["references"].items():
    cible = cible_usd(reference)
    pas = math.ceil(math.log2(cible))
    assert 2 ** pas >= cible > 2 ** (pas - 1), cle
    paliers.append({
        "cle": cle, "pas": pas, "cible_usd": cible, "valeur_usd": 2 ** pas,
        "arrivee_s": pas - MONTEE_S, "source": reference["source"],
    })
paliers.sort(key=lambda palier: palier["pas"])

pas_max = paliers[-1]["pas"]
t_dernier = pas_max - MONTEE_S
t_prix = t_dernier + 2.5
t_egal = t_prix + 2.2
t_fin = t_egal + 1.8
duree = t_fin + 0.6
assert 62 <= duree <= 75, duree


def pas_de(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {"pli_car": pas_de("car"), "pli_richesse": pas_de("richesse"), "pli_max": pas_max}
sortie = {
    "billet_largeur_m": billet["largeur_m"],
    "billet_hauteur_m": billet["hauteur_m"],
    "terre_rayon_m": sujet["terre_rayon_m"],
    "pas_max": pas_max,
    "fortune_finale_usd": 2 ** pas_max,
    "paliers": paliers,
    "t_prix": t_prix,
    "t_egal": t_egal,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": {langue: sujet[langue]["description"].format(**valeurs) for langue in ("en", "es", "pt")},
    "son": {
        "duree_s": duree,
        "tics": [pas - 1 for pas in range(1, pas_max + 1)],
        "paliers": [palier["arrivee_s"] for palier in paliers],
        "retournements": [t_prix, t_egal],
        "fin": t_fin,
        "base_hz": 73.4,
        "tic_hz": 1300,
    },
}
(RACINE / "sujets" / "dollar.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for palier in paliers:
    print(f"seconde {palier['pas']:>2} à {palier['arrivee_s']:>5.1f} s : {palier['cle']:<9} {palier['valeur_usd']:.4g} $ pour {palier['cible_usd']:.4g} $")
print(f"fortune finale {2 ** pas_max:.3g} $, durée {duree:.1f} s")
