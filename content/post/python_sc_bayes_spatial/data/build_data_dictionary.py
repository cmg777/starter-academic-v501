#!/usr/bin/env python3
"""Build an interactive, self-contained HTML data dictionary (+ a Stata pipeline) for a post.

This is the GENERIC renderer shipped by the `write-data-dictionary` skill. It is copied verbatim
into a post's data folder (`content/post/<slug>/data/`) and driven by a sibling
`data_dictionary.yaml`. Run it from that folder:

    python build_data_dictionary.py

It is self-configuring: it derives the post slug, repo, branch and raw-GitHub URLs from its own
location + `git`. For each dataset found in the folder (`.csv` / `.parquet` / `.xlsx` / `.dta`) it
writes a labeled Stata `.dta` (v118), and it emits `README.md`, `stata_codebook.do`, a
download-all ZIP, and `index.html` (the interactive page). Statistics are computed live from the
data; all prose/definitions come from `data_dictionary.yaml`.

Requires: pandas, pyreadstat, PyYAML (+ pyarrow for .parquet, openpyxl for .xlsx).
"""

import html
import math
import os
import re
import subprocess
import zipfile

import pandas as pd
import pyreadstat
import yaml

BASE = os.path.dirname(os.path.abspath(__file__))
META_PATH = os.path.join(BASE, "data_dictionary.yaml")
SELF = os.path.basename(__file__)

DATA_EXTS = [".csv", ".parquet", ".xlsx", ".dta"]   # source priority order
YESNO = {0: "No", 1: "Yes"}


# ======================================================================================
# Self-configuration (paths, slug, raw-GitHub URLs)
# ======================================================================================
def _git(*args, default=""):
    try:
        return subprocess.check_output(["git", "-C", BASE, *args],
                                       stderr=subprocess.DEVNULL).decode().strip()
    except Exception:
        return default


def _repo_root():
    return _git("rev-parse", "--show-toplevel", default=os.path.dirname(os.path.dirname(BASE)))


def _owner_repo():
    url = _git("remote", "get-url", "origin", default="")
    m = re.search(r"github\.com[:/]+([^/]+)/(.+?)(?:\.git)?$", url)
    return (m.group(1), m.group(2)) if m else ("OWNER", "REPO")


def _base_url():
    """Site baseURL from config/_default/config.yaml (best effort)."""
    cfg = os.path.join(_repo_root(), "config", "_default", "config.yaml")
    try:
        with open(cfg) as fh:
            for line in fh:
                m = re.match(r"\s*baseurl\s*:\s*['\"]?([^'\"#]+)", line, re.I)
                if m:
                    return m.group(1).strip().rstrip("/") + "/"
    except Exception:
        pass
    return ""


SLUG = os.path.basename(os.path.dirname(BASE))           # content/post/<slug>/data -> <slug>
REL = os.path.relpath(BASE, _repo_root()).replace(os.sep, "/")
_OWNER, _REPO = _owner_repo()
BRANCH = _git("rev-parse", "--abbrev-ref", "HEAD", default="master")
RAW_BASE = f"https://raw.githubusercontent.com/{_OWNER}/{_REPO}/{BRANCH}/{REL}/"
BLOB_BASE = f"https://github.com/{_OWNER}/{_REPO}/blob/{BRANCH}/{REL}/"
ZIP_NAME = f"{SLUG}_data.zip"
OUTPUT_NAMES = {"README.md", "stata_codebook.do", "index.html", ZIP_NAME, SELF,
                os.path.basename(META_PATH)}


# ======================================================================================
# Metadata + data discovery
# ======================================================================================
def load_meta():
    if not os.path.exists(META_PATH):
        return {}
    with open(META_PATH) as fh:
        return yaml.safe_load(fh) or {}


META = load_meta()
_study = META.get("study") or {}
STUDY_TITLE = _study.get("title") or SLUG
STUDY_SUB = _study.get("subtitle") or ""
SITE_POST = _study.get("post_url") or ((_base_url() + f"post/{SLUG}/") if _base_url() else f"/post/{SLUG}/")
STATA_VERSION = 14                                   # pyreadstat version 14 -> .dta release 118
DTA_FORMAT = int(META.get("dta_format_version", 118))
_VER_MAP = {117: 13, 118: 14, 119: 15}
STATA_VERSION = _VER_MAP.get(DTA_FORMAT, 14)


def discover():
    """Return ordered base-name -> (source_filename, ext). Output artifacts are excluded."""
    by_base = {}
    for f in sorted(os.listdir(BASE)):
        if f in OUTPUT_NAMES:
            continue
        b, ext = os.path.splitext(f)
        ext = ext.lower()
        if ext in DATA_EXTS:
            by_base.setdefault(b, {})[ext] = f
    chosen = {}
    for b, m in by_base.items():
        for e in DATA_EXTS:
            if e in m:
                chosen[b] = (m[e], e)
                break
    # order: files listed in YAML first, then the rest alphabetically
    order = []
    for k in (META.get("files") or {}):
        bn = os.path.splitext(k)[0]
        if bn in chosen and bn not in order:
            order.append(bn)
    for b in sorted(chosen):
        if b not in order:
            order.append(b)
    return order, chosen


def load_frame(fname, ext):
    path = os.path.join(BASE, fname)
    labels = {}
    if ext == ".csv":
        df = pd.read_csv(path)
    elif ext == ".parquet":
        df = pd.read_parquet(path)
    elif ext == ".xlsx":
        df = pd.read_excel(path, sheet_name=0)
    elif ext == ".dta":
        df, m = pyreadstat.read_dta(path)
        labels = dict(m.column_names_to_labels or {})
    else:
        raise ValueError(ext)
    for c in df.columns:
        if not pd.api.types.is_numeric_dtype(df[c]):
            df[c] = df[c].astype(object)
    return df, labels


def infer_kind(name, s):
    if name.lower() == "year":
        return "year"
    if not pd.api.types.is_numeric_dtype(s):
        return "str"
    sd = pd.to_numeric(s, errors="coerce").dropna()
    if sd.empty:
        return "cont"
    u = set(sd.unique().tolist())
    if u <= {0, 1}:
        return "dummy"
    if (sd % 1 == 0).all() and sd.min() >= 1800 and sd.max() <= 2100 and sd.nunique() <= 130:
        return "year"
    return "cont"


