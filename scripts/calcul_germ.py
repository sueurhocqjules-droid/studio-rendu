"""Calcule les paliers du sujet germ : une bactérie E. coli (1 pg) se divise en deux chaque seconde.

La masse vaut m0 x 2^n. Chaque palier tombe à la première seconde où la masse dépasse la référence.
Retournement : au vrai rythme (une division toutes les 20 minutes), le nombre d'heures pour dépasser la Terre.

Usage : python scripts/calcul_germ.py
Entrée : sujets/germ.json (références sourcées)
Sortie : sujets/germ.calcul.json
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "germ.json").read_text(encoding="utf-8"))
regle = sujet["regle_physique"]

MONTEE_S = 0.5
M0 = regle["masse_0_kg"]
F = regle["facteur"]


def masse(ref):
    if "kg" in ref:
        return ref["kg"]
    if "volume_m3" in ref:
        return ref["volume_m3"] * ref["densite_kg_m3"]
    return math.pi / 6 * ref["diametre_m"] ** 3 * ref["densite_kg_m3"]


paliers = []
for cle, ref in sujet["references"].items():
    m = masse(ref)
    pas = math.ceil(math.log(m / M0) / math.log(F))
    paliers.append({"cle": cle, "kg": m, "pas": pas, "arrivee_s": pas - MONTEE_S, "source": ref["source"]})
paliers.sort(key=lambda p: p["pas"])
assert paliers[-1]["cle"] == "toi"
ecarts = [b["pas"] - a["pas"] for a, b in zip(paliers, paliers[1:])]
assert min(ecarts) >= 2, [(p["cle"], p["pas"]) for p in paliers]

n_max = paliers[-1]["pas"]
# Au vrai rythme : divisions nécessaires pour dépasser la masse de la Terre, une toutes les 20 minutes
n_terre = math.ceil(math.log(regle["masse_terre_kg"] / M0) / math.log(F))
h_terre = n_terre * regle["generation_reelle_min"] / 60
h_texte = str(round(h_terre))

t_limite = n_max - MONTEE_S
t_coupe = t_limite + 3.0  # « au vrai rythme »
t_qui = t_coupe + 2.8  # la Terre sur le plateau
t_patte = t_qui + 3.8  # la nourriture manque
t_point = t_patte + 3.4  # une vraie colonie : un point
t_retour = t_point + 2.6
t_fin = t_retour + 2.4
duree = t_fin + 0.6
assert 62 <= duree <= 75, duree


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {f"n_{cle}": seconde(cle) for cle in ("globule", "sel", "moustique", "souris", "toi")}
valeurs["h_terre"] = h_texte
sortie = {
    "n_max": n_max,
    "m0_kg": M0,
    "facteur": F,
    "n_terre": n_terre,
    "h_terre": h_terre,
    "h_texte": h_texte,
    "paliers": paliers,
    "t_limite": t_limite,
    "t_coupe": t_coupe,
    "t_qui": t_qui,
    "t_patte": t_patte,
    "t_point": t_point,
    "t_retour": t_retour,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": {langue: sujet[langue]["description"].format(**valeurs) for langue in ("en", "es", "pt")},
    "son": {
        "duree_s": duree,
        "tics": [s - 1 for s in range(1, n_max + 1)],
        "paliers": [p["arrivee_s"] for p in paliers],
        "retournements": [t_coupe, t_qui, t_patte],
        "fin": t_fin,
        "base_hz": 98,
        "tic_hz": 1400,
        # Un grouillement qui monte, puis s'éteint quand la nourriture manque
        "bourdon": [
            [0, 110, 0.0],
            [3, 120, 0.04],
            [30, 180, 0.08],
            [t_limite, 300, 0.12],
            [t_qui, 340, 0.15],
            [t_patte, 340, 0.14],
            [t_point, 90, 0.0],
            [t_fin, 110, 0.02],
            [duree, 110, 0.0],
        ],
    },
}
(RACINE / "sujets" / "germ.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for p in paliers:
    print(f"seconde {p['pas']:>2} à {p['arrivee_s']:>5.1f} s : {p['cle']:<10} {p['kg']:>10.4g} kg")
print(f"Terre : {n_terre} divisions, {h_terre:.1f} h au vrai rythme ; durée {duree:.1f} s")
