import os
import re
from bs4 import BeautifulSoup

BASE_DIR = '/Applications/XAMPP/xamppfiles/htdocs/jaylakum'

def fix_contrast_and_labels_dutch(fpath):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Contrast variables
    content = re.sub(r'--ink-soft:\s*#4A463F;', '--ink-soft:#423E37;', content)
    content = re.sub(r'--ink-faint:\s*#6E6759;', '--ink-faint:#595347;', content)
    content = re.sub(r'--gold:\s*#A98548;', '--gold:#684B1B;', content)
    content = re.sub(r'--gold-deep:\s*#8A6C33;', '--gold-deep:#553D16;\n    --gold-btn:#745218;', content)

    # Dark mode
    content = re.sub(r'--ink-soft:\s*#CFC6B2;', '--ink-soft:#D4CBBC;', content)
    content = re.sub(r'--ink-faint:\s*#A99E86;', '--ink-faint:#B5A894;', content)
    content = re.sub(r'--gold:\s*#C9A45C;', '--gold:#E5BE72;', content)
    content = re.sub(r'--gold-deep:\s*#C9A45C;', '--gold-deep:#F0CE8A;\n      --gold-btn:#E5BE72;', content)

    # Buttons
    content = re.sub(r'background:\s*var\(--gold\);\s*color:\s*#FFF;', 'background:var(--gold-btn, #745218);color:#FFF;', content)
    content = re.sub(r'background:\s*var\(--gold-deep\);\s*color:\s*#fff;', 'background:var(--gold-btn, #745218);color:#FFF;', content)
    content = re.sub(r'background:\s*var\(--gold-deep\);\s*color:\s*#FFF;', 'background:var(--gold-btn, #745218);color:#FFF;', content)

    # Review colors
    content = content.replace('color:#f59e0b;', 'color:#b45309;')
    content = content.replace('background:rgba(46,204,113,0.12);color:#2ecc71;', 'background:rgba(22,101,52,0.12);color:#15803d;')

    # Sliders aria-labels
    content = content.replace('id="rngVisitors"', 'id="rngVisitors" aria-label="Aantal maandelijkse bezoekers"')
    content = content.replace('id="rngAov"', 'id="rngAov" aria-label="Gemiddelde orderwaarde"')
    content = content.replace('id="rngSpeed"', 'id="rngSpeed" aria-label="Huidige mobiele laadtijd"')

    # auditFormNL labels
    content = content.replace(
        '<label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Webshop URL *</label>',
        '<label for="audit-url-nl" style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Webshop URL *</label>'
    )
    content = content.replace(
        '<label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">E-mailadres (voor de videolink) *</label>',
        '<label for="audit-email-nl" style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">E-mailadres (voor de videolink) *</label>'
    )
    content = content.replace(
        '<label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">E-Commerce Platform</label>',
        '<label for="audit-platform-nl" style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">E-Commerce Platform</label>'
    )
    content = content.replace(
        '<label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Grootste Frustratie (Optioneel)</label>',
        '<label for="audit-msg-nl" style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Grootste Frustratie (Optioneel)</label>'
    )

    # dutchContactForm labels
    replacements = [
        ('<label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Jouw Naam *</label>',
         '<label for="nl-name" style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Jouw Naam *</label>'),
        ('<label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">E-mailadres *</label>',
         '<label for="nl-email" style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">E-mailadres *</label>'),
        ('<label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Webshop URL *</label>',
         '<label for="nl-url" style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Webshop URL *</label>'),
        ('<label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Waar heb je hulp bij nodig? *</label>',
         '<label for="nl-service" style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Waar heb je hulp bij nodig? *</label>'),
        ('<label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Indicatie Projectbudget</label>',
         '<label for="nl-budget" style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Indicatie Projectbudget</label>'),
        ('<label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Omschrijf het probleem of gewenste resultaat *</label>',
         '<label for="nl-msg" style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Omschrijf het probleem of gewenste resultaat *</label>')
    ]
    for old, new in replacements:
        content = content.replace(old, new)

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated contrast & labels in {os.path.relpath(fpath, BASE_DIR)}")

# Apply to nl/index.html & nl/index.php
for fn in ['index.html', 'index.php']:
    fp = os.path.join(BASE_DIR, 'nl', fn)
    if os.path.exists(fp):
        fix_contrast_and_labels_dutch(fp)

# Apply to all city pages
cities = ['amsterdam', 'rotterdam', 'utrecht', 'den-haag', 'eindhoven']
for c in cities:
    for fn in ['index.html', 'index.php']:
        fp = os.path.join(BASE_DIR, 'nl', c, fn)
        if os.path.exists(fp):
            fix_contrast_and_labels_dutch(fp)
