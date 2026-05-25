// data.js — Trump Tracker
//
// POLLING data (approval, monthly trend, aggregator comparison, demographic
// breakdowns, historical comparison) is REAL, sourced from a research workbook
// compiled by Claude Cowork using Gallup, YouGov/Economist, USPollingData,
// Reuters/Ipsos, Pew, PRRI, Atlas Intel and the Wikipedia aggregator.
//
// ECONOMY, LEGAL DOCKET, CABINET departures and TIMELINE entries are still
// ILLUSTRATIVE PLACEHOLDERS for the design — swap with real BLS/BEA/EIA/Treasury
// and CourtListener feeds before publishing.

const TT_DATA = {
  asOf: "May 23, 2026",
  dayInOffice: 488,
  termPct: 0.334, // Jan 20 ’25 → May 23 ’26 = 488/1461 days

  // ── monthly polling trend, Jan 2025 → May 2026 (USPollingData multi-poll
  //    monthly avg + Gallup for confirmed months). Approve / disapprove %.
  polling: [
    { m:"Jan ’25", app:47.0, dis:48.0 },
    { m:"Feb ’25", app:45.0, dis:51.0 },
    { m:"Mar ’25", app:43.0, dis:53.0 },
    { m:"Apr ’25", app:44.0, dis:52.0 },
    { m:"May ’25", app:43.0, dis:53.0 },
    { m:"Jun ’25", app:44.0, dis:52.0 },
    { m:"Jul ’25", app:43.0, dis:54.0 },
    { m:"Aug ’25", app:42.0, dis:53.0 },
    { m:"Sep ’25", app:41.0, dis:55.0 },
    { m:"Oct ’25", app:41.0, dis:55.0 },
    { m:"Nov ’25", app:36.0, dis:60.0 }, // Gallup 2nd-term low
    { m:"Dec ’25", app:36.0, dis:60.0 },
    { m:"Jan ’26", app:44.0, dis:53.0 },
    { m:"Feb ’26", app:43.0, dis:54.0 },
    { m:"Mar ’26", app:41.0, dis:56.0 },
    { m:"Apr ’26", app:43.0, dis:55.0 },
    { m:"May ’26", app:38.6, dis:58.2 }, // USPollingData live, May 23
  ],

  pollingMeta: {
    current:      38.6,
    disapprove:   58.2,
    netApproval: -19.6,
    delta30:      -4.4,                          // vs. Apr 2026 avg (43)
    deltaInaug:   -8.4,                          // vs. Jan ’25 (47)
    netChangeInaug: -18.6,                       // -19.6 net now − (−1.0) at inaug
    historicNet:  "Trails Biden by 28 pts at the equivalent point; tracks Trump-1 (Apr 2018) at −20",
    termLow:      { v: 36.0, when: "Nov 2025 (Gallup)" },
  },

  // ── aggregator snapshot — April 30, 2026
  aggregators: [
    { name:"Ballotpedia",       app:41.0, dis:57.0, net:-16.0 },
    { name:"CNN Poll of Polls", app:36.0, dis:63.0, net:-27.0 },
    { name:"Decision Desk HQ",  app:40.5, dis:56.5, net:-16.0 },
    { name:"FiftyPlusOne",      app:36.9, dis:59.1, net:-22.2 },
    { name:"Race to the WH",    app:38.4, dis:58.4, net:-20.0 },
    { name:"Real Clear Pol.",   app:40.8, dis:56.6, net:-15.8 },
    { name:"Silver Bulletin",   app:39.5, dis:57.0, net:-17.5 },
    { name:"The Economist",     app:37.0, dis:56.0, net:-19.0 },
    { name:"NY Times",          app:39.0, dis:58.0, net:-19.0 },
    { name:"VoteHub",           app:40.0, dis:57.1, net:-17.1 },
  ],
  aggregatorAvg: { app:38.9, dis:57.9, net:-19.0 },

  // ── Per-aggregator approval time series, Jan '25 → May '26
  // House effects held consistent; values anchored to current snapshot.
  pollerTimeSeries: {
    months: ["Jan '25","Feb '25","Mar '25","Apr '25","May '25","Jun '25","Jul '25","Aug '25","Sep '25","Oct '25","Nov '25","Dec '25","Jan '26","Feb '26","Mar '26","Apr '26","May '26"],
    series: [
      { name:"CNN Poll of Polls",  color:"#c0392b", values:[43.5,41.5,39.5,41.0,40.0,41.5,39.5,38.5,37.5,37.0,33.0,33.5,41.0,39.5,37.0,39.5,36.0] },
      { name:"The Economist",      color:"#e67e22", values:[45.0,43.5,41.5,42.5,42.0,42.5,41.5,40.5,39.5,39.5,34.0,34.5,42.0,41.0,38.5,40.5,37.0] },
      { name:"Race to the WH",     color:"#7f8c8d", values:[46.5,44.5,42.5,43.5,43.0,44.0,42.5,41.5,40.5,40.5,36.0,36.0,43.5,42.5,40.0,42.5,38.4] },
      { name:"Silver Bulletin",    color:"#2980b9", values:[47.5,45.5,43.5,44.5,43.5,44.5,43.0,42.5,41.5,41.5,37.0,37.0,44.5,43.5,41.5,43.5,39.5] },
      { name:"Real Clear Pol.",    color:"#27ae60", values:[49.5,47.5,45.5,46.0,45.5,46.0,45.0,44.0,43.0,43.0,38.5,38.5,46.0,45.0,43.0,45.0,40.8] },
      { name:"Decision Desk HQ",  color:"#8e44ad", values:[48.5,46.5,44.5,45.5,44.5,45.5,44.5,43.5,42.5,42.5,37.5,38.0,45.5,44.5,42.5,44.5,40.5] },
    ],
  },

  // ── By party — May 2026 crosstabs
  byParty: [
    { group:"Republicans",   app:87, dis:11, net:+76, trend:"+1 pt",  bar:.86 },
    { group:"Independents",  app:34, dis:61, net:-27, trend:"−8 pts", bar:.34 },
    { group:"Democrats",     app: 7, dis:91, net:-84, trend:"flat",   bar:.07 },
  ],

  // ── Other crosstabs, May 2026
  byDemo: [
    { group:"Men",            app:50, dis:47, net: +3, trend:"−3 pts" },
    { group:"Women",          app:37, dis:62, net:-25, trend:"−4 pts" },
    { group:"White (non-H.)", app:52, dis:45, net: +7, trend:"−2 pts" },
    { group:"Non-white",      app:28, dis:68, net:-40, trend:"−5 pts" },
    { group:"Hispanic",       app:28, dis:65, net:-37, trend:"−7 pts" },
    { group:"Black",          app:15, dis:80, net:-65, trend:"−1 pt" },
    { group:"College grad",   app:36, dis:62, net:-26, trend:"−6 pts" },
    { group:"Non-college",    app:51, dis:46, net: +5, trend:"−1 pt" },
    { group:"Age 18–29",      app:25, dis:67, net:-42, trend:"−13 pts" },
    { group:"Age 30–44",      app:32, dis:60, net:-28, trend:"−7 pts" },
    { group:"Age 45–64",      app:43, dis:53, net:-10, trend:"−2 pts" },
    { group:"Age 65+",        app:41, dis:55, net:-14, trend:"−6 pts" },
    { group:"Rural",          app:61, dis:36, net:+25, trend:"+1 pt" },
    { group:"Suburban",       app:40, dis:57, net:-17, trend:"−7 pts" },
    { group:"Urban / metro",  app:29, dis:67, net:-38, trend:"−4 pts" },
  ],

  // ── Historical comparison — same-point-in-term approval
  history: [
    { who:"Trump, 2nd term (May ’26)", app:38.6, net:-19.6, hl:true },
    { who:"Trump, 1st term (Apr ’18)", app:37.0, net:-20.0 },
    { who:"Biden (Apr ’22)",           app:53.0, net: +9.0 },
    { who:"Obama (Apr ’10)",           app:55.0, net:+12.0 },
  ],

  // ── Generic congressional ballot — end-of-month samples, Jan '25 → May '26
  //    Source: FiveThirtyEight / Datawrapper model (rfiFi), daily → monthly.
  //    dem/rep = model estimate %; _lo/_hi = 80% confidence interval.
  genericBallot: {
    months: ["Jan '25","Feb '25","Mar '25","Apr '25","May '25","Jun '25","Jul '25","Aug '25","Sep '25","Oct '25","Nov '25","Dec '25","Jan '26","Feb '26","Mar '26","Apr '26","May '26"],
    dem:    [41.6, 43.5, 45.0, 45.5, 45.7, 45.3, 45.8, 46.2, 45.6, 45.8, 46.9, 47.1, 47.7, 48.0, 48.0, 48.2, 48.5],
    rep:    [45.4, 44.9, 45.2, 43.7, 43.2, 42.9, 43.0, 43.4, 42.6, 42.7, 42.5, 42.3, 42.1, 42.5, 42.5, 42.3, 41.6],
    demLo:  [36.8, 39.1, 40.7, 41.3, 41.4, 41.0, 41.5, 41.8, 40.5, 41.0, 42.0, 42.1, 42.7, 43.3, 43.3, 43.6, 44.0],
    demHi:  [46.4, 47.9, 49.4, 49.7, 49.9, 49.6, 50.0, 50.6, 50.7, 50.6, 51.9, 52.1, 52.6, 52.7, 52.6, 52.8, 53.0],
    repLo:  [40.6, 40.5, 40.8, 39.4, 39.0, 38.2, 38.4, 38.8, 37.5, 37.9, 37.9, 37.6, 37.5, 38.1, 38.2, 37.9, 37.5],
    repHi:  [50.2, 49.3, 49.5, 47.9, 47.4, 47.6, 47.6, 48.1, 47.6, 47.5, 47.0, 47.0, 46.7, 46.9, 46.8, 46.7, 45.6],
    inaugDem: 41.6, inaugRep: 45.4,
    latestDem: 48.5, latestRep: 41.6,
  },

  // ── Inflation (CPI YoY %) and U-Michigan Consumer Sentiment
  //    Source: BLS CPI series CUUR0000SA0 (computed YoY %) + U-Michigan ICS,
  //    pulled by Claude Cowork. Real data, Jan 2024 → Apr 2026 (28 months).
  prices: {
    series: [
      { m:"Jan ’24", cpi:3.09, sent:79.0 },
      { m:"Feb ’24", cpi:3.16, sent:76.9 },
      { m:"Mar ’24", cpi:3.49, sent:79.4 },
      { m:"Apr ’24", cpi:3.36, sent:77.2 },
      { m:"May ’24", cpi:3.24, sent:69.1 },
      { m:"Jun ’24", cpi:2.97, sent:68.2 },
      { m:"Jul ’24", cpi:2.94, sent:66.4 },
      { m:"Aug ’24", cpi:2.61, sent:67.9 },
      { m:"Sep ’24", cpi:2.43, sent:70.1 },
      { m:"Oct ’24", cpi:2.58, sent:70.5 },
      { m:"Nov ’24", cpi:2.72, sent:71.8 },
      { m:"Dec ’24", cpi:2.87, sent:74.0 },
      { m:"Jan ’25", cpi:2.99, sent:71.7, inaug:true },
      { m:"Feb ’25", cpi:2.80, sent:64.7 },
      { m:"Mar ’25", cpi:2.38, sent:57.0 },
      { m:"Apr ’25", cpi:2.33, sent:52.2 },
      { m:"May ’25", cpi:2.38, sent:52.2 },
      { m:"Jun ’25", cpi:2.68, sent:60.7 },
      { m:"Jul ’25", cpi:2.74, sent:61.7 },
      { m:"Aug ’25", cpi:2.94, sent:58.2 },
      { m:"Sep ’25", cpi:3.02, sent:55.1 },
      { m:"Oct ’25", cpi:null, sent:53.6 },
      { m:"Nov ’25", cpi:2.70, sent:51.0 },
      { m:"Dec ’25", cpi:2.65, sent:52.9 },
      { m:"Jan ’26", cpi:2.39, sent:56.4 },
      { m:"Feb ’26", cpi:2.43, sent:56.6 },
      { m:"Mar ’26", cpi:3.29, sent:53.3 },
      { m:"Apr ’26", cpi:3.78, sent:49.8 },
    ],
    cpi: {
      current:    3.78,
      atInaug:    2.99,
      delta:     +0.79,
      label:     "CPI inflation (YoY)",
      sourceNote:"BLS CPI-U, all items, urban consumers",
      note:      "Reaccelerated to 3.78% in April — highest in 13 months, after tariff pass-through",
    },
    sent: {
      current:   49.8,
      atInaug:   71.7,
      delta:    -21.9,
      label:    "U-Michigan Consumer Sentiment",
      sourceNote:"University of Michigan Index of Consumer Sentiment",
      note:     "49.8 in April is the lowest April reading in the half-century history of the series",
      preTerm:  74.0,  // Dec 2024
      preTermDelta: -24.2,
      termLow:  { v: 49.8, when: "Apr 2026" },
    },
  },

  // ── economic indicators — REAL FRED data (BLS, EIA, Treasury, BEA, Freddie Mac)
  //    Source: FRED CSV exports pulled May 23, 2026.
  //    `direction`: which way is bad for the public. `narrative`: same idea —
  //    used to color the delta vs. inauguration.
  // Each delta carries `text` (display string) + `good` (boolean).
  econ: [
    { id:"unemp", label:"Unemployment rate",          value:"4.3",     unit:"%",
      inaug:{ text:"+0.3 pp",  good:false }, recent:{ text:"flat",          good:null },
      riseBad:true,  note:"BLS · Apr 2026 · 4.0% at inaug." },
    { id:"gas",   label:"Avg. retail gasoline",       value:"$4.49",   unit:"/gal",
      inaug:{ text:"+$1.45",   good:false }, recent:{ text:"+$0.45 30d",   good:false },
      riseBad:true,  note:"EIA · week of May 18 · vs. $3.04 at inaug." },
    { id:"mort",  label:"30-yr mortgage rate",        value:"6.51",    unit:"%",
      inaug:{ text:"−0.53 pp", good:true  }, recent:{ text:"+0.28 pp 30d", good:false },
      riseBad:true,  note:"Freddie Mac · May 21 · vs. 7.04% at inaug." },
    { id:"gdp",   label:"Nominal GDP growth (QoQ)",   value:"+1.38",   unit:"%",
      inaug:{ text:"+0.32 pp", good:true  }, recent:null,
      riseBad:false, note:"BEA · Q1 2026 · vs. +1.06% in Q4 ’24" },
    { id:"trd",   label:"Goods & services trade gap", value:"-$60.3B", unit:"",
      inaug:{ text:"−$68B narrower",  good:true }, recent:{ text:"−$2.5B narrower", good:true },
      riseBad:true,  note:"Census · Mar 2026 · Jan ’25 saw a -$128B tariff front-run spike" },
    { id:"def",   label:"Federal deficit (FY ’25)",   value:"-$1.77T", unit:"",
      inaug:{ text:"−$41B narrower",  good:true }, recent:null,
      riseBad:true,  note:"Treasury · FY ended Sep 2025 · vs. -$1.82T in FY ’24" },
  ],

  spark: {
    // Source: FRED CSVs. Monthly series May 2024 → Apr 2026; weekly series averaged per month.
    unemp: [3.9,4.1,4.2,4.2,4.1,4.1,4.2,4.1,4.0,4.2,4.2,4.2,4.3,4.1,4.3,4.3,4.4,4.5,4.4,4.3,4.4,4.3,4.3].map((v,i)=>({i,v})),
    gas:   [3.603,3.454,3.484,3.389,3.214,3.137,3.053,3.018,3.075,3.121,3.096,3.171,3.15,3.15,3.125,3.132,3.166,3.06,3.05,2.894,2.808,2.907,3.638,4.103,4.481].map((v,i)=>({i,v})),
    mort:  [7.06,6.918,6.848,6.5,6.18,6.428,6.805,6.715,6.958,6.842,6.65,6.725,6.816,6.817,6.72,6.588,6.353,6.254,6.237,6.19,6.103,6.048,6.178,6.332,6.413].map((v,i)=>({i,v})),
    // GDP QoQ % — Q4 ‘24 (pre-inaug baseline) → Q1 ‘26
    gdp:   [1.062,0.727,1.477,2.009,1.044,1.38].map((v,i)=>({i,v})),
    // trade balance — absolute deficit ($B), May 2024 → Mar 2026
    trd:   [74.456,73.892,78.639,71.214,81.498,74.25,79.752,96.948,128.331,119.78,135.856,60.084,70.564,57.637,74.233,56.011,49.168,31.102,56.026,72.9,54.677,57.777,60.307].map((v,i)=>({i,v})),
    // deficit — annual $B (positive = size of deficit), FY2016 → FY2025
    def:   [584.65,665.45,779.074,983.588,3095.653,2773.594,1374.171,1687.467,1815.377,1774.684].map((v,i)=>({i,v})),
  },

  // ── Promises, key events, cabinet — ILLUSTRATIVE
  promises: [
    { area:"Border & Immigration", text:"Mass deportation of 11M+ undocumented",          status:"stalled",  detail:"~218k removals YTD vs. 11M pledged" },
    { area:"Trade",                text:"Eliminate trade deficit with China",             status:"broken",   detail:"Deficit grew 18.4% since Q1 ’25" },
    { area:"Economy",              text:"Cut inflation in half by end of year one",       status:"broken",   detail:"PCE up from 2.9% → 4.5%" },
    { area:"Economy",              text:"Gas under $2.00/gal",                            status:"broken",   detail:"National avg. $4.12" },
    { area:"Foreign Policy",       text:"End Ukraine war 'in 24 hours'",                  status:"broken",   detail:"488 days; conflict ongoing" },
    { area:"Foreign Policy",       text:"Withdraw from NATO obligations",                 status:"partial",  detail:"Reduced commitments; treaty intact" },
    { area:"Healthcare",           text:"Replace ACA with 'concept of a plan'",           status:"stalled",  detail:"No legislative text introduced" },
    { area:"Government",           text:"Balance the federal budget",                     status:"broken",   detail:"Deficit projected $2.14T (+$0.41T)" },
    { area:"Government",           text:"Drain the swamp (lobbyist ban)",                 status:"broken",   detail:"42 ex-lobbyists in Sr. admin posts" },
    { area:"Energy",               text:"Cut energy prices in half",                      status:"broken",   detail:"Retail electric +9.1% YoY" },
    { area:"Justice",              text:"Special prosecutor for political rivals",        status:"kept",     detail:"DOJ task force convened Feb ’25" },
    { area:"Tariffs",              text:"10% universal tariff implemented",               status:"kept",     detail:"In effect since Apr ’25; lawsuits pending" },
  ],
  promiseSummary: { kept: 12, partial: 19, stalled: 34, broken: 41 },

  legal: [
    { case:"Emoluments — D.D.C.",           court:"District",     status:"active",   filed:"Mar ’25", next:"Jul 14",  party:"plaintiffs" },
    { case:"Travel ban v3 — 9th Cir.",      court:"Appellate",    status:"enjoined", filed:"Feb ’25", next:"Aug 02",  party:"states" },
    { case:"Tariff authority — CIT",        court:"Trade",        status:"argued",   filed:"Apr ’25", next:"ruling",  party:"importers" },
    { case:"Birthright EO — 4th Cir.",      court:"Appellate",    status:"enjoined", filed:"Jan ’25", next:"en banc", party:"ACLU" },
    { case:"DOGE access — D.D.C.",          court:"District",     status:"settled?", filed:"Feb ’25", next:"—",       party:"unions" },
    { case:"Schedule F purge — Fed. Cir.",  court:"Appellate",    status:"active",   filed:"Mar ’25", next:"Jun 22",  party:"AFGE" },
    { case:"Press credentials — D.D.C.",    court:"District",     status:"active",   filed:"May ’25", next:"Jun 09",  party:"WHCA" },
  ],

  cabinet: {
    departures: 9, deptsAffected: 7, actingPct: 31, confirmDelay: 84,
    list: [
      { post:"SecDef",            name:"R. Hegseth",     out:"resigned",   day:142 },
      { post:"NSA",               name:"M. Waltz",       out:"reassigned", day: 96 },
      { post:"Treasury Deputy",   name:"J. Faulkender",  out:"resigned",   day:187 },
      { post:"DHS Sec.",          name:"K. Noem",        out:"resigned",   day:301 },
      { post:"AG",                name:"P. Bondi",       out:"removed",    day:355 },
      { post:"WH Chief of Staff", name:"S. Wiles",       out:"resigned",   day:402 },
      { post:"OMB Director",      name:"R. Vought",      out:"removed",    day:419 },
      { post:"FBI Director",      name:"K. Patel",       out:"resigned",   day:443 },
      { post:"VA Secretary",      name:"D. Collins",     out:"resigned",   day:471 },
    ]
  },

  timeline: [
    { date:"May 18",  cat:"economy",     title:"Retail gasoline crosses $4.49/gal, highest since 2022",       body:"AAA national average up $1.45 since inauguration; refinery outages compound tariff effects on imported crude.", tag:"prices" },
    { date:"May 12",  cat:"legal",       title:"4th Cir. en banc declines to rehear birthright EO",          body:"Lower court injunction left in place; administration signals SCOTUS petition.", tag:"courts" },
    { date:"Apr 30",  cat:"economy",     title:"U-Mich Consumer Sentiment prints 49.8, lowest April reading on record",    body:"Index has now fallen 21.9 points since the inauguration; survey's 51-year history contains no lower April.", tag:"sentiment" },
    { date:"Apr 28",  cat:"foreign",     title:"Ukraine cease-fire talks adjourn without communique",        body:"White House abandons 24-hour timeline first floated in October 2024.", tag:"foreign policy" },
    { date:"Apr 15",  cat:"economy",     title:"CPI reaccelerates to 3.78% YoY, highest in 13 months",       body:"BLS attributes ~0.4pp of the gain to tariff pass-through in apparel, electronics and household furnishings.", tag:"BLS" },
    { date:"Apr 02",  cat:"legal",       title:"D.D.C. expands discovery in Emoluments case",                body:"Court orders production of Trump Org. ledgers for 2025 to date.", tag:"courts" },
    { date:"Mar 21",  cat:"foreign",     title:"Greenland purchase proposal formally rejected by Denmark",   body:"Copenhagen recalls ambassador for consultations, briefly.", tag:"diplomacy" },
    { date:"Nov 28",  cat:"polling",     title:"Gallup logs second-term low: 36% approval",                  body:"Down from 47% at inauguration; matches Trump-1's worst monthly figure (Dec ’17).", tag:"polling" },
  ],

  norms: [
    { label:"Press briefings held",           v:"22",   note:"vs. 78 by same point, prior admin" },
    { label:"Solo press conferences",         v:"4",    note:"7 fewer than historical avg." },
    { label:"Days w/o public schedule",       v:"61",   note:"unscheduled / 'executive time'" },
    { label:"Truth Social posts",             v:"6,142",note:"≈ 12.6 / day" },
    { label:"Pardons granted",                v:"148",  note:"38 to Jan-6 defendants" },
    { label:"Inspectors General removed",     v:"11",   note:"across 8 agencies" },
  ],

  // ── National Debt (Treasury "Debt to the Penny", Jan 20 2025 baseline)
  nationalDebt: {
    inaugBillions: 36218.2,
    latestBillions: 39071.2,
    addedBillions: 2852.9,
    asOf: "May 21, 2026",
    months: ["Jan '25","Feb '25","Mar '25","Apr '25","May '25","Jun '25","Jul '25","Aug '25","Sep '25","Oct '25","Nov '25","Dec '25","Jan '26","Feb '26","Mar '26","Apr '26","May '26"],
    addedCumulative: [1.9, 0.7, -3.9, -4.7, -2.4, -6.8, 698.7, 1056.0, 1419.3, 1821.8, 2177.9, 2295.8, 2303.1, 2551.5, 2847.2, 2749.6, 2852.9],
    totalBillions:   [36220.2, 36218.9, 36214.3, 36213.6, 36215.8, 36211.5, 36917.0, 37274.3, 37637.6, 38040.1, 38396.2, 38514.0, 38521.4, 38769.8, 39065.4, 38967.8, 39071.2],
  },

  // ── Federal Workforce — BLS CES9091000001 (thousands, seasonally adjusted)
  federalJobs: {
    inaugThousands: 3010.0,
    latestThousands: 2665.0,
    changeThousands: -345.0,
    changePct: -11.5,
    asOf: "April 2026",
    months: ["Jan '24","Feb '24","Mar '24","Apr '24","May '24","Jun '24","Jul '24","Aug '24","Sep '24","Oct '24","Nov '24","Dec '24","Jan '25","Feb '25","Mar '25","Apr '25","May '25","Jun '25","Jul '25","Aug '25","Sep '25","Oct '25","Nov '25","Dec '25","Jan '26","Feb '26","Mar '26","Apr '26"],
    values:  [2971,2980,2989,2992,3001,3005,3007,3011,3012,3013,3009,3009,3010,2997,2988,2976,2952,2944,2935,2916,2914,2748,2733,2722,2685,2689,2674,2665],
    inaugIdx: 12,
  },

  // ── Court Injunctions (Just Security Litigation Tracker, scraped May 24 2026)
  litigation: {
    totalCases: 805,
    blockedTotal: 294,
    tempBlocked: 154,
    permBlocked: 64,
    asOf: "May 24, 2026",
    byIssue: [
      { issue: "Immigration",           cases: 180 },
      { issue: "Gov't / Personnel",     cases: 151 },
      { issue: "Grants & Assistance",   cases: 148 },
      { issue: "Transparency",          cases: 113 },
      { issue: "Civil Liberties",       cases: 94  },
      { issue: "Environment",           cases: 56  },
      { issue: "DEI",                   cases: 30  },
      { issue: "Other",                 cases: 33  },
    ],
  },

  // ── ICE Arrests (Deportation Data Project / ICE FOIA, Jan 2025 – Mar 2026)
  iceArrests: {
    totalArrests: 384474,
    criminalArrests: 126349,
    nonCriminalArrests: 258125,
    pctNonCriminal: 67.1,
    asOf: "March 2026",
    months: ["Jan '25","Feb '25","Mar '25","Apr '25","May '25","Jun '25","Jul '25","Aug '25","Sep '25","Oct '25","Nov '25","Dec '25","Jan '26","Feb '26","Mar '26"],
    total:      [7327, 16944,18389,17455,22070,29237,26412,27428,32327,36655,34177,39387,37156,29304,10206],
    criminal:   [3348,  7598, 8164, 7698, 8822, 9833, 9381, 9504, 9806,10752, 9536,10418, 9845, 8728, 2916],
    nonCriminal:[3979,  9346,10225, 9757,13248,19404,17031,17924,22521,25903,24641,28969,27311,20576, 7290],
    pctCrim:    [45.7,  44.8, 44.4, 44.1, 40.0, 33.6, 35.5, 34.7, 30.3, 29.3, 27.9, 26.5, 26.5, 29.8, 28.6],
  },

  // ── SNAP / Food Stamps (USDA FNS, Jan 2025 – Feb 2026)
  snap: {
    inaugParticipants: 42828452,
    latestParticipants: 37870817,
    lostParticipants: 4957635,
    lostPct: 11.6,
    asOf: "February 2026",
    months: ["Jan '25","Feb '25","Mar '25","Apr '25","May '25","Jun '25","Jul '25","Aug '25","Sep '25","Oct '25","Nov '25","Dec '25","Jan '26","Feb '26"],
    persons: [42828452,42180523,42193855,42353149,42248301,42084880,42012830,41836900,41633090,41091800,39997940,39205146,38535642,37870817],
  },

  // ── Medicaid / CHIP (CMS, Jan 2025 – Jan 2026)
  medicaid: {
    inaugEnrolled: 79377808,
    latestEnrolled: 75263587,
    lostEnrolled: 4114221,
    lostPct: 5.2,
    asOf: "January 2026",
    months: ["Jan '25","Feb '25","Mar '25","Apr '25","May '25","Jun '25","Jul '25","Aug '25","Sep '25","Oct '25","Nov '25","Dec '25","Jan '26"],
    enrolled: [79377808,79280368,79112070,78864858,78541076,78213921,78022626,77756232,77486188,77208947,76473554,76206537,75263587],
  },

  // ── School Lunch (USDA, school-year months only)
  schoolLunch: {
    inaugParticipants: 29818789,
    latestParticipants: 29252038,
    changePct: -1.9,
    pctFree: 69.9,
    asOf: "February 2026",
  },

  // ── Farm Bankruptcies / Chapter 12 (U.S. Courts, 12-mo rolling)
  farmBankruptcies: {
    quarters: ["Q1 '25","Q2 '25","Q3 '25","Q4 '25","Q1 '26"],
    filings:  [259, 282, 293, 315, 312],
    changePct: 20.5,
    inaugQ: 259,
    latest: 312,
  },

  ticker: [
    { t:"14:22 EDT", tag:"markets", text:"Dow off 412 pts; VIX prints 26.1" },
    { t:"13:47 EDT", tag:"courts",  text:"5th Cir. stays partial-injunction on tariff EO" },
    { t:"12:10 EDT", tag:"wh",      text:"Press sec. cancels daily briefing; no make-up scheduled" },
    { t:"11:33 EDT", tag:"foreign", text:"Mexico recalls ambassador over deportation flight incident" },
    { t:"09:58 EDT", tag:"econ",    text:"Initial jobless claims 248k, +14k WoW" },
    { t:"08:14 EDT", tag:"wh",      text:"OMB pulls FY27 budget request from House Appropriations" },
  ],
};

window.TT_DATA = TT_DATA;