def col_meta(name, series, dta_label=""):
    ym = (META.get("columns") or {}).get(name, {}) or {}
    kind = ym.get("kind") or infer_kind(name, series)
    return {
        "label": (ym.get("label") or dta_label or name)[:80],
        "defn": ym.get("definition") or ym.get("defn") or "",
        "constr": ym.get("construction") or ym.get("constr") or "",
        "units": ym.get("units") or "",
        "source": ym.get("source") or "",
        "cov": ym.get("coverage") or ym.get("cov") or "",
        "kind": kind,
        "value_labels": ym.get("value_labels"),
    }


def file_meta(base, source_name):
    fm = META.get("files") or {}
    m = fm.get(source_name) or fm.get(base) or fm.get(base + ".csv") or {}
    return {
        "label": (m.get("label") or base)[:80],
        "grain": m.get("grain") or "table",
        "rows": m.get("rows") or "",
        "years": m.get("years") or "",
        "units_cov": m.get("coverage") or m.get("units_cov") or "",
        "key": m.get("key") or "",
        "purpose": m.get("purpose") or "",
        "note": m.get("note") or "",
    }


# ======================================================================================
# Formatting helpers
# ======================================================================================
def h(s):
    return html.escape(str(s))


_URL_RE = re.compile(r"(https?://[^\s)<]+)")


def linkify(text):
    return _URL_RE.sub(
        lambda m: f'<a href="{m.group(1)}" target="_blank" rel="noopener">{m.group(1)}</a>',
        h(text))


def fnum(x):
    try:
        x = float(x)
    except (TypeError, ValueError):
        return "—"
    if math.isnan(x):
        return "—"
    ax = abs(x)
    if ax == 0:
        return "0"
    if ax < 1e-3:
        return f"{x:.2e}"
    if ax >= 1e4:
        return f"{x:,.0f}"
    if ax >= 100:
        return f"{x:,.1f}"
    if ax >= 1:
        return f"{x:.2f}"
    return f"{x:.3f}"


def stat_cells(series, kind):
    total = len(series)
    n = int(series.notna().sum())
    miss = 100.0 * (total - n) / total if total else 0.0
    distinct = int(series.nunique(dropna=True))
    head = [f"{n:,}", f"{miss:.1f}", f"{distinct:,}"]
    if kind in ("cont", "dummy", "year") and pd.api.types.is_numeric_dtype(series):
        vmin, vmean = series.min(), series.mean()
        vmed, vmax, vsd = series.median(), series.max(), series.std()
        if kind == "year":
            num = [str(int(vmin)), f"{vmean:.1f}", str(int(vmed)), str(int(vmax)), f"{vsd:.2f}"]
        else:
            num = [fnum(vmin), fnum(vmean), fnum(vmed), fnum(vmax), fnum(vsd)]
    else:
        num = ["—", "—", "—", "—", "—"]
    return head + num


def html_table(headers, rows, raw_cols=(), sortable=False, tid="", tall=False, nosort_cols=()):
    cls = ' class="sortable"' if sortable else ""
    idattr = f' id="{tid}"' if tid else ""
    wcls = "tbl-wrap tall" if tall else "tbl-wrap"
    out = [f'<div class="{wcls}"><table{cls}{idattr}>', "<thead><tr>"]
    for i, x in enumerate(headers):
        out.append(f'<th class="nosort">{h(x)}</th>' if i in nosort_cols else f"<th>{h(x)}</th>")
    out.append("</tr></thead><tbody>")
    for r in rows:
        out.append("<tr>")
        for i, cell in enumerate(r):
            out.append(f"<td>{cell if i in raw_cols else h(cell)}</td>")
        out.append("</tr>")
    out.append("</tbody></table></div>")
    return "".join(out)


_TYPE_LABEL = {"cont": "continuous", "dummy": "dummy", "id": "identifier",
               "str": "identifier", "year": "year"}
_TYPE_CLASS = {"cont": "b-cont", "dummy": "b-dummy", "id": "b-id", "str": "b-id", "year": "b-year"}
_TYPE_FILTER = {"cont": "cont", "dummy": "dummy", "id": "id", "str": "id", "year": "year"}


def type_badge(kind):
    return f'<span class="badge {_TYPE_CLASS[kind]}">{_TYPE_LABEL[kind]}</span>'


def missing_bar(series):
    total = len(series)
    n = int(series.notna().sum())
    pct = 100.0 * n / total if total else 0.0
    return (f'<span class="missbar" title="{n:,} of {total:,} non-missing ({pct:.1f}%)">'
            f'<span class="missfill" style="width:{pct:.1f}%"></span></span>'
            f'<span class="misspct">{pct:.0f}%</span>')


def sparkline_svg(series, kind):
    clean = pd.to_numeric(series, errors="coerce").dropna()
    if kind in ("id", "str", "year") or clean.empty:
        return '<span class="spark-na">&ndash;</span>'
    W, H, PAD = 96, 26, 1
    extra = ""
    if kind == "dummy":
        share1 = float(clean.mean())
        counts = [1.0 - share1, share1]
        title = f"share coded 1 = {share1:.3f}"
        extra = " spark-dummy"
    else:
        lo, hi = clean.quantile(0.02), clean.quantile(0.98)
        if not (hi > lo):
            lo, hi = clean.min(), clean.max()
        if not (hi > lo):
            return '<span class="spark-na">&ndash;</span>'
        cats = pd.cut(clean.clip(lo, hi), bins=24)
        counts = cats.value_counts(sort=False).tolist()
        title = f"min {clean.min():.3g} | median {clean.median():.3g} | max {clean.max():.3g}"
    mx = max(counts) or 1.0
    n = len(counts)
    bw = (W - 2 * PAD) / n
    bars = []
    for i, c in enumerate(counts):
        bh = (H - 2 * PAD) * (c / mx)
        bars.append(f'<rect x="{PAD + i * bw:.2f}" y="{H - PAD - bh:.2f}" '
                    f'width="{max(bw - 0.6, 0.6):.2f}" height="{bh:.2f}"></rect>')
    return (f'<svg class="spark{extra}" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
            f'preserveAspectRatio="none" role="img"><title>{h(title)}</title>'
            f'{"".join(bars)}</svg>')


def code_block(code):
    return ('<div class="code"><button class="copy" type="button" onclick="copyCode(this)">Copy</button>'
            f'<pre><code>{h(code)}</code></pre></div>')


