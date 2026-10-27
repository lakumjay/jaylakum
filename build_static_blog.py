#!/usr/bin/env python3
"""
Build standalone, crawlable static HTML pages for all blog articles on jaylakum.com.
Eliminates SPA hash-URL indexing limitations by providing dedicated /blog/<slug>/ pages
with full server-rendered markup, JSON-LD schema, canonical tags, and internal linking.
"""

import os
import re
import json

BASE_URL = "https://jaylakum.com"
HTDOCS = "/Applications/XAMPP/xamppfiles/htdocs/jaylakum"
BLOG_DIR = os.path.join(HTDOCS, "blog")

def get_articles_data():
    articles_json_path = os.path.join(HTDOCS, "articles_data.json")
    if os.path.exists(articles_json_path):
        with open(articles_json_path, "r", encoding="utf-8") as f:
            return json.load(f)
    
    index_path = os.path.join(HTDOCS, "index.html")
    with open(index_path, "r", encoding="utf-8") as f:
        text = f.read()
    
    start = text.find("var ARTICLES = [")
    if start == -1:
        if os.path.exists("/tmp/articles.json"):
            with open("/tmp/articles.json", "r", encoding="utf-8") as f:
                return json.load(f)
        return []
    
    sub = text[start:]
    end_rel = sub.find("];")
    js_code = sub[:end_rel+2]
    
    # Write to temp file and run node to evaluate and output JSON cleanly
    import subprocess
    tmp_js = "/tmp/parse_articles.js"
    with open(tmp_js, "w", encoding="utf-8") as tf:
        tf.write(js_code + "\nconsole.log(JSON.stringify(ARTICLES));\n")
    
    res = subprocess.run(["node", tmp_js], capture_output=True, text=True)
    if res.returncode == 0 and res.stdout.strip():
        data = json.loads(res.stdout.strip())
        with open("/tmp/articles.json", "w", encoding="utf-8") as jf:
            json.dump(data, jf, indent=2)
        return data
        
    if os.path.exists("/tmp/articles.json"):
        with open("/tmp/articles.json", "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def render_article_page(article, all_articles):
    slug = article["slug"]
    title = article["title"]
    category = article["category"]
    date_str = article["date"]
    read_str = article["read"]
    image = article.get("image", "")
    image_alt = article.get("imageAlt", title)
    excerpt = article.get("excerpt", "")
    body = article.get("body", "")
    
    is_dutch = any(w in slug for w in ["mollie", "shopify-apps-vertragen", "webshop-klaarmaken", "nederland", "trage", "postnl", "winkelwagen"]) or any(w in category.lower() for w in ["nederland", "ideal", "mollie", "postnl"])
    lang = "nl-NL" if is_dutch else "en"
    
    # Internal linking check for Dutch article
    if is_dutch:
        if "/nl/" not in body:
            body += '<p>Bekijk voor directe ondersteuning in Nederland mijn <a href="/nl/">Shopify & WooCommerce diensten in Nederland</a>.</p>'
        if "/nl/amsterdam/" not in body and "/nl/rotterdam/" not in body and "/nl/utrecht/" not in body and "/nl/den-haag/" not in body and "/nl/eindhoven/" not in body:
            body = body.replace(
                "<h2>Gratis Technische Mini-Audit voor Jouw Webshop</h2>",
                "<h2>Directe Samenwerking in Nederland</h2><p>Als freelance <a href='/nl/amsterdam/'>Shopify specialist in Amsterdam</a> en de rest van Nederland help ik webshops met maatwerk code en snelheid zonder dure abonnementen.</p><h2>Gratis Technische Mini-Audit voor Jouw Webshop</h2>"
            )

    # Next / related articles (up to 3)
    related = [a for a in all_articles if a["slug"] != slug][:3]
    related_html = ""
    for r in related:
        r_slug = "webshop-klaarmaken-feestdagen" if r["slug"] == "nederland-heeft-nu-ook-een-dopaminesite-ni" else r["slug"]
        related_html += f"""
        <article class="card post-card" style="display:flex;flex-direction:column;justify-content:space-between">
          <div>
            <a href="/blog/{r_slug}/" style="display:block;overflow:hidden;border-radius:8px;margin-bottom:12px;background:var(--bg-soft)">
              <img src="{r.get('image', '/favicon.svg')}" alt="{r.get('imageAlt', r['title'])}" width="600" height="338" style="aspect-ratio:16/9;width:100%;height:auto;object-fit:cover;display:block;border-radius:8px;" loading="lazy" />
            </a>
            <span class="p-cat">{r['category']}</span>
            <h3 style="font-size:18px;margin:8px 0"><a href="/blog/{r_slug}/">{r['title']}</a></h3>
            <p style="font-size:14px;color:var(--ink-soft);line-height:1.5;margin-bottom:12px">{r['excerpt'][:120]}...</p>
          </div>
          <div>
            <p class="post-meta" style="font-size:13px;color:var(--ink-faint);margin-bottom:8px">{r['date']} · {r['read']}</p>
            <a class="more" href="/blog/{r_slug}/" style="font-size:14px;font-weight:600;color:var(--gold)">Read article →</a>
          </div>
        </article>
        """

    canonical_slug = "webshop-klaarmaken-feestdagen" if slug == "nederland-heeft-nu-ook-een-dopaminesite-ni" else slug
    canonical_url = f"{BASE_URL}/blog/{canonical_slug}/"
    escaped_title = title.replace('"', '&quot;')
    escaped_excerpt = excerpt.replace('"', '&quot;')
    if is_dutch:
        hreflang_tags = f"""<link rel="alternate" hreflang="nl-NL" href="{canonical_url}" />
<link rel="alternate" hreflang="nl" href="{canonical_url}" />
<link rel="alternate" hreflang="x-default" href="{canonical_url}" />"""
    else:
        hreflang_tags = f"""<link rel="alternate" hreflang="en" href="{canonical_url}" />
<link rel="alternate" hreflang="x-default" href="{canonical_url}" />"""



    cta_heading = "Hulp nodig bij jouw webshop?" if is_dutch else "Need this fixed on your store?"
    cta_text = "Stuur me een bericht met je webshop URL voor een gratis mini-audit en vaste prijs vooraf." if is_dutch else "Forms aren't for everyone. Email me directly with your store URL and what's broken — I reply within 24 hours."
    cta_btn = "Email jay@jaylakum.com" if not is_dutch else "Neem direct contact op"

    html = f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="color-scheme" content="light dark" />

<title>{title} | Jay Lakum</title>
<meta name="description" content="{excerpt}" />
<meta name="author" content="Jay Lakum" />
<link rel="canonical" href="{canonical_url}" />
{hreflang_tags}

<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="alternate icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" href="/favicon.svg" />

<!-- Open Graph / Social -->
<meta property="og:type" content="article" />
<meta property="og:url" content="{canonical_url}" />
<meta property="og:site_name" content="Jay Lakum — Webshop Performance & Development" />
<meta property="og:title" content="{title}" />
<meta property="og:description" content="{excerpt}" />
<meta property="og:image" content="{BASE_URL}/og-image.svg" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{title}" />
<meta name="twitter:description" content="{excerpt}" />
<meta name="twitter:image" content="{BASE_URL}/og-image.svg" />

<!-- Structured Data (JSON-LD) -->
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@graph": [
    {{
      "@type": "BlogPosting",
      "@id": "{canonical_url}#article",
      "headline": "{escaped_title}",
      "description": "{escaped_excerpt}",
      "datePublished": "2026-10-26T10:00:00+01:00",
      "dateModified": "2026-10-26T18:00:00+01:00",
      "inLanguage": "{lang}",
      "mainEntityOfPage": "{canonical_url}",
      "author": {{
        "@type": "Person",
        "name": "Jay Lakum",
        "url": "{BASE_URL}/",
        "jobTitle": "Senior Webshop & Performance Developer"
      }},
      "publisher": {{
        "@type": "Organization",
        "name": "Jay Lakum",
        "url": "{BASE_URL}/",
        "logo": {{
          "@type": "ImageObject",
          "url": "{BASE_URL}/favicon.svg"
        }}
      }}
    }},
    {{
      "@type": "BreadcrumbList",
      "itemListElement": [
        {{ "@type": "ListItem", "position": 1, "name": "Home", "item": "{BASE_URL}/" }},
        {{ "@type": "ListItem", "position": 2, "name": "Blog", "item": "{BASE_URL}/blog/" }},
        {{ "@type": "ListItem", "position": 3, "name": "{escaped_title}" }}
      ]
    }}
  ]
}}
</script>

