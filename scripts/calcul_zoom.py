"""Calcule les paliers du sujet zoom : on part d'une main (champ de 10 cm) et on zoome 2 fois plus chaque seconde.

Le champ vaut W0 / 2^n. Un palier tombe à la première seconde où le champ devient plus étroit que
3 fois la taille de l'objet. Retournement : le vide de l'atome de carbone (rapport des rayons au cube)
et l'atome ramené à un noyau de 1 cm, compté en terrains de football.

Usage : python scripts/calcul_zoom.py
Entrée : sujets/zoom.json (références sourcées)
Sortie : sujets/zoom.calcul.json
"""
import json
import math
from decimal import Decimal
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "zoom.json").read_text(encoding="utf-8"))
regle = sujet["regle_physique"]

MONTEE_S = 0.5
W0 = regle["champ_0_m"]
F = regle["facteur"]
K = regle["remplissage"]

paliers = []
for cle, ref in sujet["references"].items():
    pas = math.ceil(math.log(W0 / (K * ref["taille_m"])) / math.log(F))
    paliers.append({"cle": cle, "taille_m": ref["taille_m"], "pas": pas, "arrivee_s": pas - MONTEE_S, "source": ref["source"]})
paliers.sort(key=lambda p: p["pas"])
assert paliers[-1]["cle"] == "proton"
ecarts = [b["pas"] - a["pas"] for a, b in zip(paliers, paliers[1:])]
assert min(ecarts) >= 2, [(p["cle"], p["pas"]) for p in paliers]
n_max = paliers[-1]["pas"]


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


vide_s = seconde("noyau") - seconde("atome")

# Part vide du volume de l'atome : 1 - (r_noyau / r_atome)^3
plein = (regle["noyau_rayon_m"] / regle["atome_rayon_m"]) ** 3
vide_pct = 100 * (1 - plein)
# Affiché jusqu'aux deux premiers chiffres non nuls de la part pleine (en décimal exact, pas en flottant)
reste = Decimal(repr(100 * plein))
decimales = -reste.adjusted() + 1
p_texte = str((Decimal(100) - reste).quantize(Decimal(1).scaleb(-decimales)))
# L'atome si le noyau faisait 1 cm, en terrains de football
atome_m = regle["bille_m"] * regle["atome_rayon_m"] / regle["noyau_rayon_m"]
terrains = atome_m / regle["terrain_m"]
k_texte = f"{terrains:.1f}"
adn_nm = sujet["references"]["adn"]["taille_m"] * 1e9
adn_texte = f"{adn_nm:g}"
cm_texte = f"{regle['bille_m'] * 100:g}"

t_limite = n_max - MONTEE_S
t_coupe = t_limite + 3.4  # retour à l'atome : le noyau à 1 cm
t_qui = t_coupe + 4.8  # l'atome est vide
t_patte = t_qui + 4.4  # ta main est faite d'atomes : on dézoome
t_retour = t_patte + 0.4
t_fin = t_retour + 5.0
duree = t_fin + 0.6
assert 62 <= duree <= 75, duree

virgule = lambda s: s.replace(".", ",")
textes = {
    "p": {"en": p_texte, "es": virgule(p_texte), "pt": virgule(p_texte)},
    "k": {"en": k_texte, "es": virgule(k_texte), "pt": virgule(k_texte)},
    "adn": {"en": adn_texte, "es": virgule(adn_texte), "pt": virgule(adn_texte)},
    "cm": {"en": cm_texte, "es": virgule(cm_texte), "pt": virgule(cm_texte)},
}
valeurs = {f"n_{cle}": seconde(cle) for cle in ("empreinte", "cellule", "bacterie", "adn", "atome")}
valeurs["vide"] = vide_s
for langue in ("en", "es", "pt"):
    valeurs[f"p_{langue}"] = textes["p"][langue]
    valeurs[f"k_{langue}"] = textes["k"][langue]

sortie = {
    "n_max": n_max,
    "champ_0_m": W0,
    "facteur": F,
    "vide_s": vide_s,
    "vide_pct": vide_pct,
    "atome_si_noyau_1cm_m": atome_m,
    "terrains": terrains,
    "rapport_atome_noyau": regle["atome_rayon_m"] / regle["noyau_rayon_m"],
    "textes": textes,
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
        "base_hz": 73,
        "tic_hz": 1800,
        # Un souffle de lentille qui monte, se creuse dans le vide de l'atome, puis redescend au dézoom
        "bourdon": [
            [0, 130, 0.0],
            [3, 140, 0.04],
            [seconde("atome") - 0.5, 260, 0.09],
            [seconde("atome") + 1, 90, 0.05],
            [seconde("noyau") - 1, 120, 0.07],
            [t_limite, 330, 0.12],
            [t_qui, 330, 0.1],
            [t_patte, 330, 0.12],
            [t_fin - 0.3, 130, 0.0],
            [duree, 130, 0.0],
        ],
    },
}
(RACINE / "sujets" / "zoom.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, indent=2), encoding="utf-8")

for p in paliers:
    print(f"seconde {p['pas']:>2} à {p['arrivee_s']:>5.1f} s : {p['cle']:<10} {p['taille_m']:>10.4g} m, champ {W0 / F ** p['pas']:.3g} m")
print(f"vide {p_texte} % ; atome à noyau 1 cm : {atome_m:.0f} m = {k_texte} terrains ; {vide_s} s de vide ; durée {duree:.1f} s")