def ascii_safe(s):
    repl = {"–": "-", "—": "-", "−": "-", "×": "x", "·": "-", "≥": ">=", "≤": "<=",
            "²": "^2", "→": "->", "‘": "'", "’": "'", "“": '"', "”": '"', "&middot;": "-"}
    for k, v in repl.items():
        s = s.replace(k, v)
    return s.encode("ascii", "replace").decode("ascii")


# CSS / JS are generic (no per-post content) — kept verbatim across posts.
_PAGE_CSS = r"""
:root{--steel:#6a9bcc;--orange:#d97757;--ink:#141413;--teal:#00d4c8;
  --bg:#f6f7f9;--card:#fff;--line:#e4e6ea;--muted:#6b6f76;--dark:#0f1729;}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;color:var(--ink);background:var(--bg);line-height:1.6;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}
a{color:var(--steel);text-decoration:none}a:hover{text-decoration:underline}
.hero{background:linear-gradient(135deg,#0f1729 0%,#1f2b5e 55%,#2a4a7a 100%);color:#fff;
  padding:40px 20px 30px}
.wrap{max-width:1100px;margin:0 auto}
.hero .back{color:#aeb9d6;font-size:14px}
.hero .kicker{color:var(--teal);font-weight:700;text-transform:uppercase;letter-spacing:.1em;
  font-size:12px;margin:14px 0 6px}
.hero h1{margin:0;font-size:32px;font-weight:800;letter-spacing:-.02em}
.hero p.sub{margin:8px 0 0;color:#d7dcea;max-width:780px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-top:22px}
.kpi{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:12px;
  padding:12px 14px}
.kpi .n{font-size:24px;font-weight:800;color:#fff}
.kpi .l{font-size:12px;color:#aeb9d6;text-transform:uppercase;letter-spacing:.04em}
nav.toc{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.96);
  backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
nav.toc .wrap{display:flex;flex-wrap:wrap;gap:4px 18px;padding:11px 20px;font-size:14px}
nav.toc a{color:var(--ink);font-weight:500}
main{padding:0 20px}
section{padding:30px 0;border-bottom:1px solid var(--line)}
section:last-of-type{border-bottom:none}
h2{font-size:23px;margin:0 0 6px;padding-left:12px;border-left:4px solid var(--orange)}
h2 .hint{font-size:13px;font-weight:400;color:var(--muted);border:0;padding:0;margin-left:8px}
h3{font-size:17px;margin:22px 0 8px}h4{font-size:15px;margin:18px 0 6px;color:var(--muted)}
p.lead{color:#3b3f46;max-width:820px}
.btn{display:inline-block;background:var(--steel);color:#fff;padding:8px 14px;border-radius:9px;
  font-size:14px;font-weight:600;margin:4px 6px 4px 0;transition:.15s}
.btn:hover{background:var(--orange);text-decoration:none;transform:translateY(-1px)}
.btn.zip{background:var(--orange);font-size:15px;padding:11px 20px}
.btn.zip:hover{background:#c4623f}
.btn.ghost{background:#eef1f6;color:var(--ink)}.btn.ghost:hover{background:#e2e7f0;color:var(--ink)}
.btn.small{padding:5px 11px;font-size:13px}
.tbl-wrap{overflow-x:auto;margin:8px 0;border:1px solid var(--line);border-radius:10px}
.tbl-wrap.tall{max-height:78vh;overflow:auto}
table{border-collapse:collapse;width:100%;font-size:13.5px;background:var(--card)}
th,td{padding:8px 11px;text-align:left;border-bottom:1px solid var(--line);vertical-align:middle}
th{background:#eef2f8;color:#27324a;font-weight:700;white-space:nowrap;position:sticky;top:0;z-index:2}
table.sortable th{cursor:pointer}table.sortable th:hover{background:#e2e9f4}
table.sortable th::after{content:' \2195';color:#9aa3b2;font-size:11px}
table.sortable th.nosort{cursor:default}
table.sortable th.nosort:hover{background:#eef2f8}
table.sortable th.nosort::after{content:''}
tbody tr:hover{background:#f3f7fc}
code{background:#eef1f6;padding:1px 6px;border-radius:5px;font-size:.88em;
  font-family:'SF Mono',Menlo,Consolas,monospace;color:#243}
.badge{display:inline-block;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;
  color:#fff;letter-spacing:.02em;white-space:nowrap}
.b-cont{background:var(--steel)}.b-dummy{background:var(--orange)}
.b-id{background:#7a8699}.b-year{background:#1aa39a}.b-frame{background:#27324a}
.spark{display:block}.spark rect{fill:var(--steel)}.spark-dummy rect{fill:var(--orange)}
.spark-na{color:#b9bec7}
.missbar{display:inline-block;width:54px;height:8px;background:#e9ecf1;border-radius:5px;
  overflow:hidden;vertical-align:middle}
.missfill{display:block;height:100%;background:linear-gradient(90deg,#3fae8e,#00d4c8)}
.misspct{font-size:12px;color:var(--muted);margin-left:6px;vertical-align:middle}
.code{position:relative;margin:12px 0}
.code pre{background:#0f1729;color:#e8ecf2;padding:16px;border-radius:11px;overflow-x:auto;margin:0}
.code pre code{background:none;color:inherit;padding:0;font-size:13px;line-height:1.55}
.code .copy{position:absolute;top:9px;right:9px;background:#27324a;color:#c8d0e0;border:none;
  border-radius:7px;padding:4px 11px;font-size:12px;cursor:pointer}
.code .copy:hover{background:var(--steel);color:#fff}
.note{background:#eef6fb;border-left:4px solid var(--steel);padding:11px 15px;
  border-radius:0 9px 9px 0;margin:14px 0;font-size:14px}
ul.tight li{margin:5px 0}
.explorer-controls{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:6px 0 12px}
#varSearch{flex:1;min-width:240px;padding:9px 13px;border:1px solid var(--line);border-radius:9px;
  font-size:14px;background:var(--card);color:var(--ink)}
#varSearch:focus{outline:2px solid var(--steel);border-color:var(--steel)}
.chips{display:flex;gap:6px;flex-wrap:wrap}
.chip{background:#eef1f6;border:1px solid var(--line);color:#3b3f46;border-radius:20px;
  padding:6px 13px;font-size:13px;font-weight:600;cursor:pointer}
.chip.active{background:var(--steel);color:#fff;border-color:var(--steel)}
.varcount{font-size:13px;color:var(--muted)}
.tabs{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 14px}
.tab{background:#eef1f6;border:1px solid var(--line);border-radius:9px 9px 0 0;padding:8px 14px;
  font-size:13.5px;font-weight:600;cursor:pointer;color:#3b3f46}
.tab.active{background:var(--steel);color:#fff;border-color:var(--steel)}
.dl-grid td .btn{margin:2px 4px 2px 0}
footer{padding:26px 20px 60px;color:var(--muted);font-size:13px}
.hint{font-size:13px;color:var(--muted)}
.meta{font-size:13.5px;color:var(--muted);margin:4px 0}
.vlink{color:var(--muted);font-size:12px;text-decoration:none;margin-left:5px;opacity:.55}
.vlink:hover{opacity:1;color:var(--steel);text-decoration:none}
nav.toc a.active{color:var(--steel);font-weight:700}
#themeToggle{margin-left:auto;background:transparent;border:1px solid var(--line);color:var(--ink);
  border-radius:8px;padding:3px 11px;font-size:14px;cursor:pointer;line-height:1.3}
#themeToggle:hover{border-color:var(--steel);color:var(--steel)}
:focus-visible{outline:2px solid var(--steel);outline-offset:2px}
[data-theme="dark"]{--bg:#0b1120;--card:#121a2e;--line:#26304a;--muted:#9aa6bd;--ink:#e8ecf2;}
[data-theme="dark"] nav.toc{background:rgba(11,17,32,.92)}
[data-theme="dark"] p.lead{color:#c2c9d6}
[data-theme="dark"] th{background:#1b2540;color:#cdd6e6}
[data-theme="dark"] table.sortable th:hover{background:#243056}
[data-theme="dark"] table.sortable th.nosort:hover{background:#1b2540}
[data-theme="dark"] tbody tr:hover{background:#172138}
[data-theme="dark"] code{background:#1b2540;color:#cfe1f5}
[data-theme="dark"] .note{background:#13233a}
[data-theme="dark"] .btn.ghost{background:#1d2742}
[data-theme="dark"] .btn.ghost:hover{background:#26304a}
[data-theme="dark"] .chip{background:#1d2742;color:#c2c9d6}
[data-theme="dark"] .tab{background:#1d2742;color:#c2c9d6}
[data-theme="dark"] .missbar{background:#26304a}
[data-theme="dark"] .spark-na{color:#5d6884}
@media(max-width:760px){.hero h1{font-size:25px}h2{font-size:20px}#themeToggle{margin-left:0}}
@media print{
  nav.toc,.tabs,#expandBtn,.code .copy,.explorer-controls,#themeToggle,.btn,.vlink,
  .hero .back{display:none!important}
  .ds-panel{display:block!important}
  .tbl-wrap,.tbl-wrap.tall{max-height:none!important;overflow:visible!important}
  .hero{background:#fff!important;color:#000!important}
  .hero h1,.hero .kicker,.hero p.sub,.kpi .n,.kpi .l{color:#000!important}
  .kpi{border-color:#bbb}
  body{background:#fff;color:#000}
  section{border-color:#ccc;page-break-inside:auto}
}
"""

