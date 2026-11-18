"""Calcule les paliers du sujet rumor : chaque personne qui apprend un secret le répète à 2 nouvelles personnes, une par seconde.

Une personne qui l'apprend à la seconde h le dit à quelqu'un à h + 1, à quelqu'un d'autre à h + 2, puis s'arrête.
Les nouveaux venus suivent donc la suite de Fibonacci : nouveaux(n) = nouveaux(n - 1) + nouveaux(n - 2).
Chaque palier tombe à la première seconde où le nombre de personnes qui savent dépasse la référence.
Retournement : la Terre entière sait, il ne reste que les naissances (ONU) pour l'entendre.

Usage : python scripts/calcul_rumor.py
Entrée : sujets/rumor.json (références sourcées)
Sortie : sujets/rumor.calcul.json
"""
import json
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "rumor.json").read_text(encoding="utf-8"))
regle = sujet["regle_physique"]

MONTEE_S = 0.5
TERRE = sujet["references"]["terre"]["personnes"]
assert regle["a_qui_chacun_dit"] == 2  # la récurrence ci-dessous suppose deux confidences, une par seconde

# nouveaux[n] : personnes qui apprennent le secret à la seconde n ; savent[n] : total
nouveaux = [regle["premiers"]]
savent = [regle["premiers"]]
while savent[-1] < TERRE:
    precedent = nouveaux[-2] if len(nouveaux) >= 2 else 0
    nouveaux.append(nouveaux[-1] + precedent)
    savent.append(savent[-1] + nouveaux[-1])
n_max = len(savent) - 1
reels = savent[:-1] + [TERRE]  # à la dernière seconde, il n'y a plus assez de monde : on plafonne

paliers = []
for cle, ref in sujet["references"].items():
    pas = next(n for n, s in enumerate(savent) if s >= ref["personnes"])
    paliers.append({"cle": cle, "personnes": ref["personnes"], "pas": pas, "arrivee_s": pas - MONTEE_S, "source": ref["source"]})
paliers.sort(key=lambda p: p["pas"])
assert paliers[-1]["cle"] == "terre" and paliers[-1]["pas"] == n_max
ecarts = [b["pas"] - a["pas"] for a, b in zip(paliers, paliers[1:])]
assert min(ecarts) >= 2, [(p["cle"], p["pas"]) for p in paliers]

naissances_s = regle["naissances_par_an"] / regle["secondes_par_an"]
b = round(naissances_s)

t_limite = n_max - MONTEE_S
t_coupe = t_limite + 3.4
t_qui = t_coupe + 3.6
t_patte = t_qui + 4.4
t_retour = t_patte + 3.4
t_fin = t_retour + 1.2
duree = t_fin + 0.6
assert 62 <= duree <= 75, duree


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {f"n_{cle}": seconde(cle) for cle in ("classe", "paquebot", "ville", "inde", "terre")}
valeurs.update({"b_en": b, "b_es": b, "b_pt": b})
sortie = {
    "n_max": n_max,
    "savent": reels,
    "nouveaux": nouveaux,
    "naissances_s": naissances_s,
    "b": b,
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
        "base_hz": 110,
        "tic_hz": 1400,
        # Un murmure qui enfle en brouhaha, puis le silence d'une planète qui sait tout
        "bourdon": [
            [0, 330, 0.0],
            [6, 300, 0.03],
            [24, 220, 0.08],
            [t_limite, 150, 0.2],
            [t_coupe - 0.01, 150, 0.2],
            [t_coupe, 150, 0.0],
            [t_patte, 330, 0.0],
            [t_fin, 330, 0.03],
            [duree, 330, 0.0],
        ],
    },
}
(RACINE / "sujets" / "rumor.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for p in paliers:
    print(f"seconde {p['pas']:>2} à {p['arrivee_s']:>5.1f} s : {p['cle']:<9} {p['personnes']:>14,.0f}, savent {savent[p['pas']]:>14,}")
print(f"naissances {naissances_s:.2f}/s ; durée {duree:.1f} s")
