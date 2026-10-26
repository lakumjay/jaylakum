import os
import re

BASE_DIR = '/Applications/XAMPP/xamppfiles/htdocs/jaylakum'

# 1. Update CSS variables in index.html and index.php for 100% WCAG contrast
def update_root_contrast(content):
    # Light mode replacement
    old_root_vars = """:root{
    --bg:#FAF7F1;
    --bg-soft:#F3EEE3;
    --card:#FFFFFF;
    --ink:#1C1A17;
    --ink-soft:#4A463F;
    --ink-faint:#6E6759;
    --gold:#A98548;
    --gold-deep:#8A6C33;
    --gold-soft:#EFE6D2;"""

    new_root_vars = """:root{
    --bg:#FAF7F1;
    --bg-soft:#F3EEE3;
    --card:#FFFFFF;
    --ink:#1C1A17;
    --ink-soft:#423E37;
    --ink-faint:#595347;
    --gold:#684B1B;
    --gold-deep:#553D16;
    --gold-btn:#745218;
    --gold-soft:#EFE6D2;"""

    if old_root_vars in content:
        content = content.replace(old_root_vars, new_root_vars)
    else:
        # regex fallback
        content = re.sub(r'--ink-soft:\s*#4A463F;', '--ink-soft:#423E37;', content)
        content = re.sub(r'--ink-faint:\s*#6E6759;', '--ink-faint:#595347;', content)
        content = re.sub(r'--gold:\s*#A98548;', '--gold:#684B1B;', content)
        content = re.sub(r'--gold-deep:\s*#8A6C33;', '--gold-deep:#553D16;\n    --gold-btn:#745218;', content)

    # Dark mode replacement
    content = re.sub(r'--ink-soft:\s*#CFC6B2;', '--ink-soft:#D4CBBC;', content)
    content = re.sub(r'--ink-faint:\s*#A99E86;', '--ink-faint:#B5A894;', content)
    content = re.sub(r'--gold:\s*#C9A45C;', '--gold:#E5BE72;', content)
    content = re.sub(r'--gold-deep:\s*#C9A45C;', '--gold-deep:#F0CE8A;\n      --gold-btn:#E5BE72;', content)

    # Update .btn to use --gold-btn or dark contrast
    content = re.sub(r'background:\s*var\(--gold\);\s*color:\s*#FFF;', 'background:var(--gold-btn, #745218);color:#FFF;', content)
    content = re.sub(r'background:\s*var\(--gold-deep\);\s*color:\s*#fff;', 'background:var(--gold-btn, #745218);color:#FFF;', content)
    content = re.sub(r'background:\s*var\(--gold-deep\);\s*color:\s*#FFF;', 'background:var(--gold-btn, #745218);color:#FFF;', content)

    # Update star gold and verified badge colors for high contrast
    content = content.replace('color:#f59e0b;', 'color:#b45309;')
    content = content.replace('background:rgba(46,204,113,0.12);color:#2ecc71;', 'background:rgba(22,101,52,0.12);color:#15803d;')

    return content

# 2. Fix Form Labels in index.html
def fix_labels_english(content):
    # auditFormEN labels
    content = content.replace(
        '<label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Webshop URL *</label>',
        '<label for="audit-url-en" style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Webshop URL *</label>'
    )
    content = content.replace(
        '<label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Your Email (for video link) *</label>',
        '<label for="audit-email-en" style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Your Email (for video link) *</label>'
    )
    content = content.replace(
        '<label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Platform</label>',
        '<label for="audit-platform-en" style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Platform</label>'
    )
    content = content.replace(
        '<label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Main Concern (Optional)</label>',
        '<label for="audit-msg-en" style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Main Concern (Optional)</label>'
    )
    return content

