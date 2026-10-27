#!/usr/bin/env python3
import os
import re

TARGET_DIRS = [
    "/Applications/XAMPP/xamppfiles/htdocs/jaylakum",
    "/Users/jay/Documents/GitHub/jaylakum"
]

WA_CSS = """
  /* Floating Sticky WhatsApp Highlight Button */
  .whatsapp-float{
    position:fixed;
    bottom:28px;
    right:28px;
    z-index:999;
    display:inline-flex;
    align-items:center;
    gap:10px;
    background:#25D366;
    color:#FFFFFF!important;
    padding:10px 20px 10px 14px;
    border-radius:999px;
    font-size:14.5px;
    font-weight:700;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
    text-decoration:none!important;
    box-shadow:0 8px 24px rgba(37,211,102,.45),0 2px 8px rgba(0,0,0,.18);
    transition:transform .2s ease,box-shadow .2s ease;
  }
  .whatsapp-float:hover{
    transform:scale(1.05) translateY(-2px);
    box-shadow:0 12px 30px rgba(37,211,102,.6),0 4px 12px rgba(0,0,0,.22);
    color:#FFFFFF!important;
  }
  .whatsapp-float svg{
    width:24px;
    height:24px;
    flex-shrink:0;
    fill:#FFFFFF;
  }
  .whatsapp-float .wa-pulse{
    position:absolute;
    inset:-3px;
    border-radius:999px;
    border:2px solid #25D366;
    animation:waPulse 2.4s infinite ease-out;
    pointer-events:none;
  }
  @keyframes waPulse{
    0%{transform:scale(1);opacity:.8}
    70%{transform:scale(1.12,1.25);opacity:0}
    100%{transform:scale(1.12,1.25);opacity:0}
  }
  @media(max-width:720px){
    .whatsapp-float{
      bottom:76px;
      right:16px;
      padding:0;
      width:52px;
      height:52px;
      justify-content:center;
      border-radius:50%;
    }
    .whatsapp-float .wa-text{display:none}
    .whatsapp-float svg{width:28px;height:28px}
    .whatsapp-float .wa-pulse{
      inset:-4px;
      border-radius:50%;
    }
    @keyframes waPulse{
      0%{transform:scale(1);opacity:.8}
      70%{transform:scale(1.25);opacity:0}
      100%{transform:scale(1.25);opacity:0}
    }
  }
"""

WA_HTML_EN = """<!-- Floating Sticky WhatsApp Highlight Button -->
<a href="https://wa.me/916353116138?text=Hi%20Jay,%20I%20need%20help%20with%20my%20webshop%20speed" class="whatsapp-float" target="_blank" rel="noopener" aria-label="Chat directly on WhatsApp" title="Chat directly on WhatsApp">
  <span class="wa-pulse"></span>
  <svg viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84a8.19 8.19 0 0 1-5.82 2.41h-.01c-1.42 0-2.82-.37-4.06-1.08l-.29-.17-3.11.82.83-3.03-.19-.3a8.217 8.217 0 0 1-1.26-4.49c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.07-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.77-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.12-.22-.19-.47-.32z"/></svg>
  <span class="wa-text">Chat on WhatsApp</span>
</a>
"""

WA_HTML_NL = """<!-- Floating Sticky WhatsApp Highlight Button -->
<a href="https://wa.me/916353116138?text=Hallo%20Jay,%20ik%20heb%20hulp%20nodig%20met%20mijn%20webshop" class="whatsapp-float" target="_blank" rel="noopener" aria-label="Chat direct via WhatsApp" title="Chat direct via WhatsApp">
  <span class="wa-pulse"></span>
  <svg viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84a8.19 8.19 0 0 1-5.82 2.41h-.01c-1.42 0-2.82-.37-4.06-1.08l-.29-.17-3.11.82.83-3.03-.19-.3a8.217 8.217 0 0 1-1.26-4.49c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.07-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.77-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.12-.22-.19-.47-.32z"/></svg>
  <span class="wa-text">WhatsApp</span>
</a>
"""

# Replace the ugly hospital green badge with theme-accorded luxury colors
OLD_BADGE = '<div class="tag" style="background:#e8f5e9;color:#2e7d32;border-color:#a5d6a7">Resultaatgarantie op basis van vooraf overeengekomen schriftelijke scope</div>'
NEW_BADGE = '<div class="tag" style="background:var(--gold-soft);color:var(--ink);border:1px solid var(--line-strong);font-weight:600">🛡️ Resultaatgarantie op basis van vooraf overeengekomen schriftelijke scope</div>'

for base_dir in TARGET_DIRS:
    print(f"=== Processing {base_dir} ===")
    
    # Process English root
    for fname in ["index.html", "index.php"]:
        fpath = os.path.join(base_dir, fname)
        if not os.path.exists(fpath):
            continue
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()

        # Add CSS if not present
        if ".whatsapp-float" not in content:
            content = content.replace("</style>", f"{WA_CSS}\n</style>", 1)

        # Add Floating button before </body> if not present
        if 'class="whatsapp-float"' not in content:
            content = content.replace("</body>", f"{WA_HTML_EN}\n</body>", 1)

        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {fname}")

    # Process all Dutch files: nl/index, and nl/{amsterdam,rotterdam,utrecht,den-haag,eindhoven}/index
    dutch_files = [
        "nl/index.html", "nl/index.php"
    ]
    for c in ["amsterdam", "rotterdam", "utrecht", "den-haag", "eindhoven"]:
        dutch_files.extend([f"nl/{c}/index.html", f"nl/{c}/index.php"])

    for rel_path in dutch_files:
        fpath = os.path.join(base_dir, rel_path)
        if not os.path.exists(fpath):
            continue
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()

        # 1. Fix the ugly badge color to theme colors
        if OLD_BADGE in content:
            content = content.replace(OLD_BADGE, NEW_BADGE)

        # 2. Add WhatsApp CSS if not present
        if ".whatsapp-float" not in content:
            content = content.replace("</style>", f"{WA_CSS}\n</style>", 1)

        # 3. Add Floating button before </body> if not present
        if 'class="whatsapp-float"' not in content:
            content = content.replace("</body>", f"{WA_HTML_NL}\n</body>", 1)

        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {rel_path}")

print("All badge colors and sticky WhatsApp widgets updated successfully!")
