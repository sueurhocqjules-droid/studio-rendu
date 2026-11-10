"""Calcule les paliers du sujet clone : on se photocopie, et chaque copie aussi, chaque seconde.

Le nombre de copies vaut 2^n à la seconde n. Chaque palier tombe à la première seconde
où ce nombre dépasse la quantité de référence.

Usage : python scripts/calcul_clone.py
Entrée : sujets/clone.json (références sourcées)
Sortie : sujets/clone.calcul.json (secondes, retournement, textes de description)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "clone.json").read_text(encoding="utf-8"))

MONTEE_S = 0.5  # la seconde n est atteinte à n - 0,5 s


def copies_de(ref):
    if "copies" in ref:
        return ref["copies"]
    if "surface_m2" in ref:
        return ref["surface_m2"] * ref["densite_par_m2"]
    if "corps_kg" in ref:
        return ref["masse_kg"] / ref["corps_kg"]
    fraction_masse = ref["fraction_volume_o2"] * ref["masse_molaire_o2"] / ref["masse_molaire_air"]
    return ref["masse_air_sec_kg"] * fraction_masse / ref["o2_par_jour_kg"]


paliers = []
for cle, ref in sujet["references"].items():
    copies = copies_de(ref)
    pas = math.ceil(math.log2(copies))
    paliers.append({"cle": cle, "copies": copies, "pas": pas, "arrivee_s": pas - MONTEE_S, "source": ref["source"]})
paliers.sort(key=lambda palier: palier["pas"])
assert paliers[-1]["cle"] == "oxygene", paliers[-1]
assert len({palier["pas"] for palier in paliers}) == len(paliers), "deux paliers sur la même seconde"

n_max = paliers[-1]["pas"]
t_limite = n_max - MONTEE_S
t_coupe = t_limite + 2.9
t_qui = t_coupe + 2.2
t_patte = t_qui + 1.8
t_retour = t_patte + 1.6
t_fin = t_patte + 4.4
duree = t_fin + 0.5
assert 62 <= duree <= 75, duree


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {"n_stade": seconde("stade"), "n_monde": seconde("monde"), "n_oxygene": seconde("oxygene")}
sortie = {
    "n_max": n_max,
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
        "paliers": [palier["arrivee_s"] for palier in paliers],
        "retournements": [t_limite, t_coupe, t_patte],
        "fin": t_fin,
        "base_hz": 120,
        "tic_hz": 1040,
        # La machine ronfle de plus en plus, puis plus rien : elle n'a plus de papier
        "bourdon": [
            [0, 75, 0.03],
            [25, 120, 0.12],
            [50, 260, 0.3],
            [t_limite, 400, 0.5],
            [t_coupe - 0.01, 400, 0.5],
            [t_coupe, 400, 0],
            [t_patte, 90, 0],
            [t_retour, 90, 0.05],
            [t_fin, 75, 0.03],
            [duree, 75, 0],
        ],
    },
}
(RACINE / "sujets" / "clone.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for palier in paliers:
    print(f"seconde {palier['pas']:>2} à {palier['arrivee_s']:>5.1f} s : {palier['cle']:<10} {palier['copies']:>10.3g} copies, 2^n = {2 ** palier['pas']:>10.3g}")
print(f"durée {duree:.1f} s")
