"""Calcule les paliers du sujet magnet : un aimant de frigo devient 50 % plus fort chaque seconde.

Le champ vaut B0 x 1,5^n. Chaque palier tombe à la première seconde où il dépasse la référence.
Retournement : combien de fois un magnétar reste plus fort que le champ final.

Usage : python scripts/calcul_magnet.py
Entrée : sujets/magnet.json (références sourcées)
Sortie : sujets/magnet.calcul.json
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "magnet.json").read_text(encoding="utf-8"))
regle = sujet["regle_physique"]

MONTEE_S = 0.5
B0 = regle["champ_0_t"]
F = 1 + regle["gain_par_seconde"]

paliers = []
for cle, ref in sujet["references"].items():
    pas = math.ceil(math.log(ref["t"] / B0) / math.log(F))
    paliers.append({"cle": cle, "t": ref["t"], "pas": pas, "arrivee_s": pas - MONTEE_S, "source": ref["source"]})
paliers.sort(key=lambda p: p["pas"])
assert paliers[-1]["cle"] == "atome"
ecarts = [b["pas"] - a["pas"] for a, b in zip(paliers, paliers[1:])]
assert min(ecarts) >= 2, [(p["cle"], p["pas"]) for p in paliers]

n_max = paliers[-1]["pas"]
b_fin = B0 * F**n_max
# Arrondi à trois chiffres significatifs : c'est un ordre de grandeur (le champ du magnétar est une estimation)
k = regle["magnetar_t"] / b_fin
k_rond = int(round(k, -int(math.floor(math.log10(k))) + 2))

t_limite = n_max - MONTEE_S
t_coupe = t_limite + 3.0
t_qui = t_coupe + 4.4
t_patte = t_qui + 4.8
t_retour = t_patte + 1.8
t_fin = t_retour + 4.0
duree = t_fin + 0.6
assert 62 <= duree <= 75, duree


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


def grouper(n, sep):
    return f"{n:,}".replace(",", sep)


valeurs = {
    "n_irm": seconde("irm"),
    "n_grenouille": seconde("grenouille"),
    "n_explosion": seconde("explosion"),
    "n_atome": n_max,
    "k_en": grouper(k_rond, ","),
    "k_es": grouper(k_rond, "."),
    "k_pt": grouper(k_rond, "."),
}
sortie = {
    "n_max": n_max,
    "b0_t": B0,
    "facteur": F,
    "b_fin_t": b_fin,
    "k_magnetar": k_rond,
    "carte_mi": regle["carte_mi"],
    "carte_km": regle["carte_km"],
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
        "retournements": [t_limite + 0.6, t_coupe, t_qui],
        "fin": t_fin,
        "base_hz": 73,
        "tic_hz": 1400,
        # Bourdonnement électrique qui monte avec le champ
        "bourdon": [
            [0, 100, 0.02],
            [16, 120, 0.06],
            [33, 180, 0.12],
            [t_limite, 240, 0.2],
            [t_coupe, 60, 0.25],
            [t_qui, 60, 0.1],
            [t_patte, 100, 0.0],
            [t_fin, 100, 0.02],
            [duree, 100, 0.0],
        ],
    },
}
(RACINE / "sujets" / "magnet.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for p in paliers:
    print(f"seconde {p['pas']:>2} à {p['arrivee_s']:>5.1f} s : {p['cle']:<10} {p['t']:>10.4g} T, aimant {B0 * F ** p['pas']:>10.4g} T")
print(f"champ final {b_fin:.4g} T, magnétar {k:.4g} fois plus fort (affiché {k_rond}) ; durée {duree:.1f} s")
