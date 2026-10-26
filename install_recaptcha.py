#!/usr/bin/env python3
import os

HTDOCS = "/Applications/XAMPP/xamppfiles/htdocs/jaylakum"
SITE_KEY = "6LdWFgluAAAAABNJxy864jQVCCq-9JzdpJizcnWS"
SECRET_KEY = "6LdWFgluAAAAAIWLGOoAQy_fRCviHgqDh1sYh1eS"

def update_contact_php():
    path = os.path.join(HTDOCS, "contact.php")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Set secret key and curl verification
    old_block = "$recaptcha_secret = getenv('RECAPTCHA_SECRET_KEY') ?: '';"
    new_block = f"$recaptcha_secret = getenv('RECAPTCHA_SECRET_KEY') ?: '{SECRET_KEY}';"
    if old_block in content:
        content = content.replace(old_block, new_block)
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("✓ Updated Secret Key in contact.php")

def update_html_php_files():
    files = [
        os.path.join(HTDOCS, "nl/index.html"),
        os.path.join(HTDOCS, "nl/index.php"),
        os.path.join(HTDOCS, "index.html"),
        os.path.join(HTDOCS, "index.php"),
    ]
    for city in ["amsterdam", "rotterdam", "utrecht", "den-haag", "eindhoven"]:
        files.append(os.path.join(HTDOCS, f"nl/{city}/index.html"))
        files.append(os.path.join(HTDOCS, f"nl/{city}/index.php"))

    recaptcha_script = '<script src="https://www.google.com/recaptcha/api.js" async defer></script>'
    recaptcha_div = f'<div class="g-recaptcha" data-sitekey="{SITE_KEY}" style="margin-bottom:12px"></div>'

    for fpath in files:
        if not os.path.exists(fpath):
            continue
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()

        # 1. Add reCAPTCHA script to head
        if 'https://www.google.com/recaptcha/api.js' not in content:
            content = content.replace('</head>', f'{recaptcha_script}\n</head>')

        # 2. Add reCAPTCHA div before submit button in contact forms
        # In Dutch forms:
        if 'class="cf-turnstile"' in content:
            content = content.replace(
                '<div class="cf-turnstile" data-sitekey="0x4AAAAAAAx_PLACEHOLDER_KEY" data-theme="auto" style="margin-bottom:8px"></div>',
                recaptcha_div
            )
        elif 'id="nl-submit-btn"' in content and f'data-sitekey="{SITE_KEY}"' not in content:
            target = '<button type="submit" id="nl-submit-btn"'
            content = content.replace(target, f'{recaptcha_div}\n          {target}')

        # In English form:
        if 'id="contactSubmitBtn"' in content and f'data-sitekey="{SITE_KEY}"' not in content:
            target = '<button class="btn" id="contactSubmitBtn"'
            content = content.replace(target, f'{recaptcha_div}\n            {target}')

        # 3. Ensure JS payload grabs grecaptcha token
        # Dutch form
        if 'dutchContactForm' in content and 'g-recaptcha-response' not in content:
            target = "_hp_company_website_verify: hp,"
            replacement = "_hp_company_website_verify: hp,\n        'g-recaptcha-response': (typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : ''),"
            content = content.replace(target, replacement)

        # English form
        if 'contactForm' in content and 'g-recaptcha-response' not in content:
            target = "_hp_company_website_verify: hpValue,"
            replacement = "_hp_company_website_verify: hpValue,\n      'g-recaptcha-response': (typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : ''),"
            content = content.replace(target, replacement)

        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✓ Installed reCAPTCHA in {fpath}")

if __name__ == "__main__":
    update_contact_php()
    update_html_php_files()
