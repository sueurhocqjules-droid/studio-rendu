"""Calcule les paliers du sujet ball : un ballon qui rebondit 10 % plus haut à chaque rebond, 2 rebonds par seconde.

Usage : python scripts/calcul_ball.py
Entrée : sujets/ball.json (règle et références sourcées)
Sortie : sujets/ball.calcul.json (rebonds, temps, chute, textes de description)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "ball.json").read_text(encoding="utf-8"))

ballon = sujet["ballon"]
depart = ballon["hauteur_depart_m"]
gain = ballon["gain"]
gravite = sujet["gravite"]
g, gm, rayon = gravite["g"], gravite["gm"], gravite["rayon_m"]
REBOND_S = 0.5  # durée d'un rebond à l'écran
VITESSE_SON = sujet["references"]["son"]["vitesse_ms"]


def hauteur(rebond):
    return depart * gain ** rebond


def vitesse_sol(h):
    """Vitesse au sol après une chute de h mètres, gravité réelle, sans air."""
    return math.sqrt(2 * gm * (1 / rayon - 1 / (rayon + h)))


def duree_chute(h, pas=2000):
    """Temps de chute depuis h, par intégration de la vitesse (gravité réelle, sans air)."""
    total = 0.0
    for i in range(pas):
        # Changement de variable : le départ à vitesse nulle reste intégrable
        a = (i + 0.5) / pas * math.pi / 2
        altitude = h * math.cos(a) ** 2
        v = math.sqrt(2 * gm * (1 / (rayon + altitude) - 1 / (rayon + h)))
        total += 2 * h * math.cos(a) * math.sin(a) * (math.pi / 2 / pas) / v
    return total


paliers = []
for cle, reference in sujet["references"].items():
    cible = reference["m"] if "m" in reference else reference["vitesse_ms"] ** 2 / (2 * g)
    rebond = math.ceil(math.log(cible / depart) / math.log(gain))
    assert hauteur(rebond) >= cible > hauteur(rebond - 1), cle
    paliers.append({
        "cle": cle, "pas": rebond, "cible_m": cible, "hauteur_m": hauteur(rebond),
        "arrivee_s": REBOND_S * rebond - REBOND_S / 2, "source": reference["source"],
    })
paliers.sort(key=lambda palier: palier["pas"])

n_max = paliers[-1]["pas"]
h_max = hauteur(n_max)
t_iss = paliers[-1]["arrivee_s"]
t_chute = t_iss + 2.2
t_mach = t_chute + 2.3
t_panier = t_chute + 4.6
# Après le panier, le ballon retombe en vrais rebonds qui s'éteignent : la fin rejoint la première image
rebonds_fin = [0.9, 0.7, 0.5, 0.35, 0.25]
chute_fin = 0.35
duree = t_panier + chute_fin + sum(rebonds_fin)
t_fin = duree - 0.6
assert 62 <= duree <= 75, duree

mach = vitesse_sol(h_max) / VITESSE_SON
minutes = sum(2 * duree_chute(hauteur(n)) for n in range(1, n_max + 1)) / 60

impacts_fin = []
instant = t_panier + chute_fin
for duree_rebond in rebonds_fin:
    impacts_fin.append(instant)
    instant += duree_rebond

n_son = next(p["pas"] for p in paliers if p["cle"] == "son")
valeurs = {
    "depart_ft": f"{depart / 0.3048:.0f}",
    "depart_m": f"{depart:g}",
    "depart_m_pt": f"{depart:g}".replace(".", ","),
    "n_son": n_son,
    "n_max": n_max,
    "minutes": round(minutes),
    "mach": round(mach),
}
sortie = {
    "depart_m": depart,
    "gain": gain,
    "rebond_s": REBOND_S,
    "n_max": n_max,
    "n_son": n_son,
    "h_max_m": h_max,
    "gm": gm,
    "rayon_m": rayon,
    "vitesse_son": VITESSE_SON,
    "mach": round(mach),
    "minutes": round(minutes),
    "paliers": paliers,
    "t_iss": t_iss,
    "t_chute": t_chute,
    "t_mach": t_mach,
    "t_panier": t_panier,
    "chute_fin_s": chute_fin,
    "rebonds_fin_s": rebonds_fin,
    "t_fin": t_fin,
    "duree_s": duree,
    "descriptions": {langue: sujet[langue]["description"].format(**valeurs) for langue in ("en", "es", "pt")},
    "son": {
        "duree_s": duree,
        "tics": [REBOND_S * i for i in range(n_max)] + impacts_fin,
        "paliers": [palier["arrivee_s"] for palier in paliers],
        "retournements": [t_chute, t_panier],
        "fin": t_fin,
        "base_hz": 49,
        "tic_hz": 210,
    },
}
(RACINE / "sujets" / "ball.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for palier in paliers:
    print(f"rebond {palier['pas']:>3} à {palier['arrivee_s']:>5.2f} s : {palier['cle']:<9} {palier['hauteur_m']:.4g} m pour {palier['cible_m']:.4g} m")
print(f"Mach {mach:.1f} à l'arrivée, {minutes:.1f} min en vrai, durée {duree:.2f} s")
