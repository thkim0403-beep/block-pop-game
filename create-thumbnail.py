"""
Chromatic Burst — Block Pang! Thumbnail Generator
800x450 PNG for Tistory blog
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, random

random.seed(42)

W, H = 800, 450
img = Image.new('RGBA', (W, H))
draw = ImageDraw.Draw(img)

# --- Background gradient (sky blue → soft violet) ---
for y in range(H):
    t = y / H
    r = int(210 + (230 - 210) * t)
    g = int(235 + (210 - 235) * t)
    b = int(255 + (250 - 255) * t)
    draw.line([(0, y), (W, y)], fill=(r, g, b, 255))

# --- Soft blurred background circles for depth ---
bg_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
bg_draw = ImageDraw.Draw(bg_layer)
bg_circles = [
    (120, 80, 140, (255, 180, 200, 35)),
    (650, 350, 160, (180, 200, 255, 30)),
    (400, 400, 120, (200, 180, 255, 25)),
]
for cx, cy, radius, color in bg_circles:
    bg_draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=color)
bg_layer = bg_layer.filter(ImageFilter.GaussianBlur(40))
img = Image.alpha_composite(img, bg_layer)
draw = ImageDraw.Draw(img)

# --- Block colors and emojis ---
BLOCKS = [
    ('#FF6B6B', '😊'),
    ('#4ECDC4', '😆'),
    ('#95E77E', '🥰'),
    ('#FFE66D', '😎'),
    ('#C44DFF', '😈'),
    ('#FF9F43', '👻'),
]

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def draw_rounded_rect(draw, xy, radius, fill, shadow=False):
    x0, y0, x1, y1 = xy
    if shadow:
        shadow_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        sd = ImageDraw.Draw(shadow_layer)
        sd.rounded_rectangle([x0+3, y0+3, x1+3, y1+3], radius=radius, fill=(0, 0, 0, 40))
        shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(6))
        img.paste(Image.alpha_composite(Image.new('RGBA', (W, H), (0,0,0,0)), shadow_layer), (0, 0), shadow_layer)
    draw.rounded_rectangle(xy, radius=radius, fill=fill)
    # Glossy highlight
    highlight_h = int((y1 - y0) * 0.4)
    for i in range(highlight_h):
        alpha = int(60 * (1 - i / highlight_h))
        draw.line([(x0 + radius//2, y0 + 2 + i), (x1 - radius//2, y0 + 2 + i)],
                  fill=(255, 255, 255, alpha))

# --- Scattered blocks around edges ---
block_positions = [
    # (x, y, size, rotation_hint, color_index)
    (30, 25, 58, 8, 0),
    (110, 65, 50, -5, 1),
    (45, 130, 45, 12, 2),
    (700, 30, 55, -10, 3),
    (730, 120, 48, 6, 4),
    (650, 80, 42, -8, 5),
    (20, 320, 50, 10, 3),
    (80, 380, 45, -6, 0),
    (700, 310, 52, 8, 2),
    (740, 380, 46, -12, 1),
    (180, 20, 40, -7, 4),
    (600, 20, 44, 9, 5),
    (160, 390, 42, 5, 2),
    (620, 400, 40, -4, 4),
    # More blocks for richness
    (300, 10, 36, 15, 1),
    (480, 15, 38, -11, 0),
    (250, 400, 38, 8, 5),
    (520, 410, 35, -7, 3),
]

# Draw scattered blocks
try:
    emoji_font = ImageFont.truetype("C:/Windows/Fonts/seguiemj.ttf", 24)
except:
    emoji_font = ImageFont.load_default()

for bx, by, size, rot, ci in block_positions:
    color_hex, emoji = BLOCKS[ci % len(BLOCKS)]
    rgb = hex_to_rgb(color_hex)
    fill = rgb + (220,)

    # Create block on separate layer for rotation effect (simulated via position jitter)
    x0, y0 = bx, by
    x1, y1 = bx + size, by + size

    # Shadow
    draw.rounded_rectangle([x0+2, y0+2, x1+2, y1+2], radius=10, fill=(0, 0, 0, 25))
    # Block
    draw.rounded_rectangle([x0, y0, x1, y1], radius=10, fill=fill)
    # Highlight
    hl = int(size * 0.35)
    for i in range(hl):
        a = int(50 * (1 - i / hl))
        draw.line([(x0 + 4, y0 + 2 + i), (x1 - 4, y0 + 2 + i)], fill=(255, 255, 255, a))

    # Emoji centered
    try:
        efont = ImageFont.truetype("C:/Windows/Fonts/seguiemj.ttf", max(size // 2, 16))
        bbox = draw.textbbox((0, 0), emoji, font=efont)
        ew, eh = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text((x0 + (size - ew) // 2, y0 + (size - eh) // 2 - 2), emoji, font=efont, embedded_color=True)
    except:
        pass

# --- Central title area ---
# Semi-transparent white card behind title
card_w, card_h = 500, 200
card_x = (W - card_w) // 2
card_y = (H - card_h) // 2 - 15
card_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
card_draw = ImageDraw.Draw(card_layer)
card_draw.rounded_rectangle(
    [card_x, card_y, card_x + card_w, card_y + card_h],
    radius=30, fill=(255, 255, 255, 80)
)
card_layer = card_layer.filter(ImageFilter.GaussianBlur(2))
img = Image.alpha_composite(img, card_layer)
draw = ImageDraw.Draw(img)

# --- Title text ---
try:
    title_font = ImageFont.truetype("C:/Windows/Fonts/malgunbd.ttf", 72)
except:
    try:
        title_font = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 72)
    except:
        title_font = ImageFont.load_default()

title = "블록 팡!"
bbox = draw.textbbox((0, 0), title, font=title_font)
tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
tx = (W - tw) // 2 + 15  # Offset for explosion emoji
ty = (H - th) // 2 - 30

# Text shadow
draw.text((tx + 2, ty + 2), title, font=title_font, fill=(0, 0, 0, 40))
# Main text
draw.text((tx, ty), title, font=title_font, fill=(50, 50, 60, 255))

# Explosion emoji before title
try:
    boom_font = ImageFont.truetype("C:/Windows/Fonts/seguiemj.ttf", 56)
    boom_bbox = draw.textbbox((0, 0), "💥", font=boom_font)
    bw = boom_bbox[2] - boom_bbox[0]
    draw.text((tx - bw - 8, ty - 5), "💥", font=boom_font, embedded_color=True)
except:
    pass

# --- Subtitle ---
try:
    sub_font = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 22)
except:
    sub_font = ImageFont.load_default()

subtitle = "같은 블록을 모아서 터뜨리자!"
bbox = draw.textbbox((0, 0), subtitle, font=sub_font)
sw, sh = bbox[2] - bbox[0], bbox[3] - bbox[1]
sx = (W - sw) // 2
sy = ty + th + 25

draw.text((sx, sy), subtitle, font=sub_font, fill=(120, 110, 140, 255))

# --- Small sparkle dots ---
sparkles = [(200, 150), (600, 140), (350, 380), (450, 50), (150, 300), (660, 280)]
for sx, sy in sparkles:
    size = random.randint(2, 5)
    alpha = random.randint(100, 200)
    draw.ellipse([sx-size, sy-size, sx+size, sy+size], fill=(255, 255, 255, alpha))

# --- Save ---
final = img.convert('RGB')
final.save('C:/startcoding/block-pop-game/thumbnail.png', quality=95)
print("Done! thumbnail.png saved (800x450)")
