#!/usr/bin/env python3
"""
Master fix for:
1. Blog images: Clean all &middot; entities in articles_data.json and SVGs so XML parses cleanly and images never break
2. Blog badges: Fix Dutch detection in build_static_blog.py so Rotterdam PostNL article gets 🇳🇱 NL badge
3. Regenerate all blog static pages and sync PHP versions
4. Button CSS: Fix dark-mode contrast bug on .btn-ghost ("See 3 Live Projects" text invisible) and add tactile active click press + smooth hover glow across all pages
"""

import os
import re
import json
import base64
import xml.etree.ElementTree as ET

HTDOCS = "/Applications/XAMPP/xamppfiles/htdocs/jaylakum"

# -------------------------------------------------------------
# STEP 1: Fix articles_data.json SVGs
# -------------------------------------------------------------
articles_json_path = os.path.join(HTDOCS, "articles_data.json")
with open(articles_json_path, "r", encoding="utf-8") as f:
    articles = json.load(f)

for a in articles:
    img = a.get("image", "")
    if img.startswith("data:image/svg+xml;base64,"):
        b64 = img.split(",")[1]
        svg = base64.b64decode(b64).decode("utf-8")
        if "&middot;" in svg or "&amp;middot;" in svg:
            svg = svg.replace("&middot;", "·").replace("&amp;middot;", "·")
            # verify it parses as XML
            ET.fromstring(svg)
            new_b64 = base64.b64encode(svg.encode("utf-8")).decode("utf-8")
            a["image"] = "data:image/svg+xml;base64," + new_b64
            print(f"✓ Fixed SVG XML entity for: {a.get('slug')}")

with open(articles_json_path, "w", encoding="utf-8") as f:
    json.dump(articles, f, indent=2, ensure_ascii=False)

# -------------------------------------------------------------
# STEP 2: Update build_static_blog.py Dutch badge logic
# -------------------------------------------------------------
build_script_path = os.path.join(HTDOCS, "build_static_blog.py")
with open(build_script_path, "r", encoding="utf-8") as f:
    build_code = f.read()

# Fix is_dutch logic
old_is_dutch = 'is_dutch = "Nederland" in category or "nederland" in slug or "webshop-klaarmaken" in slug'
new_is_dutch = 'is_dutch = any(w in slug for w in ["mollie", "shopify-apps-vertragen", "webshop-klaarmaken", "nederland", "trage", "postnl", "winkelwagen"]) or any(w in category.lower() for w in ["nederland", "ideal", "mollie", "postnl"])'
build_code = build_code.replace(old_is_dutch, new_is_dutch)

# Fix badge expression on card
old_badge = "{'🇳🇱 NL' if any(w in slug for w in ['mollie', 'shopify-apps-vertragen', 'webshop-klaarmaken', 'nederland']) else '🇬🇧 EN'}"
new_badge = "{'🇳🇱 NL' if (any(w in slug for w in ['mollie', 'shopify-apps-vertragen', 'webshop-klaarmaken', 'nederland', 'trage', 'postnl', 'winkelwagen']) or any(w in a.get('category','').lower() for w in ['nederland', 'ideal', 'mollie', 'postnl'])) else '🇬🇧 EN'}"
build_code = build_code.replace(old_badge, new_badge)

with open(build_script_path, "w", encoding="utf-8") as f:
    f.write(build_code)

print("✓ Updated build_static_blog.py language badge detection")

# Re-run build_static_blog.py
import subprocess
res = subprocess.run(["python3", build_script_path], cwd=HTDOCS, capture_output=True, text=True)
print(res.stdout)

# Sync all generated blog index.html to index.php
import glob, shutil
for h in glob.glob(os.path.join(HTDOCS, "blog/**/index.html"), recursive=True):
    php_f = h[:-5] + ".php"
    shutil.copyfile(h, php_f)

print("✓ Rebuilt and synced all blog pages")