<style>
  :root{{
    --bg:#FAF7F1;
    --bg-soft:#F3EEE3;
    --card:#FFFFFF;
    --ink:#1C1A17;
    --ink-soft:#423E37;
    --gold-btn:#745218;
    --gold-btn-text:#FFFFFF;
    --ink-faint:#595347;
    --gold:#684B1B;
    --gold-deep:#553D16;
    --gold-soft:#EFE6D2;
    --line:#E3DCCB;
    --line-strong:#CFC4A6;
    --shadow:0 10px 30px rgba(28,26,23,.08);
    --radius:10px;
    --serif:Georgia,'Iowan Old Style','Times New Roman',serif;
    --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  }}
  @media(prefers-color-scheme:dark){{
    :root{{
      --bg:#171410;
      --bg-soft:#1F1B15;
      --card:#211C16;
      --ink:#EDE6D6;
      --ink-soft:#D4CBBC;
      --gold-btn:#E5BE72;
      --gold-btn-text:#171410;
      --ink-faint:#B5A894;
      --gold:#E5BE72;
      --gold-deep:#F0CE8A;
      --gold-soft:#2E2718;
      --line:#37301F;
      --line-strong:#4A4028;
      --shadow:0 10px 30px rgba(0,0,0,.45);
    }}
  }}
  *{{box-sizing:border-box}}
  html{{scroll-behavior:smooth}}
  body{{
    margin:0;
    font-family:var(--sans);
    background:var(--bg);
    color:var(--ink);
    line-height:1.65;
    -webkit-font-smoothing:antialiased;
  }}
  a{{color:inherit;text-decoration:none}}
  .wrap{{max-width:1120px;margin:0 auto;padding:0 24px}}
  header.site{{
    position:sticky;
    top:0;
    z-index:100;
    backdrop-filter:blur(14px);
    -webkit-backdrop-filter:blur(14px);
    background:rgba(250,247,241,.88);
    border-bottom:1px solid var(--line);
  }}
  @media(prefers-color-scheme:dark){{
    header.site{{background:rgba(18,17,15,.88)}}
  }}
  .head-row{{display:flex;align-items:center;justify-content:space-between;height:72px}}
  .brand{{font-family:var(--serif);font-size:22px;font-weight:700;letter-spacing:-.02em}}
  .brand span{{color:var(--gold)}}
  .nav-links{{display:flex;gap:22px;align-items:center;font-size:15px}}
  .nav-links a:hover{{color:var(--gold)}}
  .nav-links a.btn{{color:var(--gold-btn-text)!important;background:var(--gold-btn)}}
  .btn{{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    padding:10px 22px;
    border-radius:var(--radius);
    background:var(--gold-btn);
    color:var(--gold-btn-text)!important;
    font-weight:600;
    font-size:15px;
    transition:background .2s;
  }}
  .btn:hover{{background:var(--gold-deep)}}
  
  /* Article Container */
  .article-wrap{{max-width:820px;margin:0 auto;padding:48px 24px 80px}}
  .breadcrumb{{font-size:14px;color:var(--ink-faint);margin-bottom:24px}}
  .breadcrumb a{{color:var(--ink-soft);text-decoration:underline;text-underline-offset:3px}}
  .p-cat{{
    display:inline-block;
    font-size:12px;
    text-transform:uppercase;
    letter-spacing:.08em;
    font-weight:700;
    color:var(--gold);
    background:var(--gold-soft);
    padding:4px 10px;
    border-radius:6px;
    margin-bottom:14px;
  }}
  h1{{font-family:var(--serif);font-size:clamp(28px,4.5vw,42px);line-height:1.2;margin:0 0 16px;letter-spacing:-.02em}}
  .article-meta{{color:var(--ink-faint);font-size:15px;margin-bottom:28px;padding-bottom:18px;border-bottom:1px solid var(--line)}}
  .article-hero{{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;border:1px solid var(--line);border-radius:12px;margin:0 0 36px;background:var(--bg-soft)}}
  .article-body{{font-size:18px;line-height:1.75;color:var(--ink-soft)}}
  .article-body h2{{font-family:var(--serif);font-size:26px;color:var(--ink);margin:42px 0 14px;line-height:1.3;letter-spacing:-.01em}}
  .article-body h3{{font-family:var(--serif);font-size:21px;color:var(--ink);margin:30px 0 10px}}
  .article-body p{{margin:0 0 20px}}
  .article-body ul,.article-body ol{{margin:0 0 22px;padding-left:24px}}
  .article-body li{{margin-bottom:10px}}
  .article-body code{{background:var(--bg-soft);padding:3px 7px;border-radius:5px;font-size:.9em;border:1px solid var(--line)}}
  .article-body a{{color:var(--gold);text-decoration:underline;text-underline-offset:3px;font-weight:600}}
  .article-body a:hover{{color:var(--gold-deep)}}
  
  /* CTA Box */
  .article-cta{{
    margin:50px 0;
    padding:36px;
    background:var(--card);
    border:1px solid var(--line-strong);
    border-left:5px solid var(--gold);
    border-radius:12px;
    box-shadow:var(--shadow);
  }}
  .article-cta h3{{font-family:var(--serif);font-size:24px;margin:0 0 8px}}
  .article-cta p{{font-size:16px;color:var(--ink-soft);margin:0 0 20px}}
  
  /* Related Grid */
  .related-sect{{border-top:1px solid var(--line);padding-top:40px;margin-top:50px}}
  .blog-grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px;margin-top:20px}}
  .card{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:24px;transition:transform .2s,box-shadow .2s}}
  .card:hover{{transform:translateY(-3px);box-shadow:var(--shadow)}}
  
  /* Footer */
  footer.site{{background:var(--bg-soft);border-top:1px solid var(--line);padding:40px 0 60px;font-size:14px;color:var(--ink-faint)}}
  .foot-nav{{display:flex;flex-wrap:wrap;gap:16px 24px;margin-top:16px}}
  .foot-nav a:hover{{color:var(--gold)}}