_PAGE_JS = r"""
function copyCode(b){var c=b.parentElement.querySelector('code').innerText;
 navigator.clipboard.writeText(c).then(function(){var t=b.textContent;b.textContent='Copied!';
  setTimeout(function(){b.textContent=t;},1400);});}
var _activeTab=0,_expanded=false;
function showTab(i){_activeTab=i;
 document.querySelectorAll('.ds-panel').forEach(function(p,j){p.style.display=(i===j?'block':'none');});
 document.querySelectorAll('.tab').forEach(function(b,j){b.classList.toggle('active',i===j);});}
function toggleExpand(){_expanded=!_expanded;
 document.querySelectorAll('.ds-panel').forEach(function(p){p.style.display=_expanded?'block':'none';});
 var tabs=document.querySelector('.tabs');if(tabs)tabs.style.display=_expanded?'none':'';
 var b=document.getElementById('expandBtn');if(b)b.textContent=_expanded?'Tabbed view':'Expand all datasets';
 if(!_expanded)showTab(_activeTab);}
function openTab(e,i){if(e)e.preventDefault();
 if(_expanded){var p=document.querySelectorAll('.ds-panel')[i];if(p)p.scrollIntoView({behavior:'smooth'});}
 else{showTab(i);var d=document.getElementById('datasets');if(d)d.scrollIntoView({behavior:'smooth'});}}
function copyVarLink(e,name){if(e)e.preventDefault();
 var url=location.href.split('#')[0]+'#var-'+name;
 try{history.replaceState(null,'','#var-'+name);}catch(_){}
 navigator.clipboard.writeText(url).then(function(){var t=e.target,o=t.textContent;
  t.textContent='✓';setTimeout(function(){t.textContent=o;},1200);});}
function toggleTheme(){var d=document.documentElement,t=(d.dataset.theme==='dark')?'light':'dark';
 d.dataset.theme=t;try{localStorage.setItem('dd-theme',t);}catch(_){}setThemeIcon(t);}
function setThemeIcon(t){var b=document.getElementById('themeToggle');
 if(b){b.textContent=(t==='dark'?'☀ Light':'☾ Dark');}}
var _chip='all';
function setChip(b){_chip=b.getAttribute('data-k');
 document.querySelectorAll('.chip').forEach(function(c){c.classList.toggle('active',c===b);});filterVars();}
function filterVars(){var q=(document.getElementById('varSearch').value||'').toLowerCase();
 var rows=document.querySelectorAll('#varTable tbody tr');var s=0;
 rows.forEach(function(r){var nm=r.getAttribute('data-name'),lb=r.getAttribute('data-label'),k=r.getAttribute('data-kind');
  var okT=(!q||nm.indexOf(q)>-1||lb.indexOf(q)>-1),okK=(_chip==='all'||k===_chip);
  var v=okT&&okK;r.style.display=v?'':'none';if(v)s++;});
 var el=document.getElementById('varCount');if(el)el.textContent=s+' variable'+(s===1?'':'s')+' shown';}
function _num(v){var x=parseFloat(String(v).replace(/[,%$]/g,''));return isNaN(x)?null:x;}
document.addEventListener('click',function(e){var th=e.target.closest('table.sortable th');if(!th)return;
 if(th.classList.contains('nosort'))return;
 var tbl=th.closest('table'),idx=Array.prototype.indexOf.call(th.parentNode.children,th);
 var tb=tbl.querySelector('tbody'),rows=Array.prototype.slice.call(tb.querySelectorAll('tr'));
 var asc=!(th.getAttribute('data-asc')==='1');th.setAttribute('data-asc',asc?'1':'0');
 rows.sort(function(a,b){var x=a.children[idx].innerText.trim(),y=b.children[idx].innerText.trim();
  var nx=_num(x),ny=_num(y);if(nx!==null&&ny!==null)return asc?nx-ny:ny-nx;
  return asc?x.localeCompare(y):y.localeCompare(x);});rows.forEach(function(r){tb.appendChild(r);});});
document.addEventListener('DOMContentLoaded',function(){
 if(document.getElementById('varSearch'))filterVars();
 showTab(0);
 setThemeIcon(document.documentElement.dataset.theme||'light');
 var links={};document.querySelectorAll('nav.toc a').forEach(function(a){links[a.getAttribute('href')]=a;});
 if(window.IntersectionObserver){
  var obs=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){
   var id='#'+en.target.id;for(var k in links)links[k].classList.remove('active');
   if(links[id])links[id].classList.add('active');}});},{rootMargin:'-45% 0px -50% 0px'});
  document.querySelectorAll('main section[id]').forEach(function(s){obs.observe(s);});}
 if(location.hash.indexOf('#var-')===0){var r=document.getElementById(location.hash.slice(1));
  if(r)setTimeout(function(){r.scrollIntoView({block:'center'});},60);}
});
"""


