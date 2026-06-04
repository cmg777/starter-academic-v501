#!/usr/bin/env bash
#
# i18n-parity.sh — report English content that lacks a Spanish (/es/) or
# Japanese (/ja/) counterpart.
#
# The site has no English fallback: a /es/ or /ja/ homepage widget only shows
# items that exist under content/<lang>/<section>/. This script enumerates the
# English item bundles per section and reports, per language, which ones are
# MISSING a counterpart (and, optionally, which are STALE or missing an ASSET).
#
# Usage:
#   scripts/i18n-parity.sh                     # human report, both langs
#   scripts/i18n-parity.sh --lang es           # only Spanish gaps
#   scripts/i18n-parity.sh --section publication
#   scripts/i18n-parity.sh --mode full         # full-translation sections only
#   scripts/i18n-parity.sh --list              # TSV worklist (for backfill)
#   scripts/i18n-parity.sh --stale             # also flag stale (advisory)
#   scripts/i18n-parity.sh --strict-stale      # stale -> non-zero exit
#   scripts/i18n-parity.sh --strict-assets     # missing asset -> non-zero exit
#
# Exit codes: 0 = no gaps; 1 = MISSING gaps; 2 = stale (with --strict-stale);
#             3 = asset gaps (with --strict-assets); 64 = usage error.
#
# Pure filesystem enumeration (+ optional git for staleness). No dependencies
# beyond coreutils + git.

set -u

# --- section configuration: section|index_file|mode|asset_globs -------------
# mode is an intrinsic property of the section in this site (full vs stub card).
SECTION_CONFIG="
publication|index.md|full|featured.* cite.bib
event|index.md|full|featured.*
projects|index.md|full|featured.*
authors|_index.md|full|avatar.*
post|index.md|stub|
slides|index.md|full|
"

# --- singleton pages (not section/item-dir bundles): relpath|asset_globs -----
# Pages that are a single file rather than a directory of items (courses landing
# page, alumni widget page, draft privacy/terms). Each is checked for an es/ja
# counterpart and reported under the pseudo-section "page".
SINGLETON_CONFIG="
courses/_index.md|featured.*
alumni/index.md|
alumni/people.md|
privacy.md|
terms.md|
"

LANGS_ALL="es ja"

FORMAT="human"
FILTER_LANG=""
FILTER_SECTION=""
FILTER_MODE=""
CHECK_STALE=0
STRICT_STALE=0
STRICT_ASSETS=0

usage() {
  sed -n '3,33p' "$0" | sed 's/^# \{0,1\}//'
}

while [ $# -gt 0 ]; do
  case "$1" in
    --list|--format=tsv) FORMAT="tsv" ;;
    --format=human)      FORMAT="human" ;;
    --format=*)          echo "unknown format: ${1#*=}" >&2; exit 64 ;;
    --lang)              shift; FILTER_LANG="${1:-}" ;;
    --lang=*)            FILTER_LANG="${1#*=}" ;;
    --section)           shift; FILTER_SECTION="${1:-}" ;;
    --section=*)         FILTER_SECTION="${1#*=}" ;;
    --mode)              shift; FILTER_MODE="${1:-}" ;;
    --mode=*)            FILTER_MODE="${1#*=}" ;;
    --stale)             CHECK_STALE=1 ;;
    --strict-stale)      CHECK_STALE=1; STRICT_STALE=1 ;;
    --strict-assets)     STRICT_ASSETS=1 ;;
    -h|--help)           usage; exit 0 ;;
    *)                   echo "unknown arg: $1" >&2; usage >&2; exit 64 ;;
  esac
  shift
done

# --- locate repo root (scripts/ is at repo root) ----------------------------
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || { echo "cannot cd to repo root" >&2; exit 64; }
[ -d content ] || { echo "no content/ directory at $ROOT" >&2; exit 64; }

LANGS="$LANGS_ALL"
[ -n "$FILTER_LANG" ] && LANGS="$FILTER_LANG"

# --- helpers ----------------------------------------------------------------

# git commit timestamp of a path (epoch seconds); empty if untracked/no git.
commit_time() {
  git log -1 --format=%ct -- "$1" 2>/dev/null
}

# is the english index newer than the counterpart? (stale)
is_stale() {
  en="$1"; tr="$2"
  et="$(commit_time "$en")"; tt="$(commit_time "$tr")"
  if [ -z "$et" ] || [ -z "$tt" ]; then
    # fall back to filesystem mtime
    et="$(stat -f %m "$en" 2>/dev/null || stat -c %Y "$en" 2>/dev/null || echo 0)"
    tt="$(stat -f %m "$tr" 2>/dev/null || stat -c %Y "$tr" 2>/dev/null || echo 0)"
  fi
  [ "$et" -gt "$tt" ] 2>/dev/null
}

# does a bundle dir contain at least one file matching any of the globs?
has_asset() {
  dir="$1"; shift
  for g in "$@"; do
    for f in "$dir"/$g; do
      [ -e "$f" ] && return 0
    done
  done
  return 1
}

TOTAL_MISSING=0
TOTAL_STALE=0
TOTAL_ASSET=0

# per-section counts are written here from inside the pipe subshell and summed
# back in the parent afterwards ($$ is stable across subshells in bash).
TMP_ACC="${TMPDIR:-/tmp}/i18n_parity_acc.$$"
: > "$TMP_ACC"

[ "$FORMAT" = "human" ] && printf 'i18n parity report — %s\n' "$(date +%Y-%m-%d)"