</style>
</head>
<body>

<header class="site">
  <div class="wrap head-row">
    <a class="brand" href="/">Jay <span>lakum</span></a>
    <nav class="nav-links">
      <a href="/#home">Home</a>
      <a href="/#services">Services</a>
      <a href="/#work">Work</a>
      <a href="/blog/" style="color:var(--gold);font-weight:600">Blog</a>
      <a href="/nl/" style="color:var(--gold);font-weight:600" title="Nederlandse versie">🇳🇱 NL</a>
      <a href="mailto:jay@jaylakum.com" class="btn">Email me</a>
    </nav>
  </div>
</header>

<main>
  <article class="article-wrap">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Home</a> › <a href="/blog/">Blog</a> › <span>{title}</span>
    </nav>

    <span class="p-cat">{category}</span>
    <h1>{title}</h1>
    <p class="article-meta">{date_str} · {read_str} · by Jay Lakum, Senior Webshop & Performance Specialist</p>

    <img class="article-hero" src="{image}" alt="{image_alt}" width="800" height="450" style="aspect-ratio:16/9;width:100%;height:auto;" loading="eager" />

    <div class="article-body">
      {body}
    </div>

    <div class="article-cta">
      <h3>{cta_heading}</h3>
      <p>{cta_text}</p>
      <a class="btn" href="mailto:jay@jaylakum.com">{cta_btn}</a>
    </div>

    <div class="related-sect">
      <h3 style="font-family:var(--serif);font-size:22px">More Technical Field Guides</h3>
      <div class="blog-grid">
        {related_html}
      </div>
    </div>
  </article>
