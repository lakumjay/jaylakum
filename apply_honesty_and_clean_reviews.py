import os
import re

BASE_DIR = '/Applications/XAMPP/xamppfiles/htdocs/jaylakum'

# 1. Update index.html and index.php
# Replace the reviews section completely with the Honest Work & First Client Guarantee
honest_guarantee_en = """    <!-- Honest Work & First Client Guarantee (Replaces Unverified Reviews) -->
    <div class="section" style="border-bottom:1px solid var(--line);background:var(--bg)">
      <div class="wrap">
        <div style="background:var(--card);border:2px solid var(--gold);border-radius:18px;padding:44px 32px;box-shadow:var(--shadow);max-width:880px;margin:0 auto;text-align:center">
          <span class="tag" style="margin-bottom:14px">HONEST WORK &middot; NO FAKE REVIEWS</span>
          <h2 style="font-family:var(--serif);font-size:clamp(26px,3.8vw,36px);margin-bottom:14px">Work Directly with the Developer. Pay on Delivery.</h2>
          <p style="font-size:17px;color:var(--ink-soft);max-width:680px;margin:0 auto 28px;line-height:1.65">
            I don't display fabricated quotes from mystery founders. I believe in 100% transparency: You work directly with me, every line of code is tested safely on a staging theme with zero downtime, and you only pay once the agreed speed benchmark is met.
          </p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px;text-align:left;margin-bottom:32px">
            <div style="background:var(--bg-soft);padding:20px;border-radius:12px;border:1px solid var(--line)">
              <div style="font-size:13px;font-weight:700;color:var(--gold-deep);margin-bottom:6px">🛡️ ZERO RISK</div>
              <div style="font-size:15.5px;color:var(--ink);font-weight:600;margin-bottom:4px">Pay On Delivery</div>
              <p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.5">No upfront deposit. You test and verify the speed fix on staging before paying.</p>
            </div>
            <div style="background:var(--bg-soft);padding:20px;border-radius:12px;border:1px solid var(--line)">
              <div style="font-size:13px;font-weight:700;color:var(--gold-deep);margin-bottom:6px">⚡ REAL STORES</div>
              <div style="font-size:15.5px;color:var(--ink);font-weight:600;margin-bottom:4px">Live Verified Work</div>
              <p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.5">Real code running in production on Gecko Monaco, Opulentt, and PostCraftAI.</p>
            </div>
            <div style="background:var(--bg-soft);padding:20px;border-radius:12px;border:1px solid var(--line)">
              <div style="font-size:13px;font-weight:700;color:var(--gold-deep);margin-bottom:6px">🎯 FIRST CLIENT SPECIAL</div>
              <div style="font-size:15.5px;color:var(--ink);font-weight:600;margin-bottom:4px">Your Store Featured</div>
              <p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.5">Your project will become our next verified case study with complete before/after metrics.</p>
            </div>
          </div>
          <a href="#free-video-audit" class="btn" style="font-size:15px;padding:12px 28px">Get Your Free 3-Min Audit &rarr;</a>
        </div>
      </div>
    </div>"""

honest_guarantee_nl = """    <!-- Eerlijk Vakmanschap & Eerste Klant Garantie (Vervangt Ongeverifieerde Reviews) -->
    <div class="section" style="border-bottom:1px solid var(--line);background:var(--bg)">
      <div class="wrap">
        <div style="background:var(--card);border:2px solid var(--gold);border-radius:18px;padding:44px 32px;box-shadow:var(--shadow);max-width:880px;margin:0 auto;text-align:center">
          <span class="tag" style="margin-bottom:14px">EERLIJK VAKMANSCHAP &middot; GEEN VERZONNEN REVIEWS</span>
          <h2 style="font-family:var(--serif);font-size:clamp(26px,3.8vw,36px);margin-bottom:14px">Rechtstreeks Met De Developer. Betalen Bij Oplevering.</h2>
          <p style="font-size:17px;color:var(--ink-soft);max-width:680px;margin:0 auto 28px;line-height:1.65">
            Ik plaats geen verzonnen quotes van onbekende bedrijven. Ik kies voor 100% transparantie: Je werkt direct met mij, we testen alles veilig op een staging testomgeving zonder risico voor je live winkel, en je betaalt pas na tevreden oplevering.
          </p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px;text-align:left;margin-bottom:32px">
            <div style="background:var(--bg-soft);padding:20px;border-radius:12px;border:1px solid var(--line)">
              <div style="font-size:13px;font-weight:700;color:var(--gold-deep);margin-bottom:6px">🛡️ NUL RISICO</div>
              <div style="font-size:15.5px;color:var(--ink);font-weight:600;margin-bottom:4px">Betalen Bij Oplevering</div>
              <p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.5">Geen verplichte aanbetaling. Je controleert het resultaat eerst zelf op staging.</p>
            </div>
            <div style="background:var(--bg-soft);padding:20px;border-radius:12px;border:1px solid var(--line)">
              <div style="font-size:13px;font-weight:700;color:var(--gold-deep);margin-bottom:6px">⚡ ECHTE WEBWINKELS</div>
              <div style="font-size:15.5px;color:var(--ink);font-weight:600;margin-bottom:4px">Live Te Bekijken</div>
              <p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.5">Echte productiecode op Gecko Monaco, Opulentt en PostCraftAI.</p>
            </div>
            <div style="background:var(--bg-soft);padding:20px;border-radius:12px;border:1px solid var(--line)">
              <div style="font-size:13px;font-weight:700;color:var(--gold-deep);margin-bottom:6px">🎯 EERSTE KLANT DEAL</div>
              <div style="font-size:15.5px;color:var(--ink);font-weight:600;margin-bottom:4px">Jouw Webshop Uitgelicht</div>
              <p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.5">Jouw winkel wordt onze volgende officiële geverifieerde case study.</p>
            </div>
          </div>
          <a href="#gratis-audit" class="btn" style="font-size:15px;padding:12px 28px">Vraag Jouw Gratis Video Audit Aan &rarr;</a>
        </div>
      </div>
    </div>"""

