r"""Lint the learning-component markup (custom.scss §24) in a post's index.md.

Usage:  python .claude/skills/write-post/scripts/lint_learn_cards.py content/tutorials/<slug>/index.md

Checks, outside code fences: exact class names; <summary> on the line right
after <details>; a blank line after every <summary>...</summary> and after the
predict card's kicker <p>; a blank line before every </details>; the predict
card's </div> directly after its reveal's </details>; no headings, no
concept-pair nesting and no Markdown/backticks/\_ inside cards' <summary>;
every card closed. Exit code 1 if anything is wrong. Contract and rationale:
.claude/docs/learning-components.md.
"""
import re, sys
ALLOWED = {"learn-card predict-card", "learn-card solution-card",
           "learn-card misconception-card", "learn-card proof-card", "learn-card-reveal"}
with open(sys.argv[1], encoding="utf-8") as fh:
    lines = fh.read().split("\n")
problems, depth, in_fence, counts = [], 0, False, {}
def say(i, msg): problems.append(f"line {i + 1}: {msg}")
for i, line in enumerate(lines):
    s = line.strip()
    if s.startswith("```"):
        in_fence = not in_fence
        continue
    if in_fence:
        continue
    nxt = lines[i + 1].strip() if i + 1 < len(lines) else ""
    prev = lines[i - 1].strip() if i > 0 else ""
    m = re.match(r'<(div|details) class="([^"]*learn-card[^"]*)"', s)
    if m:
        cls = m.group(2)
        counts[cls] = counts.get(cls, 0) + 1
        if cls not in ALLOWED:
            say(i, f'unknown class "{cls}"')
        depth += 1
        if m.group(1) == "details" and not nxt.startswith("<summary>"):
            say(i, "<summary> must be the line right after <details>")
    if depth and re.match(r"<summary>.*</summary>$", s):
        if nxt:
            say(i, "blank line required after <summary>...</summary>")
        inner = re.sub(r"<[^>]+>", "", s)
        if "`" in inner or "\\_" in inner or "**" in inner:
            say(i, "Markdown/backticks/\\_ inside <summary> (raw HTML: use <code>)")
    if depth and s.startswith('<p class="learn-card-kicker">') and nxt:
        say(i, "blank line required after the kicker <p>")
    if depth and s == "</details>":
        if prev:
            say(i, "blank line required before </details>")
        depth -= 1
    elif depth and s == "</div>":
        if prev and prev != "</details>":
            say(i, "predict card: </div> must directly follow the reveal's </details>")
        depth -= 1
    if depth and re.match(r"#{1,6} ", s):
        say(i, "heading inside a learn-card")
    if depth and 'class="concept-pair"' in s:
        say(i, "learn-card nested with concept-pair")
if depth:
    problems.append(f"end of file: {depth} learn-card block(s) never closed")
print("cards:", ", ".join(f"{k}={v}" for k, v in sorted(counts.items())) or "none")
print("\n".join(problems) if problems else "OK: no markup problems")
sys.exit(1 if problems else 0)
