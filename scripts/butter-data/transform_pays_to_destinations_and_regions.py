import json
from collections import defaultdict

# Load pays.json
data_path = 'scripts/butter-data/pays.json'
with open(data_path, 'r', encoding='utf-8') as f:
    pays = json.load(f)

# Define allowed regions
ALLOWED_REGIONS = {
    'Europe', 'Afrique', 'Asie', 'Amérique du Sud', 'Amérique du Nord', 'Amérique Centrale', 'Moyen-Orient', 'France'
}

# Helper to normalize region names
REGION_SYNONYMS = {
    'Amérique du Sud': 'Amérique du Sud',
    'Amérique du Nord': 'Amérique du Nord',
    'Amérique Centrale': 'Amérique Centrale',
    'Europe': 'Europe',
    'Afrique': 'Afrique',
    'Asie': 'Asie',
    'Moyen-Orient': 'Moyen-Orient',
    'France': 'France',
}

def extract_regions(destinations):
    regions = set()
    for dest in destinations:
        nom = dest.get('nom')
        if nom in REGION_SYNONYMS:
            regions.add(REGION_SYNONYMS[nom])
    return list(regions)

# 1. Build region.json
region_set = set()
for p in pays:
    for dest in p.get('destinations', []):
        nom = dest.get('nom')
        if nom in ALLOWED_REGIONS:
            region_set.add(nom)
# Always add France
region_set.add('France')

region_list = [{'nom': r} for r in sorted(region_set)]

with open('scripts/butter-data/region.json', 'w', encoding='utf-8') as f:
    json.dump(region_list, f, ensure_ascii=False, indent=2)

# 2. Build destination.json

def get_regions_for_destination(p):
    regions = set()
    for dest in p.get('destinations', []):
        nom = dest.get('nom')
        if nom in ALLOWED_REGIONS:
            regions.add(nom)
    # If France is in the destination, add Europe as well
    if 'France' in regions:
        regions.add('Europe')
    return sorted(regions)

destinations_out = []
for p in pays:
    obj = {
        'nom': p.get('nom'),
        'chapkaZone': p.get('zone_chapka'),
        'iso': p.get('iso'),
        'interjection': p.get('interjection'),
        'meta_description': p.get('meta_description'),
        'content_slug': p.get('content_slug'),
        'regions': get_regions_for_destination(p)
    }
    destinations_out.append(obj)

with open('scripts/butter-data/destination.json', 'w', encoding='utf-8') as f:
    json.dump(destinations_out, f, ensure_ascii=False, indent=2)

print('Done! Wrote region.json and destination.json.') 