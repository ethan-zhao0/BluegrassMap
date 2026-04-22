import json
from collections import defaultdict

INPUT_FILE = "src/data/plants.json"
OUTPUT_FILE = "src/data/plants_cleaned.json"

with open(INPUT_FILE, "r") as f:
    plants = json.load(f)

for plant in plants:
    # Count occurrences by state from occurrence_coords
    state_counts_from_coords = defaultdict(int)

    if plant.get("occurrence_coords"):
        for coord in plant["occurrence_coords"]:
            state = coord.get("state", "")
            if state:
                state_counts_from_coords[state] += 1

    # Update the states dictionary with the maximum of existing count and counted coords
    if not plant.get("states"):
        plant["states"] = {}

    # First, update existing states with max of existing vs coords
    for state in plant["states"]:
        existing_count = plant["states"][state]
        coords_count = state_counts_from_coords.get(state, 0)
        # Take the maximum
        plant["states"][state] = max(existing_count, coords_count)

    # Then, add any states from coords that don't exist in states dictionary yet
    for state, count in state_counts_from_coords.items():
        if state not in plant["states"]:
            plant["states"][state] = count

    print(
        f"Cleaned: {plant.get('plant_common', 'Unknown')} ({plant.get('plant_scientific', 'Unknown')})"
    )

# Write cleaned data to output file
with open(OUTPUT_FILE, "w") as f:
    json.dump(plants, f, indent=2)

print(f"\nCleaned data written to {OUTPUT_FILE}")
