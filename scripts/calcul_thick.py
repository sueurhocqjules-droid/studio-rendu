"""Calcule les paliers du sujet thick : l'eau devient 3 fois plus visqueuse chaque seconde.

La viscosité vaut eau x 3^n à la seconde n. Chaque palier tombe à la première seconde
où l'eau est au moins aussi visqueuse que la référence.

Usage : python scripts/calcul_thick.py
Entrée : sujets/thick.json (références sourcées)
Sortie : sujets/thick.calcul.json (secondes, retournement, textes de description, son)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "thick.json").read_text(encoding="utf-8"))

MONTEE_S = 0.5  # la seconde n est atteinte à n - 0,5 s
EAU = sujet["regle_physique"]["eau_pa_s"]
FACTEUR = sujet["regle_physique"]["facteur_par_seconde"]

paliers = []
for cle, ref in sujet["references"].items():
    rapport = ref["pa_s"] / EAU
    pas = math.ceil(math.log(rapport) / math.log(FACTEUR) - 1e-12)
    paliers.append({
        "cle": cle,
        "pa_s": ref["pa_s"],
        "fois_eau": rapport,
        "pas": pas,
        "arrivee_s": pas - MONTEE_S,
        "source": ref["source"],
    })
paliers.sort(key=lambda palier: palier["pas"])
assert [p["cle"] for p in paliers] == list(sujet["references"]), "ordre des références inattendu"
assert all(b["pas"] - a["pas"] >= 3 for a, b in zip(paliers, paliers[1:])), "paliers trop rapprochés"

n_max = paliers[-1]["pas"]
t_limite = n_max - MONTEE_S
t_coupe = t_limite + 2.8   # on recule : le verre posé sur la croûte, le manteau dessous
t_flux = t_coupe + 3.4     # les plaques glissent : ça coule encore
t_retour = t_flux + 3.8    # tout se rembobine jusqu'à l'eau
t_fin = t_retour + 3.4
duree = round(t_fin + 0.6, 2)
assert 62 <= duree <= 75, duree


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {f"n_{cle}": seconde(cle) for cle in ("huile", "miel", "brai", "granit", "manteau")}
sortie = {
    "n_max": n_max,
    "facteur": FACTEUR,
    "eau_pa_s": EAU,
    "fois_eau_fin": FACTEUR ** n_max,
    "paliers": paliers,
    "t_limite": t_limite,
    "t_coupe": t_coupe,
    "t_flux": t_flux,
    "t_retour": t_retour,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": {langue: sujet[langue]["description"].format(**valeurs) for langue in ("en", "es", "pt")},
    "son": {
        "duree_s": duree,
        "tics": [s - 1 for s in range(1, n_max + 1)],
        "paliers": [palier["arrivee_s"] for palier in paliers],
        "retournements": [t_limite, t_coupe, t_flux],
        "fin": t_fin,
        "base_hz": 110,
        "tic_hz": 1175,
        # Le bourdon s'alourdit avec le liquide, gronde sous la croûte, puis remonte avec l'eau
        "bourdon": [
            [0, 330, 0.05],
            [15, 220, 0.09],
            [24, 140, 0.15],
            [t_limite, 55, 0.28],
            [t_coupe - 0.01, 55, 0.28],
            [t_coupe, 41, 0.34],
            [t_retour, 41, 0.3],
            [t_fin, 330, 0.05],
            [duree, 330, 0],
        ],
    },
}
(RACINE / "sujets" / "thick.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for palier in paliers:
    print(f"seconde {palier['pas']:>2} à {palier['arrivee_s']:>5.1f} s : {palier['cle']:<8} {palier['fois_eau']:>10.3g} x eau, règle {FACTEUR ** palier['pas']:>10.3g}")
print(f"fin : {FACTEUR ** n_max:.3g} x eau, durée {duree:.1f} s")
