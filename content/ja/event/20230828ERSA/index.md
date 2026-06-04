---
title: "宇宙から経済活動を探る"
subtitle: "衛星夜間光の処理と分析のためのPythonノートブック"
event: 第62回欧州地域科学協会大会（ERSA）
event_url: https://ersa.eventsair.com/ersa2023
location: スペイン、アリカンテおよびオンライン
summary:  第62回欧州地域科学協会大会（ERSA）
abstract: "夜間光（NTL）データは、国・サブナショナル・スープラナショナルの経済活動をモニタリングするための有用な代理指標として広く認識されています。これらのデータは、GDPのような従来の経済指標と比べて、より高い空間的粒度、適時性、低コスト、そして統計能力や政治的干渉にかかわらず地域間で比較可能であることといった利点を備えています。しかし、こうした利点があるにもかかわらず、地域科学におけるNTLデータの利用は限られてきました。これは一つには、衛星画像を処理・分析するための利用しやすい手法が不足していることに起因します。この問題に対処するため、本論文では、衛星のNTL画像を処理・分析する方法を示す、使いやすい地理計算ノートブックを提示します。まず、ノートブックはラスタ衛星画像を可視化・分析し、表形式データへと変換するためのクラウドベースのPython環境を紹介します。次に、表形式化されたデータの時空間パターンを探索するためのインタラクティブなツールを提示します。最後に、NTLデータの有用性を、横断面予測、時系列予測、地域格差の動学の観点から評価する手法を説明します。"

# Talk start and end times.
#   End time can optionally be hidden by prefixing the line with `#`.
date: "2023-08-28T10:10:00Z"
#date_end: "2030-06-01T15:00:00Z"
all_day: false

# Schedule page publish date (NOT talk date).
publishDate: "2020-12-08T00:00:00Z"

authors: []
tags: []

# Is this a featured talk? (true/false)
featured: false

image:
  caption: ''
  focal_point: Right

links:
url_code: "https://deepnote.com/workspace/QuaRCS-network-d6c6e3f4-7a32-4fcf-a8d6-e77e93ece6d6/project/project2022p-India-NTL-processing-and-analysis-c5f1adf3-3c90-4877-a649-f225aaa8ab7a/notebook/notebook-89b4992feea848ac9d679c9091306a51"
url_pdf: ""
url_slides: "https://www.canva.com/design/DAFq810AJT0/Eb6PqorPetcLxE3P0g34nw/view?utm_content=DAFq810AJT0&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink"
url_video: ""


# Markdown Slides (optional).
#   Associate this talk with Markdown slides.
#   Simply enter your slide deck's filename without extension.
#   E.g. `slides = "example-slides"` references `content/slides/example-slides.md`.
#   Otherwise, set `slides = ""`.
#slides: example

# Projects (optional).
#   Associate this post with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `projects = ["internal-project"]` references `content/project/deep-learning/index.md`.
#   Otherwise, set `projects = []`.
projects:
- spatial
- python

# Enable math on this page?
math: true
---


<div style="position: relative; width: 100%; height: 0; padding-top: 56.2500%;
 padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;
 border-radius: 8px; will-change: transform;">
  <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;"
    src="https:&#x2F;&#x2F;www.canva.com&#x2F;design&#x2F;DAGCpV2wckk&#x2F;ob078h3EKvMp3owtOp68ow&#x2F;view?embed" allowfullscreen="allowfullscreen" allow="fullscreen">
  </iframe>
</div>
<a href="https:&#x2F;&#x2F;www.canva.com&#x2F;design&#x2F;DAGCpV2wckk&#x2F;ob078h3EKvMp3owtOp68ow&#x2F;view?utm_content=DAGCpV2wckk&amp;utm_campaign=designshare&amp;utm_medium=embeds&amp;utm_source=link" target="_blank" rel="noopener">スライド</a> ：カルロス・メンデス

<center>


{{% callout note %}}
計算ノートブックは[こちら](https://deepnote.com/workspace/QuaRCS-network-d6c6e3f4-7a32-4fcf-a8d6-e77e93ece6d6/project/project2022p-India-NTL-processing-and-analysis-c5f1adf3-3c90-4877-a649-f225aaa8ab7a/notebook/notebook-89b4992feea848ac9d679c9091306a51)からアクセスできます。
{{% /callout %}}

</center>
