#!/usr/bin/env python3
"""audit-site.py — check a built site (public/) for broken internal references.

What it checks, for every public/**/*.html page:
  * internal href / src / srcset targets exist in public/ (dir/ -> dir/index.html),
    or reach an existing page through public/_redirects + netlify.toml [[redirects]]
    (splats included, up to 4 hops);
  * #anchor links on the same page and into other pages point at an existing id;
  * hreflang language-switch links exist.
With --old-ref it also builds an older commit in a temporary git worktree with the
pinned Hugo and checks that every page URL of that old build still exists or
redirects to an existing page (catches renames/moves without redirects).

Usage (repo root, after a production build):
  "$HOME/Library/Application Support/Hugo/0.111.3/hugo" --gc --minify --buildFuture
  python3 scripts/audit-site.py
  python3 scripts/audit-site.py --old-ref 7ad9d54d      # + redirect check vs that commit
  python3 scripts/audit-site.py --show-redirected       # list links that only work via a redirect

Exit code: 0 clean, 1 reachable problems found, 2 usage/build error.
Known intentional patterns (script-driven hashes, Quarto template partials) are
ignored by default; see IGNORE below and .claude/docs/site-audit.md.
Stdlib only.
"""
import argparse, os, re, shutil, subprocess, sys, tempfile
from collections import defaultdict
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
HUGO = os.path.expanduser("~/Library/Application Support/Hugo/0.111.3/hugo")
HOSTS = {"carlos-mendez.org", "www.carlos-mendez.org", "localhost", "localhost:1313", "localhost:8000"}

# Reported problems matching any of these regexes are expected and skipped:
IGNORE = [
    r"#(podcast-player|video-player)$",          # opened by the page's own script
    r"/web_app/index\.html ?#",                  # web-app tab hashes (JS tabs)
    r"\$deck-author-url\$",                      # Quarto title-slide.html template partial
    r"notebook\.html ?#title:",                  # Quarto front-matter artefact in notebooks
    r"/(es|ja)/presentations/[^/]+/slides/",     # orphan ES/JA deck copies (pages link the EN deck)
    r"/tutorials/r_dynamic_bma2/$",              # unfinished working folder (no index.md)
]


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs, self.ids, self.langs = [], set(), []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.add(a["id"])
        if tag == "a" and a.get("name"):
            self.ids.add(a["name"])
        for k in ("href", "src"):
            if a.get(k):
                self.refs.append((tag, a[k]))
        for part in (a.get("srcset") or "").split(","):
            u = part.strip().split(" ")[0]
            if u:
                self.refs.append((tag, u))
        if tag == "a" and a.get("hreflang") and a.get("href"):
            self.langs.append(a["href"])


def load_rules(pub):
    rules = []
    rp = os.path.join(pub, "_redirects")
    if os.path.isfile(rp):
        for line in open(rp, encoding="utf-8"):
            line = line.strip()
            if line and not line.startswith("#"):
                parts = line.split()
                if len(parts) >= 2:
                    rules.append((parts[0], parts[1]))
    toml = open(os.path.join(ROOT, "netlify.toml"), encoding="utf-8").read()
    for m in re.finditer(r'\[\[redirects\]\]\s*from = "([^"]+)"\s*to = "([^"]+)"', toml):
        rules.append((m.group(1), m.group(2)))
    return rules


class Site:
    def __init__(self, pub):
        self.pub, self.rules = pub, load_rules(pub)

    def exists(self, path):
        p = unquote(path.split("#")[0].split("?")[0])
        fs = os.path.join(self.pub, p.lstrip("/"))
        if p.endswith("/"):
            return os.path.isfile(os.path.join(fs, "index.html"))
        return os.path.isfile(fs) or os.path.isfile(os.path.join(fs, "index.html"))

    def redirect(self, path):
        for f, t in self.rules:  # first match wins (_redirects before netlify.toml)
            if f.endswith("*"):
                if path.lower().startswith(f[:-1].lower()):
                    return t.replace(":splat", path[len(f) - 1:])
            elif path.lower().rstrip("/") == f.lower().rstrip("/"):
                return t
        return None

    def resolve(self, path, hops=0):
        if self.exists(path):
            return path
        if hops > 4:
            return None
        nxt = self.redirect(path.split("#")[0])
        if nxt and urlsplit(nxt).netloc in HOSTS:
            nxt = urlsplit(nxt).path
        return self.resolve(nxt, hops + 1) if nxt else None


def ignored(text):
    return any(re.search(p, text) for p in IGNORE)


