"""Calcule les paliers du sujet heart : le cœur bat 12 % plus vite chaque seconde.

La fréquence vaut f0 x 1,12^n à la seconde n (f0 = 60 bpm = 1 Hz). Chaque palier tombe à la
première seconde où le cœur dépasse la référence. Au-dessus de 20 Hz, le battement devient un son :
le bourdon de la bande son suit la vraie fréquence, jusqu'au La 440 Hz du retournement.

Usage : python scripts/calcul_heart.py
Entrée : sujets/heart.json (références sourcées)
Sortie : sujets/heart.calcul.json (secondes, tables par image, son, descriptions)
"""
import json
import math
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sujet = json.loads((RACINE / "sujets" / "heart.json").read_text(encoding="utf-8"))

FPS = 30
MONTEE_S = 0.5  # la seconde n est atteinte à n - 0,5 s
regle = sujet["regle_physique"]
F0 = regle["depart_bpm"] / 60  # Hz
FACTEUR = 1 + regle["hausse_par_seconde"]
AUDIBLE = regle["seuil_audible_hz"]
LA = sujet["retournement"]["la_hz"]
PULSE_MAX = 3  # au-delà de 3 battements par seconde, plus de pulsation visible : un flou


def hz_de(ref):
    return ref["hz"] if "hz" in ref else ref["bpm"] / 60


def f_de(pas):
    return F0 * FACTEUR ** pas


paliers = []
for cle, ref in sujet["references"].items():
    hz = hz_de(ref)
    pas = math.ceil(math.log(hz / F0) / math.log(FACTEUR) - 1e-9)
    paliers.append({"cle": cle, "ref_hz": hz, "ref_bpm": hz * 60, "pas": pas, "arrivee_s": pas - MONTEE_S,
                    "coeur_hz": f_de(pas), "source": ref["source"]})
paliers.sort(key=lambda p: p["pas"])
assert [p["cle"] for p in paliers] == list(sujet["references"]), [p["cle"] for p in paliers]
ecarts = [b["pas"] - a["pas"] for a, b in zip(paliers, paliers[1:])]
assert min(ecarts) >= 2, ecarts
assert 6 <= len(paliers) + 1 <= 9

# Le cœur atteint exactement 440 Hz en cours de seconde : le compteur s'arrête pile sur le La
n_la = math.log(LA / F0) / math.log(FACTEUR)
assert n_la > paliers[-1]["pas"]


def pas_a(t, maximum):
    entier = math.floor(t)
    avance = min((t - entier) / 0.5, 1)
    return min(entier + 1 - (1 - avance) ** 3, maximum)


entier = math.floor(n_la)
t_limite = entier + 0.5 * (1 - (entier + 1 - n_la) ** (1 / 3))
t_orchestre = t_limite + 2.6
t_retour = t_orchestre + 3.0
t_fin = t_retour + 4.6
duree = round((t_fin + 0.6) * FPS) / FPS
assert 62 <= duree <= 75, duree


def lisse(x):
    return x * x * (3 - 2 * x)


def entre(t, de, a):
    return min(max((t - de) / (a - de), 0), 1)


def etat(t):
    """Pas continu (décor) et fréquence affichée au compteur."""
    if t < t_limite:
        pas = pas_a(t, n_la)
        return pas, f_de(math.floor(pas + 1e-9))
    if t < t_retour:
        return n_la, LA
    if t < t_fin:
        pas = n_la * (1 - lisse(entre(t, t_retour, t_fin)))
        return pas, f_de(pas)
    return 0.0, F0


def f_vraie(t):
    """Fréquence réelle du cœur : par marches à la montée, continue au retour."""
    if t < t_limite:
        return f_de(math.floor(pas_a(t, n_la) + 1e-9))
    return etat(t)[1]


# Intégration fine : phase vraie (battements, pour le son) et phase de l'électrocardiogramme,
# plafonnée à 3 cycles par seconde pour que le tracé ne file jamais en bouillie
DT = 1 / 3000
nb = int(round(duree / DT))
phase, psi = [0.0], [0.0]
for k in range(nb):
    f = f_vraie((k + 0.5) * DT)
    phase.append(phase[-1] + f * DT)
    psi.append(psi[-1] + min(f, PULSE_MAX) * DT)
k_limite = int(t_limite / DT)
# Après le retournement, on recale par la fin : la dernière image retombe sur la phase de la première
recale_vraie = round(phase[-1]) - phase[-1]
recale_psi = round(psi[-1]) - psi[-1]
for k in range(k_limite, nb + 1):
    phase[k] += recale_vraie
    psi[k] += recale_psi

