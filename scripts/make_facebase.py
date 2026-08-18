"""Create a 'blank' face: the traced head with eyes/nose/mouth/tongue removed
and filled with fur-white, keeping fur + eyebrows + ears + muzzle shading.
Clean rigging features are drawn back on top in build_rig.py."""
import numpy as np
from PIL import Image
from scipy import ndimage

im = Image.open("public/dog-head.png").convert("RGBA")
a = np.array(im)
r, g, b, al = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int), a[..., 3]
H, W = r.shape
ys, xs = np.mgrid[0:H, 0:W]

mx = np.maximum(np.maximum(r, g), b)
dark = mx < 80
red = (r - np.maximum(g, b) > 22) & (r > 105)
# face centre only — protect the dark inner-ear (x<135) and eyebrows (y<150)
zone = (xs >= 135) & (xs <= 372) & (ys >= 150) & (ys <= 392)
feat = (dark | red) & zone & (al > 0)
feat = ndimage.binary_dilation(feat, iterations=3)

a[feat, 0] = 248
a[feat, 1] = 251
a[feat, 2] = 255
Image.fromarray(a).save("public/dog-facebase.png")

bg = Image.new("RGBA", im.size, (232, 240, 252, 255))
bg.alpha_composite(Image.fromarray(a))
bg.convert("RGB").save("scripts/_facebase.png")
print("facebase done", im.size)
