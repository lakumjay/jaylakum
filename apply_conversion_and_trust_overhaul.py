#!/usr/bin/env python3
"""
Overhaul conversion trust, eliminate contradictions, add privacy assurances,
and harmonize languages across jaylakum.com based on real client audit.
"""

import os
import re
import json

HTDOCS = "/Applications/XAMPP/xamppfiles/htdocs/jaylakum"

def overhaul_english_home():
    for ext in ["php", "html"]:
        fpath = os.path.join(HTDOCS, f"index.{ext}")
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()

        # 1. Fix Pricing Heading: remove Dutch phrase
        content = content.replace(
            "Transparent Investment · Guaranteed Scope (Binnen Schriftelijke Scope)",
            "Transparent Investment · Guaranteed Scope (Within Written Project Scope)"
        )
        content = content.replace(
            "Transparent Investment &middot; Guaranteed Scope (Binnen Schriftelijke Scope)",
            "Transparent Investment &middot; Guaranteed Scope (Within Written Project Scope)"
        )

        # 2. Fix Speed Sprint & Redesign payment & target wording
        content = content.replace(
            "<li>✓ Target sub-1.5s mobile load time</li>",
            "<li>✓ Sub-2.5s mobile LCP (passing Google Core Web Vitals)</li>"
        )
        content = content.replace(
            "<li>✓ 14 days warranty on the fix</li>",
            "<li>✓ 100% Pay on delivery (0 upfront deposit)</li>\n                <li>✓ 14 days warranty on the fix</li>"
        )
        content = content.replace(
            "<li>✓ 30 days regression guarantee</li>",
            "<li>✓ 100% Pay on delivery after staging verification</li>\n                <li>✓ 30 days regression guarantee</li>"
        )
        content = content.replace(
            "<li>✓ Staging demo before you pay final balance</li>",
            "<li>✓ Milestone terms: 50% start / 50% on verified staging delivery</li>"
        )

        # 3. Replace "First Client" contradiction
        content = content.replace(
            "🎯 <strong>First client?</strong> Your store's optimization will be personally handled with the same step-by-step rigor and become our next verified case study.",
            "🎯 <strong>Want these results for your store?</strong> Request a Free 3-Minute Video Audit showing your exact mobile speed bottlenecks and conversion potential."
        )
        content = re.sub(
            r"<div style=\"font-size:13px;font-weight:700;color:var\(--gold-deep\);margin-bottom:6px\">🎯 FIRST CLIENT SPECIAL</div>\s*<div style=\"font-size:15\.5px;color:var\(--ink\);font-weight:600;margin-bottom:4px\">Your Store Featured</div>\s*<p style=\"margin:0;font-size:14px;color:var\(--ink-soft\);line-height:1\.5\">Your project will become our next verified case study with complete before/after metrics\.</p>",
            """<div style="font-size:13px;font-weight:700;color:var(--gold-deep);margin-bottom:6px">🔒 100% RISK-FREE</div>
              <div style="font-size:15.5px;color:var(--ink);font-weight:600;margin-bottom:4px">Pay on Verified Delivery</div>
              <p style="margin:0;font-size:14px;color:var(--ink-soft);line-height:1.5">Every speed sprint and bug fix is tested on staging and verified with live before/after Lighthouse recordings before you pay a single euro.</p>""",
            content
        )

        # 4. Add Privacy Assurance right below auditFormEN submit button
        en_privacy_box = """<div style="font-size:12.5px;color:var(--ink-soft);text-align:center;margin-top:12px;line-height:1.55">
                  🔒 <b>100% Privacy Assured:</b> Your store URL &amp; email are strictly used to record your personal 3-minute video audit and prepare your quote. Zero spam, never shared. Read our <a href="/privacy/" style="color:var(--ink);text-decoration:underline">Privacy Policy</a>.
                </div>"""
        
        # Check if already added
        if "100% Privacy Assured:" not in content:
            content = content.replace(
                """<div id="auditStatusEN" style="margin-top:14px;font-size:14px;display:none"></div>
            </form>""",
                f"""<div id="auditStatusEN" style="margin-top:14px;font-size:14px;display:none"></div>
                {en_privacy_box}
            </form>"""
            )

        # 5. Replace Dutch blog preview cards with English Phase 1 Problem Articles
        english_blog_cards = """          <article class="card post-card">
            <span class="p-cat">Shopify · Speed &amp; Mobile</span>
            <h3><a href="/blog/why-is-my-shopify-store-so-slow/">Why Is My Shopify Store So Slow? 5 Fixes That Actually Work</a></h3>
            <p>Every app installed, uncompressed image, and heavy theme script eats into your mobile conversion rate. Here are the 5 high-impact fixes that actually move the needle.</p>
            <p class="post-meta">October 2026 · 4 min read</p>
            <a class="more" href="/blog/why-is-my-shopify-store-so-slow/">Read the article →</a>
          </article>
          <article class="card post-card">
            <span class="p-cat">WooCommerce · Checkout Diagnostics</span>
            <h3><a href="/blog/woocommerce-checkout-broken-diagnose-10-minutes/">WooCommerce Checkout Broken? How to Diagnose It in 10 Minutes</a></h3>
            <p>Step-by-step developer checklist to pinpoint why carts stall, AJAX spinners hang, and payment gateways fail on WooCommerce.</p>
            <p class="post-meta">October 2026 · 5 min read</p>
            <a class="more" href="/blog/woocommerce-checkout-broken-diagnose-10-minutes/">Read the article →</a>
          </article>
          <article class="card post-card">
            <span class="p-cat">WooCommerce · Performance &amp; Core Web Vitals</span>
            <h3><a href="/blog/how-to-fix-slow-woocommerce-store-practical-checklist/">How to Fix a Slow WooCommerce Store: A Practical Checklist</a></h3>
            <p>From server response time (TTFB) to cart fragments and database bloat — a developer-grade checklist to speed up your store.</p>
            <p class="post-meta">October 2026 · 6 min read</p>
            <a class="more" href="/blog/how-to-fix-slow-woocommerce-store-practical-checklist/">Read the article →</a>
          </article>"""

        old_cards_pattern = r"<div class=\"blog-grid\" id=\"homeBlogGrid\" style=\"padding:20px 0 30px\">.*?</div>\s*<div style=\"text-align:center;margin-top:28px\">"
        replacement_block = f"""<div class="blog-grid" id="homeBlogGrid" style="padding:20px 0 30px">
{english_blog_cards}
        </div>
        <div style="text-align:center;margin-top:28px">"""
        content = re.sub(old_cards_pattern, replacement_block, content, flags=re.DOTALL)

        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✓ Overhauled English home in {fpath}")

