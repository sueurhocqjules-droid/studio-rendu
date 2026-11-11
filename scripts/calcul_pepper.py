"""Calcule les paliers du sujet pepper : un piment devient une part fixe plus piquant chaque seconde.

Le piquant vaut départ x (1 + hausse)^n SHU à la seconde n. Chaque palier tombe à la première
seconde où le piment dépasse la référence.

Usage : python scripts/calcul_pepper.py
Entrée : sujets/pepper.json (références sourcées)
Sortie : sujets/pepper.calcul.json (secondes, retournement, textes de description)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "pepper.json").read_text(encoding="utf-8"))

MONTEE_S = 0.5  # la seconde n est atteinte à n - 0,5 s
DEPART = sujet["regle_physique"]["depart_shu"]
HAUSSE = sujet["regle_physique"]["hausse_par_seconde"]
FACTEUR = 1 + HAUSSE
refs = sujet["references"]
CAPSAICINE = refs["capsaicine"]["shu"]


def shu_de(ref):
    if "shu" in ref:
        return ref["shu"]
    return ref["fois_capsaicine"] * CAPSAICINE


paliers = []
for cle, ref in refs.items():
    shu = shu_de(ref)
    pas = math.ceil(math.log(shu / DEPART) / math.log(FACTEUR))
    paliers.append({"cle": cle, "shu": shu, "pas": pas, "arrivee_s": pas - MONTEE_S, "source": ref["source"]})
paliers.sort(key=lambda palier: palier["pas"])
assert paliers[-1]["cle"] == "rtx", paliers[-1]
assert len({palier["pas"] for palier in paliers}) == len(paliers), "deux paliers sur la même seconde"
assert 6 <= len(paliers) <= 9

n_max = paliers[-1]["pas"]
t_limite = n_max - MONTEE_S
t_coupe = t_limite + 2.9  # le cristal devient une plante grasse
t_seve = t_coupe + 2.4  # la sève coule
t_lait = t_seve + 2.2  # le verre de lait arrive
t_retour = t_lait + 1.2  # le compteur redescend
t_fin = t_lait + 4.2  # retour au pepperoncini de la première image
duree = t_fin + 0.5
assert 62 <= duree <= 75, duree


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {
    "depart": DEPART,
    "pct": round(HAUSSE * 100),
    "n_jalapeno": seconde("jalapeno"),
    "n_fantome": seconde("fantome"),
    "n_pepperx": seconde("pepperx"),
    "n_capsaicine": seconde("capsaicine"),
    "n_max": n_max,
}
sortie = {
    "n_max": n_max,
    "depart_shu": DEPART,
    "facteur": FACTEUR,
    "hausse_pct": round(HAUSSE * 100),
    "shu_fin": DEPART * FACTEUR ** n_max,
    "fois": {cle: refs[cle]["fois_capsaicine"] for cle in ("dix", "cent")},
    "annees": {cle: refs[cle]["annee"] for cle in ("fantome", "pepperx")},
    "rtx_sur_capsaicine": round(refs["rtx"]["shu"] / CAPSAICINE),
    "paliers": paliers,
    "t_limite": t_limite,
    "t_coupe": t_coupe,
    "t_seve": t_seve,
    "t_lait": t_lait,
    "t_retour": t_retour,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": {langue: sujet[langue]["description"].format(**valeurs) for langue in ("en", "es", "pt")},
    "son": {
        "duree_s": duree,
        "tics": [s - 1 for s in range(1, n_max + 1)],
        "paliers": [palier["arrivee_s"] for palier in paliers],
        "retournements": [t_limite, t_coupe, t_lait],
        "fin": t_fin,
        "base_hz": 82,
        "tic_hz": 1175,
        # Un grésillement qui monte avec le piquant, coupé net quand la plante apparaît
        "bourdon": [
            [0, 110, 0.0],
            [5, 120, 0.04],
            [paliers[3]["arrivee_s"], 180, 0.10],
            [paliers[5]["arrivee_s"], 260, 0.18],
            [t_limite, 420, 0.32],
            [t_coupe - 0.01, 440, 0.32],
            [t_coupe, 98, 0],
            [t_lait, 98, 0],
            [t_retour, 98, 0.06],
            [t_fin, 110, 0.0],
            [duree, 110, 0],
        ],
    },
}
(RACINE / "sujets" / "pepper.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for palier in paliers:
    print(f"seconde {palier['pas']:>2} à {palier['arrivee_s']:>5.1f} s : {palier['cle']:<11} {palier['shu']:>14,.0f} SHU, piment {DEPART * FACTEUR ** palier['pas']:>16,.0f} SHU")
print(f"piquant final {sortie['shu_fin']:.3g} SHU, durée {duree:.1f} s")
