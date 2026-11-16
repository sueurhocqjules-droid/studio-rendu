"""Calcule les paliers du sujet pizza : on coupe la pizza en 4 chaque seconde et on garde un morceau.

Le morceau pèse M / 4^n après n coupes. Chaque palier tombe à la première coupe où le morceau est plus léger
que la référence. Le dernier palier est un atome : la masse moyenne d'un atome de pizza est calculée à partir
de la composition USDA et d'une formule type par constituant.

Usage : python scripts/calcul_pizza.py
Entrée : sujets/pizza.json (références sourcées)
Sortie : sujets/pizza.calcul.json
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "pizza.json").read_text(encoding="utf-8"))
regle = sujet["regle_physique"]

MONTEE_S = 0.5
M = regle["masse_kg"]
K = regle["morceaux_par_coupe"]
DA = regle["dalton_kg"]

# Atomes par gramme de pizza : somme sur les constituants de (masse / masse molaire) x atomes par formule
atomes_par_g = 0.0
for cle, grammes in regle["composition_g_100g"].items():
    formule = regle["formules"][cle]
    atomes_par_g += grammes / 100 / formule["masse_da"] * formule["atomes"]
masse_atome_da = 1 / atomes_par_g
masse_atome_kg = masse_atome_da * DA
atomes_pizza = M / masse_atome_kg

paliers = []
for cle, ref in sujet["references"].items():
    kg = masse_atome_kg if cle == "atome" else ref["kg"]
    pas = math.ceil(math.log(M / kg) / math.log(K))
    paliers.append({"cle": cle, "kg": kg, "pas": pas, "arrivee_s": pas - MONTEE_S, "morceau_kg": M / K**pas, "source": ref["source"]})
paliers.sort(key=lambda p: p["pas"])
assert paliers[-1]["cle"] == "atome"
ecarts = [b["pas"] - a["pas"] for a, b in zip(paliers, paliers[1:])]
assert min(ecarts) >= 2, ecarts

n_max = paliers[-1]["pas"]
morceaux = K**n_max
septillions = round(morceaux / 1e24)

t_limite = n_max - MONTEE_S
t_coupe = t_limite + 2.8  # le couteau rebondit sur l'atome
t_qui = t_coupe + 4.2
t_patte = t_qui + 4.6
t_retour = t_patte + 3.4
t_fin = t_retour + 4.2
duree = t_fin + 0.6
assert 62 <= duree <= 75, duree


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {"n_riz": seconde("riz"), "n_bacterie": seconde("bacterie"), "n_atome": n_max}
sortie = {
    "n_max": n_max,
    "masse_kg": M,
    "k": K,
    "masse_atome_da": masse_atome_da,
    "atomes_pizza": atomes_pizza,
    "morceaux": morceaux,
    "septillions": septillions,
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
        "tics": [s - 1 + 0.05 for s in range(1, n_max + 1)],
        "paliers": [p["arrivee_s"] for p in paliers],
        "retournements": [t_coupe - 0.4, t_qui, t_patte],
        "fin": t_fin,
        "base_hz": 110,
        "tic_hz": 2000,
        # Une note aiguë qui monte à mesure que le morceau rapetisse
        "bourdon": [
            [0, 220, 0.0],
            [8, 260, 0.03],
            [25, 520, 0.07],
            [t_limite, 1100, 0.12],
            [t_coupe - 0.4, 1100, 0.14],
            [t_coupe - 0.38, 1100, 0.0],
            [t_retour, 400, 0.0],
            [t_fin, 220, 0.04],
            [duree, 220, 0.0],
        ],
    },
}
(RACINE / "sujets" / "pizza.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for p in paliers:
    print(f"coupe {p['pas']:>2} à {p['arrivee_s']:>5.1f} s : {p['cle']:<12} réf {p['kg']:>10.3g} kg, morceau {p['morceau_kg']:>10.3g} kg")
print(f"atome moyen {masse_atome_da:.2f} Da, {atomes_pizza:.3g} atomes, {morceaux:.3g} morceaux ({septillions} x 10^24), durée {duree:.1f} s")
