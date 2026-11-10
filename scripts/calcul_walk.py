"""Calcule les paliers du sujet walk : une marche qui gagne 40 % de vitesse chaque seconde.

Usage : python scripts/calcul_walk.py
Entrée : sujets/walk.json (règle et références sourcées)
Sortie : sujets/walk.calcul.json (secondes, distance parcourue, retour, textes de description)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "walk.json").read_text(encoding="utf-8"))

marche = sujet["marche"]
depart = marche["depart_kmh"] / 3.6
gain = marche["gain"]
lumiere = sujet["lumiere_ms"]
MONTEE_S = 0.5  # la seconde n est atteinte à n - 0,5 s


def vitesse(seconde):
    return depart * gain ** seconde


def distance(seconde):
    """Intégrale de la vitesse depuis le départ, en mètres."""
    return depart * (gain ** seconde - 1) / math.log(gain)


def premiere_seconde(valeur_de, cible):
    seconde = 0
    while valeur_de(seconde) < cible:
        seconde += 1
    return seconde


paliers = []
for cle, reference in sujet["references"].items():
    seconde = premiere_seconde(vitesse, reference["ms"])
    paliers.append({"cle": cle, "pas": seconde, "arrivee_s": seconde - MONTEE_S, "source": reference["source"]})

n_lune = premiere_seconde(distance, sujet["lune_m"])
paliers.append({"cle": "lune", "pas": n_lune, "arrivee_s": n_lune - MONTEE_S, "source": sujet["lune_source"]})

n_max = premiere_seconde(vitesse, lumiere)
paliers.append({"cle": "lumiere", "pas": n_max, "arrivee_s": n_max - MONTEE_S, "source": "Vitesse de la lumière, 299 792 458 m/s, BIPM"})
paliers.sort(key=lambda palier: palier["pas"])

# La vitesse plafonne à la lumière : la distance s'arrête au moment où elle l'atteint
seconde_lumiere = math.log(lumiere / depart) / math.log(gain)
distance_finale = distance(seconde_lumiere)
retour_s = distance_finale / lumiere
assert 2.5 < retour_s < 3.5, retour_s

t_limite = n_max - MONTEE_S
t_clefs = t_limite + 2.6
t_retour = t_clefs + 2.6
t_fin = t_retour + retour_s
duree = t_fin + 0.8
assert 62 <= duree <= 75, duree


def seconde_de(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


d_km = round(distance_finale / 1000, -3)
d_mi = round(distance_finale / 1609.344, -3)
valeurs = {
    "depart_kmh": marche["depart_kmh"],
    "depart_mph": round(marche["depart_kmh"] / 1.609344),
    "n_son": seconde_de("son"),
    "n_lib": seconde_de("liberation"),
    "n_lune": n_lune,
    "n_max": n_max,
    "d_km": f"{d_km:,.0f}",
    "d_km_pt": f"{d_km:,.0f}".replace(",", "."),
    "d_mi": f"{d_mi:,.0f}",
}
sortie = {
    "depart_ms": depart,
    "gain": gain,
    "lumiere_ms": lumiere,
    "n_max": n_max,
    "distance_finale_m": distance_finale,
    "retour_s": retour_s,
    "paliers": paliers,
    "t_limite": t_limite,
    "t_clefs": t_clefs,
    "t_retour": t_retour,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": {langue: sujet[langue]["description"].format(**valeurs) for langue in ("en", "es", "pt")},
    "son": {
        "duree_s": duree,
        "tics": [seconde - 1 for seconde in range(1, n_max + 1)],
        "paliers": [palier["arrivee_s"] for palier in paliers],
        "retournements": [t_clefs, t_retour],
        "fin": t_fin,
        "base_hz": 73,
        "tic_hz": 330,
    },
}
(RACINE / "sujets" / "walk.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for palier in paliers:
    print(f"seconde {palier['pas']:>2} à {palier['arrivee_s']:>5.1f} s : {palier['cle']:<10} {vitesse(palier['pas']):.5g} m/s, {distance(palier['pas']) / 1000:.5g} km parcourus")
print(f"{distance_finale / 1000:.0f} km de la maison, retour {retour_s:.2f} s, durée {duree:.1f} s")
