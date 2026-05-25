"""
Build unified House election returns + district polling dataset (1998–2024).

Sources:
  - Election returns : MEDSL via TidyTuesday (1976-2022) + FTE election-results (2024)
  - Polling          : FiveThirtyEight house_polls_historical (2018-2022)
                       + house_polls current snapshot (2023-2024)
"""

import csv, re, os
from collections import defaultdict
from thefuzz import process as fuzz_process

RAW = "/sessions/intelligent-amazing-albattani/mnt/Presidential Tracker/data/raw"
OUT  = "/sessions/intelligent-amazing-albattani/mnt/Presidential Tracker/data"
os.makedirs(OUT, exist_ok=True)

# ── helpers ──────────────────────────────────────────────────────────────────

STATE_ABBR = {
    'ALABAMA':'AL','ALASKA':'AK','ARIZONA':'AZ','ARKANSAS':'AR','CALIFORNIA':'CA',
    'COLORADO':'CO','CONNECTICUT':'CT','DELAWARE':'DE','FLORIDA':'FL','GEORGIA':'GA',
    'HAWAII':'HI','IDAHO':'ID','ILLINOIS':'IL','INDIANA':'IN','IOWA':'IA',
    'KANSAS':'KS','KENTUCKY':'KY','LOUISIANA':'LA','MAINE':'ME','MARYLAND':'MD',
    'MASSACHUSETTS':'MA','MICHIGAN':'MI','MINNESOTA':'MN','MISSISSIPPI':'MS',
    'MISSOURI':'MO','MONTANA':'MT','NEBRASKA':'NE','NEVADA':'NV',
    'NEW HAMPSHIRE':'NH','NEW JERSEY':'NJ','NEW MEXICO':'NM','NEW YORK':'NY',
    'NORTH CAROLINA':'NC','NORTH DAKOTA':'ND','OHIO':'OH','OKLAHOMA':'OK',
    'OREGON':'OR','PENNSYLVANIA':'PA','RHODE ISLAND':'RI','SOUTH CAROLINA':'SC',
    'SOUTH DAKOTA':'SD','TENNESSEE':'TN','TEXAS':'TX','UTAH':'UT','VERMONT':'VT',
    'VIRGINIA':'VA','WASHINGTON':'WA','WEST VIRGINIA':'WV','WISCONSIN':'WI',
    'WYOMING':'WY','DISTRICT OF COLUMBIA':'DC',
}

def make_district_id(state_po: str, district) -> str:
    st = str(state_po).strip().upper()
    raw = str(district).strip().lower()
    raw = raw.replace('at-large','0').replace('at large','0')
    digits = re.findall(r'\d+', raw)
    d = int(digits[0]) if digits else 0
    return f"{st}-{d:02d}"

def clean_name(name: str) -> str:
    name = str(name).upper()
    name = re.sub(r'\b(MR|MRS|MS|DR|REP|REPRESENTATIVE|HON|JR|SR|II|III|IV)\b\.?', '', name)
    name = re.sub(r'[^A-Z ]', '', name)
    return ' '.join(name.split())

# ── STEP 1 : Election Returns ─────────────────────────────────────────────────
print("=== Processing election returns ===")

returns = []

