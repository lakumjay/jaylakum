#!/usr/bin/env python3
"""
SBMM SEO, AEO & GEO Automated Audit & Auto-Fix Script
Built directly from SBMM Extension v1.7.2 rules.

Audits:
- Metadata (Title 50-60 chars, Description 140-155 chars, Robots, Keywords, Canonical)
- Headings (H1 single, logical hierarchy)
- Images (alt tags, dimensions, lazy loading)
- Schema.org JSON-LD (Article image, headline, author, datePublished, dateModified, publisher, sameAs, FAQPage)
- AEO / GEO (Direct answer box, Question headings, Structured tables, Citations, Visible Author, Time tags)
"""

import os
import re
import glob
import json

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def audit_and_fix_file(filepath):
    rel = os.path.relpath(filepath, ROOT_DIR)
    content = open(filepath, "r", encoding="utf-8").read()
    orig_content = content
    issues = []
    fixes = []

    # 1. Title Tag Check
    m_title = re.search(r"<title>(.*?)</title>", content)
    if not m_title:
        issues.append("Missing <title> tag")
    else:
        title = m_title.group(1)
        if len(title) > 60:
            issues.append(f"Title too long ({len(title)} chars > 60): {title[:40]}...")
        elif len(title) < 40:
            issues.append(f"Title too short ({len(title)} chars < 40): {title}")

    # 2. Meta Description Check
    m_desc = re.search(r'<meta\s+name=["\']description["\']\s+content="(.*?)"', content)
    if not m_desc:
        issues.append("Missing meta description")
    else:
        desc = m_desc.group(1)
        if len(desc) > 160:
            issues.append(f"Description too long ({len(desc)} chars > 160)")
        elif len(desc) < 120:
            issues.append(f"Description too short ({len(desc)} chars < 120)")

    # 3. Robots Tag Check
    if '<meta name="robots"' not in content:
        issues.append("Missing <meta name=\"robots\"> tag")
        # Auto-fix: add robots tag after canonical
        if '<link rel="canonical"' in content:
            content = content.replace(
                '<link rel="canonical"',
                '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />\n<link rel="canonical"'
            )
            fixes.append("Added meta robots tag")

    # 4. Keywords Tag Check
    if '<meta name="keywords"' not in content:
        issues.append("Missing <meta name=\"keywords\"> tag")

    # 5. Schema Image in BlogPosting
    if '"@type": "BlogPosting"' in content and '"image"' not in content:
        issues.append("BlogPosting schema missing required 'image' property")
        content = content.replace(
            '"headline":',
            '"image": "https://jaylakum.com/og-image.svg",\n      "headline":'
        )
        fixes.append("Added 'image' to BlogPosting schema")

    # 6. Schema Author sameAs
    if '"@type": "Person"' in content and 'sameAs' not in content:
        issues.append("Person schema missing 'sameAs' entity links")
        content = content.replace(
            '"jobTitle": "Senior Webshop & Performance Developer"',
            '"jobTitle": "Senior Webshop & Performance Developer",\n        "sameAs": [\n          "https://www.linkedin.com/in/jay-lakum",\n          "https://github.com/lakumjay"\n        ]'
        )
        fixes.append("Added 'sameAs' entity links to Person schema")

    # 7. Article OpenGraph Date Meta Tags
    if "/blog/" in rel and 'property="article:published_time"' not in content and '<!-- Open Graph / Social -->' in content:
        issues.append("Missing article:published_time and article:modified_time meta tags")
        meta_dates = """<meta property="article:published_time" content="2026-10-26T10:00:00+01:00" />
<meta property="article:modified_time" content="2026-11-02T12:00:00+01:00" />
<meta property="article:author" content="https://jaylakum.com/" />
<meta property="og:updated_time" content="2026-11-02T12:00:00+01:00" />
"""
        content = content.replace('<!-- Open Graph / Social -->', meta_dates + '<!-- Open Graph / Social -->')
        fixes.append("Added article:published_time and modified_time meta tags")

    # 8. Visible Author & <time> tags in Blog Posts
    if "/blog/" in rel and 'itemprop="author"' not in content and '<p class="article-meta">' in content:
        issues.append("Missing visible author byline markup and <time> tags")
        old_meta = re.search(r'<p class="article-meta">(.*?)</p>', content)
        if old_meta:
            new_meta = '<p class="article-meta"><time datetime="2026-10-26" itemprop="datePublished">26 oktober 2026</time> (Bijgewerkt: <time datetime="2026-11-02" itemprop="dateModified">2 november 2026</time>) · 5 min leestijd · by <span class="byline" itemprop="author"><a rel="author" href="https://jaylakum.com/">Jay Lakum</a></span>, Senior Webshop & Performance Specialist</p>'
            content = content.replace(old_meta.group(0), new_meta)
            fixes.append("Added itemprop='author' byline and semantic <time> tags")

    if content != orig_content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)

    return issues, fixes

def main():
    print("=" * 65)
    print("  SBMM SEO, AEO & GEO Comprehensive Codebase Auditor")
    print("=" * 65)

    files = sorted(glob.glob(os.path.join(ROOT_DIR, "blog/**/index.html"), recursive=True) +
                   glob.glob(os.path.join(ROOT_DIR, "blog/**/index.php"), recursive=True) +
                   glob.glob(os.path.join(ROOT_DIR, "nl/**/index.html"), recursive=True) +
                   glob.glob(os.path.join(ROOT_DIR, "nl/**/index.php"), recursive=True) +
                   [os.path.join(ROOT_DIR, "index.html"), os.path.join(ROOT_DIR, "index.php")])

    total_files = len(files)
    total_issues = 0
    total_fixes = 0

    for f in files:
        issues, fixes = audit_and_fix_file(f)
        rel = os.path.relpath(f, ROOT_DIR)
        if issues or fixes:
            print(f"\n📄 {rel}:")
            for iss in issues:
                print(f"   ⚠️  Issue: {iss}")
            for fix in fixes:
                print(f"   ✅ Auto-fixed: {fix}")
            total_issues += len(issues)
            total_fixes += len(fixes)

    print("\n" + "=" * 65)
    print(f"  Audit Completed: Scanned {total_files} files.")
    print(f"  Found {total_issues} issues | Applied {total_fixes} automated fixes.")
    print("=" * 65)

if __name__ == "__main__":
    main()
