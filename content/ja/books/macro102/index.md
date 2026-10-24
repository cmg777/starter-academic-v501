---
book_format: online
authors:
- admin
# Catalog addition date; the source gives copyright 2026, not a publication day.
date: "2026-10-17T00:00:00Z"
book_updated: "2026-10-24T11:41:23+09:00"
external_link: ""
image:
  caption: ""
  focal_point: Smart
summary: "中級マクロ経済学に対応したPython教材で、経済成長、豊かさの違い、景気循環を探究します。全21章と8つの付録に、実データ、対話型モデル、計算用ノートブック、講義スライドを組み合わせています。パラメータやショックを変え、モデルの予測とデータを比較することで、経済理論を実践的な分析につなげられます。"
tags:
- python
- macroeconomics
- data-science
title: "データサイエンスとマクロ経済モデル"
subtitle: "AIを活用した中級マクロ経済学のためのPython実践ガイド"
links:
  - name: "ウェブサイト"
    url: "https://quarcs-lab.github.io/macro102-hub"
    icon_pack: ai
    icon: open-data
  - name: "書籍"
    url: "https://quarcs-lab.github.io/macro102-site/"
    icon_pack: fas
    icon: book
  - name: "AIポッドキャスト"
    url: "https://quarcs-lab.github.io/macro102-hub/podcasts"
    icon_pack: fas
    icon: headphones
  - name: "データアプリ"
    url: "https://quarcs-lab.github.io/macro102-hub/data-apps.html"
    icon_pack: fas
    icon: chart-bar
  - name: "図表アプリ"
    url: "https://quarcs-lab.github.io/macro102-hub/figure-apps.html"
    icon_pack: fas
    icon: sliders-h
  - name: "Spotify番組"
    url: "https://open.spotify.com/show/5MpdN8gos8te393uEr4ooK"
    icon_pack: fab
    icon: spotify
---

生活水準はなぜ大きく向上したのでしょうか。それでも国によって豊かさに大きな差があるのはなぜでしょうか。景気後退時に生産・失業・インフレはどう変わるのでしょうか。**データサイエンスとマクロ経済モデル**は、実際のデータと操作できるモデルを通して、これらの問いに取り組みます。

**カルロス・メンデス**による本書の原題は *Data Science and Macroeconomic Models: An AI-powered Python companion to intermediate macroeconomics* です。Charles I. Jonesの *Macroeconomics*（2024年）をPythonで学ぶための無料公開のオンライン書籍で、**全21章**は同じ章題・順序を採用しています。さらに、**8つの付録**では実践的な基礎から経済成長、モデル推定の発展的な内容へと進みます。Jonesの教科書で経済的な論拠を学び、対応するノートブックでデータとモデルを自分で探究できます。本書は独自のコードと図を備えた独立した補助教材であり、教科書の著者・出版社との提携や公認はありません。

## 本書の学習サイクル

序文の出発点は、経済の説明をデータに照らして確かめることです。国をまたいで、あるいは長期にわたって繰り返し観察される大まかなパターンは、モデルが説明すべき**定型化された事実**になります。新しいデータが得られたり対象とするサンプルが変わったりすれば、そのパターンも見直せます。

各章は、**データ → 探索 → 定型化された事実 → モデル → データとの比較 → 見直し**という学習サイクルをたどります。前半の3段階では、パターンを発見するためのデータサイエンスの技能を身に付けます。後半では、そのパターンをモデルで説明できるかを検討します。予測とデータが合わなければ、より明確な問いを持ってデータに戻るか、説明を改善するためにモデルに戻ります。

