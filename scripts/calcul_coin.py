"""Calcule les paliers du sujet coin : une pièce lancée chaque seconde tombe toujours sur face.

La chance d'une telle série vaut 1 sur 2^n à la seconde n. Chaque palier tombe à la première
seconde où cette chance devient plus faible que celle de l'événement de référence.

Usage : python scripts/calcul_coin.py
Entrée : sujets/coin.json (références sourcées)
Sortie : sujets/coin.calcul.json (secondes, retournement, textes de description)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "coin.json").read_text(encoding="utf-8"))

MONTEE_S = 0.5  # la seconde n est atteinte à n - 0,5 s


def chances_de(ref):
    if "chances" in ref:
        return ref["chances"]
    if "alphabet" in ref:
        return ref["alphabet"] ** ref["longueur"]
    return ref["age_annees"] * ref["secondes_par_an"]


paliers = []
for cle, ref in sujet["references"].items():
    chances = chances_de(ref)
    pas = math.ceil(math.log2(chances))
    paliers.append({"cle": cle, "chances": chances, "pas": pas, "arrivee_s": pas - MONTEE_S, "source": ref["source"]})
paliers.sort(key=lambda palier: palier["pas"])
assert paliers[-1]["cle"] == "bigbang", paliers[-1]
assert len({palier["pas"] for palier in paliers}) == len(paliers), "deux paliers sur la même seconde"

n_max = paliers[-1]["pas"]
t_limite = n_max - MONTEE_S
t_coupe = t_limite + 2.9
t_qui = t_coupe + 2.2
t_patte = t_qui + 1.8
t_retour = t_patte + 1.6
t_fin = t_patte + 4.4
duree = t_fin + 0.5
assert 62 <= duree <= 75, duree


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {"n_loto": seconde("loto"), "n_humain": seconde("humain"), "n_bigbang": seconde("bigbang")}
sortie = {
    "n_max": n_max,
    "paliers": paliers,
    "t_limite": t_limite,
    "t_coupe": t_coupe,
    "t_qui": t_qui,
    "t_patte": t_patte,
    "t_retour": t_retour,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": {langue: sujet[langue]["description"].format(**valeurs) for langue in ("en", "es", "pt")},
    "son": {
        "duree_s": duree,
        "tics": [s - 1 for s in range(1, n_max + 1)],
        "paliers": [palier["arrivee_s"] for palier in paliers],
        "retournements": [t_limite, t_coupe, t_patte],
        "fin": t_fin,
        "base_hz": 150,
        "tic_hz": 1320,
        # La tension monte à chaque lancer, plus rien quand on retourne la pièce
        "bourdon": [
            [0, 80, 0.02],
            [29, 130, 0.1],
            [48, 280, 0.28],
            [t_limite, 440, 0.5],
            [t_coupe - 0.01, 440, 0.5],
            [t_coupe, 440, 0],
            [t_patte, 90, 0],
            [t_retour, 90, 0.05],
            [t_fin, 80, 0.02],
            [duree, 80, 0],
        ],
    },
}
(RACINE / "sujets" / "coin.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for palier in paliers:
    print(f"seconde {palier['pas']:>2} à {palier['arrivee_s']:>5.1f} s : {palier['cle']:<8} 1 sur {palier['chances']:>10.3g}, 2^n = {2 ** palier['pas']:>10.3g}")
print(f"durée {duree:.1f} s")