def overhaul_dutch_home():
    for ext in ["php", "html"]:
        fpath = os.path.join(HTDOCS, f"nl/index.{ext}")
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()

        # 1. Add Privacy Assurance below auditFormNL submit button
        nl_privacy_box = """<div style="font-size:12.5px;color:var(--ink-soft);text-align:center;margin-top:12px;line-height:1.55">
                  🔒 <b>100% Privacygarantie:</b> Je webshop URL en e-mailadres worden uitsluitend gebruikt om je persoonlijke 3-minuten video audit en offerte te sturen. Geen spam, nooit gedeeld met derden. Lees ons <a href="/privacy/" style="color:var(--ink);text-decoration:underline">Privacybeleid</a>.
                </div>"""
        if "100% Privacygarantie:" not in content:
            content = content.replace(
                """<div id="auditStatusNL" style="margin-top:14px;font-size:14px;display:none"></div>
            </form>""",
                f"""<div id="auditStatusNL" style="margin-top:14px;font-size:14px;display:none"></div>
                {nl_privacy_box}
            </form>"""
            )

        # 2. Replace redundant second contact form with a clean, low-friction closing CTA
        clean_cta_section = """  <!-- Closing Direct CTA (Replaces Redundant Secondary Form) -->
  <section id="contact" class="section">
    <div class="wrap">
      <div class="contact-box" style="text-align:center;padding:48px 32px">
        <div class="eyebrow" style="margin-bottom:8px">DIRECT CONTACT MET DE DEVELOPER</div>
        <h2 style="font-size:clamp(26px,4vw,34px);margin:0 0 14px">Klaar Om Jouw Webwinkel Te Versnellen?</h2>
        <p style="color:var(--ink-soft);font-size:16.5px;max-width:620px;margin:0 auto 28px;line-height:1.6">
          Geen accountmanagers, geen uurtje-factuurtje en geen risico. Vraag een Gratis 3-Minuten Video Audit aan of stuur direct een WhatsApp / e-mail voor snel advies.
        </p>
        <div style="display:flex;justify-content:center;flex-wrap:wrap;gap:14px;align-items:center">
          <a href="#gratis-audit" class="btn" style="background:var(--gold-btn);border-color:var(--gold);color:var(--gold-btn-text)!important;font-size:15.5px;padding:12px 24px">
            ⚡ Vraag Jouw Gratis Video Audit Aan →
          </a>
          <a href="https://wa.me/916353116138?text=Hallo%20Jay,%20ik%20heb%20hulp%20nodig%20met%20mijn%20webshop" target="_blank" rel="noopener" class="btn btn-ghost" style="color:#25D366;border-color:rgba(37,211,102,0.4);font-size:15px;padding:12px 20px">
            💬 WhatsApp: +91 6353116138
          </a>
          <a href="mailto:jay@jaylakum.com" class="btn btn-ghost" style="font-size:15px;padding:12px 20px">
            ✉️ jay@jaylakum.com
          </a>
        </div>
        <p style="margin:22px 0 0;font-size:13.5px;color:var(--ink-faint)">
          Reactie binnen 24 uur &middot; Vaste prijsopgave &middot; 100% Betalen bij oplevering
        </p>
      </div>
    </div>
  </section>"""

        old_contact_pattern = r"<section id=\"contact\" class=\"section\">.*?</section>"
        content = re.sub(old_contact_pattern, clean_cta_section, content, flags=re.DOTALL)

        # 3. Clean up FAQ #5 from "lokaal Amsterdams bureau" to "traditioneel Nederlands webbureau" on nl/
        content = content.replace(
            "Waarom kies ik voor Jay Lakum en niet een lokaal Amsterdams bureau?",
            "Waarom kies ik voor Jay Lakum en niet een traditioneel Nederlands webbureau?"
        )
        content = content.replace(
            "Grote bureaus hebben kantoorpanden, projectmanagers en hoge overheadkosten, waardoor zij vaak €5.000+ rekenen voor eenvoudige optimalisaties.",
            "Traditionele full-service bureaus hebben forse kantoorpanden, projectmanagers en hoge overheadkosten, waardoor zij vaak €3.000 tot €6.000 rekenen voor relatief eenvoudige optimalisaties."
        )

        # 4. Harmonize speed sprint and pricing terms on nl/
        content = content.replace(
            "<span>✓ Target sub-1.5s mobiele laadtijd</span>",
            "<span>✓ Sub-2.5s mobiele LCP (Google Core Web Vitals)</span>"
        )
        content = content.replace(
            "<span>✓ Oplevering op testomgeving voor betaling</span>",
            "<span>✓ 100% Betalen bij oplevering na staging verificatie</span>"
        )

        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✓ Overhauled Dutch home in {fpath}")

