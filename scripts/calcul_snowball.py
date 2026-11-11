"""Calcule les paliers du sujet snowball : une boule de neige gagne une part fixe de sa masse chaque seconde.

La masse vaut m0 x (1 + gain)^n à la seconde n, avec m0 la masse d'une boule de 10 cm en neige tassée.
Chaque palier tombe à la première seconde où la boule pèse plus que la référence. Le diamètre suit
la racine cubique de la masse. Retournement : toute cette masse est de la neige prise à la montagne,
convertie en surface de manteau neigeux (3 pieds en anglais, 1 m en espagnol et portugais).

Usage : python scripts/calcul_snowball.py
Entrée : sujets/snowball.json (références sourcées)
Sortie : sujets/snowball.calcul.json (secondes, retournement, textes de description, son)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "snowball.json").read_text(encoding="utf-8"))
regle = sujet["regle_physique"]

MONTEE_S = 0.5  # la seconde n est atteinte à n - 0,5 s
DENSITE = regle["densite_boule_kg_m3"]
D0 = regle["diametre_depart_m"]
FACTEUR = 1 + regle["gain_par_seconde"]
M0 = DENSITE * math.pi / 6 * D0 ** 3
LIVRE = regle["livre_kg"]


def masse_de(ref):
    if "masse_kg" in ref:
        return ref["masse_kg"]
    if "masse_lb" in ref:
        return ref["masse_lb"] * LIVRE
    return ref["masse_tonne_longue"] * 1016.0469088


def diametre(masse):
    return (6 * masse / (math.pi * DENSITE)) ** (1 / 3)


paliers = []
for cle, ref in sujet["references"].items():
    masse = masse_de(ref)
    pas = math.ceil(math.log(masse / M0) / math.log(FACTEUR))
    paliers.append({
        "cle": cle,
        "masse_kg": masse,
        "pas": pas,
        "arrivee_s": pas - MONTEE_S,
        "diametre_boule_m": diametre(M0 * FACTEUR ** pas),
        "source": ref["source"],
    })
paliers.sort(key=lambda palier: palier["pas"])
assert paliers[-1]["cle"] == "pyramide", paliers[-1]
assert len({palier["pas"] for palier in paliers}) == len(paliers), "deux paliers sur la même seconde"
assert 6 <= len(paliers) <= 9

n_max = paliers[-1]["pas"]
t_limite = n_max - MONTEE_S
t_coupe = t_limite + 2.8
t_qui = t_coupe + 2.6
t_retour = t_qui + 3.2
t_fin = t_retour + 4.2
duree = t_fin + 0.5
assert 62 <= duree <= 75, duree

m_fin = M0 * FACTEUR ** n_max
mangee = m_fin - M0


def terrains(epaisseur_m):
    surface = mangee / (regle["densite_manteau_kg_m3"] * epaisseur_m)
    brut = surface / regle["terrain_m2"]
    return int(round(brut, -2)), surface


terrains_en, surface_en = terrains(regle["epaisseur_en_m"])
terrains_es_pt, surface_es_pt = terrains(regle["epaisseur_es_pt_m"])


def groupe(n, sep):
    return f"{n:,}".replace(",", sep)


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {
    "n_humain": seconde("humain"),
    "n_baleine": seconde("baleine"),
    "n_eiffel": seconde("eiffel"),
    "n_pyramide": seconde("pyramide"),
    "terrains_en": groupe(terrains_en, ","),
    "terrains_es": groupe(terrains_es_pt, ","),
    "terrains_pt": groupe(terrains_es_pt, "."),
}
sortie = {
    "n_max": n_max,
    "m0_kg": M0,
    "d0_m": D0,
    "facteur": FACTEUR,
    "gain_pct": round(regle["gain_par_seconde"] * 100),
    "livre_kg": LIVRE,
    "tonne_courte_kg": regle["tonne_courte_kg"],
    "m_fin_kg": m_fin,
    "d_fin_m": diametre(m_fin),
    "terrains": {"en": valeurs["terrains_en"], "es": valeurs["terrains_es"], "pt": valeurs["terrains_pt"]},
    "surface_km2": {"en": surface_en / 1e6, "es_pt": surface_es_pt / 1e6},
    "paliers": paliers,
    "t_limite": t_limite,
    "t_coupe": t_coupe,
    "t_qui": t_qui,
    "t_retour": t_retour,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": {langue: sujet[langue]["description"].format(**valeurs) for langue in ("en", "es", "pt")},
    "son": {
        "duree_s": duree,
        "tics": [s - 1 for s in range(1, n_max + 1)],
        "paliers": [palier["arrivee_s"] for palier in paliers],
        "retournements": [t_limite, t_coupe, t_retour],
        "fin": t_fin,
        "base_hz": 110,
        "tic_hz": 1320,
        # Le grondement de la boule descend à mesure qu'elle s'alourdit, se tait sur la montagne nue, puis remonte au retour
        "bourdon": [
            [0, 330, 0.04],
            [15, 220, 0.1],
            [35, 98, 0.22],
            [t_limite, 55, 0.4],
            [t_coupe - 0.01, 55, 0.4],
            [t_coupe, 55, 0],
            [t_retour, 55, 0],
            [t_retour + 0.6, 70, 0.08],
            [t_fin, 330, 0.04],
            [duree, 330, 0],
        ],
    },
}
(RACINE / "sujets" / "snowball.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for palier in paliers:
    m = M0 * FACTEUR ** palier["pas"]
    print(f"seconde {palier['pas']:>2} à {palier['arrivee_s']:>5.1f} s : {palier['cle']:<9} {palier['masse_kg']:>12.4g} kg, boule {m:>12.4g} kg, Ø {palier['diametre_boule_m']:.3g} m")
print(f"m0 {M0:.4g} kg, masse finale {m_fin:.4g} kg, Ø {diametre(m_fin):.0f} m")
print(f"terrains : en {terrains_en} ({surface_en / 1e6:.1f} km²), es/pt {terrains_es_pt} ({surface_es_pt / 1e6:.1f} km²), durée {duree:.1f} s")
