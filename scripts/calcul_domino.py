"""Calcule les paliers du sujet domino : chaque domino est 1,5 fois plus grand que le précédent, un tombe par seconde.

Le domino n mesure h0 x 1,5^n. Chaque palier tombe au premier domino plus haut que la référence.
Retournement : l'énergie de la pichenette (lever le centre de gravité du premier domino au-dessus de son arête)
face à l'énergie libérée par la chute du dernier (son centre de gravité descend de (h - e) / 2).

Usage : python scripts/calcul_domino.py
Entrée : sujets/domino.json (références sourcées)
Sortie : sujets/domino.calcul.json
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "domino.json").read_text(encoding="utf-8"))
regle = sujet["regle_physique"]

MONTEE_S = 0.5
H0 = regle["hauteur_0_m"]
F = regle["facteur"]
LARG = regle["proportions"]["largeur"]
EP = regle["proportions"]["epaisseur"]
RHO = regle["densite_kg_m3"]
G = regle["g_m_s2"]

paliers = []
for cle, ref in sujet["references"].items():
    pas = math.ceil(math.log(ref["m"] / H0) / math.log(F))
    paliers.append({"cle": cle, "m": ref["m"], "pas": pas, "arrivee_s": pas - MONTEE_S, "hauteur_m": H0 * F**pas, "source": ref["source"]})
paliers.sort(key=lambda p: p["pas"])
assert paliers[-1]["cle"] == "espace"
assert len({p["pas"] for p in paliers}) == len(paliers), "deux paliers sur la même seconde"
ecarts = [b["pas"] - a["pas"] for a, b in zip(paliers, paliers[1:])]
assert min(ecarts) >= 2, ecarts

n_max = paliers[-1]["pas"]


def masse(h):
    return RHO * h * (LARG * h) * (EP * h)


h_fin = H0 * F**n_max
e_tap = masse(H0) * G * (math.hypot(H0 / 2, EP * H0 / 2) - H0 / 2)
e_fin = masse(h_fin) * G * (h_fin - EP * h_fin) / 2
annees = e_fin / regle["energie_monde_j_an"]

t_limite = n_max - MONTEE_S
t_coupe = t_limite + 3.0  # le dernier domino finit de tomber
t_qui = t_coupe + 5.0
t_patte = t_qui + 5.5
t_retour = t_patte + 3.5
t_fin = t_retour + 4.0
duree = t_fin + 0.6
assert 62 <= duree <= 75, duree


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


def tap_texte(decimale):
    exposant = math.floor(math.log10(e_tap))
    chiffres = round(e_tap / 10**exposant * 10)
    return "0" + decimale + "0" * (-exposant - 1) + str(chiffres)


valeurs = {"n_toi": seconde("toi"), "n_burj": seconde("burj"), "n_espace": seconde("espace")}
sortie = {
    "n_max": n_max,
    "h0_m": H0,
    "facteur": F,
    "epaisseur": EP,
    "h_fin_m": h_fin,
    "e_tap_j": e_tap,
    "e_fin_j": e_fin,
    "amplification": e_fin / e_tap,
    "annees_energie": round(annees),
    "tap": {langue: tap_texte(sujet[langue]["separateurs"]["decimale"]) for langue in ("en", "es", "pt")},
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
        "tics": [s - 0.05 for s in range(1, n_max + 1)],
        "paliers": [p["arrivee_s"] for p in paliers],
        "retournements": [t_limite + 1.2, t_qui, t_patte],
        "fin": t_fin,
        "base_hz": 82,
        "tic_hz": 1200,
        # Un grondement qui descend à mesure que les dominos grossissent
        "bourdon": [
            [0, 330, 0.0],
            [10, 300, 0.04],
            [25, 180, 0.10],
            [t_limite, 55, 0.30],
            [t_coupe, 45, 0.35],
            [t_coupe + 0.6, 45, 0.0],
            [t_retour, 120, 0.0],
            [t_fin, 330, 0.05],
            [duree, 330, 0.0],
        ],
    },
}
(RACINE / "sujets" / "domino.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for p in paliers:
    print(f"domino {p['pas']:>2} à {p['arrivee_s']:>5.1f} s : {p['cle']:<8} réf {p['m']:>10.4g} m, domino {p['hauteur_m']:>10.4g} m")
print(f"dernier domino {h_fin:.4g} m, pichenette {e_tap:.3g} J, chute {e_fin:.3g} J, x{e_fin / e_tap:.3g}, {annees:.0f} ans d'énergie mondiale")
print(f"durée {duree:.1f} s, tap {sortie['tap']}")
