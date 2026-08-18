from PIL import Image, ImageDraw
im = Image.open("public/dog-full.png").convert("RGBA")
bg = Image.new("RGBA", im.size, (245, 248, 255, 255))
bg.alpha_composite(im)
d = ImageDraw.Draw(bg)
W, H = im.size
for x in range(0, W, 50):
    d.line([(x, 0), (x, H)], fill=(255, 0, 0, 120))
    d.text((x + 2, 2), str(x), fill=(200, 0, 0))
for y in range(0, H, 50):
    d.line([(0, y), (W, y)], fill=(255, 0, 0, 120))
    d.text((2, y + 1), str(y), fill=(200, 0, 0))
bg.convert("RGB").save("scripts/_grid.png")
print(im.size)
