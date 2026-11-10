"""Calcule les paliers du sujet mosquito : un moustique double de taille chaque seconde.

Sa longueur double, donc son repas de sang est multiplié par 8 (le volume).
Le bout de ses ailes va à 2 x amplitude x battements x longueur d'aile.

Usage : python scripts/calcul_mosquito.py
Entrée : sujets/mosquito.json (moustique et références sourcées)
Sortie : sujets/mosquito.calcul.json (secondes, retournement, textes de description)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "mosquito.json").read_text(encoding="utf-8"))

MONTEE_S = 0.5  # la seconde n est atteinte à n - 0,5 s

moustique = sujet["moustique"]
depart = moustique["longueur_m"]


def premiere_seconde(metres):
    return math.ceil(math.log2(metres / depart))


n_sang = math.ceil(math.log(sujet["sang_corps_l"] / moustique["repas_l"], 8))
vitesse_par_metre = 2 * moustique["amplitude_rad"] * moustique["battements_hz"] * moustique["aile_part"]
n_lumiere = premiere_seconde(sujet["lumiere_m_s"] / vitesse_par_metre)

paliers = [
    {"cle": "sang", "pas": n_sang, "arrivee_s": n_sang - MONTEE_S, "source": "Sang du corps humain, environ 5 litres, NIH"},
    {"cle": "lumiere", "pas": n_lumiere, "arrivee_s": n_lumiere - MONTEE_S, "source": "Vitesse de la lumière, 299 792 458 m/s, définition du mètre"},
]
for cle, reference in sujet["references"].items():
    seconde = premiere_seconde(reference["m"])
    paliers.append({"cle": cle, "pas": seconde, "arrivee_s": seconde - MONTEE_S, "source": reference["source"]})
paliers.sort(key=lambda palier: palier["pas"])

n_max = paliers[-1]["pas"]
t_limite = n_max - MONTEE_S
t_faim = t_limite + 2.6
t_retour = t_faim + 1.4
t_bras = t_retour + 2.6
t_claque = t_bras + 0.4
t_autre = t_claque + 1.4
t_fin = t_autre + 1.7
duree = t_fin + 0.5
assert 62 <= duree <= 75, duree


def seconde_de(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {"n_sang": n_sang, "n_plafond": seconde_de("plafond"), "n_terre": seconde_de("terre"), "n_max": n_max}
sortie = {
    "depart_m": depart,
    "n_max": n_max,
    "paliers": paliers,
    "t_limite": t_limite,
    "t_faim": t_faim,
    "t_retour": t_retour,
    "t_bras": t_bras,
    "t_claque": t_claque,
    "t_autre": t_autre,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": {langue: sujet[langue]["description"].format(**valeurs) for langue in ("en", "es", "pt")},
    "son": {
        "duree_s": duree,
        "tics": [seconde - 1 for seconde in range(1, n_max + 1)],
        "paliers": [palier["arrivee_s"] for palier in paliers],
        "retournements": [t_retour, t_claque],
        "fin": t_fin,
        "base_hz": 70,
        "tic_hz": 1000,
        # Le sifflement descend avec la taille, remonte au retour, s'éteint à la claque, revient avec l'autre
        "bourdon": [
            [0, 640, 0.26],
            [6, 500, 0.14],
            [t_limite, 58, 0.3],
            [t_retour, 58, 0.3],
            [t_bras, 640, 0.3],
            [t_claque, 640, 0.3],
            [t_claque + 0.01, 640, 0],
            [t_autre, 640, 0],
            [t_autre + 0.3, 640, 0.24],
            [duree, 640, 0.26],
        ],
    },
}
(RACINE / "sujets" / "mosquito.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for palier in paliers:
    n = palier["pas"]
    print(f"seconde {n:>2} à {palier['arrivee_s']:>5.1f} s : {palier['cle']:<10} {depart * 2 ** n:.4g} m")
print(f"durée {duree:.1f} s")
