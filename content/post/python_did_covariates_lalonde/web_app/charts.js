/* charts.js — D3 renderers for the LaLonde covariates lab.
   Colors mirror the site palette used across the post. */

const COLORS = {
  inert: "#8b9dc3",
  corrected: "#6a9bcc",
  propensity: "#00d4c8",
  benchmark: "#d97757",
  text: "#e8ecf2",
};

// Map an estimator's `group` field to a display group + marker.
function groupOf(e) {
  if (e.group === "propensity") return "propensity";
  if (e.group === "corrected") return "corrected";
  return "inert";
}

/* ---- Forest plot -------------------------------------------------------- */
function renderForest(selector, estimators, benchmark, activeIndex) {
  const el = document.querySelector(selector);
  el.innerHTML = "";
  const W = el.clientWidth || 640;
  const rowH = 46;
  const margin = { top: 34, right: 24, bottom: 40, left: 168 };
  const H = margin.top + margin.bottom + estimators.length * rowH;

  const svg = d3.select(el).append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("width", "100%").attr("height", H);

  const x = d3.scaleLinear().domain([0, 4200]).range([margin.left, W - margin.right]);
  const y = d3.scaleBand()
    .domain(d3.range(estimators.length))
    .range([margin.top, H - margin.bottom]).padding(0.3);

  // x grid + axis
  const xAxis = d3.axisBottom(x).tickValues([0, 1000, 2000, 3000, 4000])
    .tickFormat(d => "$" + d3.format(",")(d));
  svg.append("g").attr("class", "axis")
    .attr("transform", `translate(0,${H - margin.bottom})`).call(xAxis);
  svg.append("g").attr("class", "grid")
    .attr("transform", `translate(0,${H - margin.bottom})`)
    .call(d3.axisBottom(x).tickValues([1000, 2000, 3000, 4000])
      .tickSize(-(H - margin.top - margin.bottom)).tickFormat(""));

  // benchmark line
  svg.append("line").attr("class", "benchmark-line")
    .attr("x1", x(benchmark)).attr("x2", x(benchmark))
    .attr("y1", margin.top - 10).attr("y2", H - margin.bottom);
  svg.append("text").attr("class", "benchmark-label")
    .attr("x", x(benchmark)).attr("y", margin.top - 16).attr("text-anchor", "middle")
    .text("RCT benchmark $" + d3.format(",")(benchmark));

  // rows
  estimators.forEach((e, i) => {
    const g = groupOf(e);
    const col = COLORS[g];
    const cy = y(i) + y.bandwidth() / 2;
    const dim = (activeIndex != null && i !== activeIndex);
    const row = svg.append("g")
      .attr("class", "est-row" + (dim ? " est-dim" : ""));

    // CI whisker
    row.append("line")
      .attr("x1", x(Math.max(0, e.att - 1.96 * e.se)))
      .attr("x2", x(e.att + 1.96 * e.se))
      .attr("y1", cy).attr("y2", cy)
      .attr("stroke", col).attr("stroke-width", dim ? 2 : 3);
    // point
    row.append("circle")
      .attr("cx", x(e.att)).attr("cy", cy)
      .attr("r", (activeIndex === i) ? 10 : 7)
      .attr("fill", col).attr("stroke", "#0f1729").attr("stroke-width", 1.5);
    // label
    row.append("text")
      .attr("x", margin.left - 12).attr("y", cy + 4).attr("text-anchor", "end")
      .attr("font-weight", activeIndex === i ? 700 : 400)
      .text(e.label);
    // value
    row.append("text")
      .attr("x", x(e.att)).attr("y", cy - 14).attr("text-anchor", "middle")
      .attr("fill", col).attr("font-weight", 700).attr("font-size", 12)
      .attr("opacity", activeIndex === i ? 1 : 0)
      .text("$" + d3.format(",")(Math.round(e.att)));
  });

  svg.append("text")
    .attr("x", (margin.left + W - margin.right) / 2).attr("y", H - 6)
    .attr("text-anchor", "middle").attr("fill", COLORS.text).attr("font-size", 12)
    .text("ATT estimate (95% CI)");
}

/* ---- Group earnings trends --------------------------------------------- */
function renderTrends(selector, trend) {
  const el = document.querySelector(selector);
  el.innerHTML = "";
  const W = el.clientWidth || 720;
  const H = 380;
  const margin = { top: 20, right: 150, bottom: 40, left: 70 };

  const svg = d3.select(el).append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%").attr("height", H);

  const years = trend.years;
  const series = [
    { key: "treated", label: "NSW trainees", color: "#d97757", vals: trend.treated },
    { key: "cps", label: "CPS controls", color: "#8b9dc3", vals: trend.cps },
    { key: "experimental", label: "RCT controls", color: "#6a9bcc", vals: trend.experimental },
  ];

  const x = d3.scalePoint().domain(years).range([margin.left, W - margin.right]).padding(0.3);
  const maxY = d3.max(series, s => d3.max(s.vals)) * 1.08;
  const y = d3.scaleLinear().domain([0, maxY]).range([H - margin.bottom, margin.top]);

  svg.append("g").attr("class", "axis").attr("transform", `translate(0,${H - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));
  svg.append("g").attr("class", "axis").attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(6).tickFormat(d => "$" + d3.format(",")(d)));

  const line = d3.line().x((d, i) => x(years[i])).y(d => y(d));
  series.forEach(s => {
    svg.append("path").datum(s.vals).attr("fill", "none")
      .attr("stroke", s.color).attr("stroke-width", 3).attr("d", line);
    s.vals.forEach((v, i) => {
      svg.append("circle").attr("cx", x(years[i])).attr("cy", y(v)).attr("r", 5).attr("fill", s.color);
    });
    svg.append("text")
      .attr("x", x(years[years.length - 1]) + 12).attr("y", y(s.vals[s.vals.length - 1]) + 4)
      .attr("fill", s.color).attr("font-weight", 700).attr("font-size", 12.5).text(s.label);
  });
}
