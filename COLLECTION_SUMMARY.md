# Presidential Tracker — Data Collection Summary
**Generated:** May 24, 2026 | **Coverage:** January 20, 2025 – present

---

## What's Been Collected

39 data files across 7 metric categories. All baselines anchored to Inauguration Day (Jan 20, 2025) where possible.

---

## 📊 Key Findings by Category

### 🏛️ National Debt
| Metric | Value |
|--------|-------|
| Debt on Jan 20, 2025 | $36.218 trillion |
| Debt on May 21, 2026 | $39.071 trillion |
| **Added since inauguration** | **$2.853 trillion** |
| **File** | `treasury_debt_to_penny_jan2025_present.csv` (336 daily rows) |

---

### 👷 Federal Workforce (DOGE)
| Metric | Value |
|--------|-------|
| Federal workers Jan 2025 | 3,010,000 |
| Federal workers Apr 2026 | 2,665,000 |
| **Jobs eliminated** | **-345,000 (-11.5%)** |
| **File** | `bls_federal_employment_CES9091000001.csv` |

Sharp acceleration in Oct 2025: 2,976K → 2,748K in one month.

---

### ⚖️ Court Injunctions
| Metric | Value |
|--------|-------|
| Total lawsuits filed | 805 |
| Government action blocked | 294 total |
| — Temporarily blocked | 154 |
| — Permanently blocked | 64 |
| Top issue area | Immigration (180 cases) |
| **File** | `just_security_litigation_tracker.csv` |

Source: Just Security Litigation Tracker (scraped May 24, 2026)

---

### 🚨 ICE Arrests
| Metric | Value |
|--------|-------|
| Total arrests (Jan 20 2025 – Mar 2026) | **384,475** |
| Criminal arrests | 126,349 (32.9%) |
| **Non-criminal arrests** | **258,126 (67.1%)** |
| Peak month | December 2025 (39,387) |
| **Files** | `ice_arrests_trump_criminality_monthly.csv` |

Source: Deportation Data Project (FOIA data from ICE). Note: Jan 2025 partial month (7,327). Monthly criminality share of criminals *declining*: 45.7% in Jan 2025 → 28.6% in Mar 2026.

---

### 🌽 SNAP (Food Stamps)
| Metric | Value |
|--------|-------|
| Participants Jan 2025 | 42,828,452 |
| Participants Feb 2026 | 37,870,817 |
| **Lost** | **-4,957,635 (-11.6%)** |
| Post-H.R. 1 acceleration | Sharp drop from Oct 2025 |
| **Files** | `snap_national_2025_present.csv`, `snap_state_yoy_comparison.csv` |

Worst-hit states (Feb 2025 → Feb 2026): Arizona **-49.7%**, NC -18.6%, FL -14.9%, GA -14.9%.

---

### 🏥 Medicaid/CHIP
| Metric | Value |
|--------|-------|
| Enrolled Jan 2025 | 79,377,808 |
| Enrolled Jan 2026 | 75,263,587 |
| **Lost** | **-4,114,221 (-5.2%)** |
| **File** | `cms_medicaid_national_monthly_CLEAN.csv` |

---

### 🍽️ School Lunch
| Metric | Value |
|--------|-------|
| Daily participants Jan 2025 | 29,818,789 |
| Daily participants Jan 2026 | 29,252,038 |
| Year-over-year change | -566,751 (-1.9%) |
| % receiving free lunches | ~70% |
| **File** | `usda_school_lunch_monthly_parsed.csv` |

---

### 💰 Cost of Living & Wages
| Metric | Value |
|--------|-------|
| Real wage change since inauguration | **+0.16%** (essentially flat) |
| Latest trend | Sharp reversal Mar–Apr 2026 (tariff-driven CPI spike) |
| Gas prices | Collected weekly (FRED/EIA) |
| Mortgage rate | Collected weekly (Freddie Mac) |
| **Files** | `DERIVED_RealWageIndex_Jan2025Base.csv`, BLS series CSVs |

---

### 🌾 Farm Bankruptcies (Chapter 12)
| Quarter | Filings (12-month rolling) |
|---------|---------------------------|
| Q1 2025 | 259 |
| Q2 2025 | 282 |
| Q3 2025 | 293 |
| Q4 2025 | 315 |
| Q1 2026 | 312 |
| **Change** | **+20.5%** |
| **File** | `uscourts_chapter12_farm_bankruptcies.csv` |

---

