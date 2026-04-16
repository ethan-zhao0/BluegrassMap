# to run:
# cd scripts
# pip3 install requests beautifulsoup4
# python3 crawl_bluegrasslyrics.py

import requests
from bs4 import BeautifulSoup
import time
import json
import os

BASE = "https://www.bluegrasslyrics.com"
HEADERS = {"User-Agent": "Mozilla/5.0"}

def get_all_song_urls():
    """get all song links from the main songs index page"""
    r = requests.get(BASE, headers=HEADERS)
    soup = BeautifulSoup(r.text, "html.parser")
    song_list = soup.find("ul", class_="list--songs")
    if not song_list:
        print("Could not find song list — check selector")
        return []
    links = song_list.find_all("a", href=True)
    return [a["href"] for a in links]

def get_song_data(song_url):
    """scrape title, artist, and lyrics from a single song page"""
    try:
        r = requests.get(song_url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(r.text, "html.parser")

        title_el = soup.find("h1", class_="entry-title")
        title = title_el.get_text().strip() if title_el else ""

        # artist tag
        artist_el = soup.find("a", rel="tag")
        artist = artist_el.get_text().strip() if artist_el else ""

        content = soup.find("div", class_="entry-content")
        lyrics = content.get_text(separator="\n").strip() if content else ""

        return {"song_title": title, "artist": artist, "lyrics": lyrics, "url": song_url}
    except Exception as e:
        print(f"  ERROR {song_url}: {e}")
        return None

# --- run ---
print("Getting all song URLs from main index...")
song_urls = get_all_song_urls()
print(f"Found {len(song_urls)} songs")

if len(song_urls) == 0:
    print("No songs found — check the HTML selector")
    exit()

corpus = []
for i, url in enumerate(song_urls):
    print(f"[{i+1}/{len(song_urls)}] {url}")
    data = get_song_data(url)
    if data and data["lyrics"]:
        corpus.append(data)
    time.sleep(0.5)

os.makedirs("output", exist_ok=True)
with open("output/corpus.json", "w") as f:
    json.dump(corpus, f, indent=2)

print(f"\nDone — {len(corpus)} songs saved to output/corpus.json")