<figure style="width:min(1130px,calc(100vw - 40px));max-width:none;position:relative;left:50%;transform:translateX(-50%);">
  <a href="learning-cycle.svg">
    <img src="learning-cycle.svg" alt="学習サイクル：データ、探索、定型化された事実、モデル、データとの比較、見直し。見直しから、より明確な問いを持ってデータへ戻るか、より良いアイデアを持ってモデルへ戻ります。" width="1130" height="176" loading="lazy" decoding="async" style="width:100%;height:auto;">
  </a>
  <figcaption>序文に掲載された学習サイクルの図です。青はデータサイエンス、緑はマクロ経済モデリングを表します。 <a href="learning-cycle.svg">原寸の図を開く</a>. <a href="https://quarcs-lab.github.io/macro102-site/#the-cycle-of-the-book">出典：本書の序文</a> · CC BY-NC 4.0.</figcaption>
</figure>

モデルが説明できることと、その限界の両方から学びます。例えば、ソロー・モデルは豊かさの違いを説明する手掛かりになり、アイデアの経済学は持続的な成長を扱います。付録Gでは比較から推定へと進み、データを使ってパラメーターを選び、モデルの適合度を評価します。

## 本書でできること

- **データを調べる。** 個々の観測値を確認し、期間を拡大し、国や変数を比較できます。FRED、世界銀行、IMF、OECD、Penn World Tableなどの公開データを使い、付録Bでは自分でデータを取得する方法を学びます。
- **モデルを操作する。** スライダーでパラメーターを変更し、ショックを加え、Pythonで方程式を編集できます。生産と成長、労働市場とインフレ、金融政策、金融危機、国内経済と国際経済のつながりを探究します。
- **論拠とコードを一緒に理解する。** 各章では仮定から予測までモデルを組み立て、図ごとに目的・描画コード・読み取るべき点を示します。「Your turn」の課題ではデータやモデルを変更し、結果を解釈します。
- **AIを批判的に活用する。** AIはコードの説明や修正に役立ちますが、動くプログラムでも経済的な問いを取り違えていることがあります。序文では、出力を確かめ、データから得られる根拠を自分で判断することを勧めています。

## 各章の学び方

1. Jonesの対応する章で経済的な論拠を学んでから、下の章リンクを開き、モデルの概要と対話型の図を探究します。
2. **ノートブック**のリンクからGoogle Colabを開き、**Runtime → Run all**を選びます。コードを実行し、パラメーターを変更し、課題に取り組みます。本編の各章ではローカルへのインストールは必要ありません。
3. 各章の**スライド**を授業や内容の整理・復習に活用できます。下のリンクは実際の講義スライドを開きます。
4. モデルの予測とデータを比較し、何が変化したかを説明します。Pythonが初めてなら付録Aから始め、数学を復習したいときは付録Cを参照してください。

## 各章・計算用ノートブック・スライド

以下の教材は本書の順序に沿っています。**章題はオンラインで読む章本文、Colabは実行できる計算用ノートブック、スライドは講義資料を開きます。**リンク先の教材は英語です。

### 基礎：第1〜2章

マクロ経済学が扱う問いと、経済を測定するための道具から始めます。

