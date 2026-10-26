#!/usr/bin/env python3
import os
import re

HTDOCS = "/Applications/XAMPP/xamppfiles/htdocs/jaylakum"

def fix_90_percent():
    target = "In 90% van de gevallen"
    replacement = "In de praktijk zien we dat de oorzaak vrijwel altijd bij server-side caching of trage webhook afhandeling ligt, en zelden bij Mollie of de bank zelf:"
    
    files_to_fix = [
        os.path.join(HTDOCS, "blog/mollie-ideal-checkout-storing-oplossen/index.html"),
        os.path.join(HTDOCS, "blog/mollie-ideal-checkout-storing-oplossen/index.php"),
        os.path.join(HTDOCS, "index.html"),
        os.path.join(HTDOCS, "index.php"),
        os.path.join(HTDOCS, "add_two_case_studies.py")
    ]
    
    for fpath in files_to_fix:
        if os.path.exists(fpath):
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
            if target in content:
                # Replace with full sentence replacement
                content = re.sub(
                    r"In 90% van de gevallen ligt de schuld niet bij Mollie of de bank, maar bij server-side caching en trage webhook afhandeling:",
                    replacement,
                    content
                )
                # also fallback simple replace
                content = content.replace(target, "In de praktijk")
                with open(fpath, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"✓ Removed 90% statement in {fpath}")

def update_build_static_blog():
    fpath = os.path.join(HTDOCS, "build_static_blog.py")
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update render_blog_index to include image in every card
    old_card = """        <article class="card" style="display:flex;flex-direction:column;justify-content:space-between">
          <div>
            <span class="p-cat">{a['category']}</span>"""

    new_card = """        <article class="card" style="display:flex;flex-direction:column;justify-content:space-between">
          <div>
            <a href="/blog/{slug}/" style="display:block;overflow:hidden;border-radius:8px;margin-bottom:14px;background:var(--bg-soft)">
              <img src="{a.get('image', '/favicon.svg')}" alt="{a.get('imageAlt', a['title'])}" width="600" height="338" style="aspect-ratio:16/9;width:100%;height:auto;object-fit:cover;display:block;border-radius:8px;transition:transform .2s ease;" loading="lazy" />
            </a>
            <span class="p-cat">{a['category']}</span>"""

    if old_card in content:
        content = content.replace(old_card, new_card)

    # 2. Update related_html in render_article_page to include image
    old_related = """        <article class="card post-card" style="display:flex;flex-direction:column;justify-content:space-between">
          <div>
            <span class="p-cat">{r['category']}</span>"""

    new_related = """        <article class="card post-card" style="display:flex;flex-direction:column;justify-content:space-between">
          <div>
            <a href="/blog/{r_slug}/" style="display:block;overflow:hidden;border-radius:8px;margin-bottom:12px;background:var(--bg-soft)">
              <img src="{r.get('image', '/favicon.svg')}" alt="{r.get('imageAlt', r['title'])}" width="600" height="338" style="aspect-ratio:16/9;width:100%;height:auto;object-fit:cover;display:block;border-radius:8px;" loading="lazy" />
            </a>
            <span class="p-cat">{r['category']}</span>"""

    if old_related in content:
        content = content.replace(old_related, new_related)

    with open(fpath, "w", encoding="utf-8") as f:
        f.write(content)
    print("✓ Updated build_static_blog.py with card images")

if __name__ == "__main__":
    fix_90_percent()
    update_build_static_blog()
