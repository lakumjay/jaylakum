import re
import os

print("Applying SEO and conversion improvements from feedback...")

# 1. Update index.php and index.html
for fname in ['index.php', 'index.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    # Shorten Title
    content = re.sub(
        r'<title>.*?</title>',
        '<title>Shopify &amp; WooCommerce Developer Netherlands | Jay Lakum</title>',
        content,
        count=1
    )

    # Shorten Description (~150 chars)
    content = re.sub(
        r'<meta name="description" content=".*?" />',
        '<meta name="description" content="Freelance Shopify &amp; WooCommerce developer in the Netherlands. Sub-2.5s LCP speed sprints and 24-48h checkout bug fixes. Pay 100% on verified delivery." />',
        content,
        count=1
    )

    # Clean Meta Keywords (remove London/UK)
    content = re.sub(
        r'<meta name="keywords" content=".*?" />',
        '<meta name="keywords" content="Shopify developer Netherlands, WooCommerce specialist Amsterdam, Shopify speed optimization, webshop versnellen, WooCommerce checkout fix, freelance ecommerce developer" />',
        content,
        count=1
    )

    # Remove GSC placeholder verification tag
    content = re.sub(
        r'\s*<!-- Google Search Console Verification.*?-->\s*<meta name="google-site-verification" content="GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE" />',
        '',
        content
    )
    content = re.sub(
        r'<meta name="google-site-verification" content="GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE" />\s*',
        '',
        content
    )

    # Update OG Image from SVG to PNG
    content = content.replace('https://jaylakum.com/og-image.svg', 'https://jaylakum.com/og-image.png')
    content = content.replace('content="/og-image.svg"', 'content="/og-image.png"')

    # Update META.home title in client-side router
    content = content.replace(
        "title: 'Freelance Shopify & WooCommerce Developer Netherlands | Speed & Bug Fixes — Jay Lakum'",
        "title: 'Shopify & WooCommerce Developer Netherlands | Jay Lakum'"
    )
    content = content.replace(
        "title: 'Freelance Shopify & WooCommerce Developer Netherlands | Speed Sprints & Bug Fixes | Jay Lakum'",
        "title: 'Shopify & WooCommerce Developer Netherlands | Jay Lakum'"
    )

    # Fix legacy #blog/... fragment links in #view-blog
    content = content.replace('href="#blog/nederland-heeft-nu-ook-een-dopaminesite-ni"', 'href="/blog/webshop-klaarmaken-feestdagen/"')
    content = content.replace('href="#blog/why-is-my-shopify-store-so-slow"', 'href="/blog/why-is-my-shopify-store-so-slow/"')
    content = content.replace('href="#blog/woocommerce-checkout-broken-diagnose-10-minutes"', 'href="/blog/woocommerce-checkout-broken-diagnose-10-minutes/"')

    # Harmonize Redesign milestone terms
    content = content.replace(
        '<li>✓ Milestone terms: 50% start / 50% on verified staging delivery</li>',
        '<li>✓ Staged delivery: 50% kick-off / 50% after you test &amp; approve on staging</li>'
    )

    with open(fname, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✓ Updated {fname}")

# 2. Update nl/index.php and nl/index.html
for fname in ['nl/index.php', 'nl/index.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    # Shorten Dutch Title
    content = re.sub(
        r'<title>.*?</title>',
        '<title>Shopify &amp; WooCommerce Specialist Nederland | Jay Lakum</title>',
        content,
        count=1
    )

    # Shorten Dutch Description (~152 chars)
    content = re.sub(
        r'<meta name="description" content=".*?" />',
        '<meta name="description" content="Trage webshop versnellen of Mollie iDEAL checkout storing oplossen? Freelance Shopify &amp; WooCommerce specialist Nederland. Snelle LCP &amp; betalen bij oplevering." />',
        content,
        count=1
    )

    # Clean Meta Keywords
    content = re.sub(
        r'<meta name="keywords" content=".*?" />',
        '<meta name="keywords" content="Shopify webshop sneller maken, WooCommerce trage webshop versnellen, Mollie iDEAL storing, Core Web Vitals webshop, Shopify specialist Nederland, freelance webdeveloper Amsterdam, webshop versnellen Rotterdam" />',
        content,
        count=1
    )

    # Remove GSC placeholder
    content = re.sub(
        r'\s*<!-- Google Search Console Verification.*?-->\s*<meta name="google-site-verification" content="GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE" />',
        '',
        content
    )
    content = re.sub(
        r'<meta name="google-site-verification" content="GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE" />\s*',
        '',
        content
    )

    # Update OG Image
    content = content.replace('https://jaylakum.com/og-image.svg', 'https://jaylakum.com/og-image.png')
    content = content.replace('content="/og-image.svg"', 'content="/og-image.png"')

    with open(fname, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✓ Updated {fname}")

# 3. Update the 5 City Pages
city_configs = {
    'amsterdam': {
        'title': 'Shopify &amp; WooCommerce Specialist Amsterdam | Jay Lakum',
        'desc': 'Trage Shopify of WooCommerce webshop in Amsterdam? Freelance specialist voor mode, beauty &amp; retail. Snelle sub-2.5s LCP, Mollie iDEAL en no-cure-no-pay.'
    },
    'rotterdam': {
        'title': 'Shopify &amp; WooCommerce Specialist Rotterdam | Jay Lakum',
        'desc': 'Trage WooCommerce checkout of PostNL/Exact koppeling in Rotterdam? Freelance e-commerce developer voor B2B en logistieke webshops. Betalen bij oplevering.'
    },
    'utrecht': {
        'title': 'Shopify &amp; WooCommerce Specialist Utrecht | Jay Lakum',
        'desc': 'Shopify &amp; WooCommerce webshop versnellen in Utrecht? Freelance specialist voor D2C en omnichannel merken. Sub-2.5s LCP en meetbare conversieverbetering.'
    },
    'den-haag': {
        'title': 'Shopify &amp; WooCommerce Specialist Den Haag | Jay Lakum',
        'desc': 'Mollie, iDEAL &amp; Bancontact checkout fouten oplossen in Den Haag? Freelance webshop developer voor internationale webshops. Vaste prijs vooraf.'
    },
    'eindhoven': {
        'title': 'Shopify &amp; WooCommerce Specialist Eindhoven | Jay Lakum',
        'desc': 'Snelle Shopify &amp; WooCommerce optimalisatie in Brainport Eindhoven. Technische theme opschoning, API koppelingen en Core Web Vitals specialist.'
    }
}

for city, cfg in city_configs.items():
    for ext in ['index.php', 'index.html']:
        path = f"nl/{city}/{ext}"
        if not os.path.exists(path):
            continue
        with open(path, 'r', encoding='utf-8') as f:
            c = f.read()

        c = re.sub(r'<title>.*?</title>', f"<title>{cfg['title']}</title>", c, count=1)
        c = re.sub(r'<meta name="description" content=".*?" />', f"<meta name=\"description\" content=\"{cfg['desc']}\" />", c, count=1)
        c = c.replace('https://jaylakum.com/og-image.svg', 'https://jaylakum.com/og-image.png')
        c = c.replace('content="/og-image.svg"', 'content="/og-image.png"')

        # Add internal blog links section if not present
        if 'Gerelateerde Technische Kennis & Handleidingen' not in c:
            blog_links_block = '''
  <!-- Gerelateerde Handleidingen & Casestudies -->
  <section class="section" style="padding:48px 0;background:var(--bg)">
    <div class="wrap">
      <div class="section-head" style="margin-bottom:28px">
        <div class="eyebrow">TECHNISCHE KENNISBANK</div>
        <h3 style="font-size:24px;margin:0 0 8px">Gerelateerde Technische Kennis &amp; Handleidingen</h3>
        <p style="color:var(--ink-soft);font-size:15px;margin:0">Lees praktische oplossingen voor veelvoorkomende e-commerce knelpunten:</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px">
        <a href="/blog/trage-woocommerce-winkelwagen-postnl-exact-online/" style="display:block;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:22px;text-decoration:none;color:inherit;transition:transform .2s,border-color .2s">
          <span style="font-size:11px;font-weight:700;color:var(--gold-deep);text-transform:uppercase;letter-spacing:.06em">WooCommerce · Logistiek</span>
          <h4 style="font-size:16px;margin:8px 0 6px;color:var(--ink)">Trage WooCommerce Winkelwagen door PostNL &amp; Exact Online Oplossen &rarr;</h4>
          <p style="font-size:13.5px;color:var(--ink-soft);margin:0;line-height:1.5">Hoe je trage checkout API-vertragingen isoleert en winkelwagens weer soepel laat laden.</p>
        </a>
        <a href="/blog/mollie-ideal-checkout-storing-oplossen/" style="display:block;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:22px;text-decoration:none;color:inherit;transition:transform .2s,border-color .2s">
          <span style="font-size:11px;font-weight:700;color:var(--gold-deep);text-transform:uppercase;letter-spacing:.06em">iDEAL · Betalingen</span>
          <h4 style="font-size:16px;margin:8px 0 6px;color:var(--ink)">Mollie &amp; iDEAL Checkout Storing Oplossen: 10-Minuten Gids &rarr;</h4>
          <p style="font-size:13.5px;color:var(--ink-soft);margin:0;line-height:1.5">Webhook drops, mislukte status-updates en checkout bevriezingen systematisch verhelpen.</p>
        </a>
        <a href="/blog/shopify-apps-vertragen-webshop-liquid-opruimen/" style="display:block;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:22px;text-decoration:none;color:inherit;transition:transform .2s,border-color .2s">
          <span style="font-size:11px;font-weight:700;color:var(--gold-deep);text-transform:uppercase;letter-spacing:.06em">Shopify · Performance</span>
          <h4 style="font-size:16px;margin:8px 0 6px;color:var(--ink)">Shopify Apps Vertragen Webshop: Oude Liquid Scripts Opruimen &rarr;</h4>
          <p style="font-size:13.5px;color:var(--ink-soft);margin:0;line-height:1.5">Verwijder 'ghost apps' en overbodige tracking scripts voor een directe sprong in Core Web Vitals.</p>
        </a>
      </div>
    </div>
  </section>
'''
            # Insert before </main>
            if '</main>' in c:
                c = c.replace('</main>', blog_links_block + '\n</main>')
                print(f"✓ Added internal blog links to {path}")

        with open(path, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f"✓ Updated {path}")

print("All updates applied successfully!")
