#!/usr/bin/env python3
import os
import re

TARGET_DIRS = [
    "/Applications/XAMPP/xamppfiles/htdocs/jaylakum",
    "/Users/jay/Documents/GitHub/jaylakum"
]

NEW_TITLE = "⚡ Fix Shopify &amp; WooCommerce Speed in 24h | Jay Lakum"
NEW_TITLE_JS = "⚡ Fix Shopify & WooCommerce Speed in 24h | Jay Lakum"
NEW_DESC = "Sub-2s mobile speed &amp; checkout bug fixes for European Shopify &amp; WooCommerce webshops. Fixed quote upfront, no hourly surprises. Fast 24-48h turnaround."
NEW_DESC_JS = "Sub-2s mobile speed & checkout bug fixes for European Shopify & WooCommerce webshops. Fixed quote upfront, no hourly surprises. Fast 24-48h turnaround."

FAQ_SCHEMA = """<!-- Google Rich FAQ Schema for Search Snippets -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Hoe snel kan een trage Shopify of WooCommerce webshop versneld worden?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "De meeste snelheidsproblemen, render-blocking scripts en ongebruikte app-resten worden binnen 24 tot 48 uur opgelost op een veilige staging omgeving, zonder live onderbreking."
      }
    },
    {
      "@type": "Question",
      "name": "Wat kost het repareren van een haperende checkout of iDEAL/Mollie fout?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ik werk uitsluitend met een vaste prijs vooraf (fixed quote upfront). Geen onverwachte uurtarieven of nacalculaties."
      }
    },
    {
      "@type": "Question",
      "name": "Werk je rechtstreeks op de live webshop?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nee, alle aanpassingen, code-opschoning en checkout tests worden eerst grondig getest op een staging/duplicaat omgeving voordat ze worden uitgerold."
      }
    }
  ]
}
</script>"""

WA_CONTACT_SIDE_EN = """        <div class="contact-side">
          <h2>Prefer plain email or WhatsApp?</h2>
          <p>Forms aren't for everyone. Email me directly with your store's URL and a line about what's wrong:</p>
          <a class="big-mail" href="mailto:jay@jaylakum.com">jay@jaylakum.com</a>
          
          <div style="margin:20px 0;padding:16px;background:var(--bg-soft);border:1px solid var(--line);border-radius:10px">
            <p style="margin:0 0 10px;font-weight:600;color:var(--ink);font-size:15px">💬 Need faster answers? Message directly on WhatsApp:</p>
            <a class="btn" href="https://wa.me/916353116138?text=Hi%20Jay,%20I%20need%20help%20with%20my%20webshop%20speed" target="_blank" rel="noopener" style="background:#25D366;color:#FFFFFF!important;display:inline-flex;align-items:center;gap:8px;font-weight:600;padding:9px 18px;font-size:14px;border:none">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84a8.19 8.19 0 0 1-5.82 2.41h-.01c-1.42 0-2.82-.37-4.06-1.08l-.29-.17-3.11.82.83-3.03-.19-.3a8.217 8.217 0 0 1-1.26-4.49c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.07-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.77-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.12-.22-.19-.47-.32z"/></svg>
              Chat on WhatsApp: +91 6353116138
            </a>
          </div>

          <p class="reply-note"><span class="tick">✓</span><span><strong>I reply within 24 hours</strong> — usually with a Free 3-Minute Video Audit of your store and honest first thoughts, whether you hire me or not.</span></p>
          <p class="reply-note"><span class="tick">✓</span><span><strong>Async-first:</strong> everything in writing, so you can read and decide in your own time. If a call would help, a member of my team will join it.</span></p>
        </div>"""

