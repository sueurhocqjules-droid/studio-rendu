"""Calcule les paliers du sujet candle : une bougie libère 4 fois plus d'énergie chaque seconde.

La puissance vaut 80 W x 4^n. Chaque palier tombe à la première seconde où elle dépasse la référence.
Retournement : une bougie qui brille comme le Soleil brûle sa cire au même prorata (0,1 g/min pour 80 W) ;
on compare ce débit à la masse de la Lune et à la masse que le vrai Soleil convertit en énergie (L / c²).

Usage : python scripts/calcul_candle.py
Entrée : sujets/candle.json (références sourcées)
Sortie : sujets/candle.calcul.json
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "candle.json").read_text(encoding="utf-8"))
regle = sujet["regle_physique"]

MONTEE_S = 0.5
P0 = regle["puissance_0_w"]
F = regle["facteur"]

# La lumière du Soleil qui frappe la Terre se recalcule ici plutôt que d'être recopiée
sujet["references"]["terre"]["w"] = regle["constante_solaire_w_m2"] * math.pi * regle["rayon_terre_m"] ** 2

paliers = []
for cle, ref in sujet["references"].items():
    pas = math.ceil(math.log(ref["w"] / P0) / math.log(F))
    paliers.append({"cle": cle, "w": ref["w"], "pas": pas, "arrivee_s": pas - MONTEE_S, "source": ref["source"]})
paliers.sort(key=lambda p: p["pas"])
assert paliers[-1]["cle"] == "soleil"
ecarts = [b["pas"] - a["pas"] for a, b in zip(paliers, paliers[1:])]
assert min(ecarts) >= 2, [(p["cle"], p["pas"]) for p in paliers]

n_max = paliers[-1]["pas"]
p_soleil = regle["soleil_w"]
cire_kg_s = p_soleil / P0 * regle["cire_kg_s"]
heures_lune = regle["lune_kg"] / cire_kg_s / 3600
soleil_kg_s = p_soleil / regle["c_m_s"] ** 2
rapport = cire_kg_s / soleil_kg_s

h = f"{heures_lune:.1f}"
k_milliards = f"{rapport / 1e9:.1f}"
k_millions = f"{round(rapport / 1e6, -2):,.0f}".replace(",", ".")

t_limite = n_max - MONTEE_S
t_coupe = t_limite + 3.4
t_qui = t_coupe + 5.0
t_patte = t_qui + 5.0
t_retour = t_patte + 4.0
t_fin = t_retour + 3.6
duree = t_fin + 0.6
assert 62 <= duree <= 75, duree


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {f"n_{cle}": seconde(cle) for cle in ("cheval", "barrage", "humanite", "ouragan", "soleil")}
valeurs.update({
    "h_en": h,
    "h_es": h.replace(".", ","),
    "h_pt": h.replace(".", ","),
    "k_en": k_milliards,
    "k_es": k_millions,
    "k_pt": k_milliards.replace(".", ","),
})
sortie = {
    "n_max": n_max,
    "p0_w": P0,
    "facteur": F,
    "cire_kg_s": cire_kg_s,
    "heures_lune": heures_lune,
    "soleil_kg_s": soleil_kg_s,
    "rapport": rapport,
    "textes": {"h": {"en": h, "es": h.replace(".", ","), "pt": h.replace(".", ",")}, "k": {"en": k_milliards, "es": k_millions, "pt": k_milliards.replace(".", ",")}},
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
        "retournements": [t_coupe, t_qui, t_patte],
        "fin": t_fin,
        "base_hz": 87,
        "tic_hz": 1300,
        # Le souffle de la flamme devient un grondement de fournaise
        "bourdon": [
            [0, 140, 0.0],
            [8, 120, 0.04],
            [26, 80, 0.12],
            [t_limite, 50, 0.24],
            [t_patte, 50, 0.2],
            [t_retour, 140, 0.0],
            [t_fin, 140, 0.02],
            [duree, 140, 0.0],
        ],
    },
}
(RACINE / "sujets" / "candle.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for p in paliers:
    print(f"seconde {p['pas']:>2} à {p['arrivee_s']:>5.1f} s : {p['cle']:<9} {p['w']:>10.4g} W, bougie {P0 * F ** p['pas']:>10.4g} W")
print(f"cire {cire_kg_s:.3g} kg/s, une Lune toutes les {heures_lune:.2f} h ; Soleil {soleil_kg_s:.3g} kg/s ; rapport {rapport:.3g} ; durée {duree:.1f} s")
