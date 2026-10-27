#!/usr/bin/env python3
import os
import re

TARGET_DIRS = [
    "/Applications/XAMPP/xamppfiles/htdocs/jaylakum",
    "/Users/jay/Documents/GitHub/jaylakum"
]

NEW_SAME_AS_JSON = """      "sameAs": [
        "https://github.com/lakumjay",
        "https://www.linkedin.com/in/lakum-jay/",
        "https://dev.to/lakum_jay"
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

        # Update sameAs to include dev.to
        pattern = r'"sameAs":\s*\[\s*"https://github\.com/lakumjay",\s*"https://www\.linkedin\.com/in/lakum-jay/"\s*\]'
        content = re.sub(pattern, NEW_SAME_AS_JSON.strip(), content)

        # Update footer with DEV.to link
        old_foot = '<a href="https://github.com/lakumjay" target="_blank" rel="noopener me">GitHub</a>'
        new_foot = '<a href="https://github.com/lakumjay" target="_blank" rel="noopener me">GitHub</a>\n      <a href="https://dev.to/lakum_jay" target="_blank" rel="noopener me">DEV.to</a>'
        if old_foot in content and 'https://dev.to/lakum_jay' not in content:
            content = content.replace(old_foot, new_foot)

        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {fname}")

    # 2. Update Dutch files
    dutch_files = ["nl/index.html", "nl/index.php"]
    for c in ["amsterdam", "rotterdam", "utrecht", "den-haag", "eindhoven"]:
        dutch_files.extend([f"nl/{c}/index.html", f"nl/{c}/index.php"])

    for rel_path in dutch_files:
        fpath = os.path.join(base_dir, rel_path)
        if not os.path.exists(fpath):
            continue
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()

        pattern = r'"sameAs":\s*\[\s*"https://github\.com/lakumjay",\s*"https://www\.linkedin\.com/in/lakum-jay/"\s*\]'
        content = re.sub(pattern, NEW_SAME_AS_JSON.strip(), content)

        # Update footer with DEV.to link
        old_foot = '<a href="https://github.com/lakumjay" target="_blank" rel="noopener me">GitHub</a>'
        new_foot = '<a href="https://github.com/lakumjay" target="_blank" rel="noopener me">GitHub</a> &middot; <a href="https://dev.to/lakum_jay" target="_blank" rel="noopener me">DEV.to</a>'
        if old_foot in content and 'https://dev.to/lakum_jay' not in content:
            content = content.replace(old_foot, new_foot)

        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {rel_path}")

print("Added DEV.to sameAs and footer links successfully!")
