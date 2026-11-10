"""Calcule les paliers du sujet spin : la Terre tourne 5 % plus vite chaque seconde.

Le script part du rayon équatorial, du jour sidéral et de GM. Il en tire la vitesse de l'équateur
et le facteur où l'accélération centrifuge annule la gravité à l'équateur.

Usage : python scripts/calcul_spin.py
Entrée : sujets/spin.json (références sourcées)
Sortie : sujets/spin.calcul.json (secondes, retournement, textes de description)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "spin.json").read_text(encoding="utf-8"))

MONTEE_S = 0.5  # la seconde n est atteinte à n - 0,5 s
KM_PAR_MILLE = 1.609344

taux = 1 + sujet["taux_par_seconde"]
terre = sujet["terre"]
rayon_km = terre["rayon_equateur_km"]
jour_s = terre["jour_sideral_s"]
jour_h = jour_s / 3600
omega = 2 * math.pi / jour_s
v0_kmh = omega * rayon_km * 3600
gravite = terre["gm_km3_s2"] / rayon_km**2  # km/s²
centrifuge = omega**2 * rayon_km
facteur_apesanteur = math.sqrt(gravite / centrifuge)


def facteur_de(ref):
    if "kmh" in ref:
        return ref["kmh"] / v0_kmh
    if "mph" in ref:
        return ref["mph"] * KM_PAR_MILLE / v0_kmh
    if "jour_h" in ref:
        return jour_h / ref["jour_h"]
    return math.sqrt(1 - ref["poids"]) * facteur_apesanteur


def seconde_de(facteur):
    return math.ceil(math.log(facteur) / math.log(taux))


paliers = [
    {"cle": cle, "facteur": facteur_de(ref), "pas": seconde_de(facteur_de(ref)), "source": ref["source"]}
    for cle, ref in sujet["references"].items()
]
for palier in paliers:
    palier["arrivee_s"] = palier["pas"] - MONTEE_S
paliers.sort(key=lambda palier: palier["pas"])
assert paliers[-1]["cle"] == "apesanteur", paliers[-1]
assert len({palier["pas"] for palier in paliers}) == len(paliers), "deux paliers sur la même seconde"

n_max = paliers[-1]["pas"]
t_limite = n_max - MONTEE_S
t_coupe = t_limite + 2.9
t_qui = t_coupe + 2.2
t_patte = t_qui + 1.8
t_retour = t_patte + 1.6
t_fin = t_patte + 4.4
duree = t_fin + 0.5
assert 62 <= duree <= 75, duree


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {"n_x15": seconde("x15"), "n_moitie": seconde("moitie"), "n_apesanteur": seconde("apesanteur")}
sortie = {
    "v0_kmh": v0_kmh,
    "jour_h": jour_h,
    "taux": taux,
    "facteur_apesanteur": facteur_apesanteur,
    "n_max": n_max,
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
        "paliers": [palier["arrivee_s"] for palier in paliers],
        "retournements": [t_limite, t_coupe, t_patte],
        "fin": t_fin,
        "base_hz": 110,
        "tic_hz": 820,
        # Le sifflement de la rotation monte, puis le globe tourne en silence jusqu'à la patte
        "bourdon": [
            [0, 70, 0.02],
            [18, 110, 0.08],
            [44, 240, 0.25],
            [t_limite, 520, 0.5],
            [t_coupe - 0.01, 520, 0.5],
            [t_coupe, 520, 0],
            [t_retour, 80, 0],
            [t_retour + 0.3, 200, 0.15],
            [t_fin, 70, 0.02],
            [duree, 70, 0],
        ],
    },
}
(RACINE / "sujets" / "spin.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

print(f"équateur {v0_kmh:.0f} km/h, apesanteur à x{facteur_apesanteur:.2f}, jour de {jour_h * 60 / facteur_apesanteur:.0f} min")
for palier in paliers:
    n = palier["pas"]
    print(f"seconde {n:>2} à {palier['arrivee_s']:>5.1f} s : {palier['cle']:<11} x{palier['facteur']:>6.2f}, Terre x{taux**n:>6.2f}, {v0_kmh * taux**n:>7.0f} km/h, jour {jour_h / taux**n:>5.2f} h")
print(f"durée {duree:.1f} s")
