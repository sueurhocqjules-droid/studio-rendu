"""Calcule les paliers du sujet paper : une feuille pliée une fois de plus chaque seconde.

Usage : python scripts/calcul_paper.py
Entrée : sujets/paper.json (feuille et références sourcées)
Sortie : sujets/paper.calcul.json (plis, temps, retournement, textes de description)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "paper.json").read_text(encoding="utf-8"))

feuille = sujet["feuille"]
epaisseur = feuille["epaisseur_m"]
MONTEE_S = 0.5  # le pli n est atteint à n - 0,5 s


def hauteur(pli):
    return epaisseur * 2 ** pli


paliers = []
for cle, reference in sujet["references"].items():
    if "plis" in reference:
        pli = reference["plis"]
        cible_m = hauteur(pli)
    else:
        cible_m = reference["m"]
        pli = math.ceil(math.log2(cible_m / epaisseur))
    assert hauteur(pli) >= cible_m and (pli == 0 or hauteur(pli - 1) < cible_m or "plis" in reference), cle
    paliers.append({
        "cle": cle, "pli": pli, "cible_m": cible_m, "hauteur_m": hauteur(pli),
        "arrivee_s": pli - MONTEE_S, "source": reference["source"],
    })
paliers.sort(key=lambda palier: palier["pli"])

pli_max = paliers[-1]["pli"]
surface = feuille["largeur_m"] * feuille["profondeur_m"]
largeur_finale = math.sqrt(surface / 2 ** pli_max)
ratio = sujet["atome_m"] / largeur_finale

t_etoile = pli_max - MONTEE_S
t_atome = t_etoile + 2.5
t_fin = t_atome + 2.0
duree = t_fin + 0.6
assert 62 <= duree <= 75, duree

valeurs = {
    "epaisseur_mm": f"{epaisseur * 1000:g}",
    "epaisseur_mm_pt": f"{epaisseur * 1000:g}".replace(".", ","),
    "pli_moon": next(p["pli"] for p in paliers if p["cle"] == "moon"),
    "pli_max": pli_max,
    "pli_record": next(p["pli"] for p in paliers if p["cle"] == "record"),
    "ratio": round(ratio),
}
sortie = {
    "epaisseur_m": epaisseur,
    "largeur_m": feuille["largeur_m"],
    "profondeur_m": feuille["profondeur_m"],
    "pli_max": pli_max,
    "paliers": paliers,
    "largeur_finale_m": largeur_finale,
    "atome_m": sujet["atome_m"],
    "ratio_atome": ratio,
    "t_etoile": t_etoile,
    "t_atome": t_atome,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": {langue: sujet[langue]["description"].format(**valeurs) for langue in ("en", "es", "pt")},
    "son": {
        "duree_s": duree,
        "tics": [pli - 1 for pli in range(1, pli_max + 1)],
        "paliers": [palier["arrivee_s"] for palier in paliers],
        "retournements": [t_atome],
        "fin": t_fin,
    },
}
(RACINE / "sujets" / "paper.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for palier in paliers:
    print(f"pli {palier['pli']:>2} à {palier['arrivee_s']:>5.1f} s : {palier['cle']:<8} {palier['hauteur_m']:.4g} m pour {palier['cible_m']:.4g} m")
print(f"largeur finale {largeur_finale:.3g} m, {ratio:.1f} fois moins qu'un atome, durée {duree:.1f} s")
