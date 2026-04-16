import json
import time
import requests

INPUT_FILE  = "../src/data/plants.json"
OUTPUT_FILE = "../src/data/plants.json"

US_STATES = [
    "Alabama","Alaska","Arizona","Arkansas","California","Colorado",
    "Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho",
    "Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana",
    "Maine","Maryland","Massachusetts","Michigan","Minnesota",
    "Mississippi","Missouri","Montana","Nebraska","Nevada",
    "New Hampshire","New Jersey","New Mexico","New York",
    "North Carolina","North Dakota","Ohio","Oklahoma","Oregon",
    "Pennsylvania","Rhode Island","South Carolina","South Dakota",
    "Tennessee","Texas","Utah","Vermont","Virginia","Washington",
    "West Virginia","Wisconsin","Wyoming"
]

# ── hardcoded species info for your 43 plants ─────────────────────
SPECIES_INFO = {
    "Acer saccharum":        {"native_status": "Native",     "growth_habit": "Tree"},
    "Anethum graveolens":    {"native_status": "Introduced", "growth_habit": "Forb/herb"},
    "Brassica oleracea":     {"native_status": "Introduced", "growth_habit": "Forb/herb"},
    "Cannabis sativa":       {"native_status": "Introduced", "growth_habit": "Forb/herb"},
    "Citrullus lanatus":     {"native_status": "Introduced", "growth_habit": "Vine"},
    "Coffea arabica":        {"native_status": "Introduced", "growth_habit": "Shrub"},
    "Comptonia peregrina":   {"native_status": "Native",     "growth_habit": "Shrub"},
    "Dalbergia nigra":       {"native_status": "Introduced", "growth_habit": "Tree"},
    "Epigaea repens":        {"native_status": "Native",     "growth_habit": "Shrub"},
    "Gaylussacia baccata":   {"native_status": "Native",     "growth_habit": "Shrub"},
    "Gossypium hirsutum":    {"native_status": "Introduced", "growth_habit": "Forb/herb"},
    "Hedera helix":          {"native_status": "Introduced", "growth_habit": "Vine"},
    "Hepatica nobilis":      {"native_status": "Native",     "growth_habit": "Forb/herb"},
    "Hordeum vulgare":       {"native_status": "Introduced", "growth_habit": "Graminoid"},
    "Ipomoea purpurea":      {"native_status": "Introduced", "growth_habit": "Vine"},
    "Juglans nigra":         {"native_status": "Native",     "growth_habit": "Tree"},
    "Juniperus virginiana":  {"native_status": "Native",     "growth_habit": "Tree"},
    "Lonicera japonica":     {"native_status": "Introduced", "growth_habit": "Vine"},
    "Lupinus texensis":      {"native_status": "Native",     "growth_habit": "Forb/herb"},
    "Malus pumila":          {"native_status": "Introduced", "growth_habit": "Tree"},
    "Mertensia virginica":   {"native_status": "Native",     "growth_habit": "Forb/herb"},
    "Nepeta cataria":        {"native_status": "Introduced", "growth_habit": "Forb/herb"},
    "Nicotiana tabacum":     {"native_status": "Introduced", "growth_habit": "Forb/herb"},
    "Oxydendrum arboreum":   {"native_status": "Native",     "growth_habit": "Tree"},
    "Pinus strobus":         {"native_status": "Native",     "growth_habit": "Tree"},
    "Platanus occidentalis": {"native_status": "Native",     "growth_habit": "Tree"},
    "Poa pratensis":         {"native_status": "Introduced", "growth_habit": "Graminoid"},
    "Populus deltoides":     {"native_status": "Native",     "growth_habit": "Tree"},
    "Prunus persica":        {"native_status": "Introduced", "growth_habit": "Tree"},
    "Prunus serotina":       {"native_status": "Native",     "growth_habit": "Tree"},
    "Pueraria montana":      {"native_status": "Introduced", "growth_habit": "Vine"},
    "Quercus alba":          {"native_status": "Native",     "growth_habit": "Tree"},
    "Rosa carolina":         {"native_status": "Native",     "growth_habit": "Shrub"},
    "Rubus allegheniensis":  {"native_status": "Native",     "growth_habit": "Shrub"},
    "Saccharum officinarum": {"native_status": "Introduced", "growth_habit": "Graminoid"},
    "Salix babylonica":      {"native_status": "Introduced", "growth_habit": "Tree"},
    "Salix nigra":           {"native_status": "Native",     "growth_habit": "Tree"},
    "Solidago canadensis":   {"native_status": "Native",     "growth_habit": "Forb/herb"},
    "Sorghum bicolor":       {"native_status": "Introduced", "growth_habit": "Graminoid"},
    "Trifolium pratense":    {"native_status": "Introduced", "growth_habit": "Forb/herb"},
    "Triticum aestivum":     {"native_status": "Introduced", "growth_habit": "Graminoid"},
    "Viola sororia":         {"native_status": "Native",     "growth_habit": "Forb/herb"},
    "Zea mays":              {"native_status": "Introduced", "growth_habit": "Graminoid"},
}

# ── helpers ───────────────────────────────────────────────────────

def get_gbif_key(scientific_name):
    try:
        r = requests.get(
            "https://api.gbif.org/v1/species/match",
            params={"name": scientific_name, "strict": False},
            timeout=10
        )
        return r.json().get("usageKey")
    except Exception as e:
        print(f"  gbif_key error: {e}")
        return None

