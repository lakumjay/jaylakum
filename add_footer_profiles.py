#!/usr/bin/env python3
import os

TARGET_DIRS = [
    "/Applications/XAMPP/xamppfiles/htdocs/jaylakum",
    "/Users/jay/Documents/GitHub/jaylakum"
]

EN_OLD_FOOTER = '<a href="mailto:jay@jaylakum.com">jay@jaylakum.com</a>'
EN_NEW_FOOTER = """<a href="mailto:jay@jaylakum.com">jay@jaylakum.com</a>
      <a href="https://wa.me/916353116138?text=Hi%20Jay,%20I%20need%20help%20with%20my%20webshop%20speed" target="_blank" rel="noopener" style="color:#25D366;font-weight:600">💬 WhatsApp</a>
      <a href="https://www.linkedin.com/in/lakum-jay/" target="_blank" rel="noopener me">LinkedIn</a>
      <a href="https://github.com/lakumjay" target="_blank" rel="noopener me">GitHub</a>
      <a href="https://dev.to/lakum_jay" target="_blank" rel="noopener me">DEV.to</a>"""

NL_OLD_FOOTER = '<p style="margin:0">Betaalmethoden: iDEAL, SEPA, Mollie, Creditcard</p>'
NL_NEW_FOOTER = """<p style="margin:0 0 6px"><a href="https://www.linkedin.com/in/lakum-jay/" target="_blank" rel="noopener me">LinkedIn</a> &middot; <a href="https://github.com/lakumjay" target="_blank" rel="noopener me">GitHub</a> &middot; <a href="https://dev.to/lakum_jay" target="_blank" rel="noopener me">DEV.to</a></p>
        <p style="margin:0">Betaalmethoden: iDEAL, SEPA, Mollie, Creditcard</p>"""

for base_dir in TARGET_DIRS:
    print(f"=== Adding footer links in {base_dir} ===")

    # 1. English index
    for fname in ["index.html", "index.php"]:
        fpath = os.path.join(base_dir, fname)
        if not os.path.exists(fpath):
            continue
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()

        # If not already has DEV.to in footer nav
        if '<a href="https://dev.to/lakum_jay"' not in content:
            # check if EN_OLD_FOOTER is there
            content = content.replace(EN_OLD_FOOTER, EN_NEW_FOOTER)

        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated footer in {fname}")

    # 2. Dutch pages
    dutch_files = ["nl/index.html", "nl/index.php"]
    for c in ["amsterdam", "rotterdam", "utrecht", "den-haag", "eindhoven"]:
        dutch_files.extend([f"nl/{c}/index.html", f"nl/{c}/index.php"])

    for rel_path in dutch_files:
        fpath = os.path.join(base_dir, rel_path)
        if not os.path.exists(fpath):
            continue
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()

        if '<a href="https://dev.to/lakum_jay"' not in content:
            content = content.replace(NL_OLD_FOOTER, NL_NEW_FOOTER)

        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated footer in {rel_path}")

print("Footer profile links updated across all files!")
