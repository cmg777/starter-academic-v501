# Balanced Books catalog descriptions

All six books now have one paragraph of exactly three sentences in English, Spanish, and Japanese. Each summary describes the topic, distinctive learning or research features, and value to readers, based on the existing book pages and abstracts. Links, buttons, publication dates, and bodies are unchanged.

This is a catalog copy edit rather than a revision of the underlying books. Existing effective book update dates are preserved explicitly as `lastmod` for entries that previously depended on Git history, so the shared update-date sort keeps its established order with Mastering Causal Metrics first. The existing explicit lastmod of Mastering Causal Metrics is unchanged.

Validation: Hugo 0.111.3 production build passed with only the existing theme deprecation warning; translation parity reports 0 missing/stale items. Browser checks confirmed exactly six books per language, one paragraph and three sentences per description, unchanged ordering, and all five Mastering Causal Metrics buttons. All 12 catalog navigation/overflow checks passed across 360, 390, 768, and 1440px; desktop EN/ES/JA and mobile screenshots were inspected.

Production verification exposed that Hugo 0.111.3 consumes reserved `lastmod` before template Params access and gives Git history precedence. The corrective change uses the non-reserved `book_updated` field in all 18 entries, preserving every timestamp; the catalog reads it explicitly before the existing Git/publication fallback. README and CLAUDE.md now document `book_updated` for future book revisions. Other content date behavior is unchanged.
