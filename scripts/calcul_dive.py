"""Calcule les paliers du sujet dive : un petit sous-marin plonge une part fixe plus profond chaque seconde.

La profondeur vaut depart x (1 + gain)^n à la seconde n. Chaque palier tombe à la première seconde
où le sous-marin est plus profond que la référence. Le fond de l'océan arrête la règle.

Usage : python scripts/calcul_dive.py
Entrée : sujets/dive.json (références sourcées)
Sortie : sujets/dive.calcul.json (secondes, retournement, textes de description, son)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "dive.json").read_text(encoding="utf-8"))
regle = sujet["regle_physique"]

MONTEE_S = 0.5  # la seconde n est atteinte à n - 0,5 s
DEPART = regle["depart_m"]
FACTEUR = 1 + regle["gain_par_seconde"]
PIED = regle["pied_m"]


def pas_reel(metres):
    return math.log(metres / DEPART) / math.log(FACTEUR)


def atmospheres(metres):
    return 1 + metres / regle["m_par_atmosphere"]


references = dict(sujet["references"])
fond = references.pop("fond")
paliers = []
for cle, ref in references.items():
    pas = math.ceil(pas_reel(ref["m"]))
    paliers.append({"cle": cle, "m": ref["m"], "pas": pas, "arrivee_s": pas - MONTEE_S, "source": ref["source"]})
paliers.sort(key=lambda palier: palier["pas"])
assert len({palier["pas"] for palier in paliers}) == len(paliers), "deux paliers sur la même seconde"
assert 6 <= len(paliers) <= 9, len(paliers)

# Le fond : le compteur y bute entre deux secondes. pasA monte en 1 - (1 - a)^3 sur la première demi-seconde.
fond_m = fond["m"]
pas_fond = pas_reel(fond_m)
n_avant = math.floor(pas_fond)
n_regle = n_avant + 1
part = pas_fond - n_avant
t_fond = n_avant + MONTEE_S * (1 - (1 - part) ** (1 / 3))
assert paliers[-1]["pas"] <= n_avant, "le dernier palier doit précéder le fond"

t_poids = t_fond + 3.0
t_remonte = t_poids + 2.8
t_fin = t_remonte + 4.6
duree = t_fin + 0.5
assert 62 <= duree <= 75, duree

regle_m = DEPART * FACTEUR ** n_regle
atm_fond = atmospheres(fond_m)
tonnes_us = atm_fond * regle["psi_par_atmosphere"] / regle["livres_par_tonne_us"]
tonnes_cm2 = atm_fond * regle["kg_par_cm2_par_atmosphere"] / 1000


def grouper(entier, sep):
    return f"{entier:,}".replace(",", sep)


def local(valeur, langue, decimales=0):
    sep = sujet[langue]["separateurs"]
    entier, _, reste = f"{valeur:.{decimales}f}".partition(".")
    texte = grouper(int(entier), sep["milliers"])
    return f"{texte}{sep['decimale']}{reste}" if reste else texte


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


descriptions = {}
for langue in ("en", "es", "pt"):
    valeurs = {
        "n_loisir": seconde("loisir"),
        "n_gabr": seconde("gabr"),
        "n_baleine": seconde("baleine"),
        "n_titanic": seconde("titanic"),
        "regle_ft": local(regle_m / PIED, langue),
        "fond_ft": local(fond_m / PIED, langue),
        "regle_m": local(regle_m, langue),
        "fond_m": local(fond_m, langue),
        "tonnes_us": local(tonnes_us, langue),
        "tonnes_cm2": local(tonnes_cm2, langue, 1),
    }
    descriptions[langue] = sujet[langue]["description"].format(**valeurs)

sortie = {
    "depart_m": DEPART,
    "facteur": FACTEUR,
    "gain_pct": round(regle["gain_par_seconde"] * 100),
    "pied_m": PIED,
    "m_par_atmosphere": regle["m_par_atmosphere"],
    "paliers": paliers,
    "fond_m": fond_m,
    "pas_fond": pas_fond,
    "n_regle": n_regle,
    "regle_m": regle_m,
    "atm_fond": atm_fond,
    "tonnes_us_pouce2": round(tonnes_us),
    "tonnes_cm2": round(tonnes_cm2, 1),
    "t_fond": t_fond,
    "t_poids": t_poids,
    "t_remonte": t_remonte,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": descriptions,
    "son": {
        "duree_s": duree,
        "tics": [s - 1 for s in range(1, n_avant + 1)],
        "paliers": [palier["arrivee_s"] for palier in paliers],
        "retournements": [t_fond, t_poids, t_remonte],
        "fin": t_fin,
        "base_hz": 110,
        "tic_hz": 1320,
        # Sonar : un bourdon qui descend avec le sous-marin, se tait au fond puis remonte avec lui
        "bourdon": [
            [0, 330, 0.04],
            [20, 220, 0.08],
            [40, 130, 0.14],
            [t_fond, 62, 0.3],
            [t_poids, 62, 0.22],
            [t_remonte, 62, 0.0],
            [t_remonte + 0.8, 90, 0.05],
            [t_fin, 330, 0.04],
            [duree, 330, 0],
        ],
    },
}
(RACINE / "sujets" / "dive.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for palier in paliers:
    print(f"seconde {palier['pas']:>2} à {palier['arrivee_s']:>5.1f} s : {palier['cle']:<8} {palier['m']:>8.1f} m, sous-marin {DEPART * FACTEUR ** palier['pas']:>9.1f} m")
print(f"fond {fond_m} m (pas {pas_fond:.2f}) à {t_fond:.2f} s ; la règle demande {regle_m:.0f} m à la seconde {n_regle}")
print(f"{atm_fond:.0f} atm, {tonnes_us:.2f} t US/pouce², {tonnes_cm2:.2f} t/cm², durée {duree:.1f} s")
