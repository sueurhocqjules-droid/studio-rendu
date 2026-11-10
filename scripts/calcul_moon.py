"""Calcule les paliers du sujet moon : la Lune se rapproche de 5 % chaque seconde.

La distance est multipliée par 0,95 à chaque seconde. La marée suit l'inverse du cube
de la distance, le mois la puissance 3/2 de la distance (troisième loi de Kepler).
La Lune se brise à la limite de Roche, avant de toucher la Terre.

Usage : python scripts/calcul_moon.py
Entrée : sujets/moon.json (Lune, Terre et références sourcées)
Sortie : sujets/moon.calcul.json (secondes, retournement, textes de description)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "moon.json").read_text(encoding="utf-8"))

MONTEE_S = 0.5  # la seconde n est atteinte à n - 0,5 s

lune = sujet["lune"]
terre = sujet["terre"]
depart = lune["distance_km"]
facteur = 1 - sujet["taux_par_seconde"]
maree_depart = sujet["maree_m"]


def seconde_de_distance(km):
    return math.ceil(math.log(km / depart) / math.log(facteur))


def seconde_de_maree(metres):
    return math.ceil(math.log(maree_depart / metres) / (3 * math.log(facteur)))


roche_km = sujet["roche_coefficient"] * terre["rayon_km"] * (terre["densite_kg_m3"] / lune["densite_kg_m3"]) ** (1 / 3)
mois_km = depart * (sujet["mois_cible_jours"] / lune["mois_jours"]) ** (2 / 3)

paliers = [
    {"cle": "double", "pas": seconde_de_distance(depart / 2), "source": "Diamètre apparent inversement proportionnel à la distance"},
    {"cle": "mois", "pas": seconde_de_distance(mois_km), "source": "Troisième loi de Kepler, à partir de la révolution sidérale de 27,32 jours"},
    {"cle": "geo", "pas": seconde_de_distance(sujet["geostationnaire_km"]), "source": sujet["geostationnaire_source"]},
    {"cle": "roche", "pas": seconde_de_distance(roche_km), "source": sujet["roche_source"]},
]
for cle, reference in sujet["references_maree"].items():
    paliers.append({"cle": cle, "pas": seconde_de_maree(reference["m"]), "source": reference["source"]})
for palier in paliers:
    palier["arrivee_s"] = palier["pas"] - MONTEE_S
paliers.sort(key=lambda palier: palier["pas"])
assert paliers[-1]["cle"] == "roche", paliers[-1]

n_max = paliers[-1]["pas"]
n_naissance = math.log(sujet["naissance_km"] / depart) / math.log(facteur)
t_limite = n_max - MONTEE_S
t_anneaux = t_limite + 2.7
t_naissance = t_anneaux + 2.8
t_depart = t_naissance + 2.5
t_fin = t_depart + 2.7
duree = t_fin + 0.5
assert 62 <= duree <= 75, duree


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {"n_fundy": seconde("fundy"), "n_geo": seconde("geo"), "n_max": n_max}
sortie = {
    "depart_km": depart,
    "facteur": facteur,
    "maree_depart_m": maree_depart,
    "rayon_lune_km": lune["rayon_km"],
    "rayon_terre_km": terre["rayon_km"],
    "roche_km": roche_km,
    "n_max": n_max,
    "n_naissance": n_naissance,
    "paliers": paliers,
    "t_limite": t_limite,
    "t_anneaux": t_anneaux,
    "t_naissance": t_naissance,
    "t_depart": t_depart,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": {langue: sujet[langue]["description"].format(**valeurs) for langue in ("en", "es", "pt")},
    "son": {
        "duree_s": duree,
        "tics": [s - 1 for s in range(1, n_max + 1)],
        "paliers": [palier["arrivee_s"] for palier in paliers],
        "retournements": [t_limite, t_naissance],
        "fin": t_fin,
        "base_hz": 44,
        "tic_hz": 760,
        # Un grondement qui monte avec la marée, se tait à la rupture, puis une note claire pour la naissance
        "bourdon": [
            [0, 42, 0.02],
            [20, 46, 0.08],
            [45, 58, 0.22],
            [t_limite, 96, 0.42],
            [t_limite + 0.01, 96, 0],
            [t_naissance, 180, 0],
            [t_naissance + 0.4, 180, 0.16],
            [t_fin, 110, 0.05],
            [duree, 110, 0],
        ],
    },
}
(RACINE / "sujets" / "moon.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

print(f"limite de Roche : {roche_km:.0f} km")
for palier in paliers:
    n = palier["pas"]
    distance = depart * facteur ** n
    maree = maree_depart * facteur ** (-3 * n)
    print(f"seconde {n:>2} à {palier['arrivee_s']:>5.1f} s : {palier['cle']:<8} {distance:>9.0f} km, marée {maree:>8.2f} m")
print(f"naissance à n = {n_naissance:.2f}, durée {duree:.1f} s")
