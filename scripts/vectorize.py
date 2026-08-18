"""Auto-vectorize the REAL hero layers (faithful) into clean SVG paths.
Produces a single rigged SVG with <g id="body|head|tail"> from the sliced PNGs.
"""
import vtracer, os, re

os.makedirs("public/vec", exist_ok=True)

OPTS = dict(
    colormode="color", hierarchical="stacked", mode="spline",
    filter_speckle=10, color_precision=7, layer_difference=12,
    corner_threshold=58, length_threshold=4.0, max_iterations=10,
    splice_threshold=45, path_precision=6,
)

def trace(src, dst):
    vtracer.convert_image_to_svg_py(src, dst, **OPTS)
    return os.path.getsize(dst)

# whole dog (fidelity check)
print("full  ", trace("public/dog-full.png", "public/vec/full.svg"), "bytes")
# layers for rigging
print("body  ", trace("public/dog-body.png", "public/vec/body.svg"), "bytes")
print("head  ", trace("public/dog-head.png", "public/vec/head.svg"), "bytes")
print("tail  ", trace("public/dog-tail.png", "public/vec/tail.svg"), "bytes")
