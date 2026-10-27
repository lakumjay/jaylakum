#!/usr/bin/env python3
import os
import re

TARGET_DIRS = [
    "/Applications/XAMPP/xamppfiles/htdocs/jaylakum",
    "/Users/jay/Documents/GitHub/jaylakum"
]

NEW_SAME_AS_JSON = """      "sameAs": [
        "https://github.com/lakumjay",
        "https://www.linkedin.com/in/lakum-jay/"
      ]"""

for base_dir in TARGET_DIRS:
    print(f"=== Processing {base_dir} ===")

    # 1. Update index.html & index.php
    for fname in ["index.html", "index.php"]:
        fpath = os.path.join(base_dir, fname)
        if not os.path.exists(fpath):
            continue
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()

        # Update sameAs in Person schema
        content = re.sub(
            r'"sameAs":\s*\[\s*"https://github\.com/lakumjay"\s*\]',
            NEW_SAME_AS_JSON.strip(),
            content
        )

        # Update footer with LinkedIn & GitHub rel="me" if not present
        if 'https://www.linkedin.com/in/lakum-jay/' not in content:
            content = content.replace(
                '<a href="https://wa.me/916353116138?text=Hi%20Jay,%20I%20need%20help%20with%20my%20webshop%20speed" target="_blank" rel="noopener" style="color:#25D366;font-weight:600">💬 WhatsApp: +91 6353116138</a>',
                '<a href="https://wa.me/916353116138?text=Hi%20Jay,%20I%20need%20help%20with%20my%20webshop%20speed" target="_blank" rel="noopener" style="color:#25D366;font-weight:600">💬 WhatsApp: +91 6353116138</a>\n      <a href="https://www.linkedin.com/in/lakum-jay/" target="_blank" rel="noopener me">LinkedIn</a>\n      <a href="https://github.com/lakumjay" target="_blank" rel="noopener me">GitHub</a>'
            )

        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {fname}")

    # 2. Update Dutch files: nl/index, and nl/{cities}/index
    dutch_files = ["nl/index.html", "nl/index.php"]
    for c in ["amsterdam", "rotterdam", "utrecht", "den-haag", "eindhoven"]:
        dutch_files.extend([f"nl/{c}/index.html", f"nl/{c}/index.php"])

    for rel_path in dutch_files:
        fpath = os.path.join(base_dir, rel_path)
        if not os.path.exists(fpath):
            continue
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()

        # Add sameAs to Person schema in Dutch pages
        # Look for Person schema block
        pattern = r'("@type":\s*"Person",\s*"@id":\s*"https://jaylakum\.com/#person",\s*"name":\s*"Jay Lakum",\s*"jobTitle":\s*"[^"]*",\s*"url":\s*"[^"]*",\s*"email":\s*"jay@jaylakum\.com")'
        replacement = r'\1,\n      "sameAs": [\n        "https://github.com/lakumjay",\n        "https://www.linkedin.com/in/lakum-jay/"\n      ]'

        if '"https://www.linkedin.com/in/lakum-jay/"' not in content:
            content = re.sub(pattern, replacement, content)

        # Update footer with LinkedIn & GitHub links
        if 'https://www.linkedin.com/in/lakum-jay/' not in content:
            content = content.replace(
                '<p style="margin:0">Betaalmethoden: iDEAL, SEPA, Mollie, Creditcard</p>',
                '<p style="margin:0 0 6px"><a href="https://www.linkedin.com/in/lakum-jay/" target="_blank" rel="noopener me">LinkedIn</a> &middot; <a href="https://github.com/lakumjay" target="_blank" rel="noopener me">GitHub</a></p>\n        <p style="margin:0">Betaalmethoden: iDEAL, SEPA, Mollie, Creditcard</p>'
            )

        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {rel_path}")

print("All Person sameAs schemas and LinkedIn links updated successfully!")
