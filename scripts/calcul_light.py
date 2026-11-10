"""Calcule les paliers du sujet light : la lumière perd une part fixe de sa vitesse chaque seconde.

La vitesse vaut c x (1 - perte)^n à la seconde n. Chaque palier tombe à la première seconde
où la lumière est plus lente que la référence.

Usage : python scripts/calcul_light.py
Entrée : sujets/light.json (références sourcées)
Sortie : sujets/light.calcul.json (secondes, retournement, textes de description)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "light.json").read_text(encoding="utf-8"))

MONTEE_S = 0.5  # la seconde n est atteinte à n - 0,5 s
C = sujet["regle_physique"]["c_m_s"]
PERTE = sujet["regle_physique"]["perte_par_seconde"]
FACTEUR = 1 - PERTE


def vitesse_de(ref):
    if "vitesse_m_s" in ref:
        return ref["vitesse_m_s"]
    if "vitesse_kmh" in ref:
        return ref["vitesse_kmh"] / 3.6
    if "m_par_min" in ref:
        return ref["m_par_min"] / 60
    return ref["distance_m"] / ref["retard_s"]


paliers = []
for cle, ref in sujet["references"].items():
    vitesse = vitesse_de(ref)
    pas = math.ceil(math.log(vitesse / C) / math.log(FACTEUR))
    paliers.append({"cle": cle, "vitesse_m_s": vitesse, "pas": pas, "arrivee_s": pas - MONTEE_S, "source": ref["source"]})
paliers.sort(key=lambda palier: palier["pas"])
assert paliers[-1]["cle"] == "escargot", paliers[-1]
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

v_fin = C * FACTEUR ** n_max
minutes = round(sujet["regle_physique"]["ecran_yeux_m"] / v_fin / 60)


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {"n_appel": seconde("appel"), "n_sonde": seconde("sonde"), "n_marcheur": seconde("marcheur"), "n_escargot": seconde("escargot")}
sortie = {
    "n_max": n_max,
    "c_m_s": C,
    "facteur": FACTEUR,
    "perte_pct": round(PERTE * 100),
    "minutes_ecran": minutes,
    "v_fin_m_s": v_fin,
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
        "base_hz": 196,
        "tic_hz": 1568,
        # Le bourdon descend avec la lumière, comme un disque qui ralentit
        "bourdon": [
            [0, 520, 0.05],
            [18, 330, 0.12],
            [37, 180, 0.24],
            [t_limite, 70, 0.45],
            [t_coupe - 0.01, 70, 0.45],
            [t_coupe, 70, 0],
            [t_patte, 90, 0],
            [t_retour, 90, 0.05],
            [t_fin, 520, 0.05],
            [duree, 520, 0],
        ],
    },
}
(RACINE / "sujets" / "light.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for palier in paliers:
    print(f"seconde {palier['pas']:>2} à {palier['arrivee_s']:>5.1f} s : {palier['cle']:<10} {palier['vitesse_m_s']:>12.4g} m/s, lumière {C * FACTEUR ** palier['pas']:>12.4g} m/s")
print(f"vitesse finale {v_fin:.3g} m/s, écran à {minutes} min, durée {duree:.1f} s")