# 1a. MEDSL / TidyTuesday 1976-2022
with open(f"{RAW}/house_tidytuesday_1976_2022.csv", encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        year = int(row['year'])
        if year < 1998:
            continue
        if row.get('stage','').upper() not in ('GEN', 'GENERAL'):
            continue
        if row.get('writein','').upper() in ('TRUE','1','YES'):
            continue
        state_po    = row['state_po'].strip().upper()
        district_id = make_district_id(state_po, row.get('district','0'))
        try:
            cv = int(float(row.get('candidatevotes') or 0))
            tv = int(float(row.get('totalvotes') or 0))
        except (ValueError, TypeError):
            cv, tv = 0, 0
        returns.append({
            'year': year, 'state': row['state'].strip().title(),
            'state_po': state_po, 'district_id': district_id,
            'candidate': str(row.get('candidate','')).strip().title(),
            'party': str(row.get('party','')).strip().upper(),
            'candidatevotes': cv, 'totalvotes': tv, 'source': 'MEDSL',
        })

medsl_years = {r['year'] for r in returns}
print(f"  MEDSL rows: {len(returns):,}  (years {min(medsl_years)}-{max(medsl_years)})")

# 1b. FTE election-results for 2023-2024
with open(f"{RAW}/fte_election_results_house.csv", encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fte_count = 0
    for row in reader:
        try:
            year = int(row.get('cycle',''))
        except ValueError:
            continue
        if year not in (2023, 2024):
            continue
        if row.get('stage','').lower() != 'general':
            continue
        state_po    = row.get('state_abbrev','').strip().upper()
        seat_name   = row.get('office_seat_name','').lower()
        seat_num    = seat_name.replace('district','').strip()
        district_id = make_district_id(state_po, seat_num)
        try:
            votes = int(float(row.get('votes') or 0))
        except (ValueError, TypeError):
            votes = 0
        candidate = str(row.get('candidate_name','')).strip().title()
        if not candidate:
            continue
        party = str(row.get('ballot_party', row.get('party',''))).strip().upper()
        returns.append({
            'year': year, 'state': str(row.get('state','')).strip().title(),
            'state_po': state_po, 'district_id': district_id,
            'candidate': candidate, 'party': party,
            'candidatevotes': votes, 'totalvotes': 0, 'source': 'FTE_results',
        })
        fte_count += 1

print(f"  FTE 2023-2024 rows: {fte_count:,}")

# Compute totalvotes for FTE rows
tv_map = defaultdict(int)
for r in returns:
    if r['source'] == 'FTE_results':
        tv_map[(r['year'], r['district_id'])] += r['candidatevotes']
for r in returns:
    if r['source'] == 'FTE_results' and r['totalvotes'] == 0:
        r['totalvotes'] = tv_map.get((r['year'], r['district_id']), 0)

# vote_pct
for r in returns:
    tv, cv = r['totalvotes'], r['candidatevotes']
    r['vote_pct'] = round(cv / tv * 100, 4) if tv > 0 else None

print(f"  Total return rows: {len(returns):,}  |  years {min(r['year'] for r in returns)}-{max(r['year'] for r in returns)}")

# ── STEP 2 : Polling Data ─────────────────────────────────────────────────────
print("\n=== Processing polling data ===")

polls_raw = []

def load_polls(path, label):
    count = 0
    with open(path, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get('stage','').lower() != 'general':
                continue
            if row.get('nationwide_batch','').lower() in ('true','1'):
                continue
            seat_num = row.get('seat_number','').strip()
            if not seat_num:
                continue
            state = row.get('state','').strip()
            state_up = state.upper()
            # Convert full name → abbr, or keep if already 2-char abbr
            if len(state) == 2:
                state_po = state_up
            else:
                state_po = STATE_ABBR.get(state_up, state_up[:2])
            district_id = make_district_id(state_po, seat_num)
            try:
                year = int(row.get('cycle',''))
            except ValueError:
                continue
            if year < 1998:
                continue
            candidate = str(row.get('candidate_name', row.get('answer',''))).strip().title()
            party     = str(row.get('candidate_party', row.get('party',''))).strip().upper()
            try:
                pct = float(row.get('pct') or 0)
            except (ValueError, TypeError):
                pct = 0.0
            polls_raw.append({
                'year': year, 'state_po': state_po, 'district_id': district_id,
                'candidate': candidate, 'party': party, 'poll_pct': pct,
            })
            count += 1
    print(f"  {label}: {count:,} rows")

load_polls(f"{RAW}/house_polls_historical_wb.csv", "Historical 2018-2022")
load_polls(f"{RAW}/house_polls_2024_wb.csv",       "Current 2023-2024")
print(f"  Total poll rows: {len(polls_raw):,}")

# ── STEP 3 : Aggregate polling ────────────────────────────────────────────────
print("\n=== Aggregating polling averages ===")

agg = defaultdict(lambda: {'sum': 0.0, 'count': 0, 'party': '', 'display': ''})
for p in polls_raw:
    key = (p['year'], p['district_id'], clean_name(p['candidate']))
    agg[key]['sum']    += p['poll_pct']
    agg[key]['count']  += 1
    agg[key]['party']   = p['party']
    agg[key]['display'] = p['candidate']

polls_agg = []
for (year, did, name_clean), v in agg.items():
    state_po = did.split('-')[0]
    polls_agg.append({
        'year': year, 'district_id': did, 'state_po': state_po,
        'poll_candidate': v['display'], 'poll_candidate_clean': name_clean,
        'poll_party': v['party'],
        'avg_poll_pct': round(v['sum'] / v['count'], 4),
        'n_polls': v['count'],
    })
print(f"  Aggregated records: {len(polls_agg):,}")

# ── STEP 4 : Fuzzy merge ──────────────────────────────────────────────────────
print("\n=== Fuzzy-matching candidate names and merging ===")

poll_lookup = defaultdict(list)
for p in polls_agg:
    poll_lookup[(p['year'], p['district_id'])].append(p)

THRESHOLD = 82
matched, no_poll = [], []

for r in returns:
    candidates_in_race = poll_lookup.get((r['year'], r['district_id']), [])
    null_poll = {'avg_poll_pct': None, 'n_polls': None,
                 'poll_candidate_matched': None, 'match_score': None}
    if not candidates_in_race:
        merged = {**r, **null_poll}
        no_poll.append(merged)
        continue
    name_map = {p['poll_candidate_clean']: p for p in candidates_in_race}
    query    = clean_name(r['candidate'])
    best, score = fuzz_process.extractOne(query, list(name_map.keys()))
    if score >= THRESHOLD:
        poll = name_map[best]
        merged = {**r,
                  'avg_poll_pct': poll['avg_poll_pct'],
                  'n_polls': poll['n_polls'],
                  'poll_candidate_matched': poll['poll_candidate'],
                  'match_score': score}
        matched.append(merged)
    else:
        merged = {**r, **null_poll, 'match_score': score}
        no_poll.append(merged)

all_rows = matched + no_poll
all_rows.sort(key=lambda r: (r['year'], r['district_id'], -(r['candidatevotes'] or 0)))

in_polled_district = sum(1 for r in returns if poll_lookup.get((r['year'], r['district_id'])))
print(f"  Returns in polled districts  : {in_polled_district:,}")
print(f"  Fuzzy-matched (≥{THRESHOLD}%): {len(matched):,}")
print(f"  Unmatched / no-poll race     : {len(no_poll):,}")

# ── STEP 5 : Write output ─────────────────────────────────────────────────────
print("\n=== Writing output ===")

COLS = [
    'year','state','state_po','district_id',
    'candidate','party',
    'candidatevotes','totalvotes','vote_pct',
    'avg_poll_pct','n_polls',
    'poll_candidate_matched','match_score',
    'source',
]

out_path = f"{OUT}/house_elections_polls_1998_2024.csv"
with open(out_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=COLS, extrasaction='ignore')
    writer.writeheader()
    writer.writerows(all_rows)

rows_with_polls = sum(1 for r in all_rows if r['avg_poll_pct'] is not None)
print(f"  Output: {out_path}")
print(f"\n── FINAL SUMMARY ─────────────────────────────")
print(f"  Years covered      : {min(r['year'] for r in all_rows)}-{max(r['year'] for r in all_rows)}")
print(f"  Distinct districts : {len({r['district_id'] for r in all_rows}):,}")
print(f"  Total rows         : {len(all_rows):,}")
print(f"  Rows with polls    : {rows_with_polls:,} ({rows_with_polls/len(all_rows)*100:.1f}%)")
print("Done ✓")