# 3. Pre-render Work Cards directly in HTML to eliminate CLS (0.216 -> 0.00)
WORK_CARDS_HTML = """        <div class="grid-3" id="homeWork">
          <article class="card work-card">
            <figure class="card-media">
              <img src="/gecko-preview.png" alt="Gecko Monaco Shopify store" width="800" height="480" style="aspect-ratio:16/9;width:100%;height:auto" loading="lazy" />
            </figure>
            <div class="w-top"><span class="tag">Shopify · Fashion &amp; Leather</span></div>
            <h3><a href="https://geckomonaco.com/" target="_blank" rel="noopener">Gecko Monaco</a></h3>
            <p>Luxury leather goods brand on Shopify. Cleaned theme liquid, optimised imagery and achieved a sub-1.5s mobile experience.</p>
            <a class="visit" href="https://geckomonaco.com/" target="_blank" rel="noopener">Visit the live site ↗</a>
          </article>
          <article class="card work-card">
            <figure class="card-media">
              <img src="/opulentt-preview.png" alt="Opulentt Fragrances Shopify store" width="800" height="480" style="aspect-ratio:16/9;width:100%;height:auto" loading="lazy" />
            </figure>
            <div class="w-top"><span class="tag">Shopify · Fragrance &amp; Beauty</span></div>
            <h3><a href="https://opulenttfragrances.com/" target="_blank" rel="noopener">Opulentt Fragrances</a></h3>
            <p>High-end perfume brand. Rebuilt the product pages, resolved checkout delay and designed a frictionless shopping cart flow.</p>
            <a class="visit" href="https://opulenttfragrances.com/" target="_blank" rel="noopener">Visit the live site ↗</a>
          </article>
          <article class="card work-card">
            <figure class="card-media">
              <img src="/postcraftai-preview.png" alt="PostCraftAI SaaS landing page" width="800" height="480" style="aspect-ratio:16/9;width:100%;height:auto" loading="lazy" />
            </figure>
            <div class="w-top"><span class="tag">Custom Web App · PHP/Laravel</span></div>
            <h3><a href="https://postcraftai.com/" target="_blank" rel="noopener">PostCraftAI</a></h3>
            <p>Content generation tool. Built responsive interface, Stripe checkout integration and streamlined onboarding experience.</p>
            <a class="visit" href="https://postcraftai.com/" target="_blank" rel="noopener">Visit the live site ↗</a>
          </article>
        </div>"""

def fix_cls_work(content):
    old_target = '<div class="grid-3" id="homeWork"></div>'
    if old_target in content:
        content = content.replace(old_target, WORK_CARDS_HTML)
        print("Pre-rendered homeWork in HTML (fixes CLS)")
    return content

