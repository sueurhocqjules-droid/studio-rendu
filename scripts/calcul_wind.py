"""Calcule les paliers du sujet wind : le vent souffle 15 % plus fort chaque seconde.

La vitesse part de 10 km/h et est multipliée par 1,15 à chaque seconde.
Le dernier palier est la vitesse de libération de la Terre : l'air s'en va, il n'y a plus de vent.

Usage : python scripts/calcul_wind.py
Entrée : sujets/wind.json (références sourcées)
Sortie : sujets/wind.calcul.json (secondes, retournement, textes de description)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "wind.json").read_text(encoding="utf-8"))

MONTEE_S = 0.5  # la seconde n est atteinte à n - 0,5 s

depart = sujet["depart_kmh"]
facteur = 1 + sujet["taux_par_seconde"]


def seconde_de(kmh):
    return math.ceil(math.log(kmh / depart) / math.log(facteur))


paliers = [
    {"cle": cle, "kmh": ref["kmh"], "pas": seconde_de(ref["kmh"]), "source": ref["source"]}
    for cle, ref in sujet["references"].items()
]
for palier in paliers:
    palier["arrivee_s"] = palier["pas"] - MONTEE_S
paliers.sort(key=lambda palier: palier["pas"])
assert paliers[-1]["cle"] == "liberation", paliers[-1]
assert len({palier["pas"] for palier in paliers}) == len(paliers), "deux paliers sur la même seconde"

n_max = paliers[-1]["pas"]
t_limite = n_max - MONTEE_S
t_coupe = t_limite + 2.9
t_pince = t_coupe + 2.9
t_retour = t_pince + 1.4
t_fin = t_pince + 4.0
duree = t_fin + 0.5
assert 62 <= duree <= 75, duree


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {"n_son": seconde("son"), "n_neptune": seconde("neptune"), "n_liberation": seconde("liberation")}
sortie = {
    "depart_kmh": depart,
    "facteur": facteur,
    "n_max": n_max,
    "paliers": paliers,
    "t_limite": t_limite,
    "t_coupe": t_coupe,
    "t_pince": t_pince,
    "t_retour": t_retour,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": {langue: sujet[langue]["description"].format(**valeurs) for langue in ("en", "es", "pt")},
    "son": {
        "duree_s": duree,
        "tics": [s - 1 for s in range(1, n_max + 1)],
        "paliers": [palier["arrivee_s"] for palier in paliers],
        "retournements": [t_limite, t_coupe],
        "fin": t_fin,
        "base_hz": 150,
        "tic_hz": 880,
        # Un sifflement qui monte avec la vitesse, coupé net quand il n'y a plus d'air
        "bourdon": [
            [0, 110, 0.03],
            [25, 170, 0.12],
            [50, 300, 0.28],
            [t_limite, 420, 0.42],
            [t_coupe - 0.01, 420, 0.42],
            [t_coupe, 420, 0],
            [t_retour, 120, 0],
            [t_retour + 0.3, 200, 0.18],
            [t_fin, 110, 0.04],
            [duree, 110, 0],
        ],
    },
}
(RACINE / "sujets" / "wind.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for palier in paliers:
    n = palier["pas"]
    print(f"seconde {n:>2} à {palier['arrivee_s']:>5.1f} s : {palier['cle']:<11} repère {palier['kmh']:>9.1f} km/h, vent {depart * facteur ** n:>9.1f} km/h")
print(f"durée {duree:.1f} s")
