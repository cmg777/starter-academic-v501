---
# Widget「blank」：最近の講演3件を、画像とテキストが交互に並ぶ showcase
# ショートコードで表示します（プロジェクトと同じ）。
# content/home/talks.md の翻訳。
widget: blank

# このウィジェットを有効にする？ true/false
active: true

# このページはセクションを表します。
headless: true

# このセクションが表示される順序。
weight: 30

title: '最近および今後の講演'
subtitle:

design:
  # 全幅の見出しバンド。
  columns: '1'
---

{{< showcase type="event" count="3" browse_url="/event/" browse_label="すべての講演を見る" >}}