| 章 | ノートブック | スライド |
| --- | --- | --- |
| 1. [マクロ経済学入門](https://quarcs-lab.github.io/macro102-site/notebooks/ch01-introduction-to-macroeconomics.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch01-introduction-to-macroeconomics.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/ch01/) |
| 2. [マクロ経済の測定](https://quarcs-lab.github.io/macro102-site/notebooks/ch02-measuring-the-macroeconomy.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch02-measuring-the-macroeconomy.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/ch02/) |


### 長期：第3〜8章

生産、資本蓄積、アイデア、労働市場、インフレを学び、長期的な豊かさを理解します。

| 章 | ノートブック | スライド |
| --- | --- | --- |
| 3. [長期的な経済成長の概観](https://quarcs-lab.github.io/macro102-site/notebooks/ch03-an-overview-of-long-run-economic-growth.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch03-an-overview-of-long-run-economic-growth.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/ch03/) |
| 4. [生産モデル](https://quarcs-lab.github.io/macro102-site/notebooks/ch04-a-model-of-production.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch04-a-model-of-production.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/ch04/) |
| 5. [ソロー成長モデル](https://quarcs-lab.github.io/macro102-site/notebooks/ch05-the-solow-growth-model.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch05-the-solow-growth-model.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/ch05/) |
| 6. [成長とアイデア](https://quarcs-lab.github.io/macro102-site/notebooks/ch06-growth-and-ideas.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch06-growth-and-ideas.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/ch06/) |
| 7. [労働市場・賃金・失業](https://quarcs-lab.github.io/macro102-site/notebooks/ch07-the-labor-market-wages-and-unemployment.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch07-the-labor-market-wages-and-unemployment.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/ch07/) |
| 8. [インフレ](https://quarcs-lab.github.io/macro102-site/notebooks/ch08-inflation.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch08-inflation.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/ch08/) |


### 短期：第9〜15章

IS曲線から動学的確率的一般均衡モデルまで、景気変動・危機・安定化政策を探究します。

| 章 | ノートブック | スライド |
| --- | --- | --- |
| 9. [短期分析への入門](https://quarcs-lab.github.io/macro102-site/notebooks/ch09-an-introduction-to-the-short-run.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch09-an-introduction-to-the-short-run.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/ch09/) |
| 10. [大不況とCOVID-19パンデミック：最初の考察](https://quarcs-lab.github.io/macro102-site/notebooks/ch10-the-great-recession-and-the-covid-19-pandemic-a-first-look.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch10-the-great-recession-and-the-covid-19-pandemic-a-first-look.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/ch10/) |
| 11. [IS曲線](https://quarcs-lab.github.io/macro102-site/notebooks/ch11-the-is-curve.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch11-the-is-curve.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/ch11/) |
| 12. [金融政策とフィリップス曲線](https://quarcs-lab.github.io/macro102-site/notebooks/ch12-monetary-policy-and-the-phillips-curve.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch12-monetary-policy-and-the-phillips-curve.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/ch12/) |
| 13. [安定化政策と総供給・総需要の枠組み](https://quarcs-lab.github.io/macro102-site/notebooks/ch13-stabilization-policy-and-the-as-ad-framework.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch13-stabilization-policy-and-the-as-ad-framework.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/ch13/) |
| 14. [金融危機と短期モデル](https://quarcs-lab.github.io/macro102-site/notebooks/ch14-financial-crises-and-the-short-run-model.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch14-financial-crises-and-the-short-run-model.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/ch14/) |
| 15. [DSGEモデル：景気循環研究の最前線](https://quarcs-lab.github.io/macro102-site/notebooks/ch15-dsge-models-the-frontier-of-business-cycle-research.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch15-dsge-models-the-frontier-of-business-cycle-research.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/ch15/) |


### 応用とミクロ的基礎：第16〜20章

家計や企業の意思決定、政府の政策、貿易、国際金融とモデルを結び付けます。

| 章 | ノートブック | スライド |
| --- | --- | --- |
| 16. [消費](https://quarcs-lab.github.io/macro102-site/notebooks/ch16-consumption.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch16-consumption.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/ch16/) |
| 17. [投資](https://quarcs-lab.github.io/macro102-site/notebooks/ch17-investment.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch17-investment.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/ch17/) |
| 18. [政府とマクロ経済](https://quarcs-lab.github.io/macro102-site/notebooks/ch18-the-government-and-the-macroeconomy.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch18-the-government-and-the-macroeconomy.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/ch18/) |
| 19. [国際貿易](https://quarcs-lab.github.io/macro102-site/notebooks/ch19-international-trade.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch19-international-trade.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/ch19/) |
| 20. [為替レートと国際金融](https://quarcs-lab.github.io/macro102-site/notebooks/ch20-exchange-rates-and-international-finance.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch20-exchange-rates-and-international-finance.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/ch20/) |


### 今後を考える：第21章

マクロ経済学が明らかにしてきたことと、未解決の問いを考えます。

| 章 | ノートブック | スライド |
| --- | --- | --- |
| 21. [おわりに](https://quarcs-lab.github.io/macro102-site/notebooks/ch21-parting-thoughts.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/ch21-parting-thoughts.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/ch21/) |


## 8つの付録：基礎ツール・経済成長・DSGEモデル

付録は、相互に補完する3つの学習経路に沿って並んでいます。

- **基礎ツール（A〜C）。** Colab・Python・データサイエンスのライブラリから始め、マクロ経済データの取得方法を学び、Pythonによる計算を交えて数学を復習します。
- **経済成長（D〜F）。** Penn World Tableを使い、GDP成長や所得格差を資本・労働・生産性の寄与に分解します。収束の指標を使って貧しい国が豊かな国に追い付くかを調べ、人的資本をソロー・モデルに加え、Mankiw・Romer・Weil（1992年）の国際比較分析を再現します。
- **DSGEモデル（G〜H）。** Snowdropでマクロ経済モデルを書き、解き、推定します。付録Gでは米国のデータを用いたIreland（2004年）のニューケインジアン・モデルの最尤推定とベイズ推定を扱います。付録Hでは推定済みのSmets–Woutersモデルを解き、第15章のインパルス応答を再計算します。

付録Bでは追加のデータ用ライブラリを、GとHではSnowdropを、それぞれ最初のコードセルでインストールします。**8つすべての付録に、計算用ノートブックと講義スライドがあります。**

| 章 | ノートブック | スライド |
| --- | --- | --- |
| A. [Google Colab・Pythonプログラミング・データサイエンスのライブラリ](https://quarcs-lab.github.io/macro102-site/notebooks/appA-google-colab-python-and-data-science-libraries.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/appA-google-colab-python-and-data-science-libraries.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/appA/) |
| B. [Pythonによるマクロ経済データの取得](https://quarcs-lab.github.io/macro102-site/notebooks/appB-accessing-macroeconomic-data-with-python.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/appB-accessing-macroeconomic-data-with-python.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/appB/) |
| C. [マクロ経済学のための数学の復習](https://quarcs-lab.github.io/macro102-site/notebooks/appC-math-review-for-macroeconomics.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/appC-math-review-for-macroeconomics.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/appC/) |
| D. [成長会計と発展会計](https://quarcs-lab.github.io/macro102-site/notebooks/appD-growth-and-development-accounting.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/appD-growth-and-development-accounting.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/appD/) |
| E. [各国の経済成長と収束](https://quarcs-lab.github.io/macro102-site/notebooks/appE-growth-and-convergence-across-countries.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/appE-growth-and-convergence-across-countries.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/appE/) |
| F. [拡張ソロー成長モデル](https://quarcs-lab.github.io/macro102-site/notebooks/appF-augmented-solow-growth-model.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/appF-augmented-solow-growth-model.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/appF/) |
| G. [PythonによるDSGEモデリング](https://quarcs-lab.github.io/macro102-site/notebooks/appG-dsge-modeling-with-python.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/appG-dsge-modeling-with-python.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/appG/) |
| H. [SmetsとWoutersのDSGEモデル](https://quarcs-lab.github.io/macro102-site/notebooks/appH-the-dsge-model-of-smets-and-wouters.html) | [Colab](https://colab.research.google.com/github/quarcs-lab/macro102-site/blob/main/notebooks/appH-the-dsge-model-of-smets-and-wouters.ipynb) | [スライド](https://quarcs-lab.github.io/macro102-site/slides/appH/) |


## 対象読者

学部生・大学院生、独学者、経済への応用を探しているデータサイエンスの学習者、Pythonの実践経験を身に付けたい経済学者を対象としています。**プログラミングの経験は必要ありません。**経済成長に関心がある場合は付録D〜Fで学びを深め、G〜Hではマクロ経済モデルとその解法・推定を結び付けられます。

[序文](https://quarcs-lab.github.io/macro102-site/)から始めるか、上の章を選んでください。計算用ノートブックが初めてなら、付録Aが出発点になります。