def overhaul_city_pages():
    cities = ["amsterdam", "rotterdam", "utrecht", "den-haag", "eindhoven"]
    for c in cities:
        for ext in ["php", "html"]:
            fpath = os.path.join(HTDOCS, f"nl/{c}/index.{ext}")
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()

            # 1. Add privacy assurance under auditFormNL submit button
            nl_privacy_box = """<div style="font-size:12.5px;color:var(--ink-soft);text-align:center;margin-top:12px;line-height:1.55">
                  🔒 <b>100% Privacygarantie:</b> Je webshop URL en e-mailadres worden uitsluitend gebruikt om je persoonlijke 3-minuten video audit en offerte te sturen. Geen spam, nooit gedeeld met derden. Lees ons <a href="/privacy/" style="color:var(--ink);text-decoration:underline">Privacybeleid</a>.
                </div>"""
            if "100% Privacygarantie:" not in content:
                content = content.replace(
                    """<div id="auditStatusNL" style="margin-top:14px;font-size:14px;display:none"></div>
            </form>""",
                    f"""<div id="auditStatusNL" style="margin-top:14px;font-size:14px;display:none"></div>
                {nl_privacy_box}
            </form>"""
                )

            # 2. Replace redundant second contact form with clean direct CTA
            clean_city_cta = f"""  <!-- Closing Direct CTA (Replaces Redundant Secondary Form) -->
  <section id="contact" class="section">
    <div class="wrap">
      <div class="contact-box" style="text-align:center;padding:48px 32px">
        <div class="eyebrow" style="margin-bottom:8px">DIRECT CONTACT MET DE DEVELOPER &bull; {c.upper()}</div>
        <h2 style="font-size:clamp(26px,4vw,34px);margin:0 0 14px">Klaar Om Jouw Webwinkel Te Versnellen?</h2>
        <p style="color:var(--ink-soft);font-size:16.5px;max-width:620px;margin:0 auto 28px;line-height:1.6">
          Geen accountmanagers, geen uurtje-factuurtje en geen risico. Vraag een Gratis 3-Minuten Video Audit aan of stuur direct een WhatsApp / e-mail voor snel advies.
        </p>
        <div style="display:flex;justify-content:center;flex-wrap:wrap;gap:14px;align-items:center">
          <a href="#gratis-audit" class="btn" style="background:var(--gold-btn);border-color:var(--gold);color:var(--gold-btn-text)!important;font-size:15.5px;padding:12px 24px">
            ⚡ Vraag Jouw Gratis Video Audit Aan →
          </a>
          <a href="https://wa.me/916353116138?text=Hallo%20Jay,%20ik%20heb%20hulp%20nodig%20met%20mijn%20webshop" target="_blank" rel="noopener" class="btn btn-ghost" style="color:#25D366;border-color:rgba(37,211,102,0.4);font-size:15px;padding:12px 20px">
            💬 WhatsApp: +91 6353116138
          </a>
          <a href="mailto:jay@jaylakum.com" class="btn btn-ghost" style="font-size:15px;padding:12px 20px">
            ✉️ jay@jaylakum.com
          </a>
        </div>
        <p style="margin:22px 0 0;font-size:13.5px;color:var(--ink-faint)">
          Reactie binnen 24 uur &middot; Vaste prijsopgave &middot; 100% Betalen bij oplevering
        </p>
      </div>
    </div>
  </section>"""
            old_contact_pattern = r"<section id=\"contact\" class=\"section\">.*?</section>"
            content = re.sub(old_contact_pattern, clean_city_cta, content, flags=re.DOTALL)

            with open(fpath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"✓ Overhauled city page {fpath}")

def overhaul_case_studies():
    for ext in ["php", "html"]:
        # Dutch case study
        nl_path = os.path.join(HTDOCS, f"nl/case-study/index.{ext}")
        with open(nl_path, "r", encoding="utf-8") as f:
            c = f.read()
        c = c.replace(
            "<strong>Eerste Klant Garantie:</strong>",
            "<strong>Gegarandeerde Werkwijze op Staging:</strong>"
        )
        with open(nl_path, "w", encoding="utf-8") as f:
            f.write(c)
        print(f"✓ Cleaned case-study {nl_path}")

        # English case study
        en_path = os.path.join(HTDOCS, f"case-study/index.{ext}")
        with open(en_path, "r", encoding="utf-8") as f:
            c = f.read()
        c = c.replace(
            "<strong>First Client Guarantee:</strong>",
            "<strong>Guaranteed Staging Verification:</strong>"
        )
        with open(en_path, "w", encoding="utf-8") as f:
            f.write(c)
        print(f"✓ Cleaned case-study {en_path}")

if __name__ == "__main__":
    overhaul_english_home()
    overhaul_dutch_home()
    overhaul_city_pages()
    overhaul_case_studies()
    print("All conversion trust, privacy, and consistency overhauls applied!")