battements = []
for k in range(1, nb + 1):
    if math.floor(phase[k]) > math.floor(phase[k - 1]):
        t = k * DT
        if f_vraie(t) < AUDIBLE and t < duree - 0.05:
            battements.append(round(t, 4))
battements = [0.0] + battements

n_images = round(duree * FPS)
tables = {"pas": [], "hz": [], "psi": []}
for i in range(n_images):
    t = i / FPS
    pas, hz = etat(t)
    tables["pas"].append(round(pas, 4))
    tables["hz"].append(float(f"{hz:.5g}"))
    tables["psi"].append(round(psi[min(int(round(t / DT)), nb)], 4))

# Bande son : un battement sourd par pulsation (lub puis dub) tant qu'on ne l'entend pas comme une note,
# puis un bourdon qui suit la vraie fréquence au-dessus de 20 Hz, se pose sur le La et redescend
tics = []
for i, t in enumerate(battements):
    tics.append(t)
    f = f_vraie(t)
    if f <= PULSE_MAX:
        tics.append(round(t + 0.3 / f, 4))
tics.sort()

arrivee_audible = next(p["arrivee_s"] for p in paliers if p["cle"] == "audible")
n_audible = next(p["pas"] for p in paliers if p["cle"] == "audible")
n_haut = math.floor(n_la)


def force(f):
    return 0.18 + 0.30 * math.log(f / AUDIBLE) / math.log(LA / AUDIBLE)


bourdon = [[0, AUDIBLE, 0], [arrivee_audible - 0.02, f_de(n_audible), 0]]
for n in range(n_audible, n_haut + 1):
    debut = n - MONTEE_S
    if n > n_audible:
        bourdon.append([debut, f_de(n - 1), force(f_de(n - 1))])
    bourdon.append([debut + 0.06, f_de(n), force(f_de(n))])
bourdon.append([t_limite - 0.04, f_de(n_haut), force(f_de(n_haut))])
bourdon.append([t_limite, LA, 0.55])
bourdon.append([t_retour, LA, 0.5])
t = t_retour + 0.1
while t < t_fin:
    f = etat(t)[1]
    bourdon.append([round(t, 3), f, force(f) if f >= AUDIBLE else 0])
    if f < AUDIBLE:
        break
    t += 0.1
bourdon.append([duree, AUDIBLE, 0])
bourdon = [[round(a, 4), round(b, 3), round(c, 3)] for a, b, c in bourdon]
assert all(b[0] > a[0] for a, b in zip(bourdon, bourdon[1:])), "bourdon non trié"


def seconde(cle):
    return next(p["pas"] for p in paliers if p["cle"] == cle)


valeurs = {"n_course": seconde("course"), "n_souris": seconde("souris"), "n_audible": seconde("audible")}
sortie = {
    "f0_hz": F0,
    "facteur": FACTEUR,
    "hausse_pct": round(regle["hausse_par_seconde"] * 100),
    "audible_hz": AUDIBLE,
    "pulse_max_hz": PULSE_MAX,
    "la_hz": LA,
    "touche_la": sujet["retournement"]["touche_la"],
    "age_course": sujet["references"]["course"]["age"],
    "n_la": n_la,
    "paliers": paliers,
    "t_limite": t_limite,
    "t_orchestre": t_orchestre,
    "t_retour": t_retour,
    "t_fin": t_fin,
    "duree_s": duree,
    "fps": FPS,
    "battements": battements,
    "descriptions": {langue: sujet[langue]["description"].format(**valeurs) for langue in ("en", "es", "pt")},
    "son": {
        "duree_s": duree,
        "tics": tics,
        "paliers": [p["arrivee_s"] for p in paliers],
        "retournements": [t_limite],
        "fin": t_fin,
        "base_hz": 55,
        "tic_hz": 70,
        "bourdon": bourdon,
    },
    "tables": tables,
}
(RACINE / "sujets" / "heart.calcul.json").write_text(json.dumps(sortie, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

for p in paliers:
    print(f"seconde {p['pas']:>2} à {p['arrivee_s']:>5.1f} s : {p['cle']:<11} réf {p['ref_hz']:>8.2f} Hz ({p['ref_bpm']:>7.0f} bpm), cœur {p['coeur_hz']:>8.2f} Hz")
print(f"La {LA} Hz au pas {n_la:.2f}, t = {t_limite:.2f} s ; durée {duree:.2f} s ; {len(battements)} battements, {len(tics)} tics, {len(bourdon)} points de bourdon")
