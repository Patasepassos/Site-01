"""Combine the faithful traced layers into ONE rigged master SVG with named
groups + pivot notes — drop-in for Rive / Figma / Illustrator."""
import re, os

def inner(path):
    s = open(path, "r", encoding="utf-8").read()
    s = re.sub(r"<\?xml.*?\?>", "", s, flags=re.S)
    s = re.sub(r"^.*?<svg[^>]*>", "", s, flags=re.S)  # drop opening <svg ...>
    s = re.sub(r"</svg>\s*$", "", s, flags=re.S)
    return s.strip()

body = inner("public/vec/body.svg")
head = inner("public/vec/head.svg")
tail = inner("public/vec/tail.svg")

# tail bbox offset within the 601x747 canvas (from fix_tail.py)
TX, TY = 546, 455

out = f'''<?xml version="1.0" encoding="UTF-8"?>
<!--
  Cantinho do AuAu — Mascote VETORIAL FIEL (auto-traçado da arte aprovada)
  ========================================================================
  Vetorizado com vtracer a partir do hero original mascote.png, já fatiado
  em camadas. Grupos nomeados, prontos para rig em Rive / Figma / GSAP.

  Pivôs (unidades do viewBox 0 0 601 747):
    head  ~ 300,405 (pescoço) — seguir cursor / curiosidade / latido
    tail  ~ 556,596 (base)    — abanar
    body  ~ 300,720 (respiração)
  Rive State Machine "DogController": Number MouseX/MouseY · Bool Hover/Click
    · Trigger Bark/Curious · Number Excitement
-->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 601 747" width="601" height="747">
  <g id="tail" transform="translate({TX},{TY})">
{tail}
  </g>
  <g id="body">
{body}
  </g>
  <g id="head">
{head}
  </g>
</svg>
'''

os.makedirs("public/mascot", exist_ok=True)
open("public/mascot/dog-traced.svg", "w", encoding="utf-8").write(out)
print("wrote public/mascot/dog-traced.svg", len(out), "bytes")
