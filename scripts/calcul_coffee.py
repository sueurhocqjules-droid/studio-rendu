"""Calcule les paliers du sujet coffee : un café qui gagne 10 % de température chaque seconde.

Usage : python scripts/calcul_coffee.py
Entrée : sujets/coffee.json (règle et références sourcées)
Sortie : sujets/coffee.calcul.json (secondes, puissance rayonnée, textes de description)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "coffee.json").read_text(encoding="utf-8"))

cafe = sujet["cafe"]
depart = cafe["depart_c"]
gain = cafe["gain"]
MONTEE_S = 0.5  # la seconde n est atteinte à n - 0,5 s


def temperature(seconde):
    return depart * gain ** seconde


paliers = []
for cle, reference in sujet["references"].items():
    cible = reference["c"]
    seconde = math.ceil(math.log(cible / depart) / math.log(gain))
    assert temperature(seconde) >= cible > temperature(seconde - 1), cle
    paliers.append({
        "cle": cle, "pas": seconde, "cible_c": cible, "valeur_c": temperature(seconde),
        "arrivee_s": seconde - MONTEE_S, "source": reference["source"],
    })
paliers.sort(key=lambda palier: palier["pas"])

n_max = paliers[-1]["pas"]
t_max = temperature(n_max)

# Puissance rayonnée par le café, vu comme une sphère de 25 cl à cette température
rayon = (3 * cafe["volume_m3"] / (4 * math.pi)) ** (1 / 3)
surface = 4 * math.pi * rayon ** 2
rayonnement = sujet["rayonnement"]
puissance = rayonnement["sigma"] * (t_max + 273.15) ** 4 * surface
assert 0.7 < puissance / rayonnement["reacteur_w"] < 1.3, puissance
gw = round(puissance / 1e9, 2)

t_foudre = paliers[-1]["arrivee_s"]
t_reacteur = t_foudre + 2.4
t_souffle = t_reacteur + 2.6
souffle_s = 1.7
t_fin = t_souffle + 2.0
duree = t_fin + 0.6
assert 62 <= duree <= 75, duree


def seconde_de(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {
    "depart_c": depart,
    "depart_f": round(depart * 9 / 5 + 32),
    "n_plomb": seconde_de("plomb"),
    "n_soleil": seconde_de("soleil"),
    "n_foudre": seconde_de("foudre"),
    "gw": f"{gw:g}",
    "gw_pt": f"{gw:g}".replace(".", ","),
}
sortie = {
    "depart_c": depart,
    "gain": gain,
    "n_max": n_max,
    "t_max_c": t_max,
    "rayon_m": rayon,
    "puissance_w": puissance,
    "gw": gw,
    "paliers": paliers,
    "t_foudre": t_foudre,
    "t_reacteur": t_reacteur,
    "t_souffle": t_souffle,
    "souffle_s": souffle_s,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": {langue: sujet[langue]["description"].format(**valeurs) for langue in ("en", "es", "pt")},
    "son": {
        "duree_s": duree,
        "tics": [seconde - 1 for seconde in range(1, n_max + 1)],
        "paliers": [palier["arrivee_s"] for palier in paliers],
        "retournements": [t_reacteur, t_souffle],
        "fin": t_fin,
        "base_hz": 65,
        "tic_hz": 1400,
    },
}
(RACINE / "sujets" / "coffee.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for palier in paliers:
    print(f"seconde {palier['pas']:>2} à {palier['arrivee_s']:>5.1f} s : {palier['cle']:<10} {palier['valeur_c']:.5g} °C pour {palier['cible_c']:.5g} °C")
print(f"{puissance / 1e9:.2f} GW rayonnés, durée {duree:.1f} s")