def crawl(pub):
    site = Site(pub)
    pages = {}
    for dp, _, fns in os.walk(pub):
        for fn in fns:
            if fn.endswith(".html"):
                full = os.path.join(dp, fn)
                p = Page()
                p.feed(open(full, encoding="utf-8", errors="replace").read())
                pages["/" + os.path.relpath(full, pub)] = p

    broken, via, anchors, langs = (defaultdict(set) for _ in range(4))
    for rel, p in pages.items():
        base = rel.rsplit("/", 1)[0] + "/"
        for tag, u in p.refs:
            if u.startswith(("mailto:", "tel:", "javascript:", "data:", "{{")):
                continue
            if u.startswith("#"):
                if tag == "a" and len(u) > 1 and unquote(u[1:]) not in p.ids and not u.startswith("#fn"):
                    anchors[f"{rel} {u}"].add(rel)
                continue
            s = urlsplit(u)
            if s.scheme in ("http", "https"):
                if s.netloc not in HOSTS:
                    continue
                path = s.path or "/"
            elif s.scheme:
                continue
            else:
                if not s.path:
                    continue
                path = s.path if s.path.startswith("/") else \
                    os.path.normpath(base + s.path) + ("/" if s.path.endswith("/") else "")
            if site.exists(path):
                if s.fragment and tag == "a":
                    tp = path + "index.html" if path.endswith("/") else path
                    tp = tp if tp.endswith(".html") else tp + "/index.html"
                    t = pages.get(tp)
                    if t is not None and unquote(s.fragment) not in t.ids:
                        anchors[f"{tp}#{s.fragment}"].add(rel)
                continue
            r = site.resolve(path)
            (via if r else broken)[path if not r else f"{path} -> {r}"].add(rel)
        for href in p.langs:
            s = urlsplit(href)
            if (not s.netloc or s.netloc in HOSTS) and not site.exists(s.path or "/"):
                langs[href].add(rel)

    def clean(d):
        return {k: v for k, v in d.items() if not ignored(k)}
    return len(pages), clean(broken), via, clean(anchors), clean(langs), site


def old_urls(ref):
    """Build `ref` in a temporary worktree and return its page URLs."""
    tmp = tempfile.mkdtemp(prefix="audit-old-")
    wt, out = os.path.join(tmp, "src"), os.path.join(tmp, "public")
    try:
        subprocess.run(["git", "-C", ROOT, "worktree", "add", "-q", "--detach", wt, ref], check=True)
        r = subprocess.run([HUGO, "--gc", "--minify", "--buildFuture", "-d", out], cwd=wt,
                           capture_output=True, text=True)
        if r.returncode != 0:
            sys.exit(f"audit-site: building {ref} failed:\n{r.stderr[-2000:]}")
        urls = []
        for dp, _, fns in os.walk(out):
            if "index.html" in fns:
                urls.append("/" + os.path.relpath(dp, out).replace(os.sep, "/").strip(".") + "/")
        return sorted(u.replace("//", "/") for u in urls)
    finally:
        subprocess.run(["git", "-C", ROOT, "worktree", "remove", "--force", wt], capture_output=True)
        shutil.rmtree(tmp, ignore_errors=True)


def show(title, d, limit):
    print(f"\n=== {title}: {len(d)}")
    for k in sorted(d, key=lambda k: (-len(d[k]), k))[:limit]:
        src = sorted(d[k])
        print(f"  {k}  <- {len(src)} page(s), e.g. {src[:3]}")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--public", default=os.path.join(ROOT, "public"))
    ap.add_argument("--old-ref", help="git ref of an older version whose URLs must still resolve")
    ap.add_argument("--show-redirected", action="store_true")
    ap.add_argument("--limit", type=int, default=60)
    a = ap.parse_args()
    if not os.path.isdir(a.public):
        print(f"audit-site: {a.public} not found — build the site first")
        sys.exit(2)

    n, broken, via, anchors, langs, site = crawl(a.public)
    print(f"pages parsed: {n}")
    show("BROKEN internal references", broken, a.limit)
    show("Broken anchors", anchors, a.limit)
    show("Broken language-switch links", langs, a.limit)
    print(f"\n(internal links that only work through a redirect: {len(via)})")
    if a.show_redirected:
        show("Links that only work through a redirect", via, a.limit)

    bad_old = []
    if a.old_ref:
        urls = old_urls(a.old_ref)
        bad_old = [u for u in urls if not site.resolve(u)]
        print(f"\n=== Old URLs from {a.old_ref}: {len(urls)} checked, {len(bad_old)} not reachable")
        for u in bad_old[:a.limit]:
            print("  ", u)

    problems = len(broken) + len(anchors) + len(langs) + len(bad_old)
    print("\nRESULT:", "clean" if not problems else f"{problems} problem(s)")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