def md_table(header, rows):
    out = ["| " + " | ".join(header) + " |", "|" + "|".join(["---"] * len(header)) + "|"]
    for r in rows:
        out.append("| " + " | ".join(str(c) for c in r) + " |")
    return "\n".join(out)


# ======================================================================================
# Citations
# ======================================================================================
def apa_name(a):
    a = (a or "").strip()
    if "," in a:
        last, first = a.split(",", 1)
        inits = " ".join(p.strip()[0] + "." for p in first.replace(".", " ").split() if p.strip())
        return f"{last.strip()}, {inits}".strip().rstrip(",")
    return a


def auto_apa(cit):
    nm = apa_name(cit.get("author", ""))
    t = cit.get("title") or STUDY_TITLE
    main = f"{nm} ({cit.get('year', '')}). {t} [Data set]. {SITE_POST}".strip()
    parts = [main]
    if cit.get("extra_apa"):
        parts.append(str(cit["extra_apa"]).strip())
    return "\n\n".join(p for p in parts if p)


def auto_bibtex(cit):
    key = re.sub(r"[^a-z0-9]", "",
                 (str(cit.get("author", "")).split(",")[0] + str(cit.get("year", "")) + SLUG).lower())[:48] or "dataset"
    t = cit.get("title") or STUDY_TITLE
    main = ("@misc{" + key + ",\n"
            "  author       = {" + str(cit.get("author", "")) + "},\n"
            "  title        = {" + t + "},\n"
            "  year         = {" + str(cit.get("year", "")) + "},\n"
            "  howpublished = {\\url{" + SITE_POST + "}},\n"
            "  note         = {Data set}\n"
            "}")
    extra = str(cit.get("extra_bibtex", "")).strip()
    return main + ("\n\n" + extra if extra else "")


# ======================================================================================
# Per-dataset panel + variable explorer
# ======================================================================================
def _dataset_panel(base, df, cms, fm):
    dict_rows, stat_rows = [], []
    for c in df.columns:
        m = cms[c]
        dict_rows.append([f"<code>{h(c)}</code> {type_badge(m['kind'])}",
                          m["label"], m["defn"], m["constr"], m["units"], m["source"], m["cov"]])
        cells = stat_cells(df[c], m["kind"])
        stat_rows.append([f"<code>{h(c)}</code>", sparkline_svg(df[c], m["kind"]), missing_bar(df[c]),
                          cells[0], cells[2], cells[3], cells[4], cells[5], cells[6], cells[7]])
    dict_tbl = html_table(["Variable", "Label", "Definition", "Construction", "Units", "Source", "Coverage"],
                          dict_rows, raw_cols={0})
    stat_tbl = html_table(["Variable", "Distribution", "Coverage", "N", "Distinct",
                           "Min", "Mean", "Median", "Max", "SD"],
                          stat_rows, raw_cols={0, 1, 2}, sortable=True, nosort_cols={1, 2})
    meta_bits = [f'<span class="badge b-frame">{h(fm["grain"])}</span> &nbsp;'
                 f'{df.shape[0]:,} &times; {df.shape[1]}']
    if fm["years"]:
        meta_bits.append(h(fm["years"]))
    if fm["units_cov"]:
        meta_bits.append(h(fm["units_cov"]))
    key_bits = []
    if fm["key"]:
        key_bits.append(f'Panel key: <code>{h(fm["key"])}</code>')
    if fm["purpose"]:
        key_bits.append(h(fm["purpose"]))
    key_line = (f'<p class="meta">{" &middot; ".join(key_bits)}</p>') if key_bits else ""
    return (f'<div class="ds-panel" id="ds-{h(base)}">'
            f'<p class="meta">{" &middot; ".join(meta_bits)}</p>{key_line}'
            f'<h4>Variable dictionary</h4>{dict_tbl}'
            f'<h4>Distribution &amp; statistics <span style="font-weight:400;color:#6b6f76">'
            f'(click a header to sort)</span></h4>{stat_tbl}</div>')


