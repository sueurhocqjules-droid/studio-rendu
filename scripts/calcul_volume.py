"""Calcule les paliers du sujet volume : une enceinte double sa puissance chaque seconde.

Doubler la puissance ajoute 10 x log10(2) = 3,01 dB. Le son part de 20 dB.
Le dernier palier est la limite d'un son non distordu dans l'air : l'amplitude égale la pression atmosphérique.

Usage : python scripts/calcul_volume.py
Entrée : sujets/volume.json (références sourcées)
Sortie : sujets/volume.calcul.json (secondes, retournement, textes de description)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "volume.json").read_text(encoding="utf-8"))

MONTEE_S = 0.5  # la seconde n est atteinte à n - 0,5 s
P_REFERENCE = 20e-6  # Pa, référence des dB dans l'air

depart = sujet["depart_db"]
db_par_s = 10 * math.log10(2)


def niveau(ref):
    return ref["db"] if "db" in ref else 20 * math.log10(ref["pa"] / P_REFERENCE)


def seconde_de(db):
    return math.ceil((db - depart) / db_par_s)


paliers = [
    {"cle": cle, "db": niveau(ref), "pas": seconde_de(niveau(ref)), "source": ref["source"]}
    for cle, ref in sujet["references"].items()
]
for palier in paliers:
    palier["arrivee_s"] = palier["pas"] - MONTEE_S
paliers.sort(key=lambda palier: palier["pas"])
assert paliers[-1]["cle"] == "limite", paliers[-1]
assert len({palier["pas"] for palier in paliers}) == len(paliers), "deux paliers sur la même seconde"

n_max = paliers[-1]["pas"]
t_limite = n_max - MONTEE_S
t_coupe = t_limite + 2.9
t_mot = t_coupe + 2.9
t_retour = t_mot + 2.0
t_fin = t_mot + 4.6
duree = t_fin + 0.5
assert 62 <= duree <= 75, duree


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {"n_immediat": seconde("immediat"), "n_krakatoa": seconde("krakatoa"), "n_limite": seconde("limite")}
sortie = {
    "depart_db": depart,
    "db_par_s": db_par_s,
    "n_max": n_max,
    "paliers": paliers,
    "t_limite": t_limite,
    "t_coupe": t_coupe,
    "t_mot": t_mot,
    "t_retour": t_retour,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": {langue: sujet[langue]["description"].format(**valeurs) for langue in ("en", "es", "pt")},
    "son": {
        "duree_s": duree,
        "tics": [s - 1 for s in range(1, n_max + 1)],
        "paliers": [palier["arrivee_s"] for palier in paliers],
        "retournements": [t_limite, t_coupe, t_mot],
        "fin": t_fin,
        "base_hz": 130,
        "tic_hz": 760,
        # Le grondement enfle jusqu'à la limite, puis le silence total quand il ne reste que le balai
        "bourdon": [
            [0, 90, 0.01],
            [14, 120, 0.05],
            [34, 200, 0.2],
            [t_limite, 360, 0.5],
            [t_coupe - 0.01, 360, 0.5],
            [t_coupe, 360, 0],
            [t_retour, 90, 0],
            [t_retour + 0.3, 240, 0.2],
            [t_fin, 90, 0.02],
            [duree, 90, 0],
        ],
    },
}
(RACINE / "sujets" / "volume.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for palier in paliers:
    n = palier["pas"]
    print(f"seconde {n:>2} à {palier['arrivee_s']:>5.1f} s : {palier['cle']:<13} repère {palier['db']:>6.1f} dB, son {depart + db_par_s * n:>6.1f} dB")
print(f"durée {duree:.1f} s")