# -------------------------------------------------------------
# STEP 3: Apply Master Button System across all files
# -------------------------------------------------------------
BUTTON_CSS_BLOCK = """
  /* ============================================================
     PREMIUM BUTTON SYSTEM: High Contrast, Tactile Press, Rich Hover
     ============================================================ */
  .btn, a.btn, button.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: var(--sans);
    font-weight: 700;
    font-size: 14.5px;
    line-height: 1.2;
    padding: 10px 22px;
    border-radius: 999px;
    border: 1.5px solid var(--gold);
    background: var(--gold-btn, #E5BE72);
    color: var(--gold-btn-text, #171410) !important;
    text-decoration: none !important;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
    transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
                box-shadow 0.2s ease,
                background 0.2s ease,
                border-color 0.2s ease,
                color 0.2s ease;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  /* Hover State: Smooth lift + warm golden glow */
  .btn:hover, a.btn:hover, button.btn:hover {
    transform: translateY(-2px);
    background: var(--gold-deep, #F0CE8A) !important;
    border-color: var(--gold-deep, #F0CE8A) !important;
    color: var(--gold-btn-text, #171410) !important;
    box-shadow: 0 8px 24px rgba(229, 190, 114, 0.4) !important;
    text-decoration: none !important;
  }

  /* Active / Click State: Tactile depression feedback (User feels button pressed!) */
  .btn:active, a.btn:active, button.btn:active {
    transform: translateY(1.5px) scale(0.98) !important;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
    transition-duration: 0.04s !important;
  }

  /* Focus Visible for Accessibility */
  .btn:focus-visible, a.btn:focus-visible, button.btn:focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: 3px;
  }

  /* Ghost / Secondary Button (e.g., 'See 3 Live Projects') - Crystal Clear Contrast */
  .btn-ghost, a.btn-ghost, a.btn.btn-ghost,
  .btn-outline, a.btn-outline, a.btn.btn-outline {
    background: transparent !important;
    border: 1.5px solid var(--line-strong, #4A4028) !important;
    color: var(--ink, #EDE6D6) !important;
    box-shadow: none !important;
  }

  /* Ghost Hover State */
  .btn-ghost:hover, a.btn-ghost:hover, a.btn.btn-ghost:hover,
  .btn-outline:hover, a.btn-outline:hover, a.btn.btn-outline:hover {
    background: var(--gold-soft, #2C2517) !important;
    border-color: var(--gold, #E5BE72) !important;
    color: var(--gold, #E5BE72) !important;
    box-shadow: 0 6px 20px rgba(229, 190, 114, 0.25) !important;
    transform: translateY(-2px);
  }

  /* Ghost Active State */
  .btn-ghost:active, a.btn-ghost:active, a.btn.btn-ghost:active,
  .btn-outline:active, a.btn-outline:active, a.btn.btn-outline:active {
    transform: translateY(1.5px) scale(0.98) !important;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2) !important;
    transition-duration: 0.04s !important;
  }

  /* WhatsApp Floating & Header Buttons */
  a[href*="wa.me"].btn, .whatsapp-btn {
    background: #25D366 !important;
    border-color: #25D366 !important;
    color: #FFFFFF !important;
  }
  a[href*="wa.me"].btn:hover, .whatsapp-btn:hover {
    background: #20ba59 !important;
    border-color: #20ba59 !important;
    box-shadow: 0 8px 24px rgba(37, 211, 102, 0.4) !important;
  }
  a[href*="wa.me"].btn:active, .whatsapp-btn:active {
    transform: translateY(1.5px) scale(0.98) !important;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25) !important;
  }
"""

def update_file_button_css(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Remove the bad dark mode override: @media (prefers-color-scheme: dark){ .btn{color:#171410!important} }
    content = content.replace("@media (prefers-color-scheme: dark){ .btn{color:#171410!important} }", "")
    content = content.replace(".btn{color:#171410!important}", "")

    # Clean any conflicting brute-force a.btn rules
    content = re.sub(
        r"\.nav-links a\.btn, \.nav-links a\.nav-cta, a\.btn\{color:#FFFFFF!important;background:var\(--gold-btn, #745218\)\}",
        "/* standard btn active */",
        content
    )
    content = re.sub(
        r"@media \(prefers-color-scheme: dark\)\{\s*\.nav-links a\.btn, \.nav-links a\.nav-cta, a\.btn\{color:#171410!important;background:var\(--gold-btn, #E5BE72\)\}\s*\}",
        "/* standard btn active */",
        content
    )

    # Insert BUTTON_CSS_BLOCK right before </style>
    if "/* PREMIUM BUTTON SYSTEM: High Contrast" not in content:
        content = content.replace("</style>", f"{BUTTON_CSS_BLOCK}\n</style>")
    else:
        # Replace existing button block if already there
        old_btn_regex = r"/\* ============================================================\s*PREMIUM BUTTON SYSTEM.*?/\* WhatsApp Floating & Header Buttons \*/.*?transition-duration: 0\.04s !important;\s*\}"
        content = re.sub(old_btn_regex, BUTTON_CSS_BLOCK.strip(), content, flags=re.DOTALL)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"✓ Applied premium button system to {file_path}")

target_files = [
    "index.html", "index.php",
    "nl/index.html", "nl/index.php",
    "case-study/index.html", "case-study/index.php",
    "nl/case-study/index.html", "nl/case-study/index.php",
    "blog/index.html", "blog/index.php"
]
for c in ["amsterdam", "rotterdam", "utrecht", "den-haag", "eindhoven"]:
    target_files.extend([f"nl/{c}/index.html", f"nl/{c}/index.php"])

for tf in target_files:
    full_p = os.path.join(HTDOCS, tf)
    if os.path.exists(full_p):
        update_file_button_css(full_p)

print("\nAll button hover & click press effects and SVG image fixes deployed successfully!")
