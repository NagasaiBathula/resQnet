import os
from PIL import Image, ImageDraw, ImageFont

def make_gradient_image(width, height, color1, color2):
    # Create a base image
    base = Image.new("RGBA", (width, height), color1)
    top = Image.new("RGBA", (width, height), color2)
    
    # Create a vertical gradient mask
    mask = Image.new("L", (width, height))
    draw = ImageDraw.Draw(mask)
    for y in range(height):
        # Scale gradient factor
        factor = int((y / height) * 255)
        draw.line((0, y, width, y), fill=factor)
        
    # Composite the two images using the mask
    return Image.composite(top, base, mask)

def generate_assets():
    print("Generating PWA PNG assets...")
    
    # Paths
    icons_dir = os.path.join("public", "icons")
    screenshots_dir = os.path.join("public", "screenshots")
    
    os.makedirs(icons_dir, exist_ok=True)
    os.makedirs(screenshots_dir, exist_ok=True)
    
    # 1. Generate Icon 192x192
    print("Generating icon-192.png...")
    img192 = make_gradient_image(192, 192, (239, 68, 68, 255), (15, 23, 42, 255))
    draw192 = ImageDraw.Draw(img192)
    # Draw a white emergency cross
    draw192.rectangle([46, 76, 146, 116], fill=(255, 255, 255, 255))
    draw192.rectangle([76, 46, 116, 146], fill=(255, 255, 255, 255))
    img192.save(os.path.join(icons_dir, "icon-192.png"), "PNG")
    
    # 2. Generate Icon 512x512
    print("Generating icon-512.png...")
    img512 = make_gradient_image(512, 512, (239, 68, 68, 255), (15, 23, 42, 255))
    draw512 = ImageDraw.Draw(img512)
    # Draw a larger white cross
    draw512.rectangle([128, 208, 384, 304], fill=(255, 255, 255, 255))
    draw512.rectangle([208, 128, 304, 384], fill=(255, 255, 255, 255))
    img512.save(os.path.join(icons_dir, "icon-512.png"), "PNG")
    
    # 3. Generate Dashboard Screenshot 1280x720
    print("Generating screenshots/home.png...")
    screenshot = Image.new("RGBA", (1280, 720), (9, 9, 11, 255)) # Dark zinc background
    draw_ss = ImageDraw.Draw(screenshot)
    
    # Draw sidebar (left)
    draw_ss.rectangle([0, 0, 240, 720], fill=(24, 24, 27, 255))
    # Sidebar divider
    draw_ss.line((240, 0, 240, 720), fill=(39, 39, 42, 255), width=1)
    
    # Draw Header (top)
    draw_ss.rectangle([240, 0, 1280, 56], fill=(18, 18, 20, 255))
    draw_ss.line((240, 56, 1280, 56), fill=(39, 39, 42, 255), width=1)
    
    # Mock some text/dashboard items
    # Sidebar items
    for i in range(5):
        y_pos = 100 + i * 50
        draw_ss.rectangle([20, y_pos, 220, y_pos + 32], fill=(39, 39, 42, 255))
        
    # Main content widgets
    # Card 1: Active Incidents
    draw_ss.rectangle([270, 90, 500, 220], fill=(24, 24, 27, 255), outline=(39, 39, 42, 255), width=1)
    draw_ss.rectangle([290, 110, 330, 150], fill=(239, 68, 68, 50))
    # Card 2: Responders
    draw_ss.rectangle([530, 90, 760, 220], fill=(24, 24, 27, 255), outline=(39, 39, 42, 255), width=1)
    draw_ss.rectangle([550, 110, 590, 150], fill=(59, 130, 246, 50))
    # Card 3: Stockpiles
    draw_ss.rectangle([790, 90, 1020, 220], fill=(24, 24, 27, 255), outline=(39, 39, 42, 255), width=1)
    draw_ss.rectangle([810, 110, 850, 150], fill=(34, 197, 94, 50))
    # Card 4: Uptime
    draw_ss.rectangle([1050, 90, 1250, 220], fill=(24, 24, 27, 255), outline=(39, 39, 42, 255), width=1)
    draw_ss.rectangle([1070, 110, 1110, 150], fill=(234, 179, 8, 50))
    
    # Large Map Container (bottom area)
    draw_ss.rectangle([270, 250, 1250, 680], fill=(15, 23, 42, 255), outline=(51, 65, 85, 255), width=2)
    # Draw Map grid lines/markers
    for x in range(300, 1200, 100):
        draw_ss.line((x, 250, x, 680), fill=(30, 41, 59, 255), width=1)
    for y in range(300, 650, 100):
        draw_ss.line((270, y, 1250, y), fill=(30, 41, 59, 255), width=1)
        
    # Mock marker pins on map
    draw_ss.ellipse([500, 350, 520, 370], fill=(239, 68, 68, 255)) # Incident Red Marker
    draw_ss.ellipse([800, 420, 820, 440], fill=(34, 197, 94, 255)) # Resource Green Marker
    draw_ss.ellipse([700, 500, 720, 520], fill=(59, 130, 246, 255)) # Team Blue Marker
    
    screenshot.save(os.path.join(screenshots_dir, "home.png"), "PNG")
    print("All PWA PNG assets created successfully.")

if __name__ == "__main__":
    generate_assets()