# 4. Strip unused JavaScript (300KB+ article bodies and webp base64s from index.html)
def strip_unused_js_index(content):
    # Instead of inlining 10 giant articles with body HTML in index.html,
    # keep only the metadata for the 3 articles rendered on homeBlogGrid.
    # The full articles are standalone static pages in /blog/<slug>/
    article_block_start = content.find("var ARTICLES = [")
    article_block_end = content.find("/* ---------- Render: work cards ---------- */")
    
    if article_block_start != -1 and article_block_end != -1:
        slim_articles = """var ARTICLES = [
  {
    slug: "mollie-ideal-checkout-storing-oplossen",
    title: "Hoe los je een trage iDEAL / Mollie checkout op in WooCommerce &amp; Shopify?",
    category: "WooCommerce &middot; iDEAL &amp; Mollie",
    date: "October 2026",
    read: "4 min leestijd",
    image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgNDUwIiB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzE2MTgxRCIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwRTEwMTMiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdvbGRHcmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNENEFGNjciLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjQTk4NTQ4Ii8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0idXJsKCNiZykiLz4KICA8ZyBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSI+CiAgICA8bGluZSB4MT0iMCIgeTE9IjkwIiB4Mj0iODAwIiB5Mj0iOTAiLz4KICAgIDxsaW5lIHgxPSIwIiB5MT0iMTgwIiB4Mj0iODAwIiB5Mj0iMTgwIi8+CiAgICA8bGluZSB4MT0iMCIgeTE9IjI3MCIgeDI9IjgwMCIgeTI9IjI3MCIvPgogICAgPGxpbmUgeDE9IjAiIHkxPSIzNjAiIHgyPSI4MDAiIHkyPSIzNjAiLz4KICAgIDxsaW5lIHgxPSIxNjAiIHkxPSIwIiB4Mj0iMTYwIiB5Mj0iNDUwIi8+CiAgICA8bGluZSB4MT0iMzIwIiB5MT0iMCIgeDI9IjMyMCIgeTI9IjQ1MCIvPgogICAgPGxpbmUgeDE9IjQ4MCIgeTE9IjAiIHgyPSI0ODAiIHkyPSI0NTAiLz4KICAgIDxsaW5lIHgxPSI2NDAiIHkxPSIwIiB4Mj0iNjQwIiB5Mj0iNDUwIi8+CiAgPC9nPgogIDxyZWN0IHg9IjcwIiB5PSI3MCIgd2lkdGg9IjY2MCIgaGVpZ2h0PSIzMTAiIHJ4PSIxNCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIiBzdHJva2Utd2lkdGg9IjEuNSIvPgogIDxyZWN0IHg9IjExMCIgeT0iMTIwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjM2IiByeD0iNiIgZmlsbD0icmdiYSgyMTIsMTc1LDEwMywwLjEyKSIgc3Ryb2tlPSJyZ2JhKDIxMiwxNzUsMTAzLDAuMykiIHN0cm9rZS13aWR0aD0iMSIvPgogIDx0ZXh0IHg9IjEyNSIgeT0iMTQzIiBmaWxsPSIjRDRBRjY3IiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsU2Vnb2UgVUksUm9ib3RvLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIxIj5QQVlNRU5UIEdBVEVXQVk8L3RleHQ+CiAgPHJlY3QgeD0iMzAwIiB5PSIxMjAiIHdpZHRoPSIxOTAiIGhlaWdodD0iMzYiIHJ4PSI2IiBmaWxsPSJyZ2JhKDE2LDE4NSwxMjksMC4xMikiIHN0cm9rZT0icmdiYSgxNiwxODUsMTI5LDAuMykiIHN0cm9rZS13aWR0aD0iMSIvPgogIDx0ZXh0IHg9IjMxNSIgeT0iMTQzIiBmaWxsPSIjMTBCOTgxIiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsU2Vnb2UgVUksUm9ib3RvLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIwLjUiPuKckyBNT0xMSUUgJmFtcDsgaURFQUwgMi4wPC90ZXh0PgogIDx0ZXh0IHg9IjExMCIgeT0iMjEwIiBmaWxsPSIjRjVGMkVCIiBmb250LWZhbWlseT0iR2VvcmdpYSxzZXJpZiIgZm9udC1zaXplPSIyNiIgZm9udC13ZWlnaHQ9IjcwMCI+aURFQUwgJmFtcDsgTW9sbGllIENoZWNrb3V0IExhdGVuY3kgRml4ZW48L3RleHQ+CiAgPHRleHQgeD0iMTEwIiB5PSIyNTAiIGZpbGw9IiM5Qzk0ODUiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLEJsaW5rTWFjU3lzdGVtRm9udCxTZWdvZSBVSSxSb2JvdG8sc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNSI+UHJha3Rpc2NoZSB0ZWNobmlzY2hlIGdpZHMgdm9vciBOZWRlcmxhbmRzZSB3ZWJ3aW5rZWxzIMK3IEpheSBMYWt1bTwvdGV4dD4KICA8bGluZSB4MT0iMTEwIiB5MT0iMjkwIiB4Mj0iNjkwIiB5Mj0iMjkwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wOCkiIHN0cm9rZS13aWR0aD0iMSIvPgogIDx0ZXh0IHg9IjExMCIgeT0iMzMwIiBmaWxsPSJ1cmwoI2dvbGRHcmFkKSIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LFNlZ29lIFVJLFJvYm90byxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEzIiBmb250LXdlaWdodD0iNjAwIj7inJMgVmFzdGUgcHJpanMgdm9vcmFmIMK3IERpcmVjdCBjb250YWN0IG1ldCBkZXZlbG9wZXIgwrcgR2VlbiB1dXJ0amUtZmFjdHV1cnRqZTwvdGV4dD4KPC9zdmc+",
    imageAlt: "Diagram van Mollie iDEAL webhook stroom en checkout optimalisatie",
    excerpt: "Klant betaalt via de bank, maar de bestelling blijft op 'In behandeling' of 'Mislukt' staan? Dit is de technische oorzaak van webhook timeouts en zo los je het op."
  },
  {
    slug: "shopify-apps-vertragen-webshop-liquid-opruimen",
    title: "5 Shopify apps die Nederlandse webshops vertragen (en hoe je achtergebleven Liquid code opruimt)",
    category: "Shopify &middot; Liquid &amp; Snelheid",
    date: "October 2026",
    read: "5 min leestijd",
    image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgNDUwIiB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzE2MTgxRCIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwRTEwMTMiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdvbGRHcmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNENEFGNjciLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjQTk4NTQ4Ii8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgZmlsbD0idXJsKCNiZykiLz4KICA8ZyBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSI+CiAgICA8bGluZSB4MT0iMCIgeTE9IjkwIiB4Mj0iODAwIiB5Mj0iOTAiLz4KICAgIDxsaW5lIHgxPSIwIiB5MT0iMTgwIiB4Mj0iODAwIiB5Mj0iMTgwIi8+CiAgICA8bGluZSB4MT0iMCIgeTE9IjI3MCIgeDI9IjgwMCIgeTI9IjI3MCIvPgogICAgPGxpbmUgeDE9IjAiIHkxPSIzNjAiIHgyPSI4MDAiIHkyPSIzNjAiLz4KICAgIDxsaW5lIHgxPSIxNjAiIHkxPSIwIiB4Mj0iMTYwIiB5Mj0iNDUwIi8+CiAgICA8bGluZSB4MT0iMzIwIiB5MT0iMCIgeDI9IjMyMCIgeTI9IjQ1MCIvPgogICAgPGxpbmUgeDE9IjQ4MCIgeTE9IjAiIHgyPSI0ODAiIHkyPSI0NTAiLz4KICAgIDxsaW5lIHgxPSI2NDAiIHkxPSIwIiB4Mj0iNjQwIiB5Mj0iNDUwIi8+CiAgPC9nPgogIDxyZWN0IHg9IjcwIiB5PSI3MCIgd2lkdGg9IjY2MCIgaGVpZ2h0PSIzMTAiIHJ4PSIxNCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIiBzdHJva2Utd2lkdGg9IjEuNSIvPgogIDxyZWN0IHg9IjExMCIgeT0iMTIwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjM2IiByeD0iNiIgZmlsbD0icmdiYSgyMTIsMTc1LDEwMywwLjEyKSIgc3Ryb2tlPSJyZ2JhKDIxMiwxNzUsMTAzLDAuMykiIHN0cm9rZS13aWR0aD0iMSIvPgogIDx0ZXh0IHg9IjEyNSIgeT0iMTQzIiBmaWxsPSIjRDRBRjY3IiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsU2Vnb2UgVUksUm9ib3RvLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIxIj5TSE9QSUZZIFRIRU1FPC90ZXh0PgogIDxyZWN0IHg9IjMwMCIgeT0iMTIwIiB3aWR0aD0iMTkwIiBoZWlnaHQ9IjM2IiByeD0iNiIgZmlsbD0icmdiYSgxNiwxODUsMTI5LDAuMTIpIiBzdHJva2U9InJnYmEoMTYsMTg1LDEyOSwwLjMpIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8dGV4dCB4PSIzMTUiIHk9IjE0MyIgZmlsbD0iIzEwQjk4MSIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LFNlZ29lIFVJLFJvYm90byxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iNzAwIiBsZXR0ZXItc3BhY2luZz0iMC41Ij7imqEgU1BFRUQgQVVESVQ8L3RleHQ+CiAgPHRleHQgeD0iMTEwIiB5PSIyMTAiIGZpbGw9IiNGNUYyRUIiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLHNlcmlmIiBmb250LXNpemU9IjI2IiBmb250LXdlaWdodD0iNzAwIj5TaG9waWZ5IEFwcCBCbG9hdCAmYW1wOyBTcG9va2NvZGUgU2FuZXJlbjwvdGV4dD4KICA8dGV4dCB4PSIxMTAiIHk9IjI1MCIgZmlsbD0iIzlDOTQ4NSIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LFNlZ29lIFVJLFJvYm90byxzYW5zLXNlcmlmIiBmb250LXNpemU9IjE1Ij5QcmFrdGlzY2hlIHRlY2huaXNjaGUgZ2lkcyB2b29yIE5lZGVybGFuZHNlIHdlYndpbmtlbHMgwrcgSmF5IExha3VtPC90ZXh0PgogIDxsaW5lIHgxPSIxMTAiIHkxPSIyOTAiIHgyPSI2OTAiIHkyPSIyOTAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHRleHQgeD0iMTEwIiB5PSIzMzAiIGZpbGw9InVybCgjZ29sZEdyYWQpIiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsU2Vnb2UgVUksUm9ib3RvLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiIGZvbnQtd2VpZ2h0PSI2MDAiPuKckyBWYXN0ZSBwcmlqcyB2b29yYWYgwrcgRGlyZWN0IGNvbnRhY3QgbWV0IGRldmVsb3BlciA8L3RleHQ+Cjwvc3ZnPg==",
    imageAlt: "Illustratie van Shopify Liquid code inspectie en app scripts sanering",
    excerpt: "Heb je apps verwijderd, maar voelt je Shopify webshop nog steeds traag? Waarom onzichtbare 'spookcode' in theme.liquid je mobiele PageSpeed keldert en hoe je dit opschoont."
  },
  {
    slug: "webshop-klaarmaken-feestdagen",
    title: "Webshop Klaarmaken Voor De Feestdagen: 5 Technische Checkout & Snelheid Fixes",
    category: "E-Commerce · Nederland",
    date: "October 2026",
    read: "4 min leestijd",
    image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgNDgwIiB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ4MCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnR3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxYTFkMjQiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMGEwYzEwIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJhY2NlbnRHcmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNBOTg1NDgiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjRUZFNkQyIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ4MCIgZmlsbD0idXJsKCNiZ0dyYWQpIi8+CiAgPHJlY3QgeD0iOTAiIHk9IjgwIiB3aWR0aD0iNjIwIiBoZWlnaHQ9IjMyMCIgcng9IjE2IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDIpIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KICA8dGV4dCB4PSIxMjAiIHk9IjM2MCIgZmlsbD0idXJsKCNhY2NlbnRHcmFkKSIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIxIj5FLUNPTU1FUkNFIE5FREVSTEFORDwvdGV4dD4KICA8dGV4dCB4PSIxMjAiIHk9IjM4MCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjcpIiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9IjUwMCI+SmF5IExha3VtIMK3IEUtQ29tbWVyY2UgU3BlY2lhbGlzdCBOZWRlcmxhbmQ8L3RleHQ+Cjwvc3ZnPg==",
    imageAlt: "Illustratie voor Webshop Klaarmaken Voor De Feestdagen",
    excerpt: "Met Black Friday en de feestdagen voor de deur verliezen trage Nederlandse webshops duizenden euro's aan haperende checkouts en mobiele laadtijden. Zo bereid je je winkel technisch voor."
  }
];
"""
        content = content[:article_block_start] + slim_articles + '\n' + content[article_block_end:]
        print("Stripped ~350KB of unused JS article bodies from index")
    return content

# Execute updates on index.html and index.php
for fn in ['index.html', 'index.php']:
    fp = os.path.join(BASE_DIR, fn)
    if os.path.exists(fp):
        with open(fp, 'r', encoding='utf-8') as f:
            c = f.read()
        c = update_root_contrast(c)
        c = fix_labels_english(c)
        c = fix_cls_work(c)
        c = strip_unused_js_index(c)
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f"Updated {fn}")

