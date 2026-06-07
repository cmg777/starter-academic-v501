---
# Widget「blank」：最近のプロジェクト3件を、画像とテキストが交互に並ぶ
# showcase ショートコードで表示し、/projects/ ギャラリーへの「すべての
# プロジェクトを見る」リンクを付けます。content/home/projects.md の翻訳。
widget: blank

# このウィジェットを有効にする？ true/false
active: true

# このページはセクションを表します。
headless: true

# このセクションが表示される順序。
weight: 35

title: プロジェクト
subtitle: ''

design:
  # 全幅の見出しバンド。
  columns: '1'
---

{{< showcase type="project" count="3" browse_url="/projects/" browse_label="すべてのプロジェクトを見る" >}}
