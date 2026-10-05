# Data dictionary: Proposition 99 and cigarette sales in 39 US states (synthetic control tutorial)

Proposition 99 raised the cigarette tax in California by 25 cents per pack from January 1989 and funded anti-smoking education. Abadie, Diamond, and Hainmueller (2010), hereafter ADH (2010), evaluate it with a panel of 39 US states from 1970 to 2000. Each row is one state in one year, so the panel has 1,209 rows. California is the treated state, and the other 38 states form the donor pool. The outcome <code>cigsale</code> measures cigarette sales per capita, in packs. Four covariates describe each state: log GDP per capita, the share of the population aged 15–24, the retail price of cigarettes, and beer consumption per capita. The Python tutorial builds a synthetic California from these variables. It estimates that the program reduced sales by 18.98 packs per capita per year over 1989–2000.


This folder holds the companion data for [the post](https://carlos-mendez.org/post/python_sc101/). Each dataset ships as a labeled Stata `.dta` file (format 118) together with its source file. The script `build_data_dictionary.py` writes the `.dta` files, this README, `stata_codebook.do`, the ZIP bundle, and `index.html` from `data_dictionary.yaml` and the data.

## Data sources

| Source | Provides | Reference / URL |
|---|---|---|
| Abadie, Diamond, and Hainmueller (2010) | The case study and the state panel. Appendix A names the original sources: Orzechowski and Walker (2005) for sales and prices, the Bureau of the Census for income and the age share, and the Beer Institute for beer consumption. | Journal of the American Statistical Association, 105(490), 493–505. <a href="https://doi.org/10.1198/jasa.2009.ap08746" target="_blank" rel="noopener">https://doi.org/10.1198/jasa.2009.ap08746</a> |
| QuaRCS-lab data-open | The original Stata file smoking_sc.dta, labeled Tobacco Sales in 39 US States, which the post and its Stata edition load | <a href="https://github.com/quarcs-lab/data-open/raw/master/isds/smoking_sc.dta" target="_blank" rel="noopener">https://github.com/quarcs-lab/data-open/raw/master/isds/smoking_sc.dta</a> |
| This post (CSV copy) | smoking_sc.csv, with the state name as text and the values of the original .dta file at full double precision (89.8 appears as 89.80000305175781). The post loads this copy first and falls back to the original file online. | Mendez, C. (2026). <a href="https://carlos-mendez.org/post/python_sc101/" target="_blank" rel="noopener">https://carlos-mendez.org/post/python_sc101/</a> |

## Dataset links (GitHub)

| File | View on GitHub | Raw (load / download) |
|---|---|---|
| `smoking_sc.dta` | [view](https://github.com/cmg777/starter-academic-v501/blob/master/content/post/python_sc101/data/smoking_sc.dta) | [raw](https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/python_sc101/data/smoking_sc.dta) |

## Load in code

```python
import pandas as pd
BASE = "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/python_sc101/data/"
df = pd.read_stata(BASE + "smoking_sc.dta")
```

## Datasets

| File | Grain | Rows x Cols | Purpose |
|---|---|---|---|
| `smoking_sc` | state × year (balanced panel) | 1,209 x 7 | The post uses this file for every estimate: the baseline fit, the placebo tests, the leave-one-out refits, and the estimator tour. |

## Cross-file variable index

| Variable | smoking_sc |
|---|---|
| `age15to24` | ● |
| `beer` | ● |
| `cigsale` | ● |
| `lnincome` | ● |
| `retprice` | ● |
| `state` | ● |
| `year` | ● |

### `smoking_sc`

| Variable | Label | Definition | Construction | Units | Source | Coverage |
|---|---|---|---|---|---|---|
| `state` | State name (39 US states) | Name of the US state. California is the treated state, and the other 38 states form the donor pool. | The original .dta file stores a numeric code with value labels in alphabetical order (1 = Alabama, 3 = California, 39 = Wyoming). The CSV keeps the label text. |  | ADH (2010), via quarcs-lab/data-open | 39 states in every year |
| `year` | Year (1970–2000) | Calendar year of the observation. Proposition 99 takes effect in 1989, so 1970–1988 is the pre-treatment period and 1989–2000 the post-treatment period. | Stored as a float in the original .dta file and as an integer in the CSV. | calendar year | ADH (2010), via quarcs-lab/data-open | 31 years for every state |
| `cigsale` | Cigarette sales per capita, in packs (outcome) | Annual cigarette sales per capita, in packs, and the outcome of the analysis. The series divides the tax-paid sales of cigarette packs in a state by its population (Appendix A of ADH 2010). | Original .dta label: cigarette sale per capita (in packs). The post compares California with its synthetic control on this variable in every year. | packs per capita (annual) | Orzechowski and Walker (2005), via ADH (2010) and quarcs-lab/data-open | 1970–2000, all 1,209 rows |
| `lnincome` | Log of state GDP per capita (covariate) | Natural logarithm of GDP per capita in the state, as the original .dta label and Table 1 of ADH (2010) describe it. The text and Appendix A of ADH (2010) call it per capita state personal income (logged), converted to 1997 dollars with the Consumer Price Index. | Original .dta label: log state per capita gdp. The post averages it over 1980–1988 as a predictor. | log of 1997 dollars per person | Bureau of the Census, United States Statistical Abstract, via ADH (2010) and quarcs-lab/data-open | 1972–1997 (1,014 of 1,209 rows) |
| `beer` | Beer consumption per capita, in gallons (covariate) | Per capita consumption of malt beverages, in gallons. The data start in 1984, so the 1980–1988 average in the post rests on 1984–1988 alone. | Original .dta label: beer consumption per capita. ADH (2010) also average it over 1984–1988 (notes to Table 1). | gallons per capita | Beer Institute, via ADH (2010) and quarcs-lab/data-open | 1984–1997 (546 of 1,209 rows) |
| `age15to24` | Share of the population aged 15–24, a fraction (covariate) | Share of the state population aged 15 to 24, stored as a fraction between 0.129 and 0.204 (mean 0.175). The original label calls it a percent, and Table 1 of ADH (2010) reports it in percent, so multiply it by 100 to compare. | Original .dta label: percent of state population aged 15-24 years. The post averages it over 1980–1988 as a predictor. | fraction (0–1) | US Census Bureau, via ADH (2010) and quarcs-lab/data-open | 1970–1990 (819 of 1,209 rows) |
| `retprice` | Retail price of cigarettes, in cents per pack (covariate) | Average retail price of a pack of cigarettes, in cents, including state sales taxes where applicable. Appendix A of ADH (2010) converts income to 1997 dollars but mentions no such conversion for this price. | Original .dta label: retail price of cigarettes. The post averages it over 1980–1988 as a predictor. | cents per pack | Orzechowski and Walker (2005), via ADH (2010) and quarcs-lab/data-open | 1970–2000, all 1,209 rows |

| Variable | N | Miss% | Distinct | Min | Mean | Median | Max | SD |
|---|---|---|---|---|---|---|---|---|
| `state` | 1,209 | 0.0 | 39 | n/a | n/a | n/a | n/a | n/a |
| `year` | 1,209 | 0.0 | 31 | 1970 | 1985.0 | 1985 | 2000 | 8.95 |
| `cigsale` | 1,209 | 0.0 | 703 | 40.70 | 118.9 | 116.3 | 296.2 | 32.77 |
| `lnincome` | 1,014 | 16.1 | 1,014 | 9.40 | 9.86 | 9.86 | 10.49 | 0.171 |
| `beer` | 546 | 54.8 | 145 | 2.50 | 23.43 | 23.30 | 40.40 | 4.22 |
| `age15to24` | 819 | 32.3 | 819 | 0.129 | 0.175 | 0.178 | 0.204 | 0.015 |
| `retprice` | 1,209 | 0.0 | 849 | 27.30 | 108.3 | 95.50 | 351.2 | 64.38 |

## Known limitations & caveats

- <strong>The variable <code>lnincome</code> measures GDP, not income.</strong> Despite its name, <code>lnincome</code> is the log of GDP per capita, according to the original label and Table 1 of ADH (2010). The text and Appendix A of the same paper call it per capita state personal income (logged), so the source itself uses both descriptions.
- <strong>The variable <code>age15to24</code> is a share, not a percent.</strong> Its values lie between 0.129 and 0.204, although the original label reads percent. Multiply it by 100 to compare it with the percentages in Table 1 of ADH (2010).
- <strong>Covariate coverage is incomplete.</strong> The variable <code>lnincome</code> covers 1972–1997, <code>beer</code> covers 1984–1997, and <code>age15to24</code> covers 1970–1990. The <code>beer</code> average over 1980–1988 therefore rests on 1984–1988 alone. A fake start in 1984 leaves no beer data in its window of 1980–1983, so that in-time placebo fails in the post.
- <strong>State coding differs across files.</strong> The original .dta file stores <code>state</code> as a numeric code with value labels, and the CSV and the <code>.dta</code> file generated here store the state name as text. In Stata, <code>encode state, generate(state_id)</code> restores the original codes, because <code>encode</code> numbers the names in alphabetical order. California then has code 3, as in the original file.
- <strong>Read the CSV at full precision.</strong> The original file stores every number in single precision, and the CSV writes these exact values as doubles. Some parsers miss the last digits. The default parser of pandas 3.0.1 changes 1,422 of the 4,797 numeric values, and <code>readr::read_csv</code> 2.1.6 changes 771, each by less than 1e-13. The pandas option <code>float_precision="round_trip"</code> recovers the exact values, and <code>load_data()</code> in the post uses it. The functions <code>read.csv</code> in base R and <code>import delimited</code> in Stata 19 also read them exactly.
- <strong>The generated .dta file stores doubles.</strong> The renderer writes every number through pyreadstat as a double, including <code>year</code>, whereas the original file stores floats. The values themselves are identical to those of the original file. In Stata, <code>recast float cigsale lnincome beer age15to24 retprice</code> restores the original storage type without changing any value.
- <strong>Sales come from tax records.</strong> Cigarette sales per capita rest on state tax revenues rather than on surveys of smoking. ADH (2010) note that smuggling across tax jurisdictions affects such data (Section 3.2).
- <strong>A second tax increase in 1999.</strong> Proposition 10 raised the cigarette tax in California by a further 50 cents per pack in January 1999. Sales in California in 1999 and 2000 therefore reflect both measures.

---

*This README was generated by `build_data_dictionary.py`. The Stata files use the `.dta` format 118, which Stata 14 and later can read. To change any text, edit `data_dictionary.yaml` and rerun the script.*