for base_dir in TARGET_DIRS:
    print(f"--- Processing {base_dir} ---")
    
    # 1. Update index.html & index.php
    for fname in ["index.html", "index.php"]:
        fpath = os.path.join(base_dir, fname)
        if not os.path.exists(fpath):
            continue
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()

        # Update Title
        content = re.sub(
            r"<title>.*?</title>",
            f"<title>{NEW_TITLE}</title>",
            content,
            count=1
        )

        # Update Meta Description
        content = re.sub(
            r'<meta name="description" content=".*?" />',
            f'<meta name="description" content="{NEW_DESC}" />',
            content,
            count=1
        )

        # Update META.home in JS
        content = re.sub(
            r'home:\s*\{\s*title:\s*"[^"]*",\s*desc:\s*"[^"]*"\s*\}',
            f'home:     {{ title: "{NEW_TITLE_JS}",\\n              desc: "{NEW_DESC_JS}" }}',
            content,
            count=1
        )

        # Add FAQ Schema before </head> if not already present
        if "Hoe snel kan een trage Shopify of WooCommerce webshop versneld worden?" not in content:
            content = content.replace("</head>", f"{FAQ_SCHEMA}\n</head>", 1)

        # Update contact-side with WhatsApp
        old_contact_side_match = re.search(r'<div class="contact-side">.*?</div>\s*</div>\s*</div>\s*</section>', content, re.DOTALL)
        if old_contact_side_match and "wa.me/916353116138" not in content:
            # Replace contact-side
            sub_re = r'<div class="contact-side">.*?</div>(?=\s*</div>\s*</div>\s*</section>)'
            content = re.sub(sub_re, WA_CONTACT_SIDE_EN.strip(), content, count=1, flags=re.DOTALL)

        # Add WhatsApp to footer navigation if not present
        if 'href="https://wa.me/916353116138' not in content:
            content = content.replace(
                '<a href="mailto:jay@jaylakum.com">jay@jaylakum.com</a>',
                '<a href="mailto:jay@jaylakum.com">jay@jaylakum.com</a>\n      <a href="https://wa.me/916353116138?text=Hi%20Jay,%20I%20need%20help%20with%20my%20webshop%20speed" target="_blank" rel="noopener" style="color:#25D366;font-weight:600">💬 WhatsApp: +91 6353116138</a>'
            )

        # Update Sticky Mobile bar to include WhatsApp icon/link
        old_sticky = '<a class="btn btn-ghost sticky-btn-mail" href="mailto:jay@jaylakum.com">✉️ Email</a>'
        new_sticky = '<a class="btn btn-ghost sticky-btn-mail" href="https://wa.me/916353116138?text=Hi%20Jay,%20I%20need%20help%20with%20my%20webshop%20speed" target="_blank" rel="noopener" style="color:#25D366;border-color:rgba(37,211,102,0.4)">💬 WhatsApp</a>'
        if old_sticky in content:
            content = content.replace(old_sticky, new_sticky)

        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {fname}")

    # 2. Update nl/index.html & nl/index.php with WhatsApp
    for fname in ["nl/index.html", "nl/index.php"]:
        fpath = os.path.join(base_dir, fname)
        if not os.path.exists(fpath):
            continue
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()

        # Update direct email line with WhatsApp
        old_line = 'Liever direct e-mailen? Stuur je winkel link naar <a href="mailto:jay@jaylakum.com"><b>jay@jaylakum.com</b></a>'
        new_line = ('Liever direct e-mailen of WhatsAppen? Stuur je winkel link naar <a href="mailto:jay@jaylakum.com"><b>jay@jaylakum.com</b></a> '
                    'of <a href="https://wa.me/916353116138?text=Hallo%20Jay,%20ik%20heb%20hulp%20nodig%20met%20mijn%20webshop" target="_blank" rel="noopener" style="color:#25D366;font-weight:700">💬 Direct WhatsApp (+91 6353116138)</a>')
        if old_line in content:
            content = content.replace(old_line, new_line)

        # Update sticky bar
        old_sticky = '<a class="btn btn-ghost sticky-btn-mail" href="mailto:jay@jaylakum.com">✉️ E-mail</a>'
        new_sticky = '<a class="btn btn-ghost sticky-btn-mail" href="https://wa.me/916353116138?text=Hallo%20Jay,%20ik%20heb%20hulp%20nodig%20met%20mijn%20webshop" target="_blank" rel="noopener" style="color:#25D366;border-color:rgba(37,211,102,0.4)">💬 WhatsApp</a>'
        if old_sticky in content:
            content = content.replace(old_sticky, new_sticky)

        # Update footer
        old_foot = '<p style="margin:0 0 6px">Email: <a href="mailto:jay@jaylakum.com"><b>jay@jaylakum.com</b></a></p>'
        new_foot = ('<p style="margin:0 0 6px">Email: <a href="mailto:jay@jaylakum.com"><b>jay@jaylakum.com</b></a></p>\n'
                    '        <p style="margin:0 0 6px"><a href="https://wa.me/916353116138?text=Hallo%20Jay,%20ik%20heb%20hulp%20nodig%20met%20mijn%20webshop" target="_blank" rel="noopener" style="color:#25D366;font-weight:600">💬 WhatsApp: +91 6353116138</a></p>')
        if old_foot in content and "WhatsApp: +91 6353116138" not in content:
            content = content.replace(old_foot, new_foot)

        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {fname}")

    # 3. Update city pages (amsterdam, rotterdam, utrecht, den-haag, eindhoven)
    cities = ["amsterdam", "rotterdam", "utrecht", "den-haag", "eindhoven"]
    for c in cities:
        for fname in ["index.html", "index.php"]:
            fpath = os.path.join(base_dir, "nl", c, fname)
            if not os.path.exists(fpath):
                continue
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
            
            old_line = 'Liever direct e-mailen? Stuur je winkel link naar <a href="mailto:jay@jaylakum.com"><b>jay@jaylakum.com</b></a>'
            new_line = ('Liever direct e-mailen of WhatsAppen? Stuur je winkel link naar <a href="mailto:jay@jaylakum.com"><b>jay@jaylakum.com</b></a> '
                        'of <a href="https://wa.me/916353116138?text=Hallo%20Jay,%20ik%20heb%20hulp%20nodig%20met%20mijn%20webshop" target="_blank" rel="noopener" style="color:#25D366;font-weight:700">💬 Direct WhatsApp (+91 6353116138)</a>')
            if old_line in content:
                content = content.replace(old_line, new_line)

            old_sticky = '<a class="btn btn-ghost sticky-btn-mail" href="mailto:jay@jaylakum.com">✉️ E-mail</a>'
            new_sticky = '<a class="btn btn-ghost sticky-btn-mail" href="https://wa.me/916353116138?text=Hallo%20Jay,%20ik%20heb%20hulp%20nodig%20met%20mijn%20webshop" target="_blank" rel="noopener" style="color:#25D366;border-color:rgba(37,211,102,0.4)">💬 WhatsApp</a>'
            if old_sticky in content:
                content = content.replace(old_sticky, new_sticky)

            old_foot = '<p style="margin:0 0 6px">Email: <a href="mailto:jay@jaylakum.com"><b>jay@jaylakum.com</b></a></p>'
            new_foot = ('<p style="margin:0 0 6px">Email: <a href="mailto:jay@jaylakum.com"><b>jay@jaylakum.com</b></a></p>\n'
                        '        <p style="margin:0 0 6px"><a href="https://wa.me/916353116138?text=Hallo%20Jay,%20ik%20heb%20hulp%20nodig%20met%20mijn%20webshop" target="_blank" rel="noopener" style="color:#25D366;font-weight:600">💬 WhatsApp: +91 6353116138</a></p>')
            if old_foot in content and "WhatsApp: +91 6353116138" not in content:
                content = content.replace(old_foot, new_foot)

            with open(fpath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated nl/{c}/{fname}")

print("All updates applied successfully.")
