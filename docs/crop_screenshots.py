#!/usr/bin/env python3
"""
Crop focused screenshots from the full dashboard capture for document embedding.
"""

from PIL import Image
import os

img = Image.open("/Users/sheshagiri/jeevan air/screenshots/full_dashboard.png")
width, height = img.size
print(f"Source image size: {width}x{height}")

out_dir = "/Users/sheshagiri/jeevan air/screenshots"
os.makedirs(out_dir, exist_ok=True)

# 1. Header & Stat Cards (Top area)
# x: 260 to 1570, y: 0 to 240
box_header = (260, 0, 1570, 240)
img.crop(box_header).save(f"{out_dir}/sc_header_stats.png")

# 2. Camera Feed Viewport (Left column top)
# x: 260 to 1030, y: 550 to 950
box_cam = (260, 550, 1030, 950)
img.crop(box_cam).save(f"{out_dir}/sc_camera_feed.png")

# 3. Tactical Sector Map (Left column middle)
# x: 260 to 1030, y: 960 to 1520
box_map = (260, 960, 1030, 1520)
img.crop(box_map).save(f"{out_dir}/sc_tactical_map.png")

# 4. Drone Telemetry Card (Right column top)
# x: 1040 to 1570, y: 550 to 950
box_drone = (1040, 550, 1570, 950)
img.crop(box_drone).save(f"{out_dir}/sc_drone_telemetry.png")

# 5. Alerts Panel (Right column middle)
# x: 1040 to 1570, y: 960 to 1520
box_alerts = (1040, 960, 1570, 1520)
img.crop(box_alerts).save(f"{out_dir}/sc_alerts_panel.png")

# 6. AI Inference & Multi-Modal Fusion Panel (Bottom)
# x: 260 to 1570, y: 1530 to 1920
box_ai = (260, 1530, 1570, 1920)
img.crop(box_ai).save(f"{out_dir}/sc_ai_panel.png")

print("All focused screenshots cropped successfully.")
