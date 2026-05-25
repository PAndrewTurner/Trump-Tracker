// app.jsx — Trump Tracker dashboard
// Renders all sections from window.TT_DATA. Charts are inline SVG.

const { useState, useMemo, useEffect, useRef } = React;

// ─── tiny chart helpers ──────────────────────────────────────────────────
function lineCoords(data, getY, w, h, pad){
  const ys = data.map(getY);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const xStep = (w - pad.l - pad.r) / Math.max(1, data.length - 1);
  const yRange = (yMax - yMin) || 1;
  const pts = data.map((d, i) => {
    const x = pad.l + i * xStep;
    const y = pad.t + (h - pad.t - pad.b) * (1 - (getY(d) - yMin) / yRange);
    return [x, y];
  });
  return { pts, yMin, yMax };
}

function Sparkline({ data, accessor = (d)=>d.v, height=42, riseBad=true }) {
  const W = 260, H = height;
  const pad = { t:4, r:2, b:4, l:2 };
  const { pts } = useMemo(()=> lineCoords(data, accessor, W, H, pad), [data]);
  const d = pts.map((p,i)=> (i===0?"M":"L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const lastY = pts[pts.length-1][1];
  const firstY = pts[0][1];
  const goingUp = lastY < firstY; // svg y inverted: lastY smaller = up on screen
  const isBad = (goingUp && riseBad) || (!goingUp && !riseBad);
  const cls = "spark " + (isBad ? "up" : "down");
  const fill = `${d} L ${pts[pts.length-1][0]},${H-pad.b} L ${pts[0][0]},${H-pad.b} Z`;
  return (
    <svg className={cls} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <path d={fill} className="spark-fill" />
      <path d={d} className="spark-l" />
      <circle cx={pts[pts.length-1][0]} cy={lastY} r="2.4" fill={isBad ? "var(--bad)" : "var(--good)"} />
    </svg>
  );
}

function PollingChart({ data, meta }) {
  const W = 880, H = 320;
  const pad = { t:24, r:54, b:36, l:36 };
  const yMin = 30, yMax = 65;
  const xStep = (W - pad.l - pad.r) / Math.max(1, data.length - 1);
  const yScale = (v) => pad.t + (H - pad.t - pad.b) * (1 - (v - yMin) / (yMax - yMin));
  const xScale = (i) => pad.l + i * xStep;
  const lineApp = data.map((d,i)=> (i===0?"M":"L") + xScale(i).toFixed(1)+","+yScale(d.app).toFixed(1)).join(" ");
  const lineDis = data.map((d,i)=> (i===0?"M":"L") + xScale(i).toFixed(1)+","+yScale(d.dis).toFixed(1)).join(" ");
  const yTicks = [35,40,45,50,55,60];
  const labelIdx = data.map((d,i) => ({d,i})).filter(({i}) => i % 2 === 0 || i === data.length-1);

  const [tip, setTip] = useState(null);
  const svgRef = useRef(null);
  const TW = 172, TH = 72;

  const onMove = (e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (W / rect.width);
    const i = Math.max(0, Math.min(data.length - 1, Math.round((mouseX - pad.l) / xStep)));
    setTip({ i, x: xScale(i), d: data[i] });
  };

  return (
    <svg ref={svgRef} className="chart" viewBox={`0 0 ${W} ${H}`}
         style={{cursor:"crosshair", overflow:"visible"}}
         onMouseMove={onMove} onMouseLeave={() => setTip(null)}>
      {yTicks.map(t => (
        <g key={t}>
          <line className="grid-l" x1={pad.l} x2={W-pad.r} y1={yScale(t)} y2={yScale(t)} />
          <text className="ax-txt" x={pad.l-6} y={yScale(t)+3} textAnchor="end">{t}%</text>
        </g>
      ))}
      <line className="ax" x1={pad.l} x2={W-pad.r} y1={yScale(50)} y2={yScale(50)} strokeDasharray="3 3"/>
      <text className="ax-txt" x={W-pad.r-2} y={yScale(50)-4} textAnchor="end" style={{letterSpacing:".14em", textTransform:"uppercase"}}>50% line</text>
      {labelIdx.map(({d,i}) => (
        <text key={i} className="ax-txt" x={xScale(i)} y={H-pad.b+16} textAnchor="middle">{d.m}</text>
      ))}
      <path d={`${lineDis} L ${xScale(data.length-1)},${yScale(yMin)} L ${xScale(0)},${yScale(yMin)} Z`} fill="var(--accent)" opacity=".04" />
      <path d={lineApp} className="poll-app" />
      <path d={lineDis} className="poll-dis" />
      {/* end markers */}
      <circle cx={xScale(data.length-1)} cy={yScale(data[data.length-1].app)} r="3.2" fill="var(--good)" />
      <circle cx={xScale(data.length-1)} cy={yScale(data[data.length-1].dis)} r="3.2" fill="var(--accent)" />
      <text x={xScale(data.length-1)+6} y={yScale(data[data.length-1].app)+3} className="ax-txt" fill="var(--good)" style={{fontWeight:600}}>{data[data.length-1].app.toFixed(1)}</text>
      <text x={xScale(data.length-1)+6} y={yScale(data[data.length-1].dis)+3} className="ax-txt" fill="var(--accent)" style={{fontWeight:600}}>{data[data.length-1].dis.toFixed(1)}</text>
      {/* low marker */}
      {(() => {
        const lowI = data.reduce((bi, d, i) => d.app < data[bi].app ? i : bi, 0);
        return (
          <g>
            <circle cx={xScale(lowI)} cy={yScale(data[lowI].app)} r="3.2" fill="none" stroke="var(--good)" strokeWidth="1.2" />
            <text x={xScale(lowI)} y={yScale(data[lowI].app)-9} textAnchor="middle" className="ax-txt" fill="var(--good)" style={{fontWeight:600}}>
              term low {data[lowI].app}%
            </text>
          </g>
        );
      })()}
      {/* hover crosshair + tooltip */}
      {tip && (() => {
        const tx = tip.x + TW + 16 > W - pad.r ? tip.x - TW - 10 : tip.x + 10;
        const ty = pad.t + 4;
        const net = (tip.d.app - tip.d.dis).toFixed(1);
        return (
          <g style={{pointerEvents:"none"}}>
            <line x1={tip.x} x2={tip.x} y1={pad.t} y2={H - pad.b}
                  stroke="var(--ink-3)" strokeWidth="1" strokeDasharray="3 3" opacity=".6" />
            <circle cx={tip.x} cy={yScale(tip.d.app)} r="4.5" fill="var(--good)"   stroke="var(--paper)" strokeWidth="1.5" />
            <circle cx={tip.x} cy={yScale(tip.d.dis)} r="4.5" fill="var(--accent)" stroke="var(--paper)" strokeWidth="1.5" />
            <rect x={tx} y={ty} width={TW} height={TH} rx="3"
                  fill="var(--paper)" stroke="var(--rule-2)" strokeWidth=".75" />
            <text x={tx+10} y={ty+13} style={{fontFamily:"var(--mono)", fontSize:9, fill:"var(--ink-4)", letterSpacing:".14em"}}>
              {tip.d.m.toUpperCase()}
            </text>
            <rect x={tx+10} y={ty+20} width={8} height={8} rx="1.5" fill="var(--good)" />
            <text x={tx+24} y={ty+28} style={{fontFamily:"var(--mono)", fontSize:11.5, fill:"var(--good)", fontWeight:"600"}}>
              {tip.d.app.toFixed(1)}% approve
            </text>
            <rect x={tx+10} y={ty+36} width={8} height={8} rx="1.5" fill="var(--accent)" />
            <text x={tx+24} y={ty+44} style={{fontFamily:"var(--mono)", fontSize:11.5, fill:"var(--accent)", fontWeight:"600"}}>
              {tip.d.dis.toFixed(1)}% disapprove
            </text>
            <text x={tx+10} y={ty+62} style={{fontFamily:"var(--mono)", fontSize:10, fill:parseFloat(net) >= 0 ? "var(--good)" : "var(--accent)", fontWeight:"500"}}>
              net {parseFloat(net) > 0 ? "+" : ""}{net}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

function Donut({ summary }){
  const total = summary.kept + summary.partial + summary.stalled + summary.broken;
  const segs = [
    { k:"broken",  v:summary.broken,  color:"var(--accent)" },
    { k:"stalled", v:summary.stalled, color:"var(--ink-3)" },
    { k:"partial", v:summary.partial, color:"var(--ink-4)" },
    { k:"kept",    v:summary.kept,    color:"var(--good)" },
  ];
  const R = 64, r = 44, cx = 80, cy = 80;
  let a0 = -Math.PI / 2;
  const arcs = segs.map(s => {
    const a1 = a0 + (s.v / total) * Math.PI * 2;
    const large = (a1 - a0) > Math.PI ? 1 : 0;
    const x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0);
    const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
    const xi0 = cx + r * Math.cos(a0), yi0 = cy + r * Math.sin(a0);
    const xi1 = cx + r * Math.cos(a1), yi1 = cy + r * Math.sin(a1);
    const d = `M ${x0},${y0} A ${R},${R} 0 ${large} 1 ${x1},${y1} L ${xi1},${yi1} A ${r},${r} 0 ${large} 0 ${xi0},${yi0} Z`;
    a0 = a1;
    return { d, ...s };
  });
  const brokenPct = Math.round(summary.broken / total * 100);
  return (
    <div style={{display:"flex", gap:18, alignItems:"center"}}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        {arcs.map(a => <path key={a.k} d={a.d} fill={a.color} />)}
        <text x="80" y="76" textAnchor="middle" className="num" style={{fontSize:24, fill:"var(--ink)"}}>{brokenPct}%</text>
        <text x="80" y="94" textAnchor="middle" style={{fontSize:9, fill:"var(--ink-3)", letterSpacing:".14em"}}>BROKEN</text>
      </svg>
      <div style={{flex:1, display:"flex", flexDirection:"column", gap:8}}>
        {segs.slice().reverse().map(s => (
          <div key={s.k} style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", borderBottom:"1px dashed var(--rule)", paddingBottom:5}}>
            <div style={{display:"flex", alignItems:"center", gap:8}}>
              <span className="ldot" style={{background:s.color}}></span>
              <span style={{fontSize:12, color:"var(--ink-2)", letterSpacing:".06em", textTransform:"uppercase"}}>{s.k}</span>
            </div>
            <span className="num" style={{fontSize:14}}>{s.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── sections ────────────────────────────────────────────────────────────

function Masthead({ data, headline, leftWord, rightWord }) {
  return (
    <header className="mast" style={{
      gridTemplateColumns: "1fr auto",
      gridTemplateAreas: '"title right" "tag tag"',
    }}>
      <div className="title-wrap">
        <img className="portrait" src="assets/trump.png" alt="" />
        <h1 className="display">The <span className="tt">Trump</span> Tracker</h1>
      </div>
      <div className="right" style={{paddingTop:4}}>
        <div style={{border:"1.5px solid var(--ink)", padding:"8px 12px", display:"flex", flexDirection:"column", gap:4}}>
          <span style={{fontFamily:"var(--serif)", fontSize:28, fontWeight:700, color:"var(--ink)", lineHeight:1}}>38,000+</span>
          <span style={{fontFamily:"var(--mono)", fontSize:10, color:"var(--ink-3)", letterSpacing:".08em", textTransform:"uppercase", lineHeight:1.4}}>Times mentioned<br/>in the Epstein Files</span>
        </div>
      </div>
      <div className="tag">
        <div className="tag-text">A running record of the second term — promises, polling, prosecutions &amp; the price of eggs.</div>
      </div>
    </header>
  );
}

const TABS = [
  { key: null,           label:"Home" },
  { key:"approval",      label:"Approval" },
  { key:"pollsters",     label:"Pollsters" },
  { key:"government",    label:"Government" },
  { key:"immigration",   label:"Immigration" },
  { key:"safety",        label:"Safety Net" },
  { key:"demographics",  label:"Demographics" },
  { key:"prices",        label:"Prices" },
  { key:"economy",       label:"Economy" },
];

function Submast({ data, activeTab, setActiveTab }) {
  return (
    <div className="submast" data-screen-label="00 Submast">
      <div className="nav">
        {TABS.map(tab => (
          <a key={tab.key ?? "__home__"}
             onClick={() => setActiveTab(tab.key)}
             style={{
               color: activeTab === tab.key ? "var(--accent)" : "",
               borderBottom: activeTab === tab.key ? "2px solid var(--accent)" : "2px solid transparent",
               paddingBottom: 2,
             }}>
            {tab.label}
          </a>
        ))}
      </div>
      <div>UPDATED {data.asOf.toUpperCase()} · 14:22 EDT</div>
    </div>
  );
}

function HeroApproval({ data, showLede }) {
  const m = data.pollingMeta;
  return (
    <section className="sec" data-screen-label="01 Approval">
      <div className="sec-head">
        <h2>Job Approval</h2>
        <span className="kicker">Monthly multi-poll avg · Gallup / YouGov / USPollingData composite</span>
      </div>
      <div className="hero">
        <div>
          <PollingChart data={data.polling} meta={m} />
          <div style={{display:"flex", gap:18, marginTop:8, fontFamily:"var(--mono)", fontSize:11, color:"var(--ink-3)"}}>
            <span><span className="ldot" style={{background:"var(--good)"}}></span>APPROVE</span>
            <span><span className="ldot" style={{background:"var(--accent)"}}></span>DISAPPROVE</span>
          </div>
        </div>
        <div className="lede">
          {showLede && <>
            <div className="label">The 488-day verdict</div>
            <h3 style={{fontWeight:700}}>Net approval has fallen <span style={{color:"var(--accent)"}}>{m.netChangeInaug.toFixed(1)}</span> points since inauguration. {m.termLow.when}'s reading of {m.termLow.v}% remains the term low.</h3>
            <p>{m.historicNet}. The decline is driven less by partisan defection — Republicans still grade him at 87% — than by independents (now 34% approve, down 8 points YTD) and a sharp move among women and college-educated voters.</p>
          </>}
          <div className="stat-strip">
            <div>
              <div className="v">{m.current}<span style={{fontSize:14, color:"var(--ink-3)"}}>%</span></div>
              <div className="l">Approve</div>
            </div>
            <div>
              <div className="v">{m.disapprove}<span style={{fontSize:14, color:"var(--ink-3)"}}>%</span></div>
              <div className="l">Disapprove</div>
            </div>
            <div>
              <div className="v" style={{color:"var(--accent)"}}>{m.netApproval.toFixed(1)}</div>
              <div className="l">Net approval</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Multi-line pollster trend chart
function PollersTimeChart({ ts }) {
  const W = 880, H = 300;
  const pad = { t:24, r:54, b:36, l:40 };
  const months = ts.months;
  const series = ts.series;
  const yMin = 28, yMax = 56;
  const xStep = (W - pad.l - pad.r) / Math.max(1, months.length - 1);
  const xScale = (i) => pad.l + i * xStep;
  const yScale = (v) => pad.t + (H - pad.t - pad.b) * (1 - (v - yMin) / (yMax - yMin));
  const yTicks = [30, 35, 40, 45, 50, 55];
  const labelIdx = months.map((m, i) => i).filter(i => i % 3 === 0 || i === months.length - 1);

  const [tip, setTip] = useState(null);
  const svgRef = useRef(null);
  const TW = 210, TH = series.length * 18 + 16;

  const onMove = (e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (W / rect.width);
    const i = Math.max(0, Math.min(months.length - 1, Math.round((mouseX - pad.l) / xStep)));
    setTip({ i, x: xScale(i) });
  };

  const tipX = tip ? (tip.x + TW + 20 > W - pad.r ? tip.x - TW - 10 : tip.x + 10) : 0;

  return (
    <div>
      <svg ref={svgRef} className="chart" viewBox={`0 0 ${W} ${H}`}
           style={{cursor:"crosshair", overflow:"visible"}}
           onMouseMove={onMove} onMouseLeave={() => setTip(null)}>
        {yTicks.map(t => (
          <g key={t}>
            <line className="grid-l" x1={pad.l} x2={W - pad.r} y1={yScale(t)} y2={yScale(t)} />
            <text className="ax-txt" x={pad.l - 6} y={yScale(t) + 3} textAnchor="end">{t}%</text>
          </g>
        ))}
        {labelIdx.map(i => (
          <text key={i} className="ax-txt" x={xScale(i)} y={H - pad.b + 16} textAnchor="middle">{months[i]}</text>
        ))}
        {series.map(s => {
          const d = s.values.map((v, i) => `${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(" ");
          return <path key={s.name} d={d} fill="none" stroke={s.color} strokeWidth="1.8" strokeLinejoin="round" opacity=".9" />;
        })}
        {series.map(s => {
          const last = s.values.length - 1;
          return (
            <text key={s.name} x={xScale(last) + 5} y={yScale(s.values[last]) + 4}
                  style={{fontSize:10, fill:s.color, fontFamily:"var(--mono)"}}>{s.values[last].toFixed(1)}</text>
          );
        })}
        {tip && (
          <g pointerEvents="none">
            <line x1={tip.x} x2={tip.x} y1={pad.t} y2={H - pad.b} stroke="var(--ink-3)" strokeWidth="1" strokeDasharray="3 3" />
            <rect x={tipX} y={pad.t} width={TW} height={TH} rx="3"
                  fill="var(--paper)" stroke="var(--rule-2)" strokeWidth="1" />
            <text x={tipX + 10} y={pad.t + 13} style={{fontSize:11, fontFamily:"var(--mono)", fontWeight:600, fill:"var(--ink)"}}>
              {months[tip.i]}
            </text>
            {series.map((s, si) => (
              <g key={s.name}>
                <rect x={tipX + 10} y={pad.t + 20 + si * 18} width="8" height="8" rx="1" fill={s.color} />
                <text x={tipX + 22} y={pad.t + 28 + si * 18} style={{fontSize:10.5, fontFamily:"var(--sans)", fill:"var(--ink)"}}>
                  {s.name}
                </text>
                <text x={tipX + TW - 8} y={pad.t + 28 + si * 18} textAnchor="end" style={{fontSize:10.5, fontFamily:"var(--mono)", fontWeight:600, fill:s.color}}>
                  {s.values[tip.i].toFixed(1)}%
                </text>
              </g>
            ))}
          </g>
        )}
      </svg>
      <div style={{display:"flex", flexWrap:"wrap", gap:"12px 20px", marginTop:8}}>
        {series.map(s => (
          <span key={s.name} style={{display:"flex", alignItems:"center", gap:5, fontSize:11.5, fontFamily:"var(--sans)", color:"var(--ink-2)"}}>
            <span style={{display:"inline-block", width:20, height:2.5, background:s.color, borderRadius:2}} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Generic congressional ballot chart + section
function BallotSection({ data }) {
  const gb = data.genericBallot;
  const months = gb.months;
  const W = 880, H = 300;
  const pad = { t:24, r:60, b:36, l:40 };
  const yMin = 34, yMax = 56;
  const xStep = (W - pad.l - pad.r) / Math.max(1, months.length - 1);
  const xScale = (i) => pad.l + i * xStep;
  const yScale = (v) => pad.t + (H - pad.t - pad.b) * (1 - (v - yMin) / (yMax - yMin));
  const yTicks = [36, 40, 44, 48, 52];
  const labelIdx = months.map((_, i) => i).filter(i => i % 3 === 0 || i === months.length - 1);

  const [tip, setTip] = useState(null);
  const svgRef = useRef(null);
  const TW = 170, TH = 62;

  const onMove = (e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (W / rect.width);
    const i = Math.max(0, Math.min(months.length - 1, Math.round((mouseX - pad.l) / xStep)));
    setTip({ i, x: xScale(i) });
  };

  const bandPath = (loArr, hiArr) =>
    loArr.map((v, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(' ') +
    ' ' + hiArr.slice().reverse().map((v, ri) => `L${xScale(hiArr.length - 1 - ri).toFixed(1)},${yScale(v).toFixed(1)}`).join(' ') + ' Z';

  const linePath = (arr) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(' ');

  const tipX = tip ? (tip.x + TW + 16 > W - pad.r ? tip.x - TW - 8 : tip.x + 8) : 0;
  const demAdv = gb.latestDem - gb.latestRep;

  return (
    <section className="sec" data-screen-label="02b Generic Ballot">
      <div className="sec-head">
        <h2>Generic Congressional Ballot</h2>
        <span className="kicker">FiveThirtyEight model · Jan 2025 → May 2026 · 80% confidence interval</span>
      </div>
      <div className="grid" style={{gridTemplateColumns:"1fr 1fr", gap:"var(--col-gap)", alignItems:"start"}}>
        <div>
          <svg ref={svgRef} className="chart" viewBox={`0 0 ${W} ${H}`}
               style={{cursor:"crosshair", overflow:"visible"}}
               onMouseMove={onMove} onMouseLeave={() => setTip(null)}>
            {yTicks.map(t => (
              <g key={t}>
                <line className="grid-l" x1={pad.l} x2={W - pad.r} y1={yScale(t)} y2={yScale(t)} />
                <text className="ax-txt" x={pad.l - 6} y={yScale(t) + 3} textAnchor="end">{t}%</text>
              </g>
            ))}
            <line className="ax" x1={pad.l} x2={W - pad.r} y1={yScale(50)} y2={yScale(50)} strokeDasharray="3 3"/>
            <text className="ax-txt" x={W - pad.r - 2} y={yScale(50) - 4} textAnchor="end" style={{letterSpacing:".12em", textTransform:"uppercase"}}>50%</text>
            {labelIdx.map(i => (
              <text key={i} className="ax-txt" x={xScale(i)} y={H - pad.b + 16} textAnchor="middle">{months[i]}</text>
            ))}
            {/* confidence bands */}
            <path d={bandPath(gb.demLo, gb.demHi)} fill="#2563eb" opacity=".1" />
            <path d={bandPath(gb.repLo, gb.repHi)} fill="var(--accent)" opacity=".1" />
            {/* lines */}
            <path d={linePath(gb.dem)} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round" />
            <path d={linePath(gb.rep)} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
            {/* end labels */}
            <text x={xScale(months.length-1)+5} y={yScale(gb.dem[gb.dem.length-1])+4} style={{fontSize:10, fill:"#2563eb", fontFamily:"var(--mono)", fontWeight:600}}>{gb.latestDem.toFixed(1)}</text>
            <text x={xScale(months.length-1)+5} y={yScale(gb.rep[gb.rep.length-1])+4} style={{fontSize:10, fill:"var(--accent)", fontFamily:"var(--mono)", fontWeight:600}}>{gb.latestRep.toFixed(1)}</text>
            {/* tooltip */}
            {tip && (
              <g pointerEvents="none">
                <line x1={tip.x} x2={tip.x} y1={pad.t} y2={H - pad.b} stroke="var(--ink-3)" strokeWidth="1" strokeDasharray="3 3" />
                <rect x={tipX} y={pad.t} width={TW} height={TH} rx="3" fill="var(--paper)" stroke="var(--rule-2)" strokeWidth="1" />
                <text x={tipX + 10} y={pad.t + 13} style={{fontSize:11, fontFamily:"var(--mono)", fontWeight:600, fill:"var(--ink)"}}>{months[tip.i]}</text>
                <rect x={tipX + 10} y={pad.t + 20} width={8} height={8} rx="1" fill="#2563eb" />
                <text x={tipX + 22} y={pad.t + 28} style={{fontSize:10.5, fontFamily:"var(--sans)", fill:"var(--ink)"}}>Democrats</text>
                <text x={tipX + TW - 8} y={pad.t + 28} textAnchor="end" style={{fontSize:10.5, fontFamily:"var(--mono)", fontWeight:600, fill:"#2563eb"}}>{gb.dem[tip.i].toFixed(1)}%</text>
                <rect x={tipX + 10} y={pad.t + 38} width={8} height={8} rx="1" fill="var(--accent)" />
                <text x={tipX + 22} y={pad.t + 46} style={{fontSize:10.5, fontFamily:"var(--sans)", fill:"var(--ink)"}}>Republicans</text>
                <text x={tipX + TW - 8} y={pad.t + 46} textAnchor="end" style={{fontSize:10.5, fontFamily:"var(--mono)", fontWeight:600, fill:"var(--accent)"}}>{gb.rep[tip.i].toFixed(1)}%</text>
              </g>
            )}
          </svg>
          <div style={{display:"flex", gap:20, marginTop:6}}>
            <span style={{display:"flex", alignItems:"center", gap:5, fontSize:11.5, fontFamily:"var(--sans)", color:"var(--ink-2)"}}>
              <span style={{display:"inline-block", width:20, height:2.5, background:"#2563eb", borderRadius:2}} /> Democrats
            </span>
            <span style={{display:"flex", alignItems:"center", gap:5, fontSize:11.5, fontFamily:"var(--sans)", color:"var(--ink-2)"}}>
              <span style={{display:"inline-block", width:20, height:2.5, background:"var(--accent)", borderRadius:2}} /> Republicans
            </span>
          </div>
        </div>
        <div style={{display:"flex", flexDirection:"column", gap:16}}>
          <div className="card">
            <div className="lab">Ballot today</div>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginTop:4}}>
              <div>
                <span style={{fontFamily:"var(--mono)", fontSize:28, fontWeight:700, color:"#2563eb"}}>{gb.latestDem.toFixed(1)}</span>
                <span style={{fontFamily:"var(--mono)", fontSize:13, color:"var(--ink-3)", marginLeft:4}}>D</span>
              </div>
              <div style={{fontFamily:"var(--serif)", fontSize:13, color:"var(--ink-3)"}}>vs.</div>
              <div>
                <span style={{fontFamily:"var(--mono)", fontSize:28, fontWeight:700, color:"var(--accent)"}}>{gb.latestRep.toFixed(1)}</span>
                <span style={{fontFamily:"var(--mono)", fontSize:13, color:"var(--ink-3)", marginLeft:4}}>R</span>
              </div>
            </div>
            <div style={{marginTop:8, fontFamily:"var(--serif)", fontSize:13, color:"var(--ink-2)"}}>
              Democrats <strong>+{demAdv.toFixed(1)} pts</strong> — a swing of <strong>+{(demAdv - (gb.inaugDem - gb.inaugRep)).toFixed(1)} pts</strong> since inauguration.
            </div>
          </div>
          <div className="card">
            <div className="lab">At inauguration (Jan 20, 2025)</div>
            <div style={{marginTop:4, fontFamily:"var(--serif)", fontSize:13.5, color:"var(--ink-2)"}}>
              Republicans led by <strong style={{color:"var(--accent)"}}>+{(gb.inaugRep - gb.inaugDem).toFixed(1)} pts</strong> ({gb.inaugRep.toFixed(1)}R / {gb.inaugDem.toFixed(1)}D). The ballot has since flipped entirely — a net shift of <strong>{((gb.latestDem - gb.latestRep) - (gb.inaugDem - gb.inaugRep)).toFixed(1)} pts</strong> toward Democrats in 16 months.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Reusable single-line trend chart
function TrendChart({ months, values, color="var(--accent)", yMin, yMax, yTicks, inaugIdx, labelStep=3, valueFmt=(v)=>v.toLocaleString() }) {
  const W = 560, H = 200;
  const pad = { t:24, r:56, b:32, l:54 };
  const xStep = (W - pad.l - pad.r) / Math.max(1, months.length - 1);
  const xScale = (i) => pad.l + i * xStep;
  const yScale = (v) => pad.t + (H - pad.t - pad.b) * (1 - (v - yMin) / (yMax - yMin));
  const lastI = values.length - 1;
  const labelIdxs = months.map((_, i) => i).filter(i => i % labelStep === 0 || i === lastI);
  const linePath = values.map((v, i) => `${i===0?"M":"L"}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(" ");
  const [tip, setTip] = useState(null);
  const svgRef = useRef(null);
  const onMove = (e) => {
    const svg = svgRef.current; if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (W / rect.width);
    const i = Math.max(0, Math.min(months.length - 1, Math.round((mouseX - pad.l) / xStep)));
    setTip({ i, x: xScale(i), y: yScale(values[i]) });
  };
  return (
    <svg ref={svgRef} className="chart" viewBox={`0 0 ${W} ${H}`}
         style={{cursor:"crosshair", overflow:"visible"}}
         onMouseMove={onMove} onMouseLeave={() => setTip(null)}>
      {yTicks.map(t => (
        <g key={t}>
          <line className="grid-l" x1={pad.l} x2={W-pad.r} y1={yScale(t)} y2={yScale(t)} />
          <text className="ax-txt" x={pad.l-6} y={yScale(t)+3} textAnchor="end">{valueFmt(t)}</text>
        </g>
      ))}
      {labelIdxs.map(i => (
        <text key={i} className="ax-txt" x={xScale(i)} y={H-pad.b+14} textAnchor="middle">{months[i]}</text>
      ))}
      {inaugIdx != null && (
        <g>
          <line x1={xScale(inaugIdx)} x2={xScale(inaugIdx)} y1={pad.t} y2={H-pad.b}
                stroke="var(--ink)" strokeWidth=".75" strokeDasharray="2 3" opacity=".4" />
          <text x={xScale(inaugIdx)} y={pad.t-6} textAnchor="middle" className="ax-txt"
                style={{letterSpacing:".1em", textTransform:"uppercase", fontWeight:600}}>inaug.</text>
        </g>
      )}
      <path d={`${linePath} L ${xScale(lastI)},${yScale(yMin)} L ${xScale(0)},${yScale(yMin)} Z`}
            fill={color} opacity=".07" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <circle cx={xScale(lastI)} cy={yScale(values[lastI])} r="3.2" fill={color} />
      <text x={xScale(lastI)+6} y={yScale(values[lastI])+3} className="ax-txt"
            style={{fill:color, fontWeight:600}}>{valueFmt(values[lastI])}</text>
      {tip && (
        <g pointerEvents="none">
          <line x1={tip.x} x2={tip.x} y1={pad.t} y2={H-pad.b}
                stroke="var(--ink-3)" strokeWidth="1" strokeDasharray="3 3" opacity=".6" />
          <circle cx={tip.x} cy={tip.y} r="4" fill={color} stroke="var(--paper)" strokeWidth="1.5" />
          <text x={tip.x} y={pad.t-8} textAnchor="middle"
                style={{fontFamily:"var(--mono)", fontSize:12, fill:color, fontWeight:600}}>
            {valueFmt(values[tip.i])}
          </text>
          <text x={tip.x} y={H-pad.b+14} textAnchor="middle" className="ax-txt"
                style={{fill:"var(--ink)", fontWeight:600}}>{months[tip.i]}</text>
        </g>
      )}
    </svg>
  );
}

// ── Across pollsters: 10-aggregator strip + historical comparison
function AggregatorBoard({ data }) {
  const aggs = data.aggregators;
  const maxNet = 0;
  const minNet = -30;
  // common scale across all
  const x = (v) => ((v - minNet) / (maxNet - minNet)) * 100;
  const avg = data.aggregatorAvg;
  return (
    <section className="sec" data-screen-label="02 Aggregators">
      <div className="sec-head">
        <h2>Across the Pollsters</h2>
        <span className="kicker">Approval % by aggregator · Jan 2025 → May 2026</span>
      </div>
      <PollersTimeChart ts={data.pollerTimeSeries} />
      <div className="sec-head" style={{marginTop:"var(--row-gap)"}}>
        <h2 style={{fontSize:"1rem"}}>Current Snapshot</h2>
        <span className="kicker">Net approval per aggregator · Apr 30, 2026</span>
      </div>
      <div className="grid" style={{gridTemplateColumns:"1.6fr 1fr", gap:"var(--col-gap)"}}>
        <div>
          <table className="t">
            <thead>
              <tr>
                <th style={{width:"22%"}}>Aggregator</th>
                <th>Net approval</th>
                <th style={{width:"10%"}}>App</th>
                <th style={{width:"10%"}}>Dis</th>
                <th style={{width:"10%"}}>Net</th>
              </tr>
            </thead>
            <tbody>
              {aggs.map((a,i) => (
                <tr key={i}>
                  <td style={{fontFamily:"var(--serif)", fontSize:14}}>{a.name}</td>
                  <td>
                    <div style={{position:"relative", height:14}}>
                      {/* zero line at right */}
                      <div style={{position:"absolute", right:0, top:0, bottom:0, width:1, background:"var(--rule-2)"}}></div>
                      <div style={{position:"absolute", right:0, top:3, height:8,
                        width: (Math.abs(a.net) / 30 * 100) + "%",
                        background:"var(--accent)", opacity:.85}}></div>
                    </div>
                  </td>
                  <td className="num" style={{fontSize:12, textAlign:"right"}}>{a.app.toFixed(1)}</td>
                  <td className="num" style={{fontSize:12, textAlign:"right", color:"var(--ink-3)"}}>{a.dis.toFixed(1)}</td>
                  <td className="num" style={{fontSize:12, textAlign:"right", color:"var(--accent)", fontWeight:600}}>{a.net.toFixed(1)}</td>
                </tr>
              ))}
              <tr style={{borderTop:"1px solid var(--ink)"}}>
                <td style={{fontFamily:"var(--serif)", fontStyle:"italic", fontSize:14}}>Mean of 10</td>
                <td></td>
                <td className="num" style={{fontSize:12, textAlign:"right", fontWeight:600}}>{avg.app.toFixed(1)}</td>
                <td className="num" style={{fontSize:12, textAlign:"right", color:"var(--ink-3)"}}>{avg.dis.toFixed(1)}</td>
                <td className="num" style={{fontSize:12, textAlign:"right", color:"var(--accent)", fontWeight:700}}>{avg.net.toFixed(1)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="lab">Same point in term · approval %</div>
          {data.history.map((h,i) => (
            <div key={i} style={{padding:"10px 0", borderBottom: i < data.history.length-1 ? "1px dashed var(--rule)" : 0}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:10}}>
                <div style={{fontFamily:"var(--serif)", fontSize:13.5, fontWeight: h.hl ? 600 : 400, color: h.hl ? "var(--accent)" : "var(--ink)", whiteSpace:"nowrap"}}>
                  {h.who}
                </div>
                <div className="num" style={{fontSize:18, fontWeight:500, color: h.hl ? "var(--accent)" : "var(--ink)"}}>{h.app.toFixed(1)}%</div>
              </div>
              <div style={{position:"relative", height:6, marginTop:6, background:"var(--chip-bg)"}}>
                <div style={{position:"absolute", left:0, top:0, bottom:0, width: (h.app)+"%", background: h.hl ? "var(--accent)" : "var(--ink-3)"}}></div>
                <div style={{position:"absolute", left:"50%", top:-2, bottom:-2, width:1, background:"var(--ink-3)", opacity:.4}}></div>
              </div>
              <div className="num" style={{fontSize:10.5, color:"var(--ink-4)", marginTop:4, letterSpacing:".08em"}}>
                NET {h.net > 0 ? "+"+h.net.toFixed(1) : h.net.toFixed(1)}
              </div>
            </div>
          ))}
          <div className="sub" style={{marginTop:6, fontFamily:"var(--serif)", fontStyle:"italic"}}>
            Approval at ~month 16 of each presidency. Only Trump-1 sits in the same range.
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Demographic crosstabs
function DemoBoard({ data }) {
  const max = Math.max(...data.byDemo.map(d => Math.max(d.app, d.dis)));
  return (
    <section className="sec" data-screen-label="03 Demographics">
      <div className="sec-head">
        <h2>Who's Switched</h2>
        <span className="kicker">May 2026 crosstabs · approve / disapprove %, trend vs. Jan 2026</span>
      </div>
      <div className="grid" style={{gridTemplateColumns:"1fr 2fr", gap:"var(--col-gap)"}}>
        <div className="card">
          <div className="lab" style={{marginBottom:10}}>By party</div>
          {data.byParty.map((p,i) => (
            <div key={i} style={{padding:"12px 0", borderBottom: i < data.byParty.length-1 ? "1px solid var(--rule)" : 0}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
                <div style={{fontFamily:"var(--serif)", fontSize:15, fontWeight:600}}>{p.group}</div>
                <div className="num" style={{fontSize:13, color:"var(--ink-3)", whiteSpace:"nowrap"}}>{p.trend}</div>
              </div>
              <div style={{display:"flex", height:24, marginTop:8, gap:0, fontFamily:"var(--mono)", fontSize:11, fontWeight:500}}>
                <div style={{width: p.app+"%", background:"var(--good)", color:"var(--paper)", display:"flex", alignItems:"center", justifyContent:"center"}}>{p.app}%</div>
                <div style={{flex:1, background:"var(--chip-bg)"}}></div>
                <div style={{width: p.dis+"%", background:"var(--accent)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center"}}>{p.dis}%</div>
              </div>
              <div style={{display:"flex", justifyContent:"space-between", fontFamily:"var(--mono)", fontSize:10, color:"var(--ink-4)", letterSpacing:".06em", textTransform:"uppercase", marginTop:4}}>
                <span>approve</span>
                <span style={{color: p.net >= 0 ? "var(--good)" : "var(--accent)", fontWeight:600}}>net {p.net > 0 ? "+"+p.net : p.net}</span>
                <span>disapprove</span>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="lab" style={{marginBottom:10}}>By gender, race, age, education, geography</div>
          <table className="t" style={{marginTop:0}}>
            <thead>
              <tr>
                <th style={{width:"24%"}}>Group</th>
                <th>Approve / disapprove</th>
                <th style={{width:"12%", textAlign:"right"}}>Net</th>
                <th style={{width:"16%", textAlign:"right"}}>Δ vs. Jan ’26</th>
              </tr>
            </thead>
            <tbody>
              {data.byDemo.map((d,i) => (
                <tr key={i}>
                  <td style={{fontFamily:"var(--serif)", fontSize:13.5}}>{d.group}</td>
                  <td>
                    <div style={{position:"relative", height:18, background:"var(--chip-bg)"}}>
                      <div style={{position:"absolute", left:0, top:0, bottom:0, width: d.app+"%", background:"var(--good)"}}></div>
                      <div style={{position:"absolute", right:0, top:0, bottom:0, width: d.dis+"%", background:"var(--accent)", opacity:.75}}></div>
                      <div style={{position:"absolute", left:0, right:0, top:0, height:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 6px", fontFamily:"var(--mono)", fontSize:10.5, color:"#fff", fontWeight:500}}>
                        <span>{d.app}</span>
                        <span>{d.dis}</span>
                      </div>
                    </div>
                  </td>
                  <td className="num" style={{textAlign:"right", color: d.net >= 0 ? "var(--good)" : "var(--accent)", fontWeight:600, fontSize:12.5}}>
                    {d.net > 0 ? "+"+d.net : d.net}
                  </td>
                  <td className="num" style={{textAlign:"right", color:"var(--ink-3)", fontSize:12}}>{d.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ── Prices & sentiment: real BLS CPI + U-Michigan ICS series
function PricesChart({ series, accessor, color, yMin, yMax, yTicks, inaugLabel, valueFmt, sourceLabel }) {
  const W = 580, H = 230;
  const pad = { t:22, r:46, b:30, l:38 };
  const xStep = (W - pad.l - pad.r) / Math.max(1, series.length - 1);
  const yScale = (v) => pad.t + (H - pad.t - pad.b) * (1 - (v - yMin) / (yMax - yMin));
  const xScale = (i) => pad.l + i * xStep;
  // Build line, splitting on null gaps
  const segs = [];
  let cur = [];
  series.forEach((d, i) => {
    const v = accessor(d);
    if (v == null) { if (cur.length) segs.push(cur); cur = []; }
    else cur.push([xScale(i), yScale(v), v]);
  });
  if (cur.length) segs.push(cur);
  const lastPt = segs.length ? segs[segs.length-1][segs[segs.length-1].length-1] : null;
  const inaugIdx = series.findIndex(d => d.inaug);
  const labelIdx = series.map((d,i) => ({d,i})).filter(({i}) => i % 3 === 0 || i === series.length-1);

  const [tip, setTip] = useState(null);
  const svgRef = useRef(null);
  const TW = 148, TH = 52;

  const onMove = (e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (W / rect.width);
    let idx = Math.max(0, Math.min(series.length - 1, Math.round((mouseX - pad.l) / xStep)));
    // If null, find nearest non-null neighbor within ±4
    if (accessor(series[idx]) == null) {
      let best = null, bestDist = Infinity;
      for (let di = 1; di <= 4; di++) {
        for (const ci of [idx - di, idx + di]) {
          if (ci >= 0 && ci < series.length && accessor(series[ci]) != null && di < bestDist) {
            best = ci; bestDist = di;
          }
        }
        if (best !== null) break;
      }
      if (best === null) return;
      idx = best;
    }
    const v = accessor(series[idx]);
    setTip({ x: xScale(idx), y: yScale(v), v, d: series[idx] });
  };

  return (
    <svg ref={svgRef} className="chart" viewBox={`0 0 ${W} ${H}`}
         style={{cursor:"crosshair", overflow:"visible"}}
         onMouseMove={onMove} onMouseLeave={() => setTip(null)}>
      {yTicks.map(t => (
        <g key={t}>
          <line className="grid-l" x1={pad.l} x2={W-pad.r} y1={yScale(t)} y2={yScale(t)} />
          <text className="ax-txt" x={pad.l-6} y={yScale(t)+3} textAnchor="end">{valueFmt(t)}</text>
        </g>
      ))}
      {labelIdx.map(({d,i}) => (
        <text key={i} className="ax-txt" x={xScale(i)} y={H-pad.b+14} textAnchor="middle">{d.m}</text>
      ))}
      {/* inauguration marker */}
      {inaugIdx >= 0 && (
        <g>
          <line x1={xScale(inaugIdx)} x2={xScale(inaugIdx)} y1={pad.t} y2={H-pad.b}
                stroke="var(--ink)" strokeWidth=".5" strokeDasharray="2 3" opacity=".4" />
          <text x={xScale(inaugIdx)} y={pad.t-6} textAnchor="middle" className="ax-txt"
                style={{letterSpacing:".14em", textTransform:"uppercase", fontWeight:600}}>
            {inaugLabel}
          </text>
        </g>
      )}
      {/* line segments */}
      {segs.map((seg, si) => {
        const d = seg.map((p,i)=> (i===0?"M":"L") + p[0].toFixed(1)+","+p[1].toFixed(1)).join(" ");
        const fill = `${d} L ${seg[seg.length-1][0]},${H-pad.b} L ${seg[0][0]},${H-pad.b} Z`;
        return (
          <g key={si}>
            <path d={fill} fill={color} opacity=".07" />
            <path d={d} stroke={color} strokeWidth="2" fill="none" />
          </g>
        );
      })}
      {lastPt && (
        <g>
          <circle cx={lastPt[0]} cy={lastPt[1]} r="3.2" fill={color} />
          <text x={lastPt[0]+6} y={lastPt[1]+3} className="ax-txt" style={{fontWeight:600, fill:color}}>
            {valueFmt(lastPt[2])}
          </text>
        </g>
      )}
      {/* hover crosshair + tooltip */}
      {tip && (() => {
        const tx = tip.x + TW + 12 > W - pad.r ? tip.x - TW - 10 : tip.x + 10;
        const ty = pad.t + 4;
        return (
          <g style={{pointerEvents:"none"}}>
            <line x1={tip.x} x2={tip.x} y1={pad.t} y2={H - pad.b}
                  stroke="var(--ink-3)" strokeWidth="1" strokeDasharray="3 3" opacity=".6" />
            <circle cx={tip.x} cy={tip.y} r="4.5" fill={color} stroke="var(--paper)" strokeWidth="1.5" />
            <rect x={tx} y={ty} width={TW} height={TH} rx="3"
                  fill="var(--paper)" stroke="var(--rule-2)" strokeWidth=".75" />
            <text x={tx+10} y={ty+14} style={{fontFamily:"var(--mono)", fontSize:9, fill:"var(--ink-4)", letterSpacing:".14em"}}>
              {tip.d.m.toUpperCase()}
            </text>
            <text x={tx+10} y={ty+38} style={{fontFamily:"var(--mono)", fontSize:19, fill:color, fontWeight:"600", letterSpacing:"-.01em"}}>
              {valueFmt(tip.v)}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

function PricesBoard({ data }) {
  const p = data.prices;
  return (
    <section className="sec" data-screen-label="04 Prices">
      <div className="sec-head">
        <h2>Prices &amp; the Public Mood</h2>
        <span className="kicker">BLS CPI · U-Mich Consumer Sentiment · Jan ’24 – Apr ’26</span>
      </div>
      <div className="grid g-2">
        <div className="card">
          <div className="lab">{p.cpi.label}</div>
          <div style={{display:"flex", alignItems:"baseline", gap:12}}>
            <div className="big" style={{color:"var(--accent)"}}>{p.cpi.current.toFixed(2)}<span style={{fontSize:18, color:"var(--ink-3)"}}>%</span></div>
            <div className="num" style={{fontSize:14, color:"var(--accent)"}}>+{p.cpi.delta.toFixed(2)} pp <span style={{color:"var(--ink-4)"}}>vs. inaug.</span></div>
          </div>
          <PricesChart
            series={p.series}
            accessor={d => d.cpi}
            color="var(--accent)"
            yMin={2.0} yMax={4.0}
            yTicks={[2.0, 2.5, 3.0, 3.5, 4.0]}
            inaugLabel="inauguration"
            valueFmt={(v) => v.toFixed(1) + "%"}
            sourceLabel={p.cpi.sourceNote}
          />
          <div className="sub" style={{fontFamily:"var(--serif)", fontStyle:"italic", fontSize:13, color:"var(--ink-2)"}}>
            {p.cpi.note}.
          </div>
          <div className="sub" style={{fontSize:11, color:"var(--ink-4)"}}>{p.cpi.sourceNote}</div>
        </div>

        <div className="card">
          <div className="lab">{p.sent.label}</div>
          <div style={{display:"flex", alignItems:"baseline", gap:12}}>
            <div className="big" style={{color:"var(--accent)"}}>{p.sent.current.toFixed(1)}</div>
            <div className="num" style={{fontSize:14, color:"var(--accent)"}}>{p.sent.delta.toFixed(1)} <span style={{color:"var(--ink-4)"}}>vs. inaug. ({p.sent.atInaug})</span></div>
          </div>
          <PricesChart
            series={p.series}
            accessor={d => d.sent}
            color="var(--ink)"
            yMin={40} yMax={85}
            yTicks={[40, 50, 60, 70, 80]}
            inaugLabel="inauguration"
            valueFmt={(v) => v.toFixed(0)}
            sourceLabel={p.sent.sourceNote}
          />
          <div className="sub" style={{fontFamily:"var(--serif)", fontStyle:"italic", fontSize:13, color:"var(--ink-2)"}}>
            {p.sent.note}.
          </div>
          <div className="sub" style={{fontSize:11, color:"var(--ink-4)"}}>{p.sent.sourceNote}</div>
        </div>
      </div>
    </section>
  );
}

function EconBoard({ data }) {
  const fb = data.farmBankruptcies;
  const barMax = Math.max(...fb.filings);
  return (
    <section className="sec" data-screen-label="05 Economy">
      <div className="sec-head">
        <h2>The Economy &amp; the Price of Things</h2>
        <span className="kicker">6 FRED indicators · Δ vs. Jan 20, 2025 · sources in note</span>
      </div>
      <div className="grid g-3">
        {data.econ.map(m => {
          const cls = (good) => good === true ? "pos" : good === false ? "neg" : "flat";
          return (
            <div className="card" key={m.id}>
              <div className="lab">{m.label}</div>
              <div className="big">{m.value}<span style={{fontSize:14, color:"var(--ink-3)", marginLeft:6, fontFamily:"var(--sans)"}}>{m.unit}</span></div>
              <Sparkline data={data.spark[m.id]} riseBad={m.riseBad} />
              <div style={{display:"flex", justifyContent:"space-between", whiteSpace:"nowrap", gap:8}}>
                <span className={"delta " + cls(m.inaug.good)}>
                  {m.inaug.text} <span style={{color:"var(--ink-4)", marginLeft:2}}>vs. inaug.</span>
                </span>
                {m.recent && (
                  <span className={"delta " + cls(m.recent.good)} style={{opacity:.85}}>{m.recent.text}</span>
                )}
              </div>
              <div className="sub">{m.note}</div>
            </div>
          );
        })}
      </div>
      {/* Farm Bankruptcies */}
      <div className="sec-head" style={{marginTop:"var(--row-gap)"}}>
        <h2 style={{fontSize:"1rem"}}>Farm Bankruptcies (Chapter 12)</h2>
        <span className="kicker">U.S. Courts · 12-month rolling filings · Q1 2025 – Q1 2026</span>
      </div>
      <div className="grid" style={{gridTemplateColumns:"1fr 1fr", gap:"var(--col-gap)", alignItems:"start"}}>
        <div className="card">
          {fb.quarters.map((q, i) => (
            <div key={q} style={{display:"grid", gridTemplateColumns:"64px 1fr 40px", alignItems:"center", gap:8, padding:"6px 0", borderBottom:"1px dashed var(--rule)"}}>
              <div style={{fontFamily:"var(--mono)", fontSize:11.5, color:"var(--ink-3)", letterSpacing:".06em"}}>{q}</div>
              <div style={{background:"var(--chip-bg)", height:10, position:"relative"}}>
                <div style={{position:"absolute", left:0, top:0, bottom:0,
                  width:(fb.filings[i]/barMax*100)+"%",
                  background: i === fb.quarters.length-1 ? "var(--accent)" : "var(--ink-3)", opacity:.8}} />
              </div>
              <div className="num" style={{fontSize:12, textAlign:"right", color: i === fb.quarters.length-1 ? "var(--accent)" : "var(--ink-2)", fontWeight: i === fb.quarters.length-1 ? 700 : 400}}>{fb.filings[i]}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex", flexDirection:"column", gap:12}}>
          <div className="card flat">
            <div className="lab">12-mo filings (Q1 '26)</div>
            <div className="big" style={{color:"var(--accent)"}}>{fb.latest}</div>
            <div style={{fontFamily:"var(--serif)", fontSize:13, color:"var(--ink-2)", marginTop:4}}>
              +{fb.changePct}% since Q1 2025. More farm bankruptcies in any trailing 12-month window since records began.
            </div>
          </div>
          <div className="card flat">
            <div className="lab">At inauguration (Q1 '25)</div>
            <div className="big">{fb.inaugQ}</div>
            <div className="sub">12-month rolling baseline</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Government: debt + federal workforce + courts
function GovernmentBoard({ data }) {
  const debt = data.nationalDebt;
  const jobs = data.federalJobs;
  const lit  = data.litigation;
  const maxIssue = Math.max(...lit.byIssue.map(d => d.cases));
  return (
    <section className="sec" data-screen-label="06 Government">
      <div className="sec-head">
        <h2>The Federal Government</h2>
        <span className="kicker">National debt · workforce reductions · legal challenges</span>
      </div>

      {/* ── Debt ── */}
      <div className="sec-head" style={{marginTop:"var(--row-gap)"}}>
        <h2 style={{fontSize:"1rem"}}>National Debt</h2>
        <span className="kicker">U.S. Treasury "Debt to the Penny" · cumulative $ added since Jan 20, 2025</span>
      </div>
      <div className="grid" style={{gridTemplateColumns:"2fr 1fr", gap:"var(--col-gap)", alignItems:"start"}}>
        <TrendChart
          months={debt.months}
          values={debt.addedCumulative}
          color="var(--accent)"
          yMin={-100} yMax={3200}
          yTicks={[0, 500, 1000, 1500, 2000, 2500, 3000]}
          valueFmt={(v) => v >= 1000 ? `+$${(v/1000).toFixed(1)}T` : v >= 0 ? `+$${Math.round(v)}B` : `-$${Math.abs(v).toFixed(0)}B`}
          labelStep={3}
        />
        <div style={{display:"flex", flexDirection:"column", gap:12}}>
          <div className="card">
            <div className="lab">Added since inauguration</div>
            <div className="big" style={{color:"var(--accent)"}}>$2.85<span style={{fontSize:18, color:"var(--ink-3)"}}>T</span></div>
            <div style={{fontFamily:"var(--serif)", fontSize:13, color:"var(--ink-2)", marginTop:4}}>
              Debt ceiling suspended Jul 2025; $699B added in a single month.
            </div>
          </div>
          <div className="card">
            <div className="lab">Total national debt (May '26)</div>
            <div className="big">$39.1<span style={{fontSize:18, color:"var(--ink-3)"}}>T</span></div>
            <div className="sub">vs. $36.2T at inauguration</div>
          </div>
        </div>
      </div>

      {/* ── Federal Workforce ── */}
      <div className="sec-head" style={{marginTop:"var(--row-gap)"}}>
        <h2 style={{fontSize:"1rem"}}>Federal Workforce (DOGE)</h2>
        <span className="kicker">BLS CES9091000001 · federal civilian employment, thousands · seasonally adjusted</span>
      </div>
      <div className="grid" style={{gridTemplateColumns:"2fr 1fr", gap:"var(--col-gap)", alignItems:"start"}}>
        <TrendChart
          months={jobs.months}
          values={jobs.values}
          color="var(--accent)"
          yMin={2580} yMax={3060}
          yTicks={[2600, 2700, 2800, 2900, 3000]}
          inaugIdx={jobs.inaugIdx}
          valueFmt={(v) => `${v.toFixed(0)}K`}
          labelStep={4}
        />
        <div style={{display:"flex", flexDirection:"column", gap:12}}>
          <div className="card">
            <div className="lab">Jobs eliminated</div>
            <div className="big" style={{color:"var(--accent)"}}>−345<span style={{fontSize:18, color:"var(--ink-3)"}}>K</span></div>
            <div style={{fontFamily:"var(--serif)", fontSize:13, color:"var(--ink-2)", marginTop:4}}>
              −11.5% since inauguration. Sharpest single-month drop: Oct '25 (−166K).
            </div>
          </div>
          <div className="card">
            <div className="lab">Workers remaining (Apr '26)</div>
            <div className="big">2,665<span style={{fontSize:18, color:"var(--ink-3)"}}>K</span></div>
            <div className="sub">vs. 3,010K at inauguration</div>
          </div>
        </div>
      </div>

      {/* ── Courts ── */}
      <div className="sec-head" style={{marginTop:"var(--row-gap)"}}>
        <h2 style={{fontSize:"1rem"}}>Legal Challenges to Executive Action</h2>
        <span className="kicker">Just Security Litigation Tracker · {lit.asOf}</span>
      </div>
      <div className="grid" style={{gridTemplateColumns:"1fr 2fr", gap:"var(--col-gap)", alignItems:"start"}}>
        <div style={{display:"flex", flexDirection:"column", gap:12}}>
          <div className="card flat">
            <div className="lab">Total lawsuits filed</div>
            <div className="big">{lit.totalCases.toLocaleString()}</div>
          </div>
          <div className="card flat">
            <div className="lab">Gov't action blocked</div>
            <div className="big" style={{color:"var(--accent)"}}>{lit.blockedTotal}</div>
            <div style={{fontFamily:"var(--mono)", fontSize:11, color:"var(--ink-3)", marginTop:4, letterSpacing:".06em"}}>
              {lit.tempBlocked} TEMP · {lit.permBlocked} PERMANENT
            </div>
          </div>
        </div>
        <div className="card">
          <div className="lab" style={{marginBottom:10}}>Cases by issue area</div>
          {lit.byIssue.map((d, i) => (
            <div key={i} style={{display:"grid", gridTemplateColumns:"160px 1fr 36px", alignItems:"center", gap:8, padding:"5px 0", borderBottom:"1px dashed var(--rule)"}}>
              <div style={{fontFamily:"var(--serif)", fontSize:13}}>{d.issue}</div>
              <div style={{background:"var(--chip-bg)", height:10, position:"relative"}}>
                <div style={{position:"absolute", left:0, top:0, bottom:0, width:(d.cases/maxIssue*100)+"%", background:"var(--accent)", opacity:.8}} />
              </div>
              <div className="num" style={{fontSize:12, textAlign:"right"}}>{d.cases}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Immigration: ICE arrests with criminal / non-criminal split
function ImmigrationBoard({ data }) {
  const ice = data.iceArrests;
  const W = 880, H = 280;
  const pad = { t:24, r:64, b:36, l:52 };
  const months = ice.months;
  const yMin = 0, yMax = 44000;
  const xStep = (W - pad.l - pad.r) / Math.max(1, months.length - 1);
  const xScale = (i) => pad.l + i * xStep;
  const yScale = (v) => pad.t + (H - pad.t - pad.b) * (1 - (v - yMin) / (yMax - yMin));
  const yTicks = [0, 10000, 20000, 30000, 40000];
  const labelIdx = months.map((_, i) => i).filter(i => i % 2 === 0 || i === months.length - 1);
  const fmtK = (v) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(v);
  const [tip, setTip] = useState(null);
  const svgRef = useRef(null);
  const TW = 188, TH = 76;
  const onMove = (e) => {
    const svg = svgRef.current; if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (W / rect.width);
    const i = Math.max(0, Math.min(months.length - 1, Math.round((mouseX - pad.l) / xStep)));
    setTip({ i, x: xScale(i) });
  };
  const lp = (arr) => arr.map((v, i) => `${i===0?"M":"L"}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`).join(" ");
  const lastI = months.length - 1;
  const tipX = tip ? (tip.x + TW + 16 > W - pad.r ? tip.x - TW - 8 : tip.x + 8) : 0;
  return (
    <section className="sec" data-screen-label="07 Immigration">
      <div className="sec-head">
        <h2>ICE Arrests</h2>
        <span className="kicker">Deportation Data Project · FOIA data from ICE · Jan 2025 – Mar 2026</span>
      </div>
      <div className="grid" style={{gridTemplateColumns:"2fr 1fr", gap:"var(--col-gap)", alignItems:"start"}}>
        <div>
          <svg ref={svgRef} className="chart" viewBox={`0 0 ${W} ${H}`}
               style={{cursor:"crosshair", overflow:"visible"}}
               onMouseMove={onMove} onMouseLeave={() => setTip(null)}>
            {yTicks.map(t => (
              <g key={t}>
                <line className="grid-l" x1={pad.l} x2={W-pad.r} y1={yScale(t)} y2={yScale(t)} />
                <text className="ax-txt" x={pad.l-6} y={yScale(t)+3} textAnchor="end">{fmtK(t)}</text>
              </g>
            ))}
            {labelIdx.map(i => (
              <text key={i} className="ax-txt" x={xScale(i)} y={H-pad.b+14} textAnchor="middle">{months[i]}</text>
            ))}
            <path d={`${lp(ice.total)} L ${xScale(lastI)},${yScale(0)} L ${xScale(0)},${yScale(0)} Z`}
                  fill="var(--accent)" opacity=".1" />
            <path d={`${lp(ice.criminal)} L ${xScale(lastI)},${yScale(0)} L ${xScale(0)},${yScale(0)} Z`}
                  fill="var(--ink-3)" opacity=".2" />
            <path d={lp(ice.total)} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
            <path d={lp(ice.criminal)} fill="none" stroke="var(--ink-3)" strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="4 2" />
            <text x={xScale(lastI)+5} y={yScale(ice.total[lastI])+4}
                  style={{fontSize:10, fill:"var(--accent)", fontFamily:"var(--mono)", fontWeight:600}}>{ice.total[lastI].toLocaleString()}</text>
            <text x={xScale(lastI)+5} y={yScale(ice.criminal[lastI])+4}
                  style={{fontSize:10, fill:"var(--ink-3)", fontFamily:"var(--mono)", fontWeight:600}}>{ice.criminal[lastI].toLocaleString()}</text>
            {tip && (
              <g pointerEvents="none">
                <line x1={tip.x} x2={tip.x} y1={pad.t} y2={H-pad.b} stroke="var(--ink-3)" strokeWidth="1" strokeDasharray="3 3" />
                <rect x={tipX} y={pad.t} width={TW} height={TH} rx="3" fill="var(--paper)" stroke="var(--rule-2)" strokeWidth="1" />
                <text x={tipX+10} y={pad.t+13} style={{fontSize:11, fontFamily:"var(--mono)", fontWeight:600, fill:"var(--ink)"}}>{months[tip.i]}</text>
                <rect x={tipX+10} y={pad.t+20} width={8} height={8} rx="1" fill="var(--accent)" />
                <text x={tipX+22} y={pad.t+28} style={{fontSize:10.5, fontFamily:"var(--sans)", fill:"var(--ink)"}}>Total arrests</text>
                <text x={tipX+TW-8} y={pad.t+28} textAnchor="end" style={{fontSize:10.5, fontFamily:"var(--mono)", fontWeight:600, fill:"var(--accent)"}}>{ice.total[tip.i].toLocaleString()}</text>
                <rect x={tipX+10} y={pad.t+40} width={8} height={8} rx="1" fill="var(--ink-3)" />
                <text x={tipX+22} y={pad.t+48} style={{fontSize:10.5, fontFamily:"var(--sans)", fill:"var(--ink)"}}>Criminal record</text>
                <text x={tipX+TW-8} y={pad.t+48} textAnchor="end" style={{fontSize:10.5, fontFamily:"var(--mono)", fontWeight:600, fill:"var(--ink-3)"}}>{ice.criminal[tip.i].toLocaleString()} ({ice.pctCrim[tip.i]}%)</text>
                <text x={tipX+10} y={pad.t+64} style={{fontSize:10, fontFamily:"var(--mono)", fill:"var(--ink-4)"}}>
                  {(100 - ice.pctCrim[tip.i]).toFixed(1)}% had no criminal record
                </text>
              </g>
            )}
          </svg>
          <div style={{display:"flex", gap:20, marginTop:6}}>
            <span style={{display:"flex", alignItems:"center", gap:5, fontSize:11.5, fontFamily:"var(--sans)", color:"var(--ink-2)"}}>
              <span style={{display:"inline-block", width:20, height:2.5, background:"var(--accent)", borderRadius:2}} /> Total arrests
            </span>
            <span style={{display:"flex", alignItems:"center", gap:5, fontSize:11.5, fontFamily:"var(--sans)", color:"var(--ink-2)"}}>
              <span style={{display:"inline-block", width:20, height:2.5, background:"var(--ink-3)", borderRadius:2}} /> Criminal record
            </span>
          </div>
        </div>
        <div style={{display:"flex", flexDirection:"column", gap:12}}>
          <div className="card">
            <div className="lab">Total arrests (Jan '25 – Mar '26)</div>
            <div className="big" style={{color:"var(--accent)"}}>384,474</div>
          </div>
          <div className="card">
            <div className="lab">No criminal record</div>
            <div className="big">67.1<span style={{fontSize:18, color:"var(--ink-3)"}}>%</span></div>
            <div style={{fontFamily:"var(--serif)", fontSize:13, color:"var(--ink-2)", marginTop:4}}>
              258,125 of 384,474 arrests. Non-criminal share has <em>risen</em>: 54% in Jan '25 → 71% by Dec '25.
            </div>
          </div>
          <div className="card">
            <div className="lab">Criminal arrests</div>
            <div className="big">126,349</div>
            <div className="sub">32.9% of total · criminality share declining month-over-month</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Safety Net: SNAP + Medicaid + school lunch
function SafetyNetBoard({ data }) {
  const snap = data.snap;
  const med  = data.medicaid;
  const sl   = data.schoolLunch;
  return (
    <section className="sec" data-screen-label="08 Safety Net">
      <div className="sec-head">
        <h2>The Safety Net</h2>
        <span className="kicker">SNAP, Medicaid / CHIP, and school lunch — enrollment since inauguration</span>
      </div>

      {/* SNAP */}
      <div className="sec-head" style={{marginTop:"var(--row-gap)"}}>
        <h2 style={{fontSize:"1rem"}}>SNAP (Food Stamps)</h2>
        <span className="kicker">USDA FNS · national participants · Jan 2025 – Feb 2026</span>
      </div>
      <div className="grid" style={{gridTemplateColumns:"2fr 1fr", gap:"var(--col-gap)", alignItems:"start"}}>
        <TrendChart
          months={snap.months}
          values={snap.persons}
          color="var(--accent)"
          yMin={37000000} yMax={43500000}
          yTicks={[38000000, 39000000, 40000000, 41000000, 42000000, 43000000]}
          valueFmt={(v) => `${(v/1e6).toFixed(1)}M`}
          labelStep={2}
        />
        <div style={{display:"flex", flexDirection:"column", gap:12}}>
          <div className="card">
            <div className="lab">Lost since inauguration</div>
            <div className="big" style={{color:"var(--accent)"}}>−4.96<span style={{fontSize:18, color:"var(--ink-3)"}}>M</span></div>
            <div style={{fontFamily:"var(--serif)", fontSize:13, color:"var(--ink-2)", marginTop:4}}>
              −11.6% · worst-hit: AZ −49.7%, NC −18.6%, FL −14.9%
            </div>
          </div>
          <div className="card">
            <div className="lab">Participants (Feb 2026)</div>
            <div className="big">37.9<span style={{fontSize:18, color:"var(--ink-3)"}}>M</span></div>
            <div className="sub">vs. 42.8M at inauguration</div>
          </div>
        </div>
      </div>

      {/* Medicaid */}
      <div className="sec-head" style={{marginTop:"var(--row-gap)"}}>
        <h2 style={{fontSize:"1rem"}}>Medicaid / CHIP</h2>
        <span className="kicker">CMS · total enrollment · Jan 2025 – Jan 2026</span>
      </div>
      <div className="grid" style={{gridTemplateColumns:"2fr 1fr", gap:"var(--col-gap)", alignItems:"start"}}>
        <TrendChart
          months={med.months}
          values={med.enrolled}
          color="var(--accent)"
          yMin={74500000} yMax={80500000}
          yTicks={[75000000, 76000000, 77000000, 78000000, 79000000, 80000000]}
          valueFmt={(v) => `${(v/1e6).toFixed(1)}M`}
          labelStep={2}
        />
        <div style={{display:"flex", flexDirection:"column", gap:12}}>
          <div className="card">
            <div className="lab">Lost since inauguration</div>
            <div className="big" style={{color:"var(--accent)"}}>−4.11<span style={{fontSize:18, color:"var(--ink-3)"}}>M</span></div>
            <div style={{fontFamily:"var(--serif)", fontSize:13, color:"var(--ink-2)", marginTop:4}}>
              −5.2% · includes Medicaid and CHIP combined
            </div>
          </div>
          <div className="card">
            <div className="lab">Enrolled (Jan 2026)</div>
            <div className="big">75.3<span style={{fontSize:18, color:"var(--ink-3)"}}>M</span></div>
            <div className="sub">vs. 79.4M at inauguration</div>
          </div>
        </div>
      </div>

      {/* School Lunch */}
      <div className="sec-head" style={{marginTop:"var(--row-gap)"}}>
        <h2 style={{fontSize:"1rem"}}>National School Lunch Program</h2>
        <span className="kicker">USDA FNS · avg. daily participation</span>
      </div>
      <div className="grid g-3">
        <div className="card flat">
          <div className="lab">At inauguration (Jan '25)</div>
          <div className="big">29.8<span style={{fontSize:18, color:"var(--ink-3)"}}>M</span></div>
          <div className="sub">avg. daily participants</div>
        </div>
        <div className="card flat">
          <div className="lab">Latest (Jan '26)</div>
          <div className="big" style={{color:"var(--accent)"}}>29.3<span style={{fontSize:18, color:"var(--ink-3)"}}>M</span></div>
          <div className="sub">−566,751 (−1.9%) year-over-year</div>
        </div>
        <div className="card flat">
          <div className="lab">Receiving free lunch</div>
          <div className="big">69.9<span style={{fontSize:18, color:"var(--ink-3)"}}>%</span></div>
          <div className="sub">of daily participants, Jan '26</div>
        </div>
      </div>
    </section>
  );
}

function PromisesBoard({ data }){
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? data.promises : data.promises.filter(p => p.status === filter);
  const total = data.promiseSummary.kept + data.promiseSummary.partial + data.promiseSummary.stalled + data.promiseSummary.broken;
  return (
    <section className="sec" data-screen-label="06 Promises">
      <div className="sec-head">
        <h2>Promises, Tracked</h2>
        <span className="kicker">{total} pledges audited from the 2024 campaign</span>
      </div>
      <div className="grid" style={{gridTemplateColumns:"1fr 2fr"}}>
        <div className="card">
          <div className="lab">Status of pledges</div>
          <Donut summary={data.promiseSummary} />
          <div className="sub" style={{marginTop:8}}>Coded by editorial staff against the candidate's published platform &amp; on-the-record statements.</div>
        </div>
        <div>
          <div className="tabs">
            {["all","broken","stalled","partial","kept"].map(s => (
              <div key={s} className={"tab " + (filter===s ? "on" : "")} onClick={()=>setFilter(s)}>{s}</div>
            ))}
          </div>
          <table className="t">
            <thead>
              <tr><th style={{width:"22%"}}>Area</th><th>Pledge</th><th style={{width:"12%"}}>Status</th><th style={{width:"30%"}}>Where it stands</th></tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i}>
                  <td style={{color:"var(--ink-3)", fontFamily:"var(--mono)", fontSize:11, letterSpacing:".08em", textTransform:"uppercase"}}>{p.area}</td>
                  <td style={{fontFamily:"var(--serif)", fontSize:14.5, color:"var(--ink)"}}>{p.text}</td>
                  <td><span className={"pill " + p.status}>{p.status}</span></td>
                  <td style={{color:"var(--ink-2)", fontSize:12.5}}>{p.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function LegalBoard({ data }){
  return (
    <section className="sec" data-screen-label="07 Legal">
      <div className="sec-head">
        <h2>The Docket</h2>
        <span className="kicker">Active litigation against executive actions</span>
      </div>
      <div className="grid" style={{gridTemplateColumns:"2fr 1fr"}}>
        <table className="t">
          <thead>
            <tr><th>Case</th><th>Court</th><th>Filed</th><th>Status</th><th>Next</th></tr>
          </thead>
          <tbody>
            {data.legal.map((c,i) => (
              <tr key={i}>
                <td style={{fontFamily:"var(--serif)", fontSize:14.5}}>{c.case}<div style={{fontSize:11, color:"var(--ink-4)", fontFamily:"var(--mono)", letterSpacing:".06em", textTransform:"uppercase", marginTop:2}}>plaintiff: {c.party}</div></td>
                <td style={{color:"var(--ink-3)"}}>{c.court}</td>
                <td className="num" style={{fontSize:12}}>{c.filed}</td>
                <td>
                  <span className={"pill " + (c.status === "enjoined" ? "broken" : c.status === "active" ? "stalled" : "partial")}>{c.status}</span>
                </td>
                <td className="num" style={{fontSize:12}}>{c.next}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="card">
          <div className="lab">Norms &amp; precedent</div>
          {data.norms.map((n,i) => (
            <div key={i} style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", padding:"8px 0", borderBottom:"1px dashed var(--rule)"}}>
              <div>
                <div style={{fontFamily:"var(--serif)", fontSize:13.5}}>{n.label}</div>
                <div className="sub" style={{fontSize:11}}>{n.note}</div>
              </div>
              <div className="num" style={{fontSize:20, fontWeight:500}}>{n.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CabinetBoard({ data }){
  const c = data.cabinet;
  const maxDay = 488;
  return (
    <section className="sec" data-screen-label="08 Cabinet">
      <div className="sec-head">
        <h2>Cabinet Stability</h2>
        <span className="kicker">Departures from confirmed posts · cabinet &amp; cabinet-rank</span>
      </div>
      <div className="grid g-4" style={{marginBottom:24}}>
        <div className="card flat">
          <div className="lab">Departures</div>
          <div className="big" style={{color:"var(--accent)"}}>{c.departures}</div>
          <div className="sub">More than any first 488-day window since records began.</div>
        </div>
        <div className="card flat">
          <div className="lab">Depts. affected</div>
          <div className="big">{c.deptsAffected}<span style={{fontSize:18, color:"var(--ink-3)"}}> / 15</span></div>
          <div className="sub">Including DOD, DHS, DOJ, Treasury, VA.</div>
        </div>
        <div className="card flat">
          <div className="lab">Acting officials</div>
          <div className="big">{c.actingPct}<span style={{fontSize:18, color:"var(--ink-3)"}}>%</span></div>
          <div className="sub">Of Senate-confirmed posts currently filled in 'acting' capacity.</div>
        </div>
        <div className="card flat">
          <div className="lab">Avg. confirm delay</div>
          <div className="big">{c.confirmDelay}<span style={{fontSize:18, color:"var(--ink-3)"}}>d</span></div>
          <div className="sub">Nominee → floor vote, for posts confirmed YTD.</div>
        </div>
      </div>
      <div className="card">
        <div className="lab" style={{marginBottom:12}}>Timeline of departures (day in office)</div>
        {c.list.map((p,i) => (
          <div key={i} style={{display:"grid", gridTemplateColumns:"160px 1fr 110px 60px", alignItems:"center", gap:14, padding:"9px 0", borderBottom:"1px dashed var(--rule)"}}>
            <div style={{fontFamily:"var(--mono)", fontSize:11.5, color:"var(--ink-3)", letterSpacing:".06em", textTransform:"uppercase"}}>{p.post}</div>
            <div style={{fontFamily:"var(--serif)", fontSize:14.5}}>{p.name}</div>
            <div className="bar-track"><div className="bar-fill acc" style={{width: (p.day/maxDay*100)+"%"}}></div></div>
            <div className="num" style={{fontSize:12, textAlign:"right"}}>d{p.day}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Timeline({ data }){
  return (
    <section className="sec" data-screen-label="08 Timeline">
      <div className="sec-head">
        <h2>Notable Days</h2>
        <span className="kicker">Most-significant events of the past 90 days</span>
      </div>
      <div className="grid" style={{gridTemplateColumns:"2fr 1fr", gap:"36px"}}>
        <div className="tl">
          {data.timeline.map((e,i) => (
            <div key={i} className={"tl-item " + (e.cat === "economy" || e.cat === "legal" ? "bad" : "")}>
              <div className="tl-date">{e.date} · {e.cat}</div>
              <div className="tl-title">{e.title}</div>
              <div className="tl-body">{e.body}</div>
              <div className="tl-meta">FILED UNDER: {e.tag}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="card">
            <div className="lab" style={{marginBottom:6}}>Live wire</div>
            <div className="sub" style={{marginBottom:8, fontSize:11}}>Auto-refreshing newsfeed · placeholder data</div>
            {data.ticker.map((t,i) => (
              <div className="tick" key={i}>
                <span className="t-time">{t.t}</span>
                <span className="t-tag">{t.tag}</span>
                <span className="t-text">{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Foot(){
  return (
    <footer className="foot">
      <div className="disc">
        <strong>Method &amp; sources.</strong> Polling, CPI inflation, U-Michigan consumer sentiment and all six FRED economic indicators (unemployment, retail gasoline, 30-yr mortgage, nominal GDP, trade balance, federal deficit) are real, pulled from BLS, EIA, Freddie Mac, BEA, Census and Treasury via FRED through May 23, 2026. Polling is compiled from Gallup, YouGov/Economist, USPollingData, Reuters/Ipsos, Pew, PRRI, Atlas Intel and the Wikipedia aggregator.
      </div>
      <div className="num" style={{color:"var(--ink-4)"}}>
        © Trump Tracker · build 1.0.0-{Math.floor(Math.random()*900+100)}
      </div>
    </footer>
  );
}

// ─── tweaks app ──────────────────────────────────────────────────────────

function App(){
  const data = window.TT_DATA;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    document.body.dataset.theme = t.theme;
    document.body.dataset.density = t.density;
    document.documentElement.style.setProperty('--accent', t.accent);
  }, [t.theme, t.density, t.accent]);

  useEffect(() => { window.scrollTo(0, 0); }, [activeTab]);

  const show = (key) => activeTab === null || activeTab === key;

  return (
    <>
      <div className="page">
        <Masthead data={data} headline={t.headline} leftWord={t.leftWord} rightWord={t.rightWord} />
        <Submast data={data} activeTab={activeTab} setActiveTab={setActiveTab} />
        {show("approval")     && <HeroApproval data={data} showLede={t.showLede} />}
        {show("approval")     && <BallotSection data={data} />}
        {show("government")   && <GovernmentBoard data={data} />}
        {show("immigration")  && <ImmigrationBoard data={data} />}
        {show("safety")       && <SafetyNetBoard data={data} />}
        {show("pollsters")    && <AggregatorBoard data={data} />}
        {show("demographics") && <DemoBoard data={data} />}
        {show("prices")       && <PricesBoard data={data} />}
        {show("economy")      && <EconBoard data={data} />}
        <Foot />
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme" />
        <TweakRadio
          label="Surface"
          value={t.theme}
          options={["paper","graphite","news"]}
          onChange={(v)=>setTweak("theme", v)}
        />
        <TweakColor
          label="Accent"
          value={t.accent}
          options={["#b81d1d","#c2410c","#0f5132","#1e3a8a"]}
          onChange={(v)=>setTweak("accent", v)}
        />
        <TweakRadio
          label="Density"
          value={t.density}
          options={["compact","regular","comfy"]}
          onChange={(v)=>setTweak("density", v)}
        />
        <TweakSection label="Content" />
        <TweakToggle
          label="Show editorial lede"
          value={t.showLede}
          onChange={(v)=>setTweak("showLede", v)}
        />
        <TweakText
          label="Edition slug"
          value={t.headline}
          onChange={(v)=>setTweak("headline", v)}
        />
        <TweakText
          label="Mast left tag"
          value={t.leftWord}
          onChange={(v)=>setTweak("leftWord", v)}
        />
        <TweakText
          label="Mast right tag"
          value={t.rightWord}
          onChange={(v)=>setTweak("rightWord", v)}
        />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