def remove_reviews_section(filepath, honest_replacement, is_nl=False):
    with open(filepath, 'r', encoding='utf-8') as f:
        c = f.read()

    # Regex to find the reviews section starting with CLIENT REVIEWS or GEVERIFIEERDE KLANTENREVIEWS
    pattern = r'<section[^>]*id="reviews"[^>]*>.*?</section>'
    if re.search(pattern, c, re.DOTALL):
        c = re.sub(pattern, honest_replacement, c, flags=re.DOTALL)
    else:
        # Check without id="reviews"
        pattern2 = r'<div class="section"[^>]*>\s*<div class="wrap">\s*<div class="section-head"[^>]*>.*?Sophie van den Berg.*?</div>\s*</div>\s*</div>'
        if re.search(pattern2, c, re.DOTALL):
            c = re.sub(pattern2, honest_replacement, c, flags=re.DOTALL)

    # Soften 24 hours video audit deadline to realistic 24-48 hours
    c = c.replace('within 24 hours with first thoughts', 'usually within 24-48 hours with first thoughts')
    c = c.replace('within 24 hours, completely free', 'usually within 24-48 hours, completely free')
    c = c.replace('binnen 24 uur een persoonlijke video', 'meestal binnen 24 tot 48 uur een persoonlijke video')
    c = c.replace('binnen 24 uur', 'binnen 24-48 uur')

    # Update Pricing section header to explicitly state "Indicative Starting Ranges - Fixed Quote Upon Scope"
    c = c.replace('Transparent Fixed Pricing Packages', 'Indicative Project Ranges &middot; Fixed Written Quote Upfront')
    c = c.replace('Transparante Vaste Tarieven', 'Indicatieve Richtprijzen &middot; Vaste Offerte Vooraf')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(c)
    print("Cleaned reviews & updated copy in:", filepath)

# Apply to EN files
for fn in ['index.html', 'index.php']:
    remove_reviews_section(os.path.join(BASE_DIR, fn), honest_guarantee_en, is_nl=False)

# Apply to NL files
for fn in ['index.html', 'index.php']:
    remove_reviews_section(os.path.join(BASE_DIR, 'nl', fn), honest_guarantee_nl, is_nl=True)

for city in ['amsterdam', 'rotterdam', 'utrecht', 'den-haag', 'eindhoven']:
    for fn in ['index.html', 'index.php']:
        remove_reviews_section(os.path.join(BASE_DIR, 'nl', city, fn), honest_guarantee_nl, is_nl=True)

# 2. In case-study pages, trim out auxiliary unverified numbers (like 140KB, 60%, 38->96) and keep ONLY verified 6.1s -> 2.2s and +34%
for fn in ['case-study/index.html', 'case-study/index.php']:
    p = os.path.join(BASE_DIR, fn)
    with open(p, 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace('PageSpeed Mobile</div>\n        <div class="metric-val">38 &rarr; 96</div>\n        <div class="metric-note">Passed Core Web Vitals',
                  'Core Web Vitals</div>\n        <div class="metric-val">PASS</div>\n        <div class="metric-note">Sub-2.5s LCP on Mobile')
    c = c.replace('losing over half its mobile traffic to sluggish loading screens', 'experiencing high mobile drop-off due to sluggish loading times')
    c = c.replace('exceeded 68%', 'was steadily climbing')
    c = c.replace('injecting 140KB of blocking JavaScript and broken DNS preconnects', 'injecting render-blocking JavaScript and unnecessary DNS lookups')
    with open(p, 'w', encoding='utf-8') as f:
        f.write(c)

for fn in ['nl/case-study/index.html', 'nl/case-study/index.php']:
    p = os.path.join(BASE_DIR, fn)
    with open(p, 'r', encoding='utf-8') as f:
        c = f.read()
    c = c.replace('Google PageSpeed</div>\n        <div class="metric-val">38 &rarr; 96</div>\n        <div class="metric-note">Groene Core Web Vitals',
                  'Core Web Vitals</div>\n        <div class="metric-val">GROEN</div>\n        <div class="metric-note">Sub-2.5s LCP op Smartphone')
    c = c.replace('verloor meer dan de helft van haar mobiele bezoekers', 'verloor waardevolle mobiele bestellingen door trage laadtijden')
    c = c.replace('verliet meer dan 68%', 'verliet een groot deel')
    c = c.replace('140KB aan dode JavaScript', 'onnodige vertragende JavaScript')
    with open(p, 'w', encoding='utf-8') as f:
        f.write(c)

print("All reviews cleaned, indicative pricing clearly labeled, and audit deadlines softened.")
