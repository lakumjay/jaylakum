#!/usr/bin/env python3
"""
SEO AI Engine powered by Google Gemini 3.5 Flash Lite
Generates:
1. High-CTR Dutch titles (< 60 chars, <= 600px)
2. High-CTR Dutch descriptions (< 150 chars, <= 940px)
3. Direct AEO/GEO FAQ pairs (Questions + 2-sentence direct answers)
4. Target keyword clusters
"""

import os
import re
import json
import urllib.request
import urllib.error

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def get_api_key():
    # 1. Check environment variable (GitHub Actions / system env)
    key = os.environ.get("GEMINI_API_KEY")
    if key:
        return key

    # 2. Check local scripts/.env
    env_path = os.path.join(ROOT_DIR, "scripts", ".env")
    if os.path.exists(env_path):
        for line in open(env_path):
            if line.startswith("GEMINI_API_KEY="):
                return line.strip().split("=", 1)[1]
    return None

API_KEY = get_api_key()
MODEL = "gemini-3.5-flash-lite"

def call_gemini(prompt, system_instruction=None):
    if not API_KEY:
        print("⚠️ No GEMINI_API_KEY found.")
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 800
        }
    }
    if system_instruction:
        payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return text.strip()
    except Exception as e:
        print(f"⚠️ Gemini API Call Failed: {e}")
        return None

def generate_optimized_meta(topic, current_title=None):
    system_prompt = (
        "You are a Dutch Senior E-commerce SEO Specialist. "
        "Return ONLY a valid JSON object with keys: title, description, keywords. "
        "Strict rules: "
        "1. title MUST be in Dutch, between 50 and 56 characters, ending with '| Jay Lakum'. "
        "2. description MUST be in Dutch, between 135 and 145 characters (never exceed 148 chars). "
        "3. Include high-converting words: 'Vaste Prijs', 'ROI', 'Direct Contact', 'Webshop Versnellen'. "
        "4. keywords: 5 high-intent Dutch comma-separated search terms."
    )
    prompt = f"Optimize SEO metadata for webshop topic: '{topic}'. Current title: '{current_title}'"
    res = call_gemini(prompt, system_prompt)
    if not res:
        return None
    try:
        clean = re.sub(r"^```json\s*|\s*```$", "", res, flags=re.MULTILINE).strip()
        return json.loads(clean)
    except Exception:
        return None

def generate_aeo_faqs(topic):
    system_prompt = (
        "You are an AEO/GEO Answer Engine Specialist for Dutch e-commerce. "
        "Return ONLY a JSON array of 4 objects with keys: 'question' and 'answer'. "
        "Each question must be a natural query Dutch store owners ask. "
        "Each answer MUST be a direct, factual 2-sentence explanation without fluff."
    )
    prompt = f"Generate 4 direct-answer FAQs for topic: '{topic}'"
    res = call_gemini(prompt, system_prompt)
    if not res:
        return None
    try:
        clean = re.sub(r"^```json\s*|\s*```$", "", res, flags=re.MULTILINE).strip()
        return json.loads(clean)
    except Exception:
        return None

if __name__ == "__main__":
    print("Testing Gemini AI Engine...")
    test_meta = generate_optimized_meta("WooCommerce Checkout Trage Snelheid")
    print("\nGenerated Meta:")
    print(json.dumps(test_meta, indent=2, ensure_ascii=False))