</main>

<footer class="site">
  <div class="wrap">
    <p>© 2026 Jay Lakum · Shopify & WooCommerce Performance Developer</p>
    <div class="foot-nav">
      <a href="/#services">Services</a>
      <a href="/#work">Work</a>
      <a href="/case-study/">Case Study</a>
      <a href="/privacy/">Privacy Policy</a>
      <a href="/blog/">All Articles</a>
      <a href="/nl/" style="color:var(--gold);font-weight:600">Nederlands (NL)</a>
      <a href="/nl/amsterdam/">Amsterdam</a>
      <a href="/nl/rotterdam/">Rotterdam</a>
      <a href="/nl/utrecht/">Utrecht</a>
      <a href="/nl/den-haag/">Den Haag</a>
      <a href="/nl/eindhoven/">Eindhoven</a>
      <a href="mailto:jay@jaylakum.com">jay@jaylakum.com</a>
    </div>
  </div>
</footer>

</body>
</html>
"""
    return html

def render_blog_index(articles):
    cards_html = ""
    for a in articles:
        slug = "webshop-klaarmaken-feestdagen" if a["slug"] == "nederland-heeft-nu-ook-een-dopaminesite-ni" else a["slug"]
        cards_html += f"""
        <article class="card" style="display:flex;flex-direction:column;justify-content:space-between">
          <div>
            <a href="/blog/{slug}/" style="display:block;overflow:hidden;border-radius:8px;margin-bottom:14px;background:var(--bg-soft)">
              <img src="{a.get('image', '/favicon.svg')}" alt="{a.get('imageAlt', a['title'])}" width="600" height="338" style="aspect-ratio:16/9;width:100%;height:auto;object-fit:cover;display:block;border-radius:8px;transition:transform .2s ease;" loading="lazy" />
            </a>
            <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
              <span class="p-cat">{a['category']}</span>
              <span style="font-size:11.5px;font-weight:700;padding:2px 7px;border-radius:4px;background:var(--bg-soft);border:1px solid var(--line);color:var(--ink-soft)">{'🇳🇱 NL' if (any(w in slug for w in ['mollie', 'shopify-apps-vertragen', 'webshop-klaarmaken', 'nederland', 'trage', 'postnl', 'winkelwagen']) or any(w in a.get('category','').lower() for w in ['nederland', 'ideal', 'mollie', 'postnl'])) else '🇬🇧 EN'}</span>
            </div>
            <h2 style="font-size:20px;margin:10px 0;line-height:1.3;font-family:var(--serif)"><a href="/blog/{slug}/">{a['title']}</a></h2>
            <p style="font-size:15px;color:var(--ink-soft);line-height:1.6;margin-bottom:16px">{a['excerpt']}</p>
          </div>
          <div>
            <p class="post-meta" style="font-size:13px;color:var(--ink-faint);margin-bottom:10px">{a['date']} · {a['read']}</p>
            <a class="more" href="/blog/{slug}/" style="font-size:15px;font-weight:600;color:var(--gold)">Read article →</a>
          </div>
        </article>
        """

    html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>Technical E-Commerce & Webshop Performance Blog | Jay Lakum</title>
<meta name="description" content="Field-tested technical guides on Shopify and WooCommerce speed optimization, Core Web Vitals, checkout bugs, and high-conversion e-commerce development." />
<link rel="canonical" href="{BASE_URL}/blog/" />

<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="alternate icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" href="/favicon.svg" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:url" content="{BASE_URL}/blog/" />
<meta property="og:site_name" content="Jay Lakum — Webshop Performance & Development" />
<meta property="og:title" content="Technical E-Commerce & Webshop Performance Blog | Jay Lakum" />
<meta property="og:description" content="Field-tested technical guides on Shopify and WooCommerce speed optimization, Core Web Vitals, and checkout repairs." />
<meta property="og:image" content="{BASE_URL}/og-image.svg" />

<style>
  :root{{
    --bg:#FAF7F1;
    --bg-soft:#F3EEE3;
    --card:#FFFFFF;
    --ink:#1C1A17;
    --ink-soft:#423E37;
    --gold-btn:#745218;
    --gold-btn-text:#FFFFFF;
    --ink-faint:#595347;
    --gold:#684B1B;
    --gold-deep:#553D16;
    --gold-soft:#EFE6D2;
    --line:#E3DCCB;
    --shadow:0 10px 30px rgba(28,26,23,.08);
    --radius:10px;
    --serif:Georgia,'Iowan Old Style','Times New Roman',serif;
    --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  }}
  @media(prefers-color-scheme:dark){{
    :root{{
      --bg:#171410;
      --bg-soft:#1F1B15;
      --card:#211C16;
      --ink:#EDE6D6;
      --ink-soft:#D4CBBC;
      --gold-btn:#E5BE72;
      --gold-btn-text:#171410;
      --ink-faint:#B5A894;
      --gold:#E5BE72;
      --gold-deep:#F0CE8A;
      --gold-soft:#2E2718;
      --line:#37301F;
      --shadow:0 10px 30px rgba(0,0,0,.45);
    }}
  }}
  *{{box-sizing:border-box}}
  body{{margin:0;font-family:var(--sans);background:var(--bg);color:var(--ink);line-height:1.65}}
  a{{color:inherit;text-decoration:none}}
  .wrap{{max-width:1120px;margin:0 auto;padding:0 24px}}
  header.site{{position:sticky;top:0;z-index:100;background:rgba(250,247,241,.92);border-bottom:1px solid var(--line);backdrop-filter:blur(14px)}}
  @media(prefers-color-scheme:dark){{header.site{{background:rgba(18,17,15,.92)}}}}
  .head-row{{display:flex;align-items:center;justify-content:space-between;height:72px}}
  .brand{{font-family:var(--serif);font-size:22px;font-weight:700}}
  .brand span{{color:var(--gold)}}
  .nav-links{{display:flex;gap:22px;align-items:center;font-size:15px}}
  .nav-links a:hover{{color:var(--gold)}}
  .nav-links a.btn{{color:var(--gold-btn-text)!important;background:var(--gold-btn)}}
  .btn{{display:inline-flex;align-items:center;padding:10px 22px;border-radius:var(--radius);background:var(--gold-btn);color:var(--gold-btn-text)!important;font-weight:600;font-size:15px}}
  .btn:hover{{background:var(--gold-deep)}}
  
  .blog-head{{padding:60px 0 40px;text-align:center;max-width:720px;margin:0 auto}}
  .blog-head h1{{font-family:var(--serif);font-size:clamp(32px,4.5vw,46px);margin:0 0 16px;line-height:1.2}}
  .blog-head p{{font-size:18px;color:var(--ink-soft);margin:0}}
  
  .grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:28px;padding-bottom:40px}}
  .card{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:28px;transition:transform .2s,box-shadow .2s}}
  .card:hover{{transform:translateY(-3px);box-shadow:var(--shadow)}}
  .p-cat{{font-size:12px;text-transform:uppercase;letter-spacing:.08em;font-weight:700;color:var(--gold);background:var(--gold-soft);padding:4px 10px;border-radius:6px;display:inline-block}}

  .pagination-wrap{{display:flex;justify-content:center;align-items:center;gap:8px;margin:20px 0 80px;}}
  .page-btn{{
    display:inline-flex;align-items:center;justify-content:center;
    min-width:42px;height:42px;padding:0 16px;border-radius:8px;
    background:var(--card);border:1px solid var(--line);
    color:var(--ink);font-weight:600;font-size:14.5px;cursor:pointer;
    transition:all .15s ease;
  }}
  .page-btn:hover:not(:disabled){{
    border-color:var(--gold);color:var(--gold);transform:translateY(-1px);
  }}
  .page-btn.active{{
    background:var(--gold);border-color:var(--gold);color:#fff!important;pointer-events:none;
  }}
  .page-btn:disabled{{
    opacity:.35;cursor:not-allowed;
  }}
  
  footer.site{{background:var(--bg-soft);border-top:1px solid var(--line);padding:40px 0 60px;font-size:14px;color:var(--ink-faint)}}
  .foot-nav{{display:flex;flex-wrap:wrap;gap:16px 24px;margin-top:16px}}
  .foot-nav a:hover{{color:var(--gold)}}
</style>
</head>
<body>

<header class="site">
  <div class="wrap head-row">
    <a class="brand" href="/">Jay <span>lakum</span></a>
    <nav class="nav-links">
      <a href="/#home">Home</a>
      <a href="/#services">Services</a>
      <a href="/#work">Work</a>
      <a href="/blog/" style="color:var(--gold);font-weight:600">Blog</a>
      <a href="/nl/" style="color:var(--gold);font-weight:600" title="Nederlandse versie">🇳🇱 NL</a>
      <a href="mailto:jay@jaylakum.com" class="btn">Email me</a>
    </nav>
  </div>
</header>

<main class="wrap">
  <div class="blog-head">
    <span class="p-cat">Engineering Notes</span>
    <h1>Faster, Healthier Webshops</h1>
    <p>Field-tested technical guides on Shopify and WooCommerce performance, checkout repairs, Core Web Vitals, and conversion optimization.</p>
  </div>

  <div class="grid" id="blogGrid">
    {cards_html}
  </div>

  <div id="blogPagination" class="pagination-wrap"></div>
</main>

<footer class="site">
  <div class="wrap">
    <p>© 2026 Jay Lakum · Shopify & WooCommerce Performance Developer</p>
    <div class="foot-nav">
      <a href="/#services">Services</a>
      <a href="/#work">Work</a>
      <a href="/case-study/">Case Study</a>
      <a href="/privacy/">Privacy Policy</a>
      <a href="/blog/">All Articles</a>
      <a href="/nl/" style="color:var(--gold);font-weight:600">Nederlands (NL)</a>
      <a href="/nl/amsterdam/">Amsterdam</a>
      <a href="/nl/rotterdam/">Rotterdam</a>
      <a href="/nl/utrecht/">Utrecht</a>
      <a href="/nl/den-haag/">Den Haag</a>
      <a href="/nl/eindhoven/">Eindhoven</a>
      <a href="mailto:jay@jaylakum.com">jay@jaylakum.com</a>
    </div>
  </div>
</footer>

<script>
document.addEventListener('DOMContentLoaded', function(){{
  var grid = document.getElementById('blogGrid');
  if (!grid) return;
  var cards = Array.from(grid.querySelectorAll('.card'));
  var perPage = 6;
  var totalPages = Math.ceil(cards.length / perPage);
  var paginationContainer = document.getElementById('blogPagination');

  if (totalPages <= 1) {{
    if (paginationContainer) paginationContainer.style.display = 'none';
    return;
  }}

  var currentPage = 1;

  function showPage(p) {{
    currentPage = p;
    var start = (p - 1) * perPage;
    var end = start + perPage;

    cards.forEach(function(card, idx){{
      if (idx >= start && idx < end) {{
        card.style.display = 'flex';
      }} else {{
        card.style.display = 'none';
      }}
    }});

    renderPagination();
    if (p > 1) {{
      grid.scrollIntoView({{ behavior: 'smooth', block: 'start' }});
    }}
  }}

  function renderPagination() {{
    paginationContainer.innerHTML = '';

    var prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '&larr; Prev';
    prevBtn.disabled = (currentPage === 1);
    prevBtn.onclick = function(){{ showPage(currentPage - 1); }};
    paginationContainer.appendChild(prevBtn);

    for (var i = 1; i <= totalPages; i++) {{
      (function(pageIdx){{
        var btn = document.createElement('button');
        btn.className = 'page-btn' + (pageIdx === currentPage ? ' active' : '');
        btn.textContent = pageIdx;
        btn.onclick = function(){{ showPage(pageIdx); }};
        paginationContainer.appendChild(btn);
      }})(i);
    }}

    var nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = 'Next &rarr;';
    nextBtn.disabled = (currentPage === totalPages);
    nextBtn.onclick = function(){{ showPage(currentPage + 1); }};
    paginationContainer.appendChild(nextBtn);
  }}

  showPage(1);
}});
</script>

</body>
</html>"""
    return html

