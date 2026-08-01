# Data for `r_sc_dsc_sdid` — the Brexit synthetic-control tutorial

Two CSVs, both loadable directly over HTTPS:

```r
base <- "https://raw.githubusercontent.com/cmg777/starter-academic-v501/master/content/post/r_sc_dsc_sdid/"
panel <- read.csv(paste0(base, "brexit_analysis.csv"))
```

## Provenance

Quarterly national accounts for 36 OECD economies, 1960Q1-2020Q4, from the OECD
Economic Outlook (November 2018 vintage, extended). Assembled by Born, Muller,
Schularick and Sedlacek (2019), <https://doi.org/10.1093/ej/uez020>, and
redistributed in the replication package of de Brabander, Juodis and Miyazato
Szini (2025), <https://doi.org/10.1080/07474938.2025.2530649>. These CSVs are a
faithful re-encoding of that package's `brexit_data_raw_eo_nov2018.mat`,
produced by `prepare_data.R` in this directory.

## `brexit_analysis.csv` — the estimation sample

24 countries x 104 quarters (1995Q1-2020Q4) = 2,496 rows. No missing values.

| Column | Type | Definition |
|---|---|---|
| `country` | character | Country name |
| `year` | integer | Calendar year |
| `quarter` | integer | Quarter, 1-4 |
| `quarter_label` | character | e.g. `2016Q3` |
| `date_dec` | numeric | Decimal year: 2016Q3 is `2016.50` |
| `t` | integer | Period index, 1 = 1995Q1 ... 104 = 2020Q4 |
| `unit_id` | integer | Country index, 1-24, alphabetical |
| `log_rgdp` | numeric | **Outcome.** Natural log of real GDP, indexed so each country's 1995 annual average equals 1 |
| `cons_share` | numeric | Real private consumption / real GDP |
| `inv_share` | numeric | Real investment / real GDP |
| `exp_share` | numeric | Real exports / real GDP |
| `imp_share` | numeric | Real imports / real GDP |
| `labprod_growth` | numeric | 100 x quarterly log change in real GDP per worker |
| `emp_pop` | numeric | Total employment / working-age population |
| `is_treated_unit` | integer | 1 for the United Kingdom in every quarter |
| `treated` | integer | 1 for the United Kingdom from 2016Q3 onward (the headline treatment date) |

### The donor pool

Twelve of the original 36 countries are dropped because at least one stored
series is incomplete over the window: Chile, Czech Republic, Denmark, Estonia,
Greece, Israel, Latvia, Lithuania, Mexico, Poland, Slovenia, Turkey. This
reproduces the donor pool of Born et al. (2019). Note that Czech Republic,
Estonia and Israel are excluded only because of a gap in the inflation series,
which no specification in the paper actually uses.

The 24 that remain are Australia, Austria, Belgium, Canada, Finland, France,
Germany, Hungary, Iceland, Ireland, Italy, Japan, Korea, Luxembourg,
Netherlands, New Zealand, Norway, Portugal, Slovak Republic, Spain, Sweden,
Switzerland, **United Kingdom** (treated) and United States. That leaves 23
donors.

### Key dates

| Event | `quarter_label` | `date_dec` | `t` |
|---|---|---|---|
| Sample start | 1995Q1 | 1995.00 | 1 |
| Last pre-treatment quarter, 2016Q2 specification | 2016Q1 | 2016.00 | 85 |
| Treatment quarter, 2016Q2 specification | 2016Q2 | 2016.25 | 86 |
| Treatment quarter, 2016Q3 specification (headline) | 2016Q3 | 2016.50 | 87 |
| First evaluation quarter | 2018Q4 | 2018.75 | 96 |
| Second evaluation quarter | 2019Q4 | 2019.75 | 100 |
| Sample end | 2020Q4 | 2020.75 | 104 |

The referendum was held on 23 June 2016, at the very end of 2016Q2. The paper
dates treatment by the quarter in which the effect materialises, and reports
both 2016Q2 and 2016Q3 because the timing is genuinely ambiguous and because
anticipation cannot be ruled out.

## `brexit_panel_long.csv` — the full tidy panel

All 36 countries, 1960Q1-2020Q4, twelve underlying concepts in long format
(`country`, `year`, `quarter`, `quarter_label`, `date_dec`, `variable`,
`value`), with missing values dropped. Use it to rebuild a different donor
pool, outcome transform or window.

Variables: `real_gdp` (index, 1995 average = 1), `real_gdp_raw`,
`real_con_raw`, `real_inv_raw`, `real_exp_raw`, `real_imp_raw`,
`real_gov_raw`, `tot_emp_raw`, `tot_emp_pc_raw`, `lab_prod_raw`,
`unemp_rate_raw`, `pop_quarterly`. Series suffixed `_raw` are levels in
national currency or persons; coverage before 1995 is uneven.

## Licence and citation

Please cite the original sources when using these files:

> de Brabander, E., Juodis, A., & Miyazato Szini, G. (2025). On the use of
> synthetic difference-in-differences approach with (-out) covariates: The case
> study of Brexit referendum. *Econometric Reviews*, 44(10), 1617-1646.

> Born, B., Muller, G. J., Schularick, M., & Sedlacek, P. (2019). The costs of
> economic nationalism: Evidence from the Brexit experiment. *The Economic
> Journal*, 129(623), 2722-2744.
