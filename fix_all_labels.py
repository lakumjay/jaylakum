import os
import re

BASE_DIR = '/Applications/XAMPP/xamppfiles/htdocs/jaylakum'

def fix_all_dutch_form_labels(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        c = f.read()

    # Labels for dutchContactForm
    c = c.replace('<label style="display:block;font-weight:600;margin-bottom:6px;font-size:14px">Jouw Naam</label>',
                  '<label for="nl-name" style="display:block;font-weight:600;margin-bottom:6px;font-size:14px">Jouw Naam</label>')
    c = c.replace('<label style="display:block;font-weight:600;margin-bottom:6px;font-size:14px">E-mailadres</label>',
                  '<label for="nl-email" style="display:block;font-weight:600;margin-bottom:6px;font-size:14px">E-mailadres</label>')
    c = c.replace('<label style="display:block;font-weight:600;margin-bottom:6px;font-size:14px">Webshop URL</label>',
                  '<label for="nl-url" style="display:block;font-weight:600;margin-bottom:6px;font-size:14px">Webshop URL</label>')
    c = c.replace('<label style="display:block;font-weight:600;margin-bottom:6px;font-size:14px">Waar heb je hulp bij nodig?</label>',
                  '<label for="nl-service" style="display:block;font-weight:600;margin-bottom:6px;font-size:14px">Waar heb je hulp bij nodig?</label>')
    c = c.replace('<label style="display:block;font-weight:600;margin-bottom:6px;font-size:14px">Indicatie Projectbudget</label>',
                  '<label for="nl-budget" style="display:block;font-weight:600;margin-bottom:6px;font-size:14px">Indicatie Projectbudget</label>')
    c = c.replace('<label style="display:block;font-weight:600;margin-bottom:6px;font-size:14px">Omschrijf het probleem of gewenste resultaat</label>',
                  '<label for="nl-msg" style="display:block;font-weight:600;margin-bottom:6px;font-size:14px">Omschrijf het probleem of gewenste resultaat</label>')

    # With asterisk if any
    c = c.replace('<label style="display:block;font-weight:600;margin-bottom:6px;font-size:14px">Jouw Naam *</label>',
                  '<label for="nl-name" style="display:block;font-weight:600;margin-bottom:6px;font-size:14px">Jouw Naam *</label>')
    c = c.replace('<label style="display:block;font-weight:600;margin-bottom:6px;font-size:14px">E-mailadres *</label>',
                  '<label for="nl-email" style="display:block;font-weight:600;margin-bottom:6px;font-size:14px">E-mailadres *</label>')
    c = c.replace('<label style="display:block;font-weight:600;margin-bottom:6px;font-size:14px">Webshop URL *</label>',
                  '<label for="nl-url" style="display:block;font-weight:600;margin-bottom:6px;font-size:14px">Webshop URL *</label>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(c)

for root, dirs, files in os.walk(os.path.join(BASE_DIR, 'nl')):
    for f in files:
        if f.endswith(('.html', '.php')):
            fix_all_dutch_form_labels(os.path.join(root, f))
            print(f"Fixed labels in nl/{os.path.relpath(os.path.join(root, f), os.path.join(BASE_DIR, 'nl'))}")

