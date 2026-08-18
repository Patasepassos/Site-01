"""Isolate the puppy from the blue decorative background, preserving interior detail.
1) color-key the bluish background  2) keep largest connected component (the dog)
3) fill interior holes (restores grey ear/hip + blue tag)  4) feather edges.
"""
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
import os

SRC = "mascote.png"
os.makedirs("public", exist_ok=True)

im = Image.open(SRC).convert("RGBA")
arr = np.asarray(im).astype(np.int16)
r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]

# Background = clearly bluish AND bright. The dark slate inner-ear is bluish
# but dark, so the brightness gate keeps it (and all dark dog parts).
mx = np.maximum(np.maximum(r, g), b)
is_bg = ((b - r) > 14) & ((b - g) > 6) & (mx > 175)
is_bg &= ~((r - b) > 28)      # tongue/reddish -> keep

fg = ~is_bg                   # True where dog

# Keep largest connected component
lbl, n = ndimage.label(fg)
if n > 0:
    sizes = ndimage.sum(np.ones_like(lbl), lbl, index=range(1, n + 1))
    keep = (np.argmax(sizes) + 1)
    fg = lbl == keep

# Fill interior holes -> restores grey inner-ear, hip patch, blue tag
fg = ndimage.binary_fill_holes(fg)

# Erode 1px to kill blue halo, then feather
fg_er = ndimage.binary_erosion(fg, iterations=2)
alpha = Image.fromarray((fg_er * 255).astype(np.uint8), "L").filter(
    ImageFilter.GaussianBlur(1.1)
)

out = im.copy()
out.putalpha(alpha)
bbox = out.getbbox()
if bbox:
    out = out.crop(bbox)
out.save("public/dog-full.png")

prev = Image.new("RGBA", out.size, (240, 245, 255, 255))
prev.alpha_composite(out)
prev.convert("RGB").save("scripts/_preview.png")
print("saved dog-full.png", out.size)
