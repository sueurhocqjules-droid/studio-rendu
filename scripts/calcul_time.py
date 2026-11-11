"""Calcule les paliers du sujet time : le temps va deux fois plus vite chaque seconde.

À la seconde n, une seconde de la vidéo couvre facteur^n secondes réelles. Chaque palier tombe
à la première seconde dont la durée dépasse la référence. Le retournement tombe quand une
seconde dure plus longtemps que l'âge de l'Univers.

Usage : python scripts/calcul_time.py
Entrée : sujets/time.json (références sourcées)
Sortie : sujets/time.calcul.json (secondes, unités, retournement, textes de description)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "time.json").read_text(encoding="utf-8"))

MONTEE_S = 0.5  # la seconde n est atteinte à n - 0,5 s
R = sujet["regle_physique"]
FACTEUR = R["facteur_par_seconde"]
AN_S = R["jours_par_an"] * R["jour_s"]


def duree_de(ref):
    if "duree_s" in ref:
        return ref["duree_s"]
    if "construite_en" in ref:
        # Pas d'année zéro entre -1 et 1
        return (R["annee_courante"] - ref["construite_en"] - 1) * AN_S
    return ref["duree_ans"] * AN_S


def pas_de(duree_s):
    pas = math.ceil(math.log(duree_s) / math.log(FACTEUR) - 1e-12)
    assert FACTEUR ** pas >= duree_s > FACTEUR ** (pas - 1)
    return pas


paliers = []
for cle, ref in sujet["references"].items():
    duree = duree_de(ref)
    pas = pas_de(duree)
    paliers.append({"cle": cle, "duree_s": duree, "duree_ans": duree / AN_S, "pas": pas, "arrivee_s": pas - MONTEE_S, "source": ref["source"]})
paliers.sort(key=lambda palier: palier["pas"])
assert len({palier["pas"] for palier in paliers}) == len(paliers), "deux paliers sur la même seconde"
assert 6 <= len(paliers) <= 9

univers_s = sujet["univers"]["duree_ans"] * AN_S
n_max = pas_de(univers_s)
assert n_max > paliers[-1]["pas"]
pct = math.floor(100 * univers_s / FACTEUR ** n_max)

t_limite = n_max - MONTEE_S
t_coupe = t_limite + 2.8
t_retour = t_coupe + 3.3
t_fin = t_retour + 4.6
duree = t_fin + 0.5
assert 62 <= duree <= 75, duree

# Unités du compteur, de la plus petite à la plus grande : [clé, seuil en secondes, diviseur]
unites = [
    ["s", 0, R["seconde_s"]],
    ["min", R["minute_s"], R["minute_s"]],
    ["h", R["heure_s"], R["heure_s"]],
    ["jours", R["jour_s"], R["jour_s"]],
    ["ans", AN_S, AN_S],
    ["ma", 1e6 * AN_S, 1e6 * AN_S],
    ["ga", 1e9 * AN_S, 1e9 * AN_S],
]


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {f"n_{p['cle']}": p["pas"] for p in paliers} | {"n_univers": n_max}
sortie = {
    "n_max": n_max,
    "facteur": FACTEUR,
    "an_s": AN_S,
    "jour_s": R["jour_s"],
    "heure_s": R["heure_s"],
    "heure_depart": R["heure_depart"],
    "jour_depart": R["jour_depart"],
    "unites": unites,
    "univers_ans": sujet["univers"]["duree_ans"],
    "univers_ga": round(sujet["univers"]["duree_ans"] / 1e9, 1),
    "univers_ma": round(sujet["univers"]["duree_ans"] / 1e8) * 100,
    "univers_pct": pct,
    "seconde_finale_ans": FACTEUR ** n_max / AN_S,
    "paliers": paliers,
    "pas": {p["cle"]: p["pas"] for p in paliers},
    "t_limite": t_limite,
    "t_coupe": t_coupe,
    "t_retour": t_retour,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": {langue: sujet[langue]["description"].format(**valeurs) for langue in ("en", "es", "pt")},
    "son": {
        "duree_s": duree,
        "tics": [s - 1 for s in range(1, n_max + 1)],
        "paliers": [palier["arrivee_s"] for palier in paliers],
        "retournements": [t_limite, t_coupe, t_retour],
        "fin": t_fin,
        "base_hz": 110,
        "tic_hz": 1320,
        # Le bourdon monte d'une octave par palier franchi, puis redescend au rembobinage
        "bourdon": [
            [0, 82, 0.04],
            [paliers[2]["arrivee_s"], 110, 0.08],
            [paliers[5]["arrivee_s"], 165, 0.14],
            [t_limite, 247, 0.3],
            [t_coupe, 247, 0.1],
            [t_retour, 330, 0.12],
            [t_fin, 82, 0.04],
            [duree, 82, 0],
        ],
    },
}
(RACINE / "sujets" / "time.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for palier in paliers:
    print(f"seconde {palier['pas']:>2} à {palier['arrivee_s']:>5.1f} s : {palier['cle']:<9} {palier['duree_ans']:>14.4g} ans, une seconde = {FACTEUR ** palier['pas'] / AN_S:>12.4g} ans")
print(f"univers : seconde {n_max}, une seconde = {FACTEUR ** n_max / AN_S:.4g} ans, univers = {pct} % de la seconde, durée {duree:.1f} s")
