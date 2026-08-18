from PIL import Image, ImageDraw
sheet = Image.open("SVG mascote.png").convert("RGBA")
im = Image.new("RGBA", sheet.size, (255, 255, 255, 255))
im.alpha_composite(sheet)
im = im.convert("RGB")
d = ImageDraw.Draw(im)
W, H = im.size
for x in range(0, W, 100):
    d.line([(x, 0), (x, H)], fill=(255, 0, 0))
    d.text((x + 2, 2), str(x), fill=(255, 0, 0))
for y in range(0, H, 100):
    d.line([(0, y), (W, y)], fill=(255, 0, 0))
    d.text((2, y + 1), str(y), fill=(255, 0, 0))
im.save("scripts/_grid_sheet.png")
print(im.size)