def main():
    print("Building static standalone blog pages...")
    os.makedirs(BLOG_DIR, exist_ok=True)
    
    articles = get_articles_data()
    
    # Write blog index
    index_html = render_blog_index(articles)
    with open(os.path.join(BLOG_DIR, "index.html"), "w", encoding="utf-8") as f:
        f.write(index_html)
    with open(os.path.join(BLOG_DIR, "index.php"), "w", encoding="utf-8") as f:
        f.write(index_html)
    print(f"✓ Created {os.path.join(BLOG_DIR, 'index.html')}")
    
    generated_slugs = []
    
    for article in articles:
        orig_slug = article["slug"]
        slugs_to_write = [orig_slug]
        if orig_slug == "nederland-heeft-nu-ook-een-dopaminesite-ni":
            slugs_to_write.append("webshop-klaarmaken-feestdagen")
            
        for s in slugs_to_write:
            art_dir = os.path.join(BLOG_DIR, s)
            os.makedirs(art_dir, exist_ok=True)
            art_html = render_article_page(article, articles)
            with open(os.path.join(art_dir, "index.html"), "w", encoding="utf-8") as f:
                f.write(art_html)
            with open(os.path.join(art_dir, "index.php"), "w", encoding="utf-8") as f:
                f.write(art_html)
            print(f"✓ Created /blog/{s}/index.html")
            if s not in generated_slugs:
                generated_slugs.append(s)
                
    print(f"All {len(generated_slugs)} standalone blog pages generated successfully.")

if __name__ == "__main__":
    main()