def _explorer(order, frames, cms_all):
    file_idx = {b: i for i, b in enumerate(order)}
    var_files, sample, vmeta = {}, {}, {}
    for b in order:
        for c in frames[b].columns:
            var_files.setdefault(c, []).append(b)
            sample.setdefault(c, frames[b][c])
            vmeta.setdefault(c, cms_all[b][c])
    rows = []
    for c in sorted(var_files):
        m = vmeta[c]
        k = _TYPE_FILTER[m["kind"]]
        files = ", ".join(f'<a href="#datasets" onclick="openTab(event,{file_idx[b]})">{h(b)}</a>'
                          for b in var_files[c])
        rows.append(
            f'<tr id="var-{h(c)}" data-name="{h(c.lower())}" data-label="{h(m["label"].lower())}" '
            f'data-kind="{k}">'
            f'<td><code>{h(c)}</code>'
            f'<a class="vlink" href="#var-{h(c)}" title="Copy link to this variable" '
            f'onclick="copyVarLink(event,\'{h(c)}\')">#</a></td>'
            f'<td>{type_badge(m["kind"])}</td>'
            f'<td>{sparkline_svg(sample[c], m["kind"])}</td>'
            f'<td>{h(m["label"])}</td><td>{h(m["defn"])}</td>'
            f'<td>{h(m["units"])}</td><td>{files}</td>'
            f'<td>{h(m["source"])}</td></tr>')
    controls = ('<div class="explorer-controls">'
                '<input id="varSearch" type="search" oninput="filterVars()" '
                'placeholder="Search variables by name or label..." aria-label="Search variables">'
                '<div class="chips">'
                '<button class="chip active" data-k="all" onclick="setChip(this)">All</button>'
                '<button class="chip" data-k="cont" onclick="setChip(this)">Continuous</button>'
                '<button class="chip" data-k="dummy" onclick="setChip(this)">Dummy</button>'
                '<button class="chip" data-k="id" onclick="setChip(this)">Identifier</button>'
                '</div><span id="varCount" class="varcount"></span></div>')
    table = ('<div class="tbl-wrap tall"><table id="varTable" class="sortable"><thead><tr>'
             '<th>Variable</th><th>Type</th><th class="nosort">Distribution</th><th>Label</th>'
             '<th>Definition</th><th>Units</th><th>In files</th><th>Source</th>'
             '</tr></thead><tbody>' + "".join(rows) + "</tbody></table></div>")
    return controls + table


# ======================================================================================
# Markdown README, Stata .do, ZIP, .dta
# ======================================================================================
def build_readme(order, frames, cms_all, fms, chosen):
    short = {b: b for b in order}
    var_files = {}
    for b in order:
        for c in frames[b].columns:
            var_files.setdefault(c, set()).add(b)
    src_rows = [[h(s.get("name", "")), h(s.get("provides", "")), linkify(s.get("reference", ""))]
                for s in (META.get("sources") or [])]
    parts = [f"# Data dictionary - {STUDY_TITLE}", ""]
    ov = (META.get("study") or {}).get("overview")
    if ov:
        parts += [ov, ""]
    parts += [f"Companion data for the post <{SITE_POST}>. Each dataset ships as a labeled Stata "
              f"`.dta` (v{DTA_FORMAT}) plus its source file. Generated by `{SELF}`.", ""]
    if src_rows:
        parts += ["## Data sources", "", md_table(["Source", "Provides", "Reference / URL"], src_rows), ""]
    # dataset links (raw + view)
    link_rows = []
    for b in order:
        link_rows.append([f"`{b}.dta`", f"[view]({BLOB_BASE}{b}.dta)", f"[raw]({RAW_BASE}{b}.dta)"])
    parts += ["## Dataset links (GitHub)", "",
              md_table(["File", "View on GitHub", "Raw (load / download)"], link_rows), ""]
    parts += ["## Load in code", "",
              "```python", "import pandas as pd",
              f'BASE = "{RAW_BASE}"', f'df = pd.read_stata(BASE + "{order[0]}.dta")', "```", "",
              "## Datasets", "",
              md_table(["File", "Grain", "Rows x Cols", "Purpose"],
                       [[f"`{b}`", fms[b]["grain"], f"{frames[b].shape[0]:,} x {frames[b].shape[1]}",
                         fms[b]["purpose"]] for b in order]), "",
              "## Cross-file variable index", "",
              md_table(["Variable"] + [short[b] for b in order],
                       [[f"`{c}`"] + ["●" if b in var_files[c] else "" for b in order]
                        for c in sorted(var_files)]), ""]
    for b in order:
        df = frames[b]
        dict_rows = [[f"`{c}`", cms_all[b][c]["label"], cms_all[b][c]["defn"], cms_all[b][c]["constr"],
                      cms_all[b][c]["units"], cms_all[b][c]["source"], cms_all[b][c]["cov"]]
                     for c in df.columns]
        stat_rows = [[f"`{c}`"] + stat_cells(df[c], cms_all[b][c]["kind"]) for c in df.columns]
        parts += [f"### `{b}`", "",
                  md_table(["Variable", "Label", "Definition", "Construction", "Units", "Source", "Coverage"],
                           dict_rows), "",
                  md_table(["Variable", "N", "Miss%", "Distinct", "Min", "Mean", "Median", "Max", "SD"],
                           stat_rows), ""]
    cav = META.get("caveats") or []
    if cav:
        parts += ["## Known limitations & caveats", ""] + [f"- {c}" for c in cav] + [""]
    parts += ["---", "", f"*Generated by `{SELF}`. Stata format: .dta v{DTA_FORMAT}.*", ""]
    return "\n".join(parts)


def build_do(order, frames, cms_all, fms):
    lines = ["* stata_codebook.do - attach long-form notes to the .dta files (run once in Stata).",
             "* Generated by " + SELF + " - do not edit by hand.", ""]
    for b in order:
        lines.append(f'* ---- {b}.dta ----')
        lines.append(f'use "{b}.dta", clear')
        lines.append(f'label data "{ascii_safe(fms[b]["label"])}"')
        if fms[b]["note"]:
            lines.append(f'note _dta: {ascii_safe(fms[b]["note"])}')
        for c in frames[b].columns:
            m = cms_all[b][c]
            bits = [m["defn"]]
            if m["constr"]:
                bits.append("Construction: " + m["constr"])
            if m["units"]:
                bits.append("Units: " + m["units"])
            if m["source"]:
                bits.append("Source: " + m["source"])
            txt = ". ".join(x for x in bits if x).strip() or m["label"]
            lines.append(f'note {c}: {ascii_safe(txt)}')
        lines.append(f'save "{b}.dta", replace')
        lines.append("")
    return "\n".join(lines)


def build_zip(order, chosen):
    out = os.path.join(BASE, ZIP_NAME)
    members = []
    for b in order:
        members.append(b + ".dta")
        src = chosen[b][0]
        if src != b + ".dta":
            members.append(src)
    members += ["README.md", "stata_codebook.do"]
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for fn in members:
            p = os.path.join(BASE, fn)
            if os.path.exists(p):
                z.write(p, arcname=fn)
    return out


