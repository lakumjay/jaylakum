#!/usr/bin/env python3
"""
Add Rich Google FAQs Schema (FAQPage JSON-LD) and on-page FAQ accordion items to:
- /nl/
- /nl/amsterdam/
- /nl/rotterdam/
- /nl/utrecht/
- /nl/den-haag/
- /nl/eindhoven/
"""

import os

BASE = "/Applications/XAMPP/xamppfiles/htdocs/jaylakum/nl"

PAGES = {
    "nl": {
        "path": BASE,
        "id": "https://jaylakum.com/nl/#faq",
        "city_q1": "Wat kost een Shopify of WooCommerce speed optimalisatie?",
        "city_a1": "Een complete Shopify of WooCommerce snelheidsoptimalisatie voer ik uit op basis van één vaste projectprijs vooraf (geen onverwachte nacalculatie). Na een gratis mini-audit ontvang je een duidelijke schriftelijke scope met gegarandeerde doelen. Betaling gebeurt pas na oplevering en verificatie op staging.",
        "city_q2": "Hoe snel is mijn trage WooCommerce checkout of Mollie storing opgelost?",
        "city_a2": "Acute checkout storingen, vastlopende iDEAL betalingen en Mollie webhook timeouts los ik doorgaans binnen 24 tot 48 uur op op een veilige staging omgeving zonder dat je live winkel offline hoeft."
    },
    "amsterdam": {
        "path": os.path.join(BASE, "amsterdam"),
        "id": "https://jaylakum.com/nl/amsterdam/#faq",
        "city_q1": "Wat kost een Shopify speed optimalisatie voor een winkel in Amsterdam?",
        "city_a1": "Voor Amsterdamse boutique- en modemerken werk ik met vaste projectprijzen vooraf. Na een kosteloze inspectie van je Liquid thema en app-scripts ontvang je een transparante offerte. Betaling volgt pas na oplevering op staging.",
        "city_q2": "Hoe snel kan een trage Shopify store in Amsterdam geoptimaliseerd worden?",
        "city_a2": "Acute checkout bugs of haperende Mollie iDEAL koppelingen worden binnen 24 tot 48 uur verholpen. Een complete Core Web Vitals optimalisatie duurt gemiddeld 3 tot 5 werkdagen inclusief grondige metingen."
    },
    "rotterdam": {
        "path": os.path.join(BASE, "rotterdam"),
        "id": "https://jaylakum.com/nl/rotterdam/#faq",
        "city_q1": "Wat kost een WooCommerce speed optimalisatie voor een Rotterdamse retailer?",
        "city_a1": "Rotterdamse retailers met grote catalogi en PostNL/Exact koppelingen ontvangen vooraf één duidelijke vaste offerte. Geen uurtje-factuurtje: je weet vooraf exact wat de investering is.",
        "city_q2": "Hoe snel los je trage winkelmandjes en database queries op in Rotterdam?",
        "city_a2": "Database query optimalisatie en webhook vertragingen worden doorgaans binnen 48 uur geïsoleerd en opgelost op een veilige testomgeving zonder live onderbreking."
    },
    "utrecht": {
        "path": os.path.join(BASE, "utrecht"),
        "id": "https://jaylakum.com/nl/utrecht/#faq",
        "city_q1": "Wat kost het om Core Web Vitals groen te krijgen voor een webshop in Utrecht?",
        "city_a1": "Afhankelijk van je e-commerce platform ontvang je een vaste prijsopgave met meetbare Core Web Vitals targets (LCP < 2.0s, INP < 200ms) binnen overeengekomen scope.",
        "city_q2": "Hoe snel kan mijn webwinkel in Utrecht sneller laden op mobiel?",
        "city_a2": "Mobiele laadtijdverbeteringen voer ik binnen 3 tot 5 werkdagen uit met moderne WebP/AVIF compressie en CSS/JS stroomlijning op staging."
    },
    "den-haag": {
        "path": os.path.join(BASE, "den-haag"),
        "id": "https://jaylakum.com/nl/den-haag/#faq",
        "city_q1": "Wat kost het oplossen van een Mollie iDEAL checkout fout in Den Haag?",
        "city_a1": "Voor acute checkout en payment gateway reparaties hanteer ik een vaste prijsopgave vooraf met de 'geen oplossing, geen factuur' garantie binnen schriftelijke scope.",
        "city_q2": "Hoe snel is een Mollie iDEAL webhook storing in Den Haag opgelost?",
        "city_a2": "Webhook timeouts en iDEAL status haperingen los ik meestal binnen 24 tot 48 uur op door caching uitsluitingen en API-log analyses."
    },
    "eindhoven": {
        "path": os.path.join(BASE, "eindhoven"),
        "id": "https://jaylakum.com/nl/eindhoven/#faq",
        "city_q1": "Wat kost maatwerk Shopify of Storefront API ontwikkeling in Eindhoven?",
        "city_a1": "Voor Eindhovense tech- en hardware merken hanteer ik transparante projectprijzen op basis van modulaire architectuur en vaste mijlpalen.",
        "city_q2": "Hoe snel worden custom Liquid scripts en filters in Eindhoven gebouwd?",
        "city_a2": "Maatwerk functionaliteiten lever ik modulair op staging binnen 3 tot 5 werkdagen, getest op prestaties en mobiele responsiviteit."
    }
}

for key, data in PAGES.items():
    for ext in ["index.html", "index.php"]:
        filepath = os.path.join(data["path"], ext)
        if not os.path.exists(filepath):
            continue
        with open(filepath, "r", encoding="utf-8") as f:
            c = f.read()

        # Update FAQ Schema ID to match page
        c = c.replace('"@id": "https://jaylakum.com/nl/#faq"', f'"@id": "{data["id"]}"')

        # Check if new questions already in schema
        if data["city_q1"] not in c:
            new_schema_questions = f"""        {{
          "@type": "Question",
          "name": "{data['city_q1']}",
          "acceptedAnswer": {{
            "@type": "Answer",
            "text": "{data['city_a1']}"
          }}
        }},
        {{
          "@type": "Question",
          "name": "{data['city_q2']}",
          "acceptedAnswer": {{
            "@type": "Answer",
            "text": "{data['city_a2']}"
          }}
        }},"""
            c = c.replace('"mainEntity": [', f'"mainEntity": [\n{new_schema_questions}')

        # Add visual FAQ items
        if data["city_q1"] not in c:
            new_visual_items = f"""        <details class="faq-item">
          <summary>{data['city_q1']}</summary>
          <p>{data['city_a1']}</p>
        </details>

        <details class="faq-item">
          <summary>{data['city_q2']}</summary>
          <p>{data['city_a2']}</p>
        </details>
"""
            c = c.replace('<div class="faq-wrap">', f'<div class="faq-wrap">\n{new_visual_items}')

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(c)
        print(f"✓ Updated FAQ schema & visuals in {key}/{ext}")

print("All FAQs Schema & visual accordions updated successfully!")
