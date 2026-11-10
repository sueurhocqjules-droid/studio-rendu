"""Calcule les paliers du sujet rice : un grain de riz qui double chaque seconde.

Usage : python scripts/calcul_rice.py
Entrée : sujets/rice.json (grain et références sourcées)
Sortie : sujets/rice.calcul.json (secondes, tas, années de récolte, textes de description)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "rice.json").read_text(encoding="utf-8"))

grain = sujet["grain"]
masse_grain = grain["masse_kg"]
densite = grain["densite_vrac_kg_m3"]
pente = math.tan(math.radians(grain["talus_deg"]))
MONTEE_S = 0.5  # la seconde n est atteinte à n - 0,5 s


def masse(seconde):
    return masse_grain * 2 ** seconde


def volume(seconde):
    return masse(seconde) / densite


def rayon_tas(seconde):
    """Rayon d'un tas conique : V = pi r^2 h / 3 avec h = r tan(talus)."""
    return (3 * volume(seconde) / (math.pi * pente)) ** (1 / 3)


def hauteur_tas(seconde):
    return rayon_tas(seconde) * pente


def premiere_seconde(valeur_de, cible):
    seconde = 0
    while valeur_de(seconde) < cible:
        seconde += 1
    return seconde


paliers = []
for cle, reference in sujet["references"].items():
    if "kg" in reference:
        seconde = premiere_seconde(masse, reference["kg"])
    else:
        seconde = premiere_seconde(volume, reference["m3"])
    paliers.append({"cle": cle, "pas": seconde, "arrivee_s": seconde - MONTEE_S, "source": reference["source"]})

n_echiquier = sujet["echiquier_cases"] - 1  # la case k porte 2^(k-1) grains
paliers.append({"cle": "echiquier", "pas": n_echiquier, "arrivee_s": n_echiquier - MONTEE_S, "source": "Légende de l'échiquier : case k, 2^(k-1) grains"})

n_max = premiere_seconde(hauteur_tas, sujet["everest_m"])
paliers.append({"cle": "everest", "pas": n_max, "arrivee_s": n_max - MONTEE_S, "source": sujet["everest_source"]})
paliers.sort(key=lambda palier: palier["pas"])

# Une seule couche de grains posés à plat sur toute la Terre, océans compris
emprise = grain["longueur_m"] * grain["largeur_m"]
grains_terre = sujet["terre_m2"] / emprise
n_terre = premiere_seconde(lambda seconde: 2 ** seconde, grains_terre)
assert n_terre == n_max, (n_terre, n_max)

recolte = sujet["references"]["recolte"]["kg"]
annees = round(masse(n_echiquier) / recolte)

t_limite = n_max - MONTEE_S
t_planete = t_limite + 2.4
t_boule = t_planete + 2.4
t_faim = t_boule + 1.6
t_chute = t_faim + 1.0
t_fin = t_chute + 0.9
duree = t_fin + 0.6
assert 62 <= duree <= 75, duree


def seconde_de(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {"n_elephant": seconde_de("elephant"), "n_navire": seconde_de("navire"), "annees": annees, "n_max": n_max}
sortie = {
    "masse_grain_kg": masse_grain,
    "volume_grain_m3": masse_grain / densite,
    "pente": pente,
    "longueur_grain_m": grain["longueur_m"],
    "n_max": n_max,
    "annees": annees,
    "hauteur_finale_m": hauteur_tas(n_max),
    "rayon_final_m": rayon_tas(n_max),
    "hauteur_avant_m": hauteur_tas(n_max - 1),
    "everest_m": sujet["everest_m"],
    "paliers": paliers,
    "t_limite": t_limite,
    "t_planete": t_planete,
    "t_boule": t_boule,
    "t_faim": t_faim,
    "t_chute": t_chute,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": {langue: sujet[langue]["description"].format(**valeurs) for langue in ("en", "es", "pt")},
    "son": {
        "duree_s": duree,
        "tics": [seconde - 1 for seconde in range(1, n_max + 1)],
        "paliers": [palier["arrivee_s"] for palier in paliers] + [t_planete],
        "retournements": [t_boule, t_chute],
        "fin": t_fin,
        "base_hz": 62,
        "tic_hz": 620,
    },
}
(RACINE / "sujets" / "rice.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for palier in paliers:
    n = palier["pas"]
    print(f"seconde {n:>2} à {palier['arrivee_s']:>5.1f} s : {palier['cle']:<10} {masse(n):.4g} kg, {volume(n):.4g} m3, rayon {rayon_tas(n):.4g} m")
print(f"tas final {hauteur_tas(n_max):.0f} m de haut, {annees} ans de récolte, couche sur la Terre {grains_terre:.3g} grains, durée {duree:.1f} s")