def get_species_info(gbif_key):
    try:
        r = requests.get(
            f"https://api.gbif.org/v1/species/{gbif_key}",
            timeout=10
        )
        data = r.json()
        r2 = requests.get(
            f"https://api.gbif.org/v1/species/{gbif_key}/vernacularNames",
            params={"limit": 5},
            timeout=10
        )
        vernacular = [v["vernacularName"] for v in r2.json().get("results", [])]
        return {
            "gbif_key":         gbif_key,
            "family":           data.get("family", ""),
            "order":            data.get("order", ""),
            "vernacular_names": vernacular,
        }
    except Exception as e:
        print(f"  species_info error: {e}")
        return {}

def get_species_images(gbif_key):
    try:
        r = requests.get(
            "https://api.gbif.org/v1/occurrence/search",
            params={
                "taxonKey":  gbif_key,
                "mediaType": "StillImage",
                "country":   "US",
                "limit":     3
            },
            timeout=10
        )
        images = []
        for occ in r.json().get("results", []):
            for media in occ.get("media", []):
                url = media.get("identifier", "")
                if url and url.startswith("http"):
                    images.append({
                        "url":     url,
                        "credit":  media.get("rightsHolder", ""),
                        "license": media.get("license", "")
                    })
                    break
            if len(images) >= 3:
                break
        return images
    except Exception as e:
        print(f"  images error: {e}")
        return []

def get_iucn_status(scientific_name):
    try:
        r = requests.get(
            "https://api.gbif.org/v1/species/search",
            params={"q": scientific_name, "limit": 1},
            timeout=10
        )
        results = r.json().get("results", [])
        return results[0].get("threatStatuses", []) if results else []
    except Exception as e:
        print(f"  iucn error: {e}")
        return []

def get_occurrence_coords(scientific_name, limit=200):
    try:
        r = requests.get(
            "https://api.gbif.org/v1/occurrence/search",
            params={
                "scientificName":     scientific_name,
                "country":            "US",
                "hasCoordinate":      True,
                "hasGeospatialIssue": False,
                "limit":              limit
            },
            timeout=15
        )
        coords = []
        for occ in r.json().get("results", []):
            lat = occ.get("decimalLatitude")
            lng = occ.get("decimalLongitude")
            if lat and lng:
                coords.append({
                    "lat":   lat,
                    "lng":   lng,
                    "state": occ.get("stateProvince", "")
                })
        return coords
    except Exception as e:
        print(f"  coords error: {e}")
        return []

def get_state_count(scientific_name, state):
    try:
        r = requests.get(
            "https://api.gbif.org/v1/occurrence/search",
            params={
                "scientificName": scientific_name,
                "country":        "US",
                "stateProvince":  state,
                "limit":          0
            },
            timeout=10
        )
        data = r.json()
        if isinstance(data, dict):
            return data.get("count", 0)
        return 0
    except Exception as e:
        print(f"  count error {state}: {e}")
        return 0

# ── main ──────────────────────────────────────────────────────────

with open(INPUT_FILE) as f:
    data = json.load(f)

print(f"Loaded {len(data)} entries")

# collect unique scientific names
unique_plants = {}
for entry in data:
    sci = entry.get("plant_scientific", "").strip()
    if sci and sci not in unique_plants:
        unique_plants[sci] = None

print(f"Unique species: {len(unique_plants)}\n")

# ── step 1: fetch GBIF species info once per plant ────────────────

species_cache = {}
for i, sci_name in enumerate(unique_plants):
    print(f"[{i+1}/{len(unique_plants)}] {sci_name}")

    key = get_gbif_key(sci_name)
    if not key:
        print(f"  no GBIF match")
        species_cache[sci_name] = {}
        time.sleep(0.3)
        continue

    info   = get_species_info(key)
    images = get_species_images(key)
    coords = get_occurrence_coords(sci_name, limit=200)
    iucn   = get_iucn_status(sci_name)
    lookup = SPECIES_INFO.get(sci_name, {})

    species_cache[sci_name] = {
        **info,
        "images":            images,
        "occurrence_coords": coords,
        "iucn_status":       iucn,
        "native_status":     lookup.get("native_status", ""),
        "growth_habit":      lookup.get("growth_habit", ""),
    }

    print(f"  family: {info.get('family','?')} | "
          f"habit: {lookup.get('growth_habit','?')} | "
          f"native: {lookup.get('native_status','?')} | "
          f"images: {len(images)} | "
          f"coords: {len(coords)}")

    time.sleep(0.5)

# ── step 2: state counts + merge into entries ─────────────────────

print(f"\nUpdating entries...")
for entry in data:
    sci = entry.get("plant_scientific", "").strip()
    if not sci:
        continue

    # fetch state counts only if missing
    if not entry.get("states"):
        print(f"  State counts: {sci}")
        state_counts = {}
        for state in US_STATES:
            count = get_state_count(sci, state)
            if count > 0:
                state_counts[state] = count
            time.sleep(0.2)
        entry["states"] = state_counts

    # attach species info only if not already present
    if not entry.get("gbif_key") and sci in species_cache:
        sp = species_cache[sci]
        entry["gbif_key"]           = sp.get("gbif_key", "")
        entry["family"]             = sp.get("family", "")
        entry["order"]              = sp.get("order", "")
        entry["vernacular_names"]   = sp.get("vernacular_names", [])
        entry["images"]             = sp.get("images", [])
        entry["occurrence_coords"]  = sp.get("occurrence_coords", [])
        entry["native_status"]      = sp.get("native_status", "")
        entry["growth_habit"]       = sp.get("growth_habit", "")
        entry["iucn_status"]        = sp.get("iucn_status", [])

    # save after every entry — safe to interrupt and resume
    with open(OUTPUT_FILE, "w") as f:
        json.dump(data, f, indent=2)

print(f"\nDone. {OUTPUT_FILE} updated.")