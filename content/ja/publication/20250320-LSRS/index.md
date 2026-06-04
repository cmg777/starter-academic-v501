---
title: "リモートセンシングデータによるベトナムのサブナショナルGDPの予測：機械学習アプローチ"
authors:
- Hussein Suleiman
- Minh-Thu Thi Nguyen
- admin


date: "2025-03-20T00:00:00Z"
doi: "10.1007/s12076-025-00397-z"

# Schedule page publish date (NOT publication's date).
publishDate: "2025-03-20T00:00:00Z"

# Publication type.
# Legend: 0 = Uncategorized; 1 = Conference paper; 2 = Journal article;
# 3 = Preprint / Working Paper; 4 = Report; 5 = Book; 6 = Book section;
# 7 = Thesis; 8 = Patent
publication_types: ["2"]

# Publication name and optional abbreviated publication name.
publication: "*Letters in Spatial and Resource Sciences*"
publication_short: ""

abstract: "ベトナムの公式なサブナショナル国内総生産（GDP）データは2010年以降にしか利用できず、地域開発の長期的な動態の分析を妨げてきました。本研究では、リモートセンシングデータと機械学習の手法に基づき、ベトナムの63の省について1992年から2009年までのサブナショナルGDP指標を構築します。具体的には、夜間光（NTL）、農地、気候の各データセットに依拠し、6つの機械学習アルゴリズムを用いてGDPデータセットを構築します。複数の機械学習アルゴリズムの精度を比較し、2つの夜間光データセットを用いて、最も性能の高いアルゴリズムによる予測サブナショナルGDPを比較します。両方のデータセットで一貫した予測が得られることを示し、より長い時間的範囲を持つ夜間光データを用いてサブナショナルGDPデータセットを構築します。この新しいデータセットにより、研究者と政策担当者はベトナムのサブナショナル・レベルで長期的な経済動向を分析できるようになり、歴史的な経済データにおける重大な空白を埋めることができます。"

# Summary. An optional shortened abstract.
summary: "本研究は、夜間光、農地、気候のデータを機械学習の手法を通じて統合することで、ベトナムの新しいサブナショナルGDPデータセットを構築します。"

tags:
- satellite data
- subnational GDP
- Vietnam


featured: false

# Icons: https://fontawesome.com/search
links:
  #- name: "AI Video"
  #  url: "https://youtu.be/srNtOUf_e_w?si=ccLDJ7WWtafc6Gag"
  #  icon_pack: fab
  #  icon: youtube
  - name: "AIポッドキャスト"
    url: "https://on.soundcloud.com/J3ZaFc9kGWYcN5cF9"
    icon_pack: fas
    icon: headphones
  #- name: "AI Mindmap"
  #  url: "https://mapify.so/share-link/fGCoa7QgaP"
  #  icon_pack: fas
  #  icon: brain
  - name: "オープンアクセス論文"
    url: "https://doi.org/10.1007/s12076-025-00397-z"
    icon_pack: fas
    icon: university


#url_pdf: 'https://link.springer.com/article/10.1007/s12076-024-00375-x'
#url_preprint: "https://www.overleaf.com/read/bzqgsrrmbbhc#9f94fc"
url_code: ''
url_dataset: ''
url_poster: ''
url_project: ''
url_slides: ''
url_source: ''
url_video: ''

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder.
image:
  caption: ''
  focal_point: ""
  preview_only: false

# Associated Projects (optional).
#   Associate this publication with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `internal-project` references `content/project/internal-project/index.md`.
#   Otherwise, set `projects: []`.
#projects: [convergence, clusters]

# Slides (optional).
#   Associate this publication with Markdown slides.
#   Simply enter your slide deck's filename without extension.
#   E.g. `slides: "example"` references `content/slides/example/index.md`.
#   Otherwise, set `slides: ""`.
# slides: example
---

**🤖 AIポッドキャストによる要約**

<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2059684160&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe><div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;"><a href="https://soundcloud.com/user-562952877" title="QuaRCS-lab" target="_blank" style="color: #cccccc; text-decoration: none;">QuaRCS-lab</a> · <a href="https://soundcloud.com/user-562952877/vietnam-subnational-gdp" title="Vietnam Subnational GDP Prediction Using Remote Sensing and Machine Learning" target="_blank" style="color: #cccccc; text-decoration: none;">Vietnam Subnational GDP Prediction Using Remote Sensing and Machine Learning</a></div>


**🛰️ はじめに・背景**
- 課題：2010年以前のベトナムにおけるサブナショナルGDPデータの不足
- 必要性：経済開発分析のための長期データ
- 解決策：リモートセンシングと機械学習を用いてGDPを予測する

**🌌 利用したデータ源**
- 公式GDPデータ（2010〜2020年）
- 夜間光（NTL）：ハーモナイズドDMSPおよびVIIRS-likeのデータセット
- 農地データ（ESA）
- 気候データ：気温と降水量（CRU）

**🧠 機械学習アプローチ**
- 比較した6つのアルゴリズム：
  - 人工ニューラルネットワーク（ANN）
  - ランダムフォレスト（RF）
  - サポートベクターマシン（SVM）
  - k近傍法（KNN）
  - リッジ回帰
  - 勾配ブースティング（XGBoost）

**🔦 主要な知見**
- 予測は異なる夜間光データセットの間で一貫していた
- 最終モデルにはリッジ回帰を採用
- 重要な特徴量：気温と農地が夜間光よりも影響力が大きい

**🌍 応用と意義**
- 1992〜2009年のGDPデータを作成
- 地域経済動向の詳細な長期分析を可能にする
- 政策担当者と研究者が地域格差と成長に取り組むのを支援する

**⚠️ 限界**
- リモートセンシングの計測・較正における不一致
- 公式GDPベンチマークへの依存
- 機械学習の手法の解釈可能性の課題

**🚀 今後の研究の方向性**
- 追加のリモートセンシングデータセットの探索
- より広範な社会経済指標の推定
- より大規模なデータセットによるモデルの改善

**🎯 結論**
- 機械学習＋リモートセンシングは、サブナショナルなデータの空白に効果的に対処する
- 新しいデータセットは、根拠に基づいた経済政策の意思決定を支援する
- 他の開発途上国にも応用可能な手法となりうる
