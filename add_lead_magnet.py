import re

def update_nl_files():
    nl_section = '''
  <!-- Gratis 3-Minuten Video Audit Lead Magnet -->
  <section id="gratis-audit" class="section" style="background:linear-gradient(180deg, var(--bg) 0%, var(--bg-soft) 100%);padding:64px 0;border-bottom:1px solid var(--line)">
    <div class="wrap">
      <div style="max-width:820px;margin:0 auto;background:var(--card);border:2px solid var(--gold);border-radius:18px;padding:36px;box-shadow:0 12px 36px rgba(0,0,0,0.06);position:relative">
        <div style="position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:var(--gold-deep);color:#fff;padding:4px 18px;border-radius:999px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.15)">
          ⚡ 100% Gratis &middot; Geen Verplichtingen
        </div>
        <div style="text-align:center;margin-top:6px;margin-bottom:24px">
          <div class="eyebrow" style="margin-bottom:8px">LEAD MAGNET &middot; PERSOONLIJKE LOOM VIDEO</div>
          <h2 style="font-size:clamp(23px,3.6vw,32px);margin-bottom:10px">Gratis 3-Minuten Video Audit Van Je Webshop</h2>
          <p style="color:var(--ink-soft);font-size:16px;line-height:1.55;max-width:660px;margin:0 auto">
            Wil je weten waarom je webwinkel traag laadt of waarom bezoekers afhaken bij het afrekenen? Vul je URL in. Binnen 24 uur stuur ik je een persoonlijke 3-minuten Loom schermopname met de grootste mobiele bottlenecks en concrete oplossingen.
          </p>
        </div>

        <form id="auditFormNL" action="../contact.php" method="POST" style="display:flex;flex-direction:column;gap:16px">
          <div style="opacity:0;position:absolute;top:0;left:0;height:0;width:0;z-index:-1;overflow:hidden">
            <label for="audit-hp-nl">Laat leeg</label>
            <input id="audit-hp-nl" name="_hp_company_website_verify" type="text" tabindex="-1" autocomplete="off" />
          </div>
          <input type="hidden" name="lead_type" value="3_minute_video_audit" />

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px">
            <div>
              <label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Webshop URL *</label>
              <input type="url" id="audit-url-nl" name="website" required placeholder="https://jouwwinkel.nl" style="width:100%;padding:12px 14px;border:1px solid var(--line);border-radius:8px;font-size:15px;background:var(--bg);box-sizing:border-box">
            </div>
            <div>
              <label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">E-mailadres (voor de videolink) *</label>
              <input type="email" id="audit-email-nl" name="email" required placeholder="jouw@bedrijf.nl" style="width:100%;padding:12px 14px;border:1px solid var(--line);border-radius:8px;font-size:15px;background:var(--bg);box-sizing:border-box">
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px">
            <div>
              <label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">E-Commerce Platform</label>
              <select id="audit-platform-nl" name="platform" style="width:100%;padding:12px 14px;border:1px solid var(--line);border-radius:8px;font-size:15px;background:var(--bg);box-sizing:border-box">
                <option value="Shopify">Shopify</option>
                <option value="WooCommerce">WooCommerce / WordPress</option>
                <option value="Anders / Magento / Lightspeed">Ander Platform / Lightspeed / Magento</option>
              </select>
            </div>
            <div>
              <label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Grootste Frustratie (Optioneel)</label>
              <input type="text" id="audit-msg-nl" name="message" placeholder="bijv. Haperende iDEAL betaling, trage checkout" style="width:100%;padding:12px 14px;border:1px solid var(--line);border-radius:8px;font-size:15px;background:var(--bg);box-sizing:border-box">
            </div>
          </div>

          <div id="auditStatusNL" style="display:none;padding:12px 16px;border-radius:8px;font-size:14px;line-height:1.5"></div>

          <button type="submit" id="auditSubmitBtnNL" class="btn" style="width:100%;justify-content:center;font-size:16px;padding:14px 20px;background:var(--gold-deep);border-color:var(--gold-deep);color:#fff;cursor:pointer">
            🎥 Ontvang Mijn Gratis Video Audit Binnen 24u &rarr;
          </button>

          <p style="text-align:center;font-size:12.5px;color:var(--ink-faint);margin:0">
            🔒 Geen spam, geen telefoontjes. Binnen 24 uur een eerlijke technische analyse van een ervaren developer.
          </p>
        </form>
      </div>
    </div>
  </section>
'''

    nl_js = '''
  // Video Audit Lead Magnet Handler
  var auditForm = document.getElementById('auditFormNL');
  if (auditForm) {
    auditForm.addEventListener('submit', function(e){
      e.preventDefault();
      var hp = document.getElementById('audit-hp-nl').value;
      var btn = document.getElementById('auditSubmitBtnNL');
      var status = document.getElementById('auditStatusNL');
      if (hp && hp.trim() !== '') {
        auditForm.reset();
        btn.textContent = 'Verzonden!';
        return;
      }
      btn.textContent = 'Bezig met versturen...';
      btn.disabled = true;
      var payload = {
        lead_type: '3_minute_video_audit',
        name: 'Webshop Eigenaar (Video Audit)',
        email: document.getElementById('audit-email-nl').value,
        website: document.getElementById('audit-url-nl').value,
        platform: document.getElementById('audit-platform-nl').value,
        message: document.getElementById('audit-msg-nl').value,
        problem_type: 'Gratis 3-Minuten Video Audit (' + document.getElementById('audit-platform-nl').value + ')',
        _hp_company_website_verify: hp
      };
      fetch('../contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(function(r){ return r.json(); })
      .then(function(res){
        status.style.display = 'block';
        status.style.background = 'rgba(46, 204, 113, 0.15)';
        status.style.color = '#27ae60';
        status.innerHTML = '<strong>✓ Aanvraag ontvangen!</strong> Ik neem je mobiele webshop persoonlijk onder de loep en stuur je binnen 24 uur een Loom-videolink toe.';
        btn.textContent = 'Aanvraag Verzonden!';
        auditForm.reset();
      })
      .catch(function(err){
        status.style.display = 'block';
        status.style.background = 'rgba(231, 76, 60, 0.15)';
        status.style.color = '#e74c3c';
        status.innerHTML = 'Er ging iets mis bij het verzenden. Mail je link gerust direct naar <a href="mailto:jay@jaylakum.com">jay@jaylakum.com</a>.';
        btn.textContent = 'Ontvang Gratis Video Audit →';
        btn.disabled = false;
      });
    });
  }
'''

    for path in ['/Applications/XAMPP/xamppfiles/htdocs/jaylakum/nl/index.html', '/Applications/XAMPP/xamppfiles/htdocs/jaylakum/nl/index.php']:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        if 'id="gratis-audit"' not in content:
            # Insert after the calculator section
            target = '</section>\n\n  <!-- Services -->'
            if target in content:
                content = content.replace(target, '</section>\n' + nl_section + '\n  <!-- Services -->')
            else:
                target_alt = '</section>\n  <!-- Services -->'
                content = content.replace(target_alt, '</section>\n' + nl_section + '\n  <!-- Services -->')

        if 'auditFormNL' not in content:
            # Insert JS right before </script>
            content = content.replace('});\n</script>', nl_js + '});\n</script>')

        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Updated lead magnet in {path}")

