"""Calcule les paliers du sujet press : une presse hydraulique appuie 40 % plus fort chaque seconde.

La pression vaut P0 x 1,4^n. Chaque palier tombe à la première seconde où elle dépasse la référence.
Retournement : la force qu'il faut pour atteindre la même pression sur la pointe d'une enclume de diamant,
F = P x π (d/2)^2, exprimée en poids (kg et livres).

Usage : python scripts/calcul_press.py
Entrée : sujets/press.json (références sourcées)
Sortie : sujets/press.calcul.json
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "press.json").read_text(encoding="utf-8"))
regle = sujet["regle_physique"]

MONTEE_S = 0.5
P0 = regle["pression_0_pa"]
F = 1 + regle["gain_par_seconde"]

paliers = []
for cle, ref in sujet["references"].items():
    pas = math.ceil(math.log(ref["pa"] / P0) / math.log(F))
    paliers.append({"cle": cle, "pa": ref["pa"], "pas": pas, "arrivee_s": pas - MONTEE_S, "source": ref["source"]})
paliers.sort(key=lambda p: p["pas"])
assert paliers[-1]["cle"] == "centre"
ecarts = [b["pas"] - a["pas"] for a, b in zip(paliers, paliers[1:])]
assert min(ecarts) >= 2, [(p["cle"], p["pas"]) for p in paliers]

n_max = paliers[-1]["pas"]
p_cible = sujet["references"]["centre"]["pa"]
force_n = p_cible * math.pi * (regle["culet_m"] / 2) ** 2
force_kg = force_n / regle["g_m_s2"]
force_lb = force_kg / 0.45359237

t_limite = n_max - MONTEE_S
t_coupe = t_limite + 3.2
t_qui = t_coupe + 4.0
t_patte = t_qui + 4.0
t_retour = t_patte + 4.0
t_fin = t_retour + 3.0
duree = t_fin + 0.6
assert 62 <= duree <= 75, duree


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {
    "n_espresso": seconde("espresso"),
    "n_acier": seconde("acier"),
    "n_diamant": seconde("diamant"),
    "n_centre": n_max,
    "force_lb": round(force_lb),
    "force_kg": f"{force_kg:.1f}".replace(".", ","),
}
sortie = {
    "n_max": n_max,
    "p0_pa": P0,
    "facteur": F,
    "force_n": force_n,
    "force_kg": force_kg,
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
        "retournements": [t_limite + 0.5, t_coupe, t_patte],
        "fin": t_fin,
        "base_hz": 55,
        "tic_hz": 900,
        # Le grondement hydraulique descend et s'épaissit avec la pression
        "bourdon": [
            [0, 110, 0.04],
            [15, 90, 0.08],
            [33, 60, 0.18],
            [t_limite, 41, 0.32],
            [t_coupe, 41, 0.32],
            [t_coupe + 0.4, 41, 0.0],
            [t_retour, 110, 0.0],
            [t_fin, 110, 0.04],
            [duree, 110, 0.0],
        ],
    },
}
(RACINE / "sujets" / "press.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for p in paliers:
    print(f"seconde {p['pas']:>2} à {p['arrivee_s']:>5.1f} s : {p['cle']:<9} {p['pa']:>10.4g} Pa, presse {P0 * F ** p['pas']:>10.4g} Pa")
print(f"force sur une pointe de 20 µm : {force_n:.1f} N = {force_kg:.1f} kg = {force_lb:.1f} lb ; durée {duree:.1f} s")
