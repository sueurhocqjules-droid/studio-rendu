"""Calcule les paliers du sujet sneeze : un éternuement va 50 % plus vite chaque seconde.

La vitesse vaut v0 x 1,5^n. Chaque palier tombe à la première seconde où elle dépasse la référence.
Le tour de la Terre se recalcule à partir du rayon équatorial ; la Lune compte quand on l'atteint en moins de 2 s.
Retournement : la seconde suivante, la vitesse dépasserait celle de la lumière.

Usage : python scripts/calcul_sneeze.py
Entrée : sujets/sneeze.json (références sourcées)
Sortie : sujets/sneeze.calcul.json
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "sneeze.json").read_text(encoding="utf-8"))
regle = sujet["regle_physique"]

MONTEE_S = 0.5
V0 = regle["v0_m_s"]
F = regle["facteur"]
C = regle["c_m_s"]


def vitesse_de(ref):
    if "m_s" in ref:
        return ref["m_s"]
    if "kmh" in ref:
        return ref["kmh"] / 3.6
    if "rayon_m" in ref:
        return 2 * math.pi * ref["rayon_m"] / ref["duree_s"]
    return ref["distance_m"] / ref["duree_s"]


def v(n):
    return V0 * F ** n


paliers = []
for cle, ref in sujet["references"].items():
    vitesse = vitesse_de(ref)
    pas = math.ceil(math.log(vitesse / V0) / math.log(F) - 1e-12)
    paliers.append({"cle": cle, "m_s": vitesse, "pas": pas, "arrivee_s": pas - MONTEE_S, "source": ref["source"]})
paliers.sort(key=lambda p: p["pas"])
assert paliers[-1]["cle"] == "lune"
ecarts = [b["pas"] - a["pas"] for a, b in zip(paliers, paliers[1:])]
assert min(ecarts) >= 2, [(p["cle"], p["pas"]) for p in paliers]

n_max = paliers[-1]["pas"]
n_lumiere = math.ceil(math.log(C / V0) / math.log(F))
assert n_lumiere == n_max + 1, n_lumiere  # la Lune est la dernière étape avant l'impossible
assert v(n_max) < C < v(n_lumiere)
lune_s = sujet["references"]["lune"]["distance_m"] / v(n_max)
lune = f"{lune_s:.1f}"

t_limite = n_max - MONTEE_S
t_coupe = t_limite + 3.6
t_qui = t_coupe + 4.8
t_patte = t_qui + 4.6
t_retour = t_patte + 3.8
t_fin = t_retour + 1.4
duree = t_fin + 0.6
assert 62 <= duree <= 75, duree

v0_mph = round(V0 * regle["m_s_en_mph"])
v0_kmh = round(V0 * regle["m_s_en_kmh"])
textes_lune = {"en": lune, "es": lune, "pt": lune.replace(".", ",")}


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


def valeurs(langue):
    sortie = {f"n_{cle}": seconde(cle) for cle in ("guepard", "son", "liberation", "sonde", "lune")}
    sortie.update({"n_lumiere": n_lumiere, f"lune_{langue}": textes_lune[langue], "v0": v0_mph if langue == "en" else v0_kmh})
    return sortie


sortie = {
    "n_max": n_max,
    "n_lumiere": n_lumiere,
    "v0_m_s": V0,
    "facteur": F,
    "c_m_s": C,
    "m_s_en_mph": regle["m_s_en_mph"],
    "m_s_en_kmh": regle["m_s_en_kmh"],
    "v0": {"en": v0_mph, "es": v0_kmh, "pt": v0_kmh},
    "lune_s": lune_s,
    "lune": textes_lune,
    "paliers": paliers,
    "t_limite": t_limite,
    "t_coupe": t_coupe,
    "t_qui": t_qui,
    "t_patte": t_patte,
    "t_retour": t_retour,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": {langue: sujet[langue]["description"].format(**valeurs(langue)) for langue in ("en", "es", "pt")},
    "son": {
        "duree_s": duree,
        "tics": [s - 1 for s in range(1, n_max + 1)],
        "paliers": [p["arrivee_s"] for p in paliers],
        "retournements": [t_coupe, t_qui, t_patte],
        "fin": t_fin,
        "base_hz": 98,
        "tic_hz": 1500,
        # Un sifflement de vent qui monte comme un moteur, coupé net par la limite de la lumière
        "bourdon": [
            [0, 120, 0.0],
            [4, 140, 0.04],
            [20, 260, 0.1],
            [t_limite, 520, 0.2],
            [t_coupe - 0.01, 520, 0.2],
            [t_coupe, 520, 0.0],
            [t_retour, 120, 0.0],
            [t_fin, 120, 0.03],
            [duree, 120, 0.0],
        ],
    },
}
(RACINE / "sujets" / "sneeze.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for p in paliers:
    print(f"seconde {p['pas']:>2} à {p['arrivee_s']:>5.1f} s : {p['cle']:<10} {p['m_s']:>12.4g} m/s, éternuement {v(p['pas']):>12.4g} m/s")
print(f"lumière à la seconde {n_lumiere} ; Lune en {lune_s:.2f} s ; départ {v0_mph} mph / {v0_kmh} km/h ; durée {duree:.1f} s")