def write_dta(base, df, cms):
    labels = [cms[c]["label"] for c in df.columns]
    vvl = {}
    for c in df.columns:
        if cms[c]["value_labels"]:
            vvl[c] = {int(k): v for k, v in cms[c]["value_labels"].items()}
        elif cms[c]["kind"] == "dummy":
            vvl[c] = YESNO
    pyreadstat.write_dta(df, os.path.join(BASE, base + ".dta"), file_label=fms_global[base]["label"],
                         column_labels=labels, version=STATA_VERSION,
                         variable_value_labels=vvl or None)


# ======================================================================================
# The interactive HTML page
# ======================================================================================
def build_html(order, frames, cms_all, fms, chosen):
    all_cols = sorted({c for b in order for c in frames[b].columns})
    total_rows = sum(frames[b].shape[0] for b in order)
    data_points = sum(int(frames[b].notna().sum().sum()) for b in order)
    kdef = [(len(order), "datasets"), (len(all_cols), "variables"),
            (f"{total_rows:,}", "rows"), (f"{data_points:,}", "data points")]
    ky = _study.get("kpis")
    if ky:
        kdef = [(k.get("n"), k.get("l")) if isinstance(k, dict) else tuple(k) for k in ky]
    kpi_html = "".join(f'<div class="kpi"><div class="n">{h(v)}</div><div class="l">{h(l)}</div></div>'
                       for v, l in kdef)

    dl_rows = []
    for b in order:
        df, src = frames[b], chosen[b][0]
        dl_rows.append([f"<code>{h(b)}</code>", h(fms[b]["grain"]),
                        f"{df.shape[0]:,} &times; {df.shape[1]}",
                        f'<a class="btn small" href="{RAW_BASE}{b}.dta" target="_blank" rel="noopener">{b}.dta</a>',
                        f'<a class="btn ghost small" href="{RAW_BASE}{h(src)}" target="_blank" rel="noopener">{h(src)}</a>'])
    dl_tbl = html_table(["Dataset", "Grain", "Rows", "Stata", "Source"], dl_rows, raw_cols={0, 2, 3, 4})

    ex = order[0]
    blist = ", ".join(f'"{b}"' for b in order)
    stata_code = (f'* Stata 14+ : `use` reads an https URL directly\n'
                  f'global BASE "{RAW_BASE}"\n'
                  f'use "${{BASE}}{ex}.dta", clear\n'
                  f'describe\n'
                  f'notes')
    python_code = (f'!pip install -q pyreadstat\n'
                   f'import pandas as pd\n'
                   f'BASE = "{RAW_BASE}"\n'
                   f'df = pd.read_stata(BASE + "{ex}.dta")\n\n'
                   f'# load every dataset at once\n'
                   f'files = [{blist}]\n'
                   f'data = {{f: pd.read_stata(BASE + f + ".dta") for f in files}}\n\n'
                   f'# pyreadstat (richest metadata) reads LOCAL files -> download first\n'
                   f'import pyreadstat, urllib.request\n'
                   f'urllib.request.urlretrieve(BASE + "{ex}.dta", "{ex}.dta")\n'
                   f'df, meta = pyreadstat.read_dta("{ex}.dta")')
    r_code = (f'# R : haven::read_dta auto-downloads an https URL\n'
              f'library(haven)\n'
              f'BASE <- "{RAW_BASE}"\n'
              f'df <- read_dta(paste0(BASE, "{ex}.dta"))')

    var_files = {}
    for b in order:
        for c in frames[b].columns:
            var_files.setdefault(c, set()).add(b)
    matrix_rows = [[f'<a href="#var-{h(c)}"><code>{h(c)}</code></a>']
                   + ["&#9679;" if b in var_files[c] else "" for b in order]
                   for c in sorted(var_files)]
    matrix_tbl = html_table(["Variable"] + [h(b) for b in order], matrix_rows,
                            raw_cols=set(range(len(order) + 1)), tall=True)

    tabs = "".join(f'<button class="tab" onclick="showTab({i})">{h(b)}</button>'
                   for i, b in enumerate(order))
    panels = "".join(_dataset_panel(b, frames[b], cms_all[b], fms[b]) for b in order)

    sources = META.get("sources") or []
    formulas_html = (META.get("study") or {}).get("formulas_html") or META.get("formulas_html") or ""
    caveats = META.get("caveats") or []
    citation = META.get("citation") or {}
    panel_note = (META.get("study") or {}).get("panel_structure") or ""

    sections = []
    # Downloads
    sections.append(("downloads", "Downloads",
        '<section id="downloads"><h2>Downloads</h2>'
        '<p class="lead">Each dataset is available as a labeled Stata <code>.dta</code> and its '
        'source file.</p>'
        f'<p><a class="btn zip" href="{RAW_BASE}{ZIP_NAME}" target="_blank" rel="noopener">'
        '&#8681; Download all data (ZIP)</a>'
        f'<a class="btn ghost" href="{RAW_BASE}stata_codebook.do" target="_blank" rel="noopener">'
        'stata_codebook.do</a></p>'
        f'<div class="dl-grid">{dl_tbl}</div>'
        '<p class="note">Run <code>stata_codebook.do</code> in Stata once to attach long-form '
        'per-variable notes to the <code>.dta</code> files.</p></section>'))
    # Load in code
    sections.append(("load", "Load in code",
        '<section id="load"><h2>Load directly in code</h2>'
        '<p class="lead">Every file loads straight from GitHub (raw URLs). Swap the file name to '
        'load any dataset.</p>'
        "<h3>Stata</h3>" + code_block(stata_code) +
        "<h3>Python</h3>" + code_block(python_code) +
        '<p class="note">Copy and paste this snippet in Google Colab app. '
        '<a href="https://colab.research.google.com/notebooks/empty.ipynb" target="_blank" '
        'rel="noopener">https://colab.research.google.com/notebooks/empty.ipynb</a></p>'
        "<h3>R</h3>" + code_block(r_code) + "</section>"))
    # Overview & sources
    if ov_or_sources := (panel_note or sources or (META.get("study") or {}).get("overview")):
        ov = (META.get("study") or {}).get("overview") or ""
        src_tbl = html_table(["Source", "Provides", "Reference / URL"],
                             [[h(s.get("name", "")), h(s.get("provides", "")), linkify(s.get("reference", ""))]
                              for s in sources], raw_cols={2}) if sources else ""
        ov_html = '<section id="overview"><h2>Overview &amp; sources</h2>'
        if ov:
            ov_html += f'<p class="lead">{ov}</p>'
        if panel_note:
            ov_html += f'<div class="note">{panel_note}</div>'
        if src_tbl:
            ov_html += "<h3>Data sources</h3>" + src_tbl
        ov_html += "</section>"
        sections.append(("overview", "Overview", ov_html))
    # Cite
    if citation:
        apa = citation.get("apa") or auto_apa(citation)
        bibtex = citation.get("bibtex") or auto_bibtex(citation)
        sections.append(("cite", "Cite",
            '<section id="cite"><h2>Cite this data</h2>'
            '<p class="lead">Please cite this dataset as follows.</p>'
            "<h3>APA</h3>" + code_block(apa) + "<h3>BibTeX</h3>" + code_block(bibtex) + "</section>"))
    # Variable explorer
    sections.append(("explorer", "Variable explorer",
        '<section id="explorer"><h2>Variable explorer '
        f'<span class="hint">search &amp; filter all {len(all_cols)} variables</span></h2>'
        '<p class="lead">Type to filter by name or label, or use the chips to filter by type. '
        'Each row shows a mini distribution. Click a header to sort.</p>'
        + _explorer(order, frames, cms_all) + "</section>"))
    # Cross-file index
    sections.append(("index", "Cross-file index",
        '<section id="index"><h2>Cross-file variable index</h2>'
        '<p class="lead">Which file each variable appears in (&#9679; = present).</p>'
        + matrix_tbl + "</section>"))
    # Formulas
    if formulas_html:
        sections.append(("formulas", "Formulas",
            '<section id="formulas"><h2>Construction &amp; formulas</h2>' + formulas_html + "</section>"))
    # Datasets
    sections.append(("datasets", "Datasets",
        '<section id="datasets"><h2>The datasets</h2>'
        '<p class="lead">Switch datasets with the tabs. Each shows the full variable dictionary '
        'plus a sortable statistics table with mini distributions and data coverage.</p>'
        '<p><button id="expandBtn" class="btn ghost small" onclick="toggleExpand()">'
        'Expand all datasets</button> <span class="hint">expand to search (Ctrl/&#8984;+F) or '
        'print across all datasets</span></p>'
        f'<div class="tabs">{tabs}</div>{panels}</section>'))
    # Caveats
    if caveats:
        sections.append(("caveats", "Caveats",
            '<section id="caveats"><h2>Known limitations &amp; caveats</h2>'
            '<ul class="tight">' + "".join(f"<li>{c}</li>" for c in caveats) + "</ul></section>"))

    nav = "".join(f'<a href="#{sid}">{h(label)}</a>' for sid, label, _ in sections)
    body = "".join(html_ for _, _, html_ in sections)
    out = [
        "<!doctype html>", '<html lang="en"><head>', '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        '<script>(function(){try{var t=localStorage.getItem("dd-theme");'
        'if(!t)t=(window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light";'
        'document.documentElement.dataset.theme=t;}catch(e){}})();</script>',
        f"<title>Data dictionary &middot; {h(STUDY_TITLE)}</title>",
        f'<meta name="description" content="Interactive data dictionary for {h(STUDY_TITLE)}.">',
        f"<style>{_PAGE_CSS}</style>", "</head><body>",
        '<header class="hero"><div class="wrap">',
        f'<a class="back" href="{SITE_POST}">&larr; Back to the post</a>',
        '<div class="kicker">Interactive data dictionary</div>',
        f"<h1>{h(STUDY_TITLE)}</h1>",
        (f'<p class="sub">{h(STUDY_SUB)}</p>' if STUDY_SUB else ""),
        f'<div class="kpis">{kpi_html}</div>', "</div></header>",
        '<nav class="toc"><div class="wrap">', nav,
        '<button id="themeToggle" onclick="toggleTheme()" aria-label="Toggle dark mode">'
        '&#9790; Dark</button>',
        "</div></nav>", '<main class="wrap">', body, "</main>",
        f'<footer class="wrap">Generated by <code>{SELF}</code> &middot; Stata format '
        f'<code>.dta</code> v{DTA_FORMAT} &middot; <a href="{SITE_POST}">Back to the post</a></footer>',
        f"<script>{_PAGE_JS}</script>", "</body></html>",
    ]
    return "\n".join(out)


# resolved file-meta cache for write_dta (set in main)
fms_global = {}


def main():
    order, chosen = discover()
    if not order:
        raise SystemExit(f"No data files ({'/'.join(DATA_EXTS)}) found in {BASE}")
    print(f"Post: {SLUG}  |  datasets: {len(order)}  |  raw base: {RAW_BASE}")
    frames, cms_all, fms = {}, {}, {}
    for b in order:
        src, ext = chosen[b]
        df, dta_labels = load_frame(src, ext)
        frames[b] = df
        cms_all[b] = {c: col_meta(c, df[c], dta_labels.get(c, "")) for c in df.columns}
        fms[b] = file_meta(b, src)
        print(f"  {b}: {df.shape[0]:,} x {df.shape[1]}  (from {src})")
    fms_global.update(fms)
    for b in order:
        write_dta(b, frames[b], cms_all[b])
    with open(os.path.join(BASE, "README.md"), "w") as f:
        f.write(build_readme(order, frames, cms_all, fms, chosen))
    with open(os.path.join(BASE, "stata_codebook.do"), "w") as f:
        f.write(build_do(order, frames, cms_all, fms))
    build_zip(order, chosen)
    with open(os.path.join(BASE, "index.html"), "w") as f:
        f.write(build_html(order, frames, cms_all, fms, chosen))
    print(f"  wrote: {len(order)} .dta, README.md, stata_codebook.do, {ZIP_NAME}, index.html")

    # self-check: re-read each .dta, confirm shape + release
    for b in order:
        path = os.path.join(BASE, b + ".dta")
        rdf, m = pyreadstat.read_dta(path)
        assert rdf.shape == frames[b].shape, f"{b}: shape mismatch"
        with open(path, "rb") as fh:
            rel = int(fh.read(80).split(b"<release>")[1].split(b"</release>")[0])
        assert rel == DTA_FORMAT, f"{b}: .dta release {rel} != {DTA_FORMAT}"
    print(f"  verified {len(order)} .dta at release {DTA_FORMAT}.")


if __name__ == "__main__":
    main()
