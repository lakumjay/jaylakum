import os
import glob
import re
import subprocess

print("Applying image fixes, mobile navigation responsiveness, and full testing...")

mobile_nav_css = """
  /* Mobile Navigation Fit (Zero Horizontal Overflow) */
  @media (max-width: 768px) {
    .nav, .head-row { gap: 8px !important; }
    .nav-links { gap: 8px !important; }
    .nav-links a:not(.lang-toggle-btn):not(.nav-cta):not([href*="audit"]):not([href*="contact"]) { display: none !important; }
    .nav-links .btn, .nav-links .nav-cta { padding: 6px 12px !important; font-size: 12.5px !important; white-space: nowrap !important; }
    .lang-toggle-btn { padding: 4px 10px !important; font-size: 12px !important; }
  }
"""

# 1. Update nl/ pages (index and 5 cities)
nl_files = glob.glob('nl/**/*.php', recursive=True) + glob.glob('nl/**/*.html', recursive=True)
for fpath in nl_files:
    with open(fpath, 'r', encoding='utf-8') as f:
        c = f.read()
    if 'Mobile Navigation Fit' not in c and '</style>' in c:
        c = c.replace('</style>', mobile_nav_css + '\n</style>')
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f"✓ Added mobile nav CSS to {fpath}")

# 2. Update case-study pages
cs_files = glob.glob('case-study/**/*.php', recursive=True) + glob.glob('case-study/**/*.html', recursive=True)
for fpath in cs_files:
    with open(fpath, 'r', encoding='utf-8') as f:
        c = f.read()
    if 'Mobile Navigation Fit' not in c and '</style>' in c:
        c = c.replace('</style>', mobile_nav_css + '\n</style>')
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f"✓ Added mobile nav CSS to {fpath}")

# 3. Update build_static_blog.py and recompile
with open('build_static_blog.py', 'r', encoding='utf-8') as f:
    bsb = f.read()

if 'Mobile Navigation Fit' not in bsb:
    bsb = bsb.replace('</style>', mobile_nav_css + '\n</style>')
    with open('build_static_blog.py', 'w', encoding='utf-8') as f:
        f.write(bsb)
    print("✓ Added mobile nav CSS to build_static_blog.py")

# Run build_static_blog.py
print("Recompiling static blog...")
subprocess.run(['python3', 'build_static_blog.py'], check=True)

# Sync blog HTML to PHP
for html_file in glob.glob('blog/**/index.html', recursive=True):
    php_file = html_file[:-4] + 'php'
    with open(html_file, 'r', encoding='utf-8') as src:
        c = src.read()
    with open(php_file, 'w', encoding='utf-8') as dst:
        dst.write(c)
print("✓ Synced all blog index.html to index.php")

print("All fixes applied successfully!")
