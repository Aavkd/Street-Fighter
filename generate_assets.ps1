$env:GEMINI_API_KEY = "AIzaSyB8X8SGdz-zVBIePlG9vQ75Rn-tFDPU1e4"
$UV = "C:\Users\speee\.local\bin\uv.exe"
$SCRIPT = "C:\Users\speee\AppData\Roaming\npm\node_modules\openclaw\skills\nano-banana-pro\scripts\generate_image.py"
$BASE_DIR = "D:\Documents\PROJECTS\SF_Clone\public\assets"

# Characters - Samurai
& $UV run $SCRIPT --prompt "Pixel art sprite sheet of a cyberpunk samurai idling, breathing stance, side view, white background, 4 frames" --filename "$BASE_DIR\sprites\samurai\idle.png" --resolution 1K
& $UV run $SCRIPT --prompt "Pixel art sprite sheet of a cyberpunk samurai walking cycle, side view, white background, 6 frames" --filename "$BASE_DIR\sprites\samurai\walk.png" --resolution 1K
& $UV run $SCRIPT --prompt "Pixel art sprite sheet of a cyberpunk samurai katana slash attack, side view, white background, 3 frames" --filename "$BASE_DIR\sprites\samurai\attack.png" --resolution 1K
& $UV run $SCRIPT --prompt "Pixel art sprite of a cyberpunk samurai taking damage, hit reaction, side view, white background" --filename "$BASE_DIR\sprites\samurai\hit.png" --resolution 1K

# Characters - Cyborg
& $UV run $SCRIPT --prompt "Pixel art sprite sheet of a heavy cyberpunk cyborg idling, mechanical breathing, side view, white background, 4 frames" --filename "$BASE_DIR\sprites\cyborg\idle.png" --resolution 1K
& $UV run $SCRIPT --prompt "Pixel art sprite sheet of a heavy cyberpunk cyborg walking cycle, heavy steps, side view, white background, 6 frames" --filename "$BASE_DIR\sprites\cyborg\walk.png" --resolution 1K
& $UV run $SCRIPT --prompt "Pixel art sprite sheet of a heavy cyberpunk cyborg punch attack, side view, white background, 3 frames" --filename "$BASE_DIR\sprites\cyborg\attack.png" --resolution 1K
& $UV run $SCRIPT --prompt "Pixel art sprite of a heavy cyberpunk cyborg taking damage, hit reaction, side view, white background" --filename "$BASE_DIR\sprites\cyborg\hit.png" --resolution 1K

# Stages (Clean)
& $UV run $SCRIPT --prompt "Pixel art fighting game stage, cyberpunk dojo rooftop, night city background, empty, no characters, no hud" --filename "$BASE_DIR\stage_dojo_clean.png" --resolution 2K
& $UV run $SCRIPT --prompt "Pixel art fighting game stage, cyberpunk slums alleyway, rain, neon signs, empty, no characters, no hud" --filename "$BASE_DIR\stage_slums_clean.png" --resolution 2K

# UI
& $UV run $SCRIPT --prompt "Pixel art cyberpunk health bar frame, empty container, green and pink digital style, transparent background" --filename "$BASE_DIR\ui_healthbar_frame.png" --resolution 1K
& $UV run $SCRIPT --prompt "Pixel art cyberpunk timer background, digital clock box, glitched style, transparent background" --filename "$BASE_DIR\ui_timer_bg.png" --resolution 1K
