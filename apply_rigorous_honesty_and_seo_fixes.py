import re
import os
import subprocess

print("Applying rigorous honesty, SEO jargon removal, and Amsterdam title update...")

# 1. Update nl/amsterdam title and meta description
for ext in ['index.php', 'index.html']:
    p = f"nl/amsterdam/{ext}"
    if os.path.exists(p):
        with open(p, 'r', encoding='utf-8') as f:
            c = f.read()

        # Update title to exact requested query target
        c = re.sub(
            r'<title>.*?</title>',
            '<title>WooCommerce Developer Amsterdam | Shopify Specialist — Jay Lakum</title>',
            c,
            count=1
        )

        # Update meta description: replace jargon & remove no-cure-no-pay
        c = re.sub(
            r'<meta name="description" content=".*?" />',
            '<meta name="description" content="Trage Shopify of WooCommerce webshop in Amsterdam? Freelance developer voor mobiele laadtijden onder 2,5 seconden en acute checkout fixes. Betalen bij oplevering." />',
            c,
            count=1
        )

        with open(p, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f"✓ Updated {p}")

# 2. Update Home index.php & index.html meta description
for p in ['index.php', 'index.html']:
    with open(p, 'r', encoding='utf-8') as f:
        c = f.read()

    # Replace Sub-2.5s LCP with plain English
    c = re.sub(
        r'<meta name="description" content=".*?" />',
        '<meta name="description" content="Freelance Shopify &amp; WooCommerce developer in the Netherlands. Pages that load in under 2.5 seconds and 24-48h checkout bug fixes. Pay 100% on verified delivery." />',
        c,
        count=1
    )

    # Remove unverified +34% from homepage case study preview
    c = c.replace(
        'Fashion Boutique: 6.1s → 2.2s Mobile LCP (+34% Checkout Conversion)',
        'Fashion Boutique: 6.1s → 2.2s Mobile LCP (Clean Core Web Vitals)'
    )
    c = c.replace(
        'Mobile checkout completion jumped by +34% within 30 days. Tested on staging with zero live store downtime.',
        'Mobile LCP dropped from 6.1s to 2.2s. Tested safely on staging with zero live store downtime.'
    )

    with open(p, 'w', encoding='utf-8') as f:
        f.write(c)
    print(f"✓ Updated {p}")

# 3. Update Dutch Home nl/index.php & nl/index.html meta description
for p in ['nl/index.php', 'nl/index.html']:
    with open(p, 'r', encoding='utf-8') as f:
        c = f.read()

    c = re.sub(
        r'<meta name="description" content=".*?" />',
        '<meta name="description" content="Trage webshop versnellen of Mollie iDEAL checkout storing oplossen? Freelance Shopify &amp; WooCommerce specialist Nederland. Mobiele laadtijden onder 2,5 seconden &amp; 100% betalen bij oplevering." />',
        c,
        count=1
    )

    with open(p, 'w', encoding='utf-8') as f:
        f.write(c)
    print(f"✓ Updated {p}")

# 4. Update Utrecht & Rotterdam meta descriptions
for city in ['utrecht', 'rotterdam', 'den-haag', 'eindhoven']:
    for ext in ['index.php', 'index.html']:
        p = f"nl/{city}/{ext}"
        if os.path.exists(p):
            with open(p, 'r', encoding='utf-8') as f:
                c = f.read()
            c = c.replace('sub-2.5s LCP', 'laadtijden onder 2,5 seconden')
            c = c.replace('Sub-2.5s LCP', 'laadtijden onder 2,5 seconden')
            c = c.replace('no-cure-no-pay', 'betalen bij oplevering')
            with open(p, 'w', encoding='utf-8') as f:
                f.write(c)
            print(f"✓ Cleaned jargon in {p}")

# 5. Remove +34% unverified claim from case-study pages & generator
cs_files = ['case-study/index.php', 'case-study/index.html', 'nl/case-study/index.php', 'nl/case-study/index.html']
for p in cs_files:
    if os.path.exists(p):
        with open(p, 'r', encoding='utf-8') as f:
            c = f.read()

        c = c.replace('(+34% Conversions)', '(Core Web Vitals Pass)')
        c = c.replace('(+34% Conversie)', '(Core Web Vitals Geslaagd)')
        c = c.replace('en conversie met +34% verhoogden.', 'en Core Web Vitals groen kregen.')
        c = c.replace('and increased checkout completion by +34%.', 'and passed Google Core Web Vitals.')
        c = c.replace('<div class="metric-val">+34%</div>', '<div class="metric-val">&lt;2.5s</div>')
        c = c.replace('<div class="metric-lbl">Checkout Conversion Lift</div>', '<div class="metric-lbl">Mobile LCP Good Rating</div>')
        c = c.replace('<div class="metric-lbl">Conversiestijging Kassa</div>', '<div class="metric-lbl">Mobiele LCP Goed Rating</div>')
        c = c.replace('<li><strong>+34% increase in completed mobile checkouts</strong> from paid traffic.</li>', '<li><strong>Mobile load times reduced by 64%</strong>, permanently passing Google Core Web Vitals.</li>')
        c = c.replace('<li><strong>+34% stijging in voltooide mobiele bestellingen</strong> uit betaald verkeer.</li>', '<li><strong>Mobiele laadtijd met 64% verlaagd</strong>, waarmee de winkel ruim binnen de Google Core Web Vitals norm valt.</li>')

        with open(p, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f"✓ Removed unverified +34% from {p}")

# 6. Update articles_data.json to remove speculative calculation in ROI article
import json
with open('articles_data.json', 'r', encoding='utf-8') as f:
    arts = json.load(f)

for a in arts:
    if a['slug'] == 'wat-kost-webshop-versnellen-kosten-overzicht':
        # Remove speculative ROI math and frame strictly around Google / Deloitte research
        a['imageAlt'] = "Wat kost het versnellen van een webshop in Nederland? Eerlijk prijsoverzicht en markttarieven"
        a['body'] = re.sub(
            r'Laten we een rekenvoorbeeld nemen.*?volledig terugverdiend\.',
            '<p>Volgens onderzoek van <strong>Google en Deloitte Digital</strong> (<i>Milliseconds Make Millions</i>) leidt elke seconde mobiele snelheidsverbetering tot een meetbare verlaging van het bouncepercentage en betere checkout voltooiing. De exacte impact verschilt uiteraard per webwinkel, productcategorie en verkeersbron.</p>',
            a['body'],
            flags=re.DOTALL
        )
        print("✓ Grounded ROI article strictly in verified industry research (no speculative revenue numbers)")

with open('articles_data.json', 'w', encoding='utf-8') as f:
    json.dump(arts, f, indent=2, ensure_ascii=False)

# Rebuild blog
print("Rebuilding static blog...")
subprocess.run(['python3', 'build_static_blog.py'], check=True)

# Sync blog HTML to PHP
import glob
for html_file in glob.glob('blog/**/index.html', recursive=True):
    php_file = html_file[:-4] + 'php'
    with open(html_file, 'r', encoding='utf-8') as src:
        c = src.read()
    with open(php_file, 'w', encoding='utf-8') as dst:
        dst.write(c)

print("All updates applied cleanly!")
