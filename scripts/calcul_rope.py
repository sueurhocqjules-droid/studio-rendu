"""Calcule les paliers du sujet rope : un lacet double de longueur chaque seconde.

La longueur vaut L0 x 2^n. Chaque palier tombe à la première seconde où le lacet dépasse la référence.
Le tour de la Terre se recalcule depuis le rayon équatorial, le jour-lumière depuis c.
Retournement : la lumière met des heures à le parcourir, et si le lacet grandit en continu
(L0 x 2^t), sa pointe avance à ln 2 x L par seconde, plus vite que la lumière dès que L > c / ln 2.

Usage : python scripts/calcul_rope.py
Entrée : sujets/rope.json (références sourcées)
Sortie : sujets/rope.calcul.json
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "rope.json").read_text(encoding="utf-8"))
regle = sujet["regle_physique"]

MONTEE_S = 0.5
L0 = regle["longueur_0_m"]
F = regle["facteur"]
C = regle["c_m_s"]


def longueur_de(ref):
    if "m" in ref:
        return ref["m"]
    if "rayon_m" in ref:
        return 2 * math.pi * ref["rayon_m"]
    return ref["jours_lumiere"] * C * 86400


def L(n):
    return L0 * F ** n


paliers = []
for cle, ref in sujet["references"].items():
    m = longueur_de(ref)
    pas = math.ceil(math.log(m / L0) / math.log(F) - 1e-12)
    paliers.append({"cle": cle, "m": m, "forme": ref["forme"], "pas": pas, "arrivee_s": pas - MONTEE_S, "source": ref["source"]})
paliers.sort(key=lambda p: p["pas"])
assert paliers[-1]["cle"] == "voyager"
ecarts = [b["pas"] - a["pas"] for a, b in zip(paliers, paliers[1:])]
assert min(ecarts) >= 2, [(p["cle"], p["pas"]) for p in paliers]

n_max = paliers[-1]["pas"]
heures = round(L(n_max) / C / 3600)
# Croissance continue L0 x 2^t : vitesse de la pointe ln 2 x L(t) ; elle dépasse c pendant la seconde n_bout
t_bout = math.log(C / (math.log(2) * L0)) / math.log(2)
n_bout = math.ceil(t_bout)

t_limite = n_max - MONTEE_S
t_coupe = t_limite + 3.4
t_qui = t_coupe + 4.4
t_patte = t_qui + 4.4
t_retour = t_patte + 3.6
t_fin = t_retour + 1.2
duree = t_fin + 0.6
assert 62 <= duree <= 75, duree

l0 = {}
for langue in ("en", "es", "pt"):
    u = sujet[langue]["unite_l0"]
    l0[langue] = f"{round(L0 / u['metres'])} {u['nom']}"


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


def valeurs(langue):
    sortie = {f"n_{cle}": seconde(cle) for cle in ("bus", "everest", "parislondres", "tour", "lune", "soleil", "voyager")}
    sortie.update({"n_bout": n_bout, "h": heures, f"l0_{langue}": l0[langue].lower().replace("cm", "cm")})
    return sortie


sortie = {
    "n_max": n_max,
    "l0_m": L0,
    "facteur": F,
    "chaussure_m": regle["chaussure_m"],
    "heures": heures,
    "t_bout": t_bout,
    "n_bout": n_bout,
    "l0": l0,
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
        "base_hz": 73,
        "tic_hz": 1200,
        # Une corde pincée qui se détend : plus le lacet s'allonge, plus sa note descend
        "bourdon": [
            [0, 392, 0.0],
            [3, 392, 0.04],
            [20, 196, 0.1],
            [t_limite, 60, 0.2],
            [t_coupe - 0.01, 60, 0.2],
            [t_coupe, 60, 0.0],
            [t_retour, 392, 0.0],
            [t_fin, 392, 0.03],
            [duree, 392, 0.0],
        ],
    },
}
(RACINE / "sujets" / "rope.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for p in paliers:
    print(f"seconde {p['pas']:>2} à {p['arrivee_s']:>5.1f} s : {p['cle']:<13} {p['m']:>12.4g} m, lacet {L(p['pas']):>12.4g} m")
print(f"lumière de bout en bout : {heures} h ; pointe plus rapide que la lumière à t = {t_bout:.2f} (seconde {n_bout}) ; durée {duree:.1f} s")