### 📉 Trump Approval
| Aggregator | Approve | Disapprove |
|-----------|---------|------------|
| RealClearPolitics | 39.6% | 57.8% |
| FiveThirtyEight | 39% | 57% |
| CNN | 36% | 63% |
| Ballotpedia | 40% | 57% |
| (as of May 20, 2026) | | |
| **File** | `trump_approval_wikipedia.csv` |

---

## ⚠️ Suppressed / Blocked Data

| Metric | Status | Notes |
|--------|--------|-------|
| CBP border encounters (2025+) | **SUPPRESSED** | DHS OHSS stopped publishing after Jan 16, 2025 |
| ICE removals by criminality (2025+) | **SUPPRESSED** | Same — OHSS last data: Nov 2024 |
| CBPP SNAP tracker | **BLOCKED** | 403 bot detection; CBPP reports 2.5M already lost |
| OGE ethics waivers | **SUPPRESSED** | Administration stopped disclosure |
| RealClearPolling time series | **BLOCKED** | Datadome captcha; pivoted to Wikipedia |
| SSA disability wait times (charts) | **PARTIAL** | Dashboard is JS-rendered; key text metrics extracted only |

Pre-Trump baseline data for immigration metrics is available in `ohss_immigration_tables_nov2024_LAST_AVAILABLE.xlsx` (35 sheets).

---

## 🔑 Still Needs API Key

| Series | Where to Get Key |
|--------|-----------------|
| FRED (backup access) | https://fred.stlouisfed.org/docs/api/ (free) |
| EIA gasoline (direct) | https://www.eia.gov/opendata/ (free) |
| TRAC immigration bulk | Subscription required |

Most FRED series were successfully collected via alternative CSV download endpoints and are already in the `data/` directory.

---

## 📁 All Data Files

```
data/
├── COLLECTION_SUMMARY.md           ← this file
├── collection_manifest.json        ← machine-readable manifest
│
├── Immigration & Border
│   ├── ice_arrests_trump_monthly.csv
│   ├── ice_arrests_trump_criminality_monthly.csv
│   ├── ice_arrests_latest.parquet             (713K raw records)
│   ├── ice_ero_arrests_by_criminality_PARSED.csv
│   ├── cbp_encounters_PARSED.csv
│   ├── dhs_removals_by_criminality_PARSED.csv
│   ├── ohss_immigration_tables_nov2024_LAST_AVAILABLE.xlsx
│   └── DATA_SUPPRESSION_OHSS_immigration.txt
│
├── Cost of Living & Economy
│   ├── DERIVED_RealWageIndex_Jan2025Base.csv
│   ├── CUSR0000SA0_CPI_AllItems_SA.csv
│   ├── CUSR0000SAF11_CPI_FoodAtHome_SA.csv
│   ├── CUSR0000SEHF01_CPI_Electricity_SA.csv
│   ├── CUSR0000SEHG_CPI_UtilityGas_SA.csv
│   ├── GASREGCOVW_GasolinePrice_Regular_Weekly.csv
│   ├── MORTGAGE30US_Mortgage30YrFixed_Weekly.csv
│   ├── LNS14000000_UnemploymentRate_SA.csv
│   ├── CEU3000000001_ManufacturingEmployment_Thousands_SA.csv
│   ├── GDPC1_RealGDP_Billions2017Dollars_Quarterly.csv
│   ├── C307RX1Q020SBEA_ManufacturingStructuresInvestment_Real_Quarterly.csv
│   ├── uscourts_chapter12_farm_bankruptcies.csv
│   ├── treasury_debt_to_penny_jan2025_present.csv
│   └── treasury_debt_monthly_summary.csv
│
├── Trade
│   ├── EIUIR_ImportPriceIndex_AllCommodities.csv
│   ├── EIUIQ_ImportPriceIndex_ExclPetroleum.csv
│   ├── IQ_ExportPriceIndex_AllCommodities_Monthly.csv
│   └── fred_trade_balance.csv
│
├── Government & Workforce
│   ├── bls_federal_employment_CES9091000001.csv
│   ├── just_security_litigation_tracker.csv  (805 cases)
│   ├── just_security_litigation_summary.json
│   └── ssa_wait_times_extracted.json
│
├── Safety Net
│   ├── snap_national_2025_present.csv
│   ├── snap_state_yoy_comparison.csv
│   ├── usda_school_lunch_monthly_parsed.csv
│   ├── cms_medicaid_national_monthly_CLEAN.csv
│   └── cms_medicaid_deduped_2025_present.csv
│
└── Approval Polling
    └── trump_approval_wikipedia.csv
```
