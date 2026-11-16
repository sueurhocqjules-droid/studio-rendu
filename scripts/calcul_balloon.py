"""Calcule les paliers du sujet balloon : un ballon gonflé d'un souffle triple son volume d'air chaque seconde.

Le volume vaut V0 x 3^n, le diamètre (6V/π)^(1/3). Chaque palier tombe à la première seconde où le volume
dépasse la référence. Le dernier palier est tout l'air de la Terre, ramené à la densité du niveau de la mer.

Usage : python scripts/calcul_balloon.py
Entrée : sujets/balloon.json (références sourcées)
Sortie : sujets/balloon.calcul.json
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "balloon.json").read_text(encoding="utf-8"))
regle = sujet["regle_physique"]

MONTEE_S = 0.5
V0 = regle["volume_0_m3"]
F = regle["facteur"]
V_AIR = regle["masse_atmosphere_kg"] / regle["densite_air_kg_m3"]


def diametre(v):
    return (6 * v / math.pi) ** (1 / 3)


paliers = []
for cle, ref in sujet["references"].items():
    v = V_AIR if cle == "atmosphere" else ref["m3"]
    pas = math.ceil(math.log(v / V0) / math.log(F))
    paliers.append({"cle": cle, "m3": v, "pas": pas, "arrivee_s": pas - MONTEE_S, "diametre_m": diametre(V0 * F**pas), "source": ref["source"]})
paliers.sort(key=lambda p: p["pas"])
assert paliers[-1]["cle"] == "atmosphere"
ecarts = [b["pas"] - a["pas"] for a, b in zip(paliers, paliers[1:])]
assert min(ecarts) >= 2, [(p["cle"], p["pas"]) for p in paliers]

n_max = paliers[-1]["pas"]
d_fin = diametre(V_AIR)
d_mi = round(d_fin / 1609.344 / 10) * 10
d_km = round(d_fin / 1000 / 10) * 10

t_limite = n_max - MONTEE_S
t_coupe = t_limite + 3.4
t_qui = t_coupe + 4.4
t_patte = t_qui + 3.0
t_retour = t_patte + 0.4
t_fin = t_retour + 5.0
duree = t_fin + 0.6
assert 62 <= duree <= 75, duree


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {cle: seconde(cle) for cle in ("poumons", "piscine", "pyramide", "canyon", "atmosphere")}
valeurs = {f"n_{cle}": n for cle, n in valeurs.items()}
valeurs["d_mi"] = f"{d_mi:,}"
valeurs["d_km"] = f"{d_km:,}".replace(",", ".")
sortie = {
    "n_max": n_max,
    "v0_m3": V0,
    "facteur": F,
    "d0_m": diametre(V0),
    "v_air_m3": V_AIR,
    "d_fin_m": d_fin,
    "d_mi": d_mi,
    "d_km": d_km,
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
        "paliers": [p["arrivee_s"] for p in paliers],
        "retournements": [t_coupe, t_qui, t_qui + 0.15],
        "fin": t_fin,
        "base_hz": 147,
        "tic_hz": 1600,
        # Le caoutchouc qui se tend : une note qui monte, coupée net à l'éclatement
        "bourdon": [
            [0, 180, 0.0],
            [4, 190, 0.04],
            [25, 300, 0.08],
            [t_limite, 520, 0.12],
            [t_qui - 0.02, 700, 0.16],
            [t_qui, 700, 0.0],
            [t_retour, 180, 0.0],
            [t_fin, 180, 0.03],
            [duree, 180, 0.0],
        ],
    },
}
(RACINE / "sujets" / "balloon.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for p in paliers:
    print(f"seconde {p['pas']:>2} à {p['arrivee_s']:>5.1f} s : {p['cle']:<12} {p['m3']:>10.4g} m3, ballon de {p['diametre_m']:>10.4g} m")
print(f"tout l'air : {V_AIR:.4g} m3, diamètre {d_fin / 1000:.0f} km ({d_mi} mi) ; départ {diametre(V0) * 100:.1f} cm ; durée {duree:.1f} s")
