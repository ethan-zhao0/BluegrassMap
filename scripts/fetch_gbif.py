## to run:
## cd scripts
## pip3 install requests
## python3 fetch_gbif.py

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

def query_gbif(plant_name, state):
    try:
        r = requests.get(
            "https://api.gbif.org/v1/occurrence/search",
            params={
                "scientificName": plant_name,
                "country": "US",
                "stateProvince": state,
                "limit": 0
            },
            timeout=10
        )
        return r.json().get("count", 0)
    except Exception as e:
        print(f"  ERROR {plant_name} / {state}: {e}")
        return 0

def query_gbif_by_common(common_name, state):
    """fallback: search by vernacular name"""
    try:
        # first get the taxon key
        r = requests.get(
            "https://api.gbif.org/v1/species/suggest",
            params={"q": common_name, "limit": 1},
            timeout=10
        )
        results = r.json()
        if not results:
            return 0
        key = results[0].get("key")
        if not key:
            return 0
        # then query occurrences
        r2 = requests.get(
            "https://api.gbif.org/v1/occurrence/search",
            params={
                "taxonKey": key,
                "country": "US",
                "stateProvince": state,
                "limit": 0
            },
            timeout=10
        )
        return r2.json().get("count", 0)
    except Exception as e:
        print(f"  FALLBACK ERROR {common_name} / {state}: {e}")
        return 0

with open(INPUT_FILE) as f:
    data = json.load(f)

# collect unique plants — prefer scientific name, fall back to common
unique_plants = {}
for entry in data:
    sci  = entry.get("plant_scientific", "").strip()
    com  = entry.get("plant_common", "").strip()
    key  = sci if sci else com
    if key and key not in unique_plants:
        unique_plants[key] = {"scientific": sci, "common": com}

print(f"Found {len(unique_plants)} unique plants to query")
print(f"Total API calls: {len(unique_plants)} plants x 50 states = {len(unique_plants)*50}\n")

# fetch distribution for each unique plant
plant_distributions = {}
for i, (plant_key, names) in enumerate(unique_plants.items()):
    print(f"[{i+1}/{len(unique_plants)}] {plant_key}")
    state_counts = {}

    for state in US_STATES:
        if names["scientific"]:
            count = query_gbif(names["scientific"], state)
        else:
            count = query_gbif_by_common(names["common"], state)

        if count > 0:
            state_counts[state] = count

        time.sleep(0.2)  # stay polite to GBIF

    plant_distributions[plant_key] = state_counts
    found_in = len(state_counts)
    print(f"  → found in {found_in} states")

# write distribution back into each entry
for entry in data:
    sci = entry.get("plant_scientific", "").strip()
    com = entry.get("plant_common", "").strip()
    key = sci if sci else com
    entry["states"] = plant_distributions.get(key, {})

with open(OUTPUT_FILE, "w") as f:
    json.dump(data, f, indent=2)

print(f"\nDone. Updated {OUTPUT_FILE}")