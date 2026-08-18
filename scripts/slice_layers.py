"""Slice the isolated dog into head + body layers.
Head = top portion (ears..chin..top of collar). Body = full dog with the
area above the chest erased, so the rotating head never doubles. The black
collar (kept on the body) hides the neck seam.
"""
import numpy as np
from PIL import Image

dog = Image.open("public/dog-full.png").convert("RGBA")
W, H = dog.size  # 601 x 747

# ---- HEAD: crop top through the top of the collar ----
HEAD_BOTTOM = 425
head = dog.crop((0, 0, W, HEAD_BOTTOM))
head.save("public/dog-head.png")

# ---- BODY: erase everything above the chest line so no head ghosting ----
CHEST_TOP = 392
body = np.array(dog)
body[:CHEST_TOP, :, 3] = 0           # transparent above chest
Image.fromarray(body).save("public/dog-body.png")

print("head", head.size, "| body erased above y=", CHEST_TOP,
      "| head pivot ~ (300,405)")
