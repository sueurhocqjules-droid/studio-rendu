"""Calcule les paliers du sujet ice : un glaçon perd 4 °C chaque seconde.

Le plan parlait de 1 °C : il faudrait 273 s pour le zéro absolu. À 4 °C, on y arrive en 69 s.

Usage : python scripts/calcul_ice.py
Entrée : sujets/ice.json (glaçon et références sourcées)
Sortie : sujets/ice.calcul.json (secondes, retournement, textes de description)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "ice.json").read_text(encoding="utf-8"))

MONTEE_S = 0.5  # la seconde n est atteinte à n - 0,5 s

depart = sujet["glacon"]["depart_c"]
perte = sujet["glacon"]["perte_c"]
zero = sujet["zero_absolu_c"]


def premiere_seconde(cible):
    return math.ceil((depart - cible) / perte)


paliers = []
for cle, reference in sujet["references"].items():
    seconde = premiere_seconde(reference["c"])
    paliers.append({"cle": cle, "pas": seconde, "arrivee_s": seconde - MONTEE_S, "source": reference["source"]})

n_max = premiere_seconde(zero)
paliers.append({"cle": "zero", "pas": n_max, "arrivee_s": n_max - MONTEE_S, "source": "Zéro absolu, -273,15 degrés, définition du kelvin"})
paliers.sort(key=lambda palier: palier["pas"])

t_limite = n_max - MONTEE_S
t_tremble = t_limite + 2.4
t_fonte = t_tremble + 1.5
t_fin = t_fonte + 0.8
duree = t_fin + 0.6
assert 62 <= duree <= 75, duree


def seconde_de(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {"n_mercure": seconde_de("mercure"), "n_vostok": seconde_de("vostok"), "n_oxygene": seconde_de("oxygene"), "n_max": n_max}
sortie = {
    "depart_c": depart,
    "perte_c": perte,
    "zero_c": zero,
    "n_max": n_max,
    "paliers": paliers,
    "t_limite": t_limite,
    "t_tremble": t_tremble,
    "t_fonte": t_fonte,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": {langue: sujet[langue]["description"].format(**valeurs) for langue in ("en", "es", "pt")},
    "son": {
        "duree_s": duree,
        "tics": [seconde - 1 for seconde in range(1, n_max + 1)],
        "paliers": [palier["arrivee_s"] for palier in paliers],
        "retournements": [t_limite, t_fonte],
        "fin": t_fin,
        "base_hz": 92,
        "tic_hz": 1250,
    },
}
(RACINE / "sujets" / "ice.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for palier in paliers:
    n = palier["pas"]
    print(f"seconde {n:>2} à {palier['arrivee_s']:>5.1f} s : {palier['cle']:<12} {depart - perte * n} °C")
print(f"durée {duree:.1f} s")
