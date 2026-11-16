"""Calcule les paliers du sujet eye : la vue devient 30 % plus perçante chaque seconde.

Le plus petit angle distingué vaut θ0 / 1,3^n (θ0 = 1 minute d'arc, vue de 10/10). Chaque palier tombe à la
première seconde où cet angle passe sous celui de la référence (détail ou objet vu à sa distance).
Compteur : distance à laquelle on distingue une pièce de 24,26 mm. Retournement : diamètre de pupille qu'il
faudrait pour voir aussi net, par le critère de Rayleigh D = 1,22 λ / θ.

Usage : python scripts/calcul_eye.py
Entrée : sujets/eye.json (références sourcées)
Sortie : sujets/eye.calcul.json
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "eye.json").read_text(encoding="utf-8"))
regle = sujet["regle_physique"]

MONTEE_S = 0.5
ARCSEC = math.pi / 180 / 3600
THETA0 = regle["acuite_0_arcsec"] * ARCSEC
F = 1 + regle["gain_par_seconde"]


def angle_de(ref):
    if "rapport" in ref:
        return THETA0 / ref["rapport"]
    if "arcsec" in ref:
        return ref["arcsec"] * ARCSEC
    return ref["taille_m"] / ref["distance_m"]


paliers = []
for cle, ref in sujet["references"].items():
    angle = angle_de(ref)
    pas = math.ceil(math.log(THETA0 / angle) / math.log(F))
    paliers.append({"cle": cle, "angle_rad": angle, "pas": pas, "arrivee_s": pas - MONTEE_S, "source": ref["source"]})
paliers.sort(key=lambda p: p["pas"])
assert paliers[-1]["cle"] == "trounoir"
ecarts = [b["pas"] - a["pas"] for a, b in zip(paliers, paliers[1:])]
assert min(ecarts) >= 2, [(p["cle"], p["pas"]) for p in paliers]

n_max = paliers[-1]["pas"]
theta_fin = THETA0 / F**n_max
pupille_m = 1.22 * regle["longueur_onde_m"] / theta_fin
piece_0_m = regle["piece_m"] / THETA0

t_limite = n_max - MONTEE_S
t_coupe = t_limite + 2.6
t_qui = t_coupe + 4.0
t_patte = t_qui + 4.2
t_retour = t_patte + 2.6
t_fin = t_retour + 3.2
duree = t_fin + 0.6
assert 62 <= duree <= 75, duree


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


pupille_mi = pupille_m / 1609.344
pupille_km = pupille_m / 1000
valeurs = {
    "n_aigle": seconde("aigle"),
    "n_personne": seconde("personne"),
    "n_hubble": seconde("hubble"),
    "n_trounoir": n_max,
    "pupille_en": f"{pupille_mi:.1f}",
    "pupille_km": f"{pupille_km:.1f}".replace(".", ","),
}
sortie = {
    "n_max": n_max,
    "facteur": F,
    "theta0_rad": THETA0,
    "piece_0_m": piece_0_m,
    "pupille_m": pupille_m,
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
        "base_hz": 98,
        "tic_hz": 1800,
        # Un sifflement clair qui monte comme une mise au point
        "bourdon": [
            [0, 392, 0.0],
            [6, 392, 0.03],
            [30, 587, 0.06],
            [t_limite, 784, 0.10],
            [t_coupe, 784, 0.10],
            [t_coupe + 0.3, 784, 0.0],
            [t_retour, 392, 0.0],
            [t_fin, 392, 0.03],
            [duree, 392, 0.0],
        ],
    },
}
(RACINE / "sujets" / "eye.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for p in paliers:
    print(f"seconde {p['pas']:>2} à {p['arrivee_s']:>5.1f} s : {p['cle']:<10} {p['angle_rad'] / ARCSEC:>10.4g} arcsec")
print(f"pièce vue à {piece_0_m:.1f} m au départ, {piece_0_m * F**n_max / 1000:.4g} km à la fin ; pupille {pupille_m:.0f} m ({pupille_mi:.2f} mi) ; durée {duree:.1f} s")
