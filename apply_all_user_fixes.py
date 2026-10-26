#!/usr/bin/env python3
import os
import glob
import re

HTDOCS = "/Applications/XAMPP/xamppfiles/htdocs/jaylakum"

def clean_placeholders_and_add_other():
    # 1. Update Dutch files: nl/index.html, nl/index.php, and all 5 city pages
    dutch_files = [
        os.path.join(HTDOCS, "nl/index.html"),
        os.path.join(HTDOCS, "nl/index.php"),
    ]
    for city in ["amsterdam", "rotterdam", "utrecht", "den-haag", "eindhoven"]:
        dutch_files.append(os.path.join(HTDOCS, f"nl/{city}/index.html"))
        dutch_files.append(os.path.join(HTDOCS, f"nl/{city}/index.php"))

    for fpath in dutch_files:
        if not os.path.exists(fpath):
            continue
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()

        # Remove example placeholders
        content = content.replace('placeholder="bijv. Pieter de Jong"', 'placeholder=""')
        content = content.replace('placeholder="pieter@jouwwinkel.nl"', 'placeholder=""')
        content = content.replace('placeholder="https://jouwwinkel.nl"', 'placeholder=""')
        content = content.replace('placeholder="Wat gebeurt er precies, sinds wanneer, en wat heb je zelf al geprobeerd?"', 'placeholder=""')
        content = content.replace('placeholder="jouw@bedrijf.nl"', 'placeholder=""')
        content = content.replace('placeholder="bijv. Haperende iDEAL betaling, trage checkout"', 'placeholder=""')

        # Add "Anders / Overig" option to Waar heb je hulp bij nodig?
        if 'value="Anders / Overig (Geef toelichting)"' not in content:
            target = '<option value="Maatwerk Technische Hulp">🔧 Maatwerk Technische Oplossing</option>'
            replacement = target + '\n              <option value="Anders / Overig (Geef toelichting)">💬 Anders / Overig (Geef toelichting)</option>'
            content = content.replace(target, replacement)

        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✓ Cleaned placeholders & added 'Anders / Overig' in {fpath}")

    # 2. Update English files: index.html & index.php
    for fpath in [os.path.join(HTDOCS, "index.html"), os.path.join(HTDOCS, "index.php")]:
        if not os.path.exists(fpath):
            continue
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()

        # Remove example placeholders
        content = content.replace('placeholder="https://yourstore.com"', 'placeholder=""')
        content = content.replace('placeholder="you@yourstore.com"', 'placeholder=""')
        content = content.replace('placeholder="e.g. Slow mobile PageSpeed, high cart abandonment"', 'placeholder=""')
        content = content.replace('placeholder="What\'s happening, when did it start, and what have you tried?"', 'placeholder=""')

        # Add "Other / Custom Webshop Requirement" option
        if 'value="Other / Custom Webshop Requirement"' not in content:
            target = '<option value="Design & Redesign">Design & Redesign (Modern, mobile-first store redesign)</option>'
            replacement = target + '\n              <option value="Other / Custom Webshop Requirement">💬 Other / Custom Webshop Requirement</option>'
            content = content.replace(target, replacement)

        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✓ Cleaned placeholders & added 'Other' in {fpath}")

def update_build_static_blog_pagination():
    fpath = os.path.join(HTDOCS, "build_static_blog.py")
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    # Add pagination CSS to build_static_blog.py if not already present
    pagination_css = """
  .pagination-wrap{display:flex;justify-content:center;align-items:center;gap:8px;margin:30px 0 80px;}
  .page-btn{
    display:inline-flex;align-items:center;justify-content:center;
    min-width:42px;height:42px;padding:0 16px;border-radius:8px;
    background:var(--card);border:1px solid var(--line);
    color:var(--ink);font-weight:600;font-size:14.5px;cursor:pointer;
    transition:all .15s ease;
  }
  .page-btn:hover:not(:disabled){
    border-color:var(--gold);color:var(--gold);transform:translateY(-1px);
  }
  .page-btn.active{
    background:var(--gold);border-color:var(--gold);color:#fff!important;pointer-events:none;
  }
  .page-btn:disabled{
    opacity:.35;cursor:not-allowed;
  }
"""
    if ".pagination-wrap" not in content:
        content = content.replace(".p-cat{", pagination_css + "\n  .p-cat{")

    # Add blogGrid id and pagination container inside render_blog_index
    if 'id="blogPagination"' not in content:
        content = content.replace(
            '<div class="grid">\n    {cards_html}\n  </div>',
            '<div class="grid" id="blogGrid">\n    {cards_html}\n  </div>\n  <div id="blogPagination" class="pagination-wrap"></div>'
        )

    # Add pagination script right before </body>
    pagination_js = """
<script>
document.addEventListener('DOMContentLoaded', function(){
  var grid = document.getElementById('blogGrid');
  if (!grid) return;
  var cards = Array.from(grid.querySelectorAll('.card'));
  var perPage = 6;
  var totalPages = Math.ceil(cards.length / perPage);
  var paginationContainer = document.getElementById('blogPagination');

  if (totalPages <= 1) {
    if (paginationContainer) paginationContainer.style.display = 'none';
    return;
  }

  var currentPage = 1;

  function showPage(p) {
    currentPage = p;
    var start = (p - 1) * perPage;
    var end = start + perPage;

    cards.forEach(function(card, idx){
      if (idx >= start && idx < end) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });

    renderPagination();
    if (p > 1) {
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function renderPagination() {
    paginationContainer.innerHTML = '';

    // Prev Button
    var prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '&larr; Prev';
    prevBtn.disabled = (currentPage === 1);
    prevBtn.onclick = function(){ showPage(currentPage - 1); };
    paginationContainer.appendChild(prevBtn);

    // Number Buttons
    for (var i = 1; i <= totalPages; i++) {
      (function(pageIdx){
        var btn = document.createElement('button');
        btn.className = 'page-btn' + (pageIdx === currentPage ? ' active' : '');
        btn.textContent = pageIdx;
        btn.onclick = function(){ showPage(pageIdx); };
        paginationContainer.appendChild(btn);
      })(i);
    }

    // Next Button
    var nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = 'Next &rarr;';
    nextBtn.disabled = (currentPage === totalPages);
    nextBtn.onclick = function(){ showPage(currentPage + 1); };
    paginationContainer.appendChild(nextBtn);
  }

  showPage(1);
});
</script>
"""
    if "blogPagination" in content and "renderPagination()" not in content:
        content = content.replace("</body>", pagination_js + "\n</body>")

    with open(fpath, "w", encoding="utf-8") as f:
        f.write(content)
    print("✓ Updated build_static_blog.py with clean responsive pagination")

if __name__ == "__main__":
    clean_placeholders_and_add_other()
    update_build_static_blog_pagination()
