"""Calcule les paliers du sujet gravity : la gravité gagne 40 % chaque seconde.

Le plan parlait de 10 % : en 70 s cela ne fait que 790 g, à peine plus que le Soleil.
À 40 %, la vitesse de libération de la Terre dépasse celle de la lumière vers la seconde 61.

Usage : python scripts/calcul_gravity.py
Entrée : sujets/gravity.json (pomme, Terre et références sourcées)
Sortie : sujets/gravity.calcul.json (secondes, trou noir, textes de description)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "gravity.json").read_text(encoding="utf-8"))

G_NEWTON = 6.674e-11
C_LUMIERE = 299792458
MONTEE_S = 0.5  # la seconde n est atteinte à n - 0,5 s

pomme = sujet["pomme_kg"]
hausse = sujet["hausse"]
terre = sujet["terre"]


def facteur(seconde):
    return hausse ** seconde


def premiere_seconde(cible):
    return math.ceil(math.log(cible) / math.log(hausse))


def facteur_cible(reference):
    if "g" in reference:
        return reference["g"]
    if "kg" in reference:
        return reference["kg"] / pomme
    return terre["hauteur_echelle_m"] / reference["hauteur_m"]


paliers = []
for cle, reference in sujet["references"].items():
    seconde = premiere_seconde(facteur_cible(reference))
    paliers.append({"cle": cle, "pas": seconde, "arrivee_s": seconde - MONTEE_S, "source": reference["source"]})

# Rayon de Schwarzschild de la Terre, 8,9 mm : il atteint le rayon de la Terre quand G est multiplié par R / rs
rayon_schwarzschild = 2 * G_NEWTON * terre["masse_kg"] / C_LUMIERE ** 2
facteur_trou = terre["rayon_m"] / rayon_schwarzschild
n_max = premiere_seconde(facteur_trou)
paliers.append({"cle": "trou", "pas": n_max, "arrivee_s": n_max - MONTEE_S, "source": "Rayon de Schwarzschild 2GM/c2, 8,87 mm pour la Terre"})
paliers.sort(key=lambda palier: palier["pas"])

t_limite = n_max - MONTEE_S
t_allumee = t_limite + 2.8
t_tare = t_allumee + 1.8
t_fin = t_tare + 1.0
duree = t_fin + 0.6
assert 62 <= duree <= 75, duree


def seconde_de(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {"n_personne": seconde_de("personne"), "n_ciel": seconde_de("ciel"), "n_max": n_max}
sortie = {
    "pomme_g": pomme * 1000,
    "hausse": hausse,
    "balance_max_g": sujet["balance_max_kg"] * 1000,
    "hauteur_echelle_m": terre["hauteur_echelle_m"],
    "facteur_trou": facteur_trou,
    "rayon_schwarzschild_m": rayon_schwarzschild,
    "n_max": n_max,
    "paliers": paliers,
    "t_limite": t_limite,
    "t_allumee": t_allumee,
    "t_tare": t_tare,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": {langue: sujet[langue]["description"].format(**valeurs) for langue in ("en", "es", "pt")},
    "son": {
        "duree_s": duree,
        "tics": [seconde - 1 for seconde in range(1, n_max + 1)],
        "paliers": [palier["arrivee_s"] for palier in paliers],
        "retournements": [t_limite, t_tare],
        "fin": t_fin,
        "base_hz": 48,
        "tic_hz": 480,
    },
}
(RACINE / "sujets" / "gravity.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for palier in paliers:
    n = palier["pas"]
    print(f"seconde {n:>2} à {palier['arrivee_s']:>5.1f} s : {palier['cle']:<10} x{facteur(n):.4g}, pomme {pomme * facteur(n):.4g} kg")
print(f"rs {rayon_schwarzschild * 1000:.2f} mm, facteur {facteur_trou:.3g}, durée {duree:.1f} s")
