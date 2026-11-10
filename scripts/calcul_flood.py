"""Calcule les paliers du sujet flood : la mer monte de 40 % de plus chaque seconde.

La hauteur part de 1 cm et est multipliée par 1,4 à chaque seconde.
Deux paliers sont calculés : la couche d'eau ajoutée dépasse toute l'eau de la Terre,
puis elle pèse plus lourd que la Terre (couche sphérique d'eau non compressée).

Usage : python scripts/calcul_flood.py
Entrée : sujets/flood.json (références sourcées)
Sortie : sujets/flood.calcul.json (secondes, retournement, textes de description)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "flood.json").read_text(encoding="utf-8"))

MONTEE_S = 0.5  # la seconde n est atteinte à n - 0,5 s

depart = sujet["depart_m"]
facteur = 1 + sujet["taux_par_seconde"]
rayon = sujet["terre"]["rayon_km"] * 1000
volume_eau = sujet["eau"]["volume_km3"] * 1e9
densite = sujet["eau"]["densite_kg_m3"]
masse_terre = sujet["terre"]["masse_kg"]


def seconde_de(metres):
    return math.ceil(math.log(metres / depart) / math.log(facteur))


def hauteur_de_coquille(volume):
    return (rayon**3 + 3 * volume / (4 * math.pi)) ** (1 / 3) - rayon


hauteur_eau = hauteur_de_coquille(volume_eau)
hauteur_lourd = hauteur_de_coquille(masse_terre / densite)

paliers = [
    {"cle": cle, "hauteur_m": ref["m"], "pas": seconde_de(ref["m"]), "source": ref["source"]}
    for cle, ref in sujet["references"].items()
]
paliers.append({"cle": "eau", "hauteur_m": hauteur_eau, "pas": seconde_de(hauteur_eau), "source": sujet["eau"]["source"]})
paliers.append({"cle": "lourd", "hauteur_m": hauteur_lourd, "pas": seconde_de(hauteur_lourd), "source": sujet["terre"]["source"]})
for palier in paliers:
    palier["arrivee_s"] = palier["pas"] - MONTEE_S
paliers.sort(key=lambda palier: palier["pas"])
assert paliers[-1]["cle"] == "lourd", paliers[-1]
assert len({palier["pas"] for palier in paliers}) == len(paliers), "deux paliers sur la même seconde"

n_max = paliers[-1]["pas"]
t_limite = n_max - MONTEE_S
t_coupe = t_limite + 2.9
t_bouchon = t_coupe + 2.9
t_retour = t_bouchon + 0.5
t_fin = t_bouchon + 3.6
duree = t_fin + 0.5
assert 62 <= duree <= 75, duree

rayon_globe = rayon + depart * facteur**n_max


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {"n_eau": seconde("eau"), "n_everest": seconde("everest"), "n_iss": seconde("iss"), "n_max": n_max}
sortie = {
    "depart_m": depart,
    "facteur": facteur,
    "rayon_terre_m": rayon,
    "rayon_globe_m": rayon_globe,
    "n_max": n_max,
    "paliers": paliers,
    "t_limite": t_limite,
    "t_coupe": t_coupe,
    "t_bouchon": t_bouchon,
    "t_retour": t_retour,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": {langue: sujet[langue]["description"].format(**valeurs) for langue in ("en", "es", "pt")},
    "son": {
        "duree_s": duree,
        "tics": [s - 1 for s in range(1, n_max + 1)],
        "paliers": [palier["arrivee_s"] for palier in paliers],
        "retournements": [t_limite, t_bouchon],
        "fin": t_fin,
        "base_hz": 52,
        "tic_hz": 620,
        # Un remous qui enfle avec la mer, se tait quand on voit la Terre, puis la bonde qui aspire
        "bourdon": [
            [0, 48, 0.02],
            [25, 54, 0.1],
            [50, 72, 0.24],
            [t_limite, 110, 0.4],
            [t_limite + 0.01, 110, 0],
            [t_bouchon, 240, 0],
            [t_bouchon + 0.2, 240, 0.22],
            [t_fin, 60, 0.04],
            [duree, 60, 0],
        ],
    },
}
(RACINE / "sujets" / "flood.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for palier in paliers:
    n = palier["pas"]
    print(f"seconde {n:>2} à {palier['arrivee_s']:>5.1f} s : {palier['cle']:<9} repère {palier['hauteur_m']:>12.1f} m, mer {depart * facteur ** n:>12.2f} m")
print(f"durée {duree:.1f} s, rayon du globe {rayon_globe / 1000:.0f} km")