for lang in $LANGS; do
  lang_missing=0
  [ "$FORMAT" = "human" ] && printf '\n[%s]\n' "$lang"

  printf '%s\n' "$SECTION_CONFIG" | while IFS='|' read -r section index_file mode asset_globs; do
    [ -z "$section" ] && continue
    [ -n "$FILTER_SECTION" ] && [ "$FILTER_SECTION" != "$section" ] && continue
    [ -n "$FILTER_MODE" ] && [ "$FILTER_MODE" != "$mode" ] && continue
    [ -d "content/$section" ] || continue

    total=0; present=0; missing=0; stale=0; asset_warn=0
    missing_list=""
    asset_list=""

    for endir in $(find "content/$section" -mindepth 1 -maxdepth 1 -type d | sort); do
      slug="$(basename "$endir")"
      en_index="$endir/$index_file"
      [ -f "$en_index" ] || continue   # only count real bundles
      total=$((total + 1))
      tgt_dir="content/$lang/$section/$slug"
      tgt_index="$tgt_dir/$index_file"

      if [ ! -f "$tgt_index" ]; then
        missing=$((missing + 1))
        missing_list="$missing_list $slug"
        if [ "$FORMAT" = "tsv" ]; then
          printf '%s\t%s\t%s\t%s\t%s\t%s\n' \
            "$lang" "$section" "$mode" "$slug" "$en_index" "$tgt_index"
        fi
        continue
      fi

      present=$((present + 1))

      # stale check (advisory)
      if [ "$CHECK_STALE" = "1" ]; then
        if is_stale "$en_index" "$tgt_index"; then
          stale=$((stale + 1))
        fi
      fi

      # asset check (full mode only)
      if [ "$mode" = "full" ] && [ -n "$asset_globs" ]; then
        if has_asset "$endir" $asset_globs && ! has_asset "$tgt_dir" $asset_globs; then
          asset_warn=$((asset_warn + 1))
          asset_list="$asset_list $slug"
        fi
      fi
    done

    if [ "$FORMAT" = "human" ]; then
      printf '  %-12s %-5s present %3d / %-3d  missing %3d  stale %3d  asset-warn %3d\n' \
        "$section" "$mode" "$present" "$total" "$missing" "$stale" "$asset_warn"
      if [ "$missing" -gt 0 ]; then
        printf '    MISSING:%s\n' "$missing_list"
      fi
      if [ "$asset_warn" -gt 0 ]; then
        printf '    ASSET-WARN (counterpart exists, asset not copied):%s\n' "$asset_list"
      fi
    fi

    # accumulate to temp file (subshell from the pipe can't mutate parent vars)
    printf '%d %d %d\n' "$missing" "$stale" "$asset_warn" >> "$TMP_ACC"
  done

  # --- singleton pages (courses, alumni, privacy/terms, …) ------------------
  if [ -z "$FILTER_SECTION" ] || [ "$FILTER_SECTION" = "page" ]; then
   if [ -z "$FILTER_MODE" ] || [ "$FILTER_MODE" = "full" ]; then
    printf '%s\n' "$SINGLETON_CONFIG" | while IFS='|' read -r relpath asset_globs; do
      [ -z "$relpath" ] && continue
      en_index="content/$relpath"
      [ -f "$en_index" ] || continue
      tgt_index="content/$lang/$relpath"
      en_dir="content/$(dirname "$relpath")"
      tgt_dir="content/$lang/$(dirname "$relpath")"
      if [ ! -f "$tgt_index" ]; then
        if [ "$FORMAT" = "tsv" ]; then
          printf '%s\t%s\t%s\t%s\t%s\t%s\n' "$lang" "page" "full" "$relpath" "$en_index" "$tgt_index"
        else
          printf '  %-22s page  full  MISSING -> %s\n' "$relpath" "$tgt_index"
        fi
        printf '1 0 0\n' >> "$TMP_ACC"
        continue
      fi
      asw=0
      if [ -n "$asset_globs" ] && has_asset "$en_dir" $asset_globs && ! has_asset "$tgt_dir" $asset_globs; then
        asw=1
        [ "$FORMAT" = "human" ] && printf '  %-22s page  ASSET-WARN (asset not copied)\n' "$relpath"
      fi
      printf '0 0 %d\n' "$asw" >> "$TMP_ACC"
    done
   fi
  fi
done

# --- totals (read back the per-section accumulations) -----------------------
if [ -f "$TMP_ACC" ]; then
  while read -r m s a; do
    TOTAL_MISSING=$((TOTAL_MISSING + m))
    TOTAL_STALE=$((TOTAL_STALE + s))
    TOTAL_ASSET=$((TOTAL_ASSET + a))
  done < "$TMP_ACC"
  rm -f "$TMP_ACC"
fi

if [ "$FORMAT" = "human" ]; then
  printf '\nSUMMARY  missing: %d   stale: %d   asset-warn: %d\n' \
    "$TOTAL_MISSING" "$TOTAL_STALE" "$TOTAL_ASSET"
fi

# --- exit code --------------------------------------------------------------
if [ "$TOTAL_MISSING" -gt 0 ]; then
  exit 1
elif [ "$STRICT_STALE" = "1" ] && [ "$TOTAL_STALE" -gt 0 ]; then
  exit 2
elif [ "$STRICT_ASSETS" = "1" ] && [ "$TOTAL_ASSET" -gt 0 ]; then
  exit 3
fi
exit 0