def update_en_files():
    en_section = '''
    <!-- Free 3-Minute Video Audit Lead Magnet -->
    <div id="free-video-audit" class="section" style="background:linear-gradient(180deg, var(--bg-soft) 0%, var(--bg) 100%);padding:64px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)">
      <div class="wrap">
        <div style="max-width:820px;margin:0 auto;background:var(--card);border:2px solid var(--gold);border-radius:18px;padding:36px;box-shadow:0 12px 36px rgba(0,0,0,0.06);position:relative">
          <div style="position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:var(--gold-deep);color:#fff;padding:4px 18px;border-radius:999px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.15)">
            ⚡ 100% Free &middot; No Obligation
          </div>
          <div style="text-align:center;margin-top:6px;margin-bottom:24px">
            <p class="eyebrow" style="margin-bottom:8px">Free Mini-Audit &middot; Within 24 Hours</p>
            <h2 style="font-size:clamp(23px,3.6vw,32px);margin-bottom:10px">Get A Free 3-Minute Video Audit Of Your Store</h2>
            <p style="color:var(--ink-soft);font-size:16px;line-height:1.55;max-width:660px;margin:0 auto">
              Wondering why your store feels slow or why visitors drop off at checkout? Drop your URL below. Within 24 hours, I'll record and email you a personalized 3-minute Loom walkthrough detailing your biggest mobile speed leaks and quick fixes.
            </p>
          </div>

          <form id="auditFormEN" action="contact.php" method="POST" style="display:flex;flex-direction:column;gap:16px">
            <div style="opacity:0;position:absolute;top:0;left:0;height:0;width:0;z-index:-1;overflow:hidden">
              <label for="audit-hp-en">Leave empty</label>
              <input id="audit-hp-en" name="_hp_company_website_verify" type="text" tabindex="-1" autocomplete="off" />
            </div>
            <input type="hidden" name="lead_type" value="3_minute_video_audit" />

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px">
              <div>
                <label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Webshop URL *</label>
                <input type="url" id="audit-url-en" name="website" required placeholder="https://yourstore.com" style="width:100%;padding:12px 14px;border:1px solid var(--line);border-radius:8px;font-size:15px;background:var(--bg);box-sizing:border-box">
              </div>
              <div>
                <label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Your Email (for video link) *</label>
                <input type="email" id="audit-email-en" name="email" required placeholder="you@yourstore.com" style="width:100%;padding:12px 14px;border:1px solid var(--line);border-radius:8px;font-size:15px;background:var(--bg);box-sizing:border-box">
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px">
              <div>
                <label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Platform</label>
                <select id="audit-platform-en" name="platform" style="width:100%;padding:12px 14px;border:1px solid var(--line);border-radius:8px;font-size:15px;background:var(--bg);box-sizing:border-box">
                  <option value="Shopify">Shopify</option>
                  <option value="WooCommerce">WooCommerce / WordPress</option>
                  <option value="Other / Custom">Other Platform / Custom</option>
                </select>
              </div>
              <div>
                <label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px">Main Concern (Optional)</label>
                <input type="text" id="audit-msg-en" name="message" placeholder="e.g. Slow mobile PageSpeed, high cart abandonment" style="width:100%;padding:12px 14px;border:1px solid var(--line);border-radius:8px;font-size:15px;background:var(--bg);box-sizing:border-box">
              </div>
            </div>

            <div id="auditStatusEN" style="display:none;padding:12px 16px;border-radius:8px;font-size:14px;line-height:1.5"></div>

            <button type="submit" id="auditSubmitBtnEN" class="btn" style="width:100%;justify-content:center;font-size:16px;padding:14px 20px;background:var(--gold-deep);border-color:var(--gold-deep);color:#fff;cursor:pointer">
              🎥 Get My Free Video Audit Within 24h &rarr;
            </button>

            <p style="text-align:center;font-size:12.5px;color:var(--ink-faint);margin:0">
              🔒 Zero spam, no unsolicited sales calls. You get a direct, honest technical breakdown from a developer.
            </p>
          </form>
        </div>
      </div>
    </div>
'''

    en_js = '''
  // English Video Audit Lead Magnet Handler
  var auditFormEN = document.getElementById('auditFormEN');
  if (auditFormEN) {
    auditFormEN.addEventListener('submit', function(e){
      e.preventDefault();
      var hp = document.getElementById('audit-hp-en').value;
      var btn = document.getElementById('auditSubmitBtnEN');
      var status = document.getElementById('auditStatusEN');
      if (hp && hp.trim() !== '') {
        auditFormEN.reset();
        btn.textContent = 'Sent Successfully!';
        return;
      }
      btn.textContent = 'Sending request...';
      btn.disabled = true;
      var payload = {
        lead_type: '3_minute_video_audit',
        name: 'Webshop Owner (Video Audit)',
        email: document.getElementById('audit-email-en').value,
        website: document.getElementById('audit-url-en').value,
        platform: document.getElementById('audit-platform-en').value,
        message: document.getElementById('audit-msg-en').value,
        problem_type: 'Free 3-Minute Video Audit (' + document.getElementById('audit-platform-en').value + ')',
        _hp_company_website_verify: hp
      };

      function showENSuccess() {
        status.style.display = 'block';
        status.style.background = 'rgba(46, 204, 113, 0.15)';
        status.style.border = '1px solid rgba(46, 204, 113, 0.4)';
        status.style.color = '#2ecc71';
        status.innerHTML = '<strong>✓ Request Received!</strong> I will audit your store on mobile and send a personalized 3-minute Loom link to your email within 24 hours.';
        btn.textContent = 'Request Sent!';
        auditFormEN.reset();
      }

      fetch('contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(function(r){ return r.json(); })
      .then(function(res){
        showENSuccess();
      })
      .catch(function(){
        // Fallback to formsubmit.co
        fetch('https://formsubmit.co/ajax/lakumjay2000@gmail.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(function(){ showENSuccess(); })
        .catch(function(){
          status.style.display = 'block';
          status.style.background = 'rgba(231, 76, 60, 0.15)';
          status.style.color = '#e74c3c';
          status.innerHTML = 'Something went wrong. Feel free to email your store URL directly to <a href="mailto:jay@jaylakum.com">jay@jaylakum.com</a>.';
          btn.textContent = 'Get Free Video Audit →';
          btn.disabled = false;
        });
      });
    });
  }
'''

    for path in ['/Applications/XAMPP/xamppfiles/htdocs/jaylakum/index.html', '/Applications/XAMPP/xamppfiles/htdocs/jaylakum/index.php']:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        if 'id="free-video-audit"' not in content:
            # Insert after the How working with me goes steps section (line 619)
            target = '        </div>\n      </div>\n    </div>\n\n    <div class="section section-soft">\n      <div class="wrap about-grid">'
            if target in content:
                content = content.replace(target, '        </div>\n      </div>\n    </div>\n' + en_section + '\n    <div class="section section-soft">\n      <div class="wrap about-grid">')
            else:
                # alternative search
                target_alt = '<div class="section section-soft">\n      <div class="wrap about-grid">'
                content = content.replace(target_alt, en_section + '\n    <div class="section section-soft">\n      <div class="wrap about-grid">')

        if 'auditFormEN' not in content:
            # Insert JS right before the end of the script tag or DOMContentLoaded
            target_script = '    fetch(\'contact.php\''
            if target_script in content:
                # Add before DOMContentLoaded ends or at end of script
                content = content.replace('})();\n</script>', en_js + '\n})();\n</script>')

        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Updated lead magnet in {path}")

if __name__ == '__main__':
    update_nl_files()
    update_en_files()
