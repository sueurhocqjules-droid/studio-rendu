"""Calcule les paliers du sujet volt : une pile de 1,5 V gagne une part fixe de tension chaque seconde.

La tension vaut v0 x (1 + hausse)^n à la seconde n. Chaque palier tombe à la première seconde
où la pile dépasse la référence. Au palier de l'éclair, la charge de la pile (sa capacité en
ampères-heures, inchangée) multipliée par sa nouvelle tension donne une énergie, comparée à la
consommation d'un foyer américain moyen.

Usage : python scripts/calcul_volt.py
Entrée : sujets/volt.json (références sourcées)
Sortie : sujets/volt.calcul.json (secondes, retournement, son, descriptions)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "volt.json").read_text(encoding="utf-8"))

FPS = 30
MONTEE_S = 0.5  # la seconde n est atteinte à n - 0,5 s
regle = sujet["regle_physique"]
V0 = regle["depart_v"]
HAUSSE = regle["hausse_par_seconde"]
FACTEUR = 1 + HAUSSE


def tension(pas):
    return V0 * FACTEUR ** pas


paliers = []
for cle, ref in sujet["references"].items():
    pas = math.ceil(math.log(ref["volts"] / V0) / math.log(FACTEUR) - 1e-9)
    paliers.append({"cle": cle, "ref_v": ref["volts"], "pas": pas, "arrivee_s": pas - MONTEE_S,
                    "pile_v": tension(pas), "source": ref["source"]})
paliers.sort(key=lambda p: p["pas"])
assert [p["cle"] for p in paliers] == list(sujet["references"]), [p["cle"] for p in paliers]
assert paliers[-1]["cle"] == "eclair"
ecarts = [b["pas"] - a["pas"] for a, b in zip(paliers, paliers[1:])]
assert min(ecarts) >= 3, ecarts
assert 6 <= len(paliers) <= 9

n_max = paliers[-1]["pas"]
v_max = tension(n_max)

# Retournement : même charge, tension d'éclair
charge_c = regle["capacite_aa_mah"] / 1000 * 3600
energie_kwh = charge_c * v_max / 3.6e6
foyer_kwh_an = regle["foyer_kwh_mois"] * 12
annees = round(energie_kwh / foyer_kwh_an)
energie_depart_wh = charge_c * V0 / 3600

t_limite = n_max - MONTEE_S
t_haut = t_limite + 2.6
t_maison = t_haut + 2.8
t_retour = t_maison + 2.8
t_fin = t_retour + 3.6
duree = round((t_fin + 0.5) * FPS) / FPS
assert 62 <= duree <= 75, duree


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


def nombre(valeur, langue):
    sep = sujet[langue]["separateurs"]
    texte = f"{valeur:g}"
    return texte.replace(".", sep["decimale"])


valeurs = {"n_voiture": seconde("voiture"), "n_anguille": seconde("anguille"), "n_ligne": seconde("ligne"),
           "n_eclair": seconde("eclair"), "annees": annees, "pct": round(HAUSSE * 100)}
sortie = {
    "v0": V0,
    "facteur": FACTEUR,
    "hausse_pct": round(HAUSSE * 100),
    "n_max": n_max,
    "v_max": v_max,
    "charge_c": charge_c,
    "energie_depart_wh": energie_depart_wh,
    "energie_kwh": energie_kwh,
    "foyer_kwh_an": foyer_kwh_an,
    "annees": annees,
    "paliers": paliers,
    "t_limite": t_limite,
    "t_haut": t_haut,
    "t_maison": t_maison,
    "t_retour": t_retour,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": {langue: sujet[langue]["description"].format(v0=nombre(V0, langue), **valeurs)
                     for langue in ("en", "es", "pt")},
    "son": {
        "duree_s": duree,
        "tics": [s - 1 for s in range(1, n_max + 1)],
        "paliers": [p["arrivee_s"] for p in paliers],
        "retournements": [t_limite, t_haut, t_maison],
        "fin": t_fin,
        "base_hz": 60,
        "tic_hz": 1200,
        # Le bourdon du secteur : il monte avec la tension, se tait quand l'éclair part, revient au calme
        "bourdon": [
            [0, 60, 0.03],
            [paliers[2]["arrivee_s"], 90, 0.08],
            [paliers[5]["arrivee_s"], 150, 0.18],
            [t_limite, 240, 0.32],
            [t_haut - 0.01, 240, 0.32],
            [t_haut, 240, 0],
            [t_retour, 120, 0],
            [t_retour + 0.6, 120, 0.06],
            [t_fin, 60, 0.03],
            [duree, 60, 0],
        ],
    },
}
(RACINE / "sujets" / "volt.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for p in paliers:
    print(f"seconde {p['pas']:>2} à {p['arrivee_s']:>5.1f} s : {p['cle']:<9} réf {p['ref_v']:>12.4g} V, pile {p['pile_v']:>12.4g} V")
print(f"énergie de la pile à {v_max:.3g} V : {energie_kwh:,.0f} kWh, soit {annees} ans d'un foyer ({foyer_kwh_an} kWh/an)")
print(f"durée {duree:.2f} s")
