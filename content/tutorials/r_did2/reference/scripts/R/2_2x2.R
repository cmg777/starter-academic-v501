# Clear environment
rm(list = ls())

# load packages
library(tidyverse)
library(kableExtra)
library(modelsummary)
library(did)
library(ggthemes)
library(fixest)

# omit NA from tables
options(knitr.kable.NA = '')

# set ggplot theme
theme_set(
  theme_clean() + 
    theme(plot.background = element_blank(),
          legend.background = element_rect(color = "white"),
          strip.background = element_rect(color = "black"))
)
# set seed for reproducibility
set.seed(20240924)

# set filepath locations for tables and figures
file.loc.tab <- here::here("tables/")
file.loc.fig <- here::here("figures/")

# load cleaned data
mydata <- read_csv(here::here("data", "county_mortality_data.csv")) %>% 
  # make state the abbreviation
  mutate(state = str_sub(county, nchar(county) - 1, nchar(county))) %>%
  # drop DC and pre-2014 adoption states
  filter(!(state %in% c("DC", "DE", "MA", "NY", "VT"))) %>% 
  # drop states that adopt between 2014 and 2019
  filter(yaca == 2014 | is.na(yaca) | yaca > 2019)

# set the covariates that we're going to use.
covs <- c("perc_female","perc_white", "perc_hispanic", "unemp_rate", "poverty_rate", "median_income")

## Clean data and add in covariates
mydata <- mydata %>% 
  # make variables
  mutate(perc_white = population_20_64_white / population_20_64 * 100,
         perc_hispanic = population_20_64_hispanic / population_20_64 * 100,
         perc_female = population_20_64_female/ population_20_64 * 100,
         unemp_rate = unemp_rate * 100,
         median_income = median_income / 1000) %>% 
  # keep just subset of variables that we will use later
  select(state, county, county_code, year, population_20_64, yaca,
         starts_with("perc_"), crude_rate_20_64, all_of(covs))

# keep only counties with full observations for outcome and covariates in 2013 and 2014
mydata <- mydata %>%
  # allow the aca expansion variable to be missing
  drop_na(!yaca) %>%
  group_by(county_code) %>% 
  # need full covariates for 2013 and 2014
  filter(length(which(year == 2013 | year == 2014)) == 2) %>% 
  ungroup()

# finally, keep only counties with full mortality data for 2009 to 2019
mydata <- mydata %>% 
  group_by(county_code) %>% 
  drop_na(crude_rate_20_64) %>% 
  filter(n() == 11)

# make a smaller dataset with only years 2013 and 2014
short_data <- mydata %>% 
  # make a binary variable that identifies ACA expansion and post-years
  mutate(Treat = if_else(yaca == 2014 & !is.na(yaca), 1, 0),
         Post = if_else(year == 2014, 1, 0)) %>% 
  # filter years for just 2013 and 2014
  filter(year %in% c(2013, 2014)) %>% 
  # make a variable with population weight in 2013
  group_by(county_code) %>% 
  mutate(set_wt = population_20_64[which(year == 2013)]) %>% 
  ungroup()
  
# get group means for Table 2
# unweighted expansion pre-reform
T_pre <- short_data %>% 
  filter(Treat == 1 & year == 2013) %>% 
  summarize(mean = mean(crude_rate_20_64)) %>% 
  pull(mean)

# unweighted non-expansion pre-form 
C_pre <- short_data %>% 
  filter(Treat == 0 & year == 2013) %>% 
  summarize(mean = mean(crude_rate_20_64)) %>% 
  pull(mean)

# unweighted expansion post-reform
T_Post <- short_data %>% 
  filter(Treat == 1 & year == 2014) %>% 
  summarize(mean = mean(crude_rate_20_64)) %>% 
  pull(mean)

# unweighted non-expansion post-reform
C_Post <- short_data %>% 
  filter(Treat == 0 & year == 2014) %>% 
  summarize(mean = mean(crude_rate_20_64)) %>% 
  pull(mean)

# get the same group means but this time weighted
T_pre_weight <- short_data %>% 
  filter(Treat == 1 & year == 2013) %>% 
  summarize(mean = weighted.mean(crude_rate_20_64, w = set_wt)) %>% 
  pull(mean)

C_pre_weight <- short_data %>% 
  filter(Treat == 0 & year == 2013) %>% 
  summarize(mean = weighted.mean(crude_rate_20_64, w = set_wt)) %>% 
  pull(mean)

T_Post_weight <- short_data %>% 
  filter(Treat == 1 & year == 2014) %>% 
  summarize(mean = weighted.mean(crude_rate_20_64, w = set_wt)) %>% 
  pull(mean)

C_Post_weight <- short_data %>% 
  filter(Treat == 0 & year == 2014) %>% 
  summarize(mean = weighted.mean(crude_rate_20_64, w = set_wt)) %>% 
  pull(mean)

# function to do a reasonable rounding
g_round <- function(x, k) {format(round(x, k), nsmall = k)}

# make table and export
table <- tribble(
  ~"", ~"Expansion", ~ "No Expansion", ~"Gap/DiD", ~"Expansion", ~"No Expansion", ~"Gap/DiD",
  "2013", as.character(g_round(T_pre, 1)), as.character(g_round(C_pre, 1)), as.character(g_round(T_pre - C_pre, 1)), 
  as.character(g_round(T_pre_weight, 1)), as.character(g_round(C_pre_weight, 1)), as.character(g_round(T_pre_weight - C_pre_weight, 1)),
  "2014", as.character(g_round(T_Post, 1)), as.character(g_round(C_Post, 1)), as.character(g_round(T_Post - C_Post, 1)), 
  as.character(g_round(T_Post_weight, 1)), as.character(g_round(C_Post_weight, 1)), as.character(g_round(T_Post_weight - C_Post_weight, 1)),
  "Trend/DiD", as.character(g_round(T_Post - T_pre, 1)), as.character(g_round(C_Post-C_pre, 1)), 
  as.character(g_round((T_Post - T_pre) - (C_Post-C_pre), 1)),
    as.character(g_round(T_Post_weight - T_pre_weight, 1)), as.character(g_round(C_Post_weight-C_pre_weight, 1)), 
  as.character(g_round((T_Post_weight - T_pre_weight) - (C_Post_weight-C_pre_weight), 1))
) %>% 
  # format table
  kable(
    "latex", 
    align = 'c',
    booktabs = T, 
    escape = F,
    caption = "Simple 2 $\\times$ 2 DiD",
    label = "two_by_two_ex"
    ) %>% 
  kable_styling(latex_options = "hold_position",
                font_size = 12) %>% 
  row_spec(3, color = "BrickRed") %>% 
  column_spec(c(1:3, 5:6), color = "black") %>% 
  row_spec(3, italic = TRUE) %>% 
  column_spec(c(4, 7), italic = TRUE) %>% 
  add_header_above(c(" " = 1, "Unweighted Averages" = 3, "Weighted Averages" = 3))

table <- footnote(table,
                  general = "\\\\vspace{-4ex} \\\\singlespacing \\\\footnotesize{This table reports average county-level 
                  mortality rates (deaths among adults aged 20-64 per 100,000 adults) in 2013 (row 1) and 2014 (row 2) 
                  in states that expanded adult Medicaid eligibility in 2014 (columns 1 and 4) and states that have not expanded 
                  by 2019 (columns 2 and 5). The first three columns present unweighted averages and the second three columns 
                  present population-weighted averages. Columns 1, 2, 4, and 5 in the third row show time trends in mortality 
                  between 2013 and 2014 for each group of states. The first two rows of columns 3 and 6 show the cross-sectional 
                  gap in mortality between expansion and non-expansion states in 2013 and 2014. The entries in bold red text in 
                  row 3 show the simple 2 $\\\\times$ 2 difference-in-differences estimates without weights (column 3) and with them 
                  (column 6)}",
                  footnote_as_chunk = TRUE,
                  escape = FALSE,
                  threeparttable = TRUE,
                  general_title = "")

write_lines(table, paste0(file.loc.tab, "table2_R.tex"))

# show that you can get the same estimates with regression
# make a different short data with long differences in mortality by county and treatment indicators
short_data2 <- short_data %>% 
  group_by(county_code) %>% 
  summarize(state = state[1],
            set_wt = mean(set_wt),
            # long difference between 2014 and 2013 rates
            diff = crude_rate_20_64[which(year == 2014)] - crude_rate_20_64[which(year == 2013)],
            Treat = mean(Treat),
            Post = 1)

# estimate three models without weights. These are Treat*Post with no fixed effects,
# fixed effects + Treat:Post, and then the long difference model with no fixed effects.
mod1 <- feols(crude_rate_20_64 ~ Treat*Post, data = short_data, cluster = ~county_code)
mod2 <- feols(crude_rate_20_64 ~ Treat:Post | county_code + year, data = short_data, cluster = ~county_code)
mod3 <- feols(diff ~ Treat:Post, data = short_data2, cluster = ~county_code)

# estimate the same three three models with weights
mod4 <- feols(crude_rate_20_64 ~ Treat*Post, data = short_data, weights = ~set_wt, cluster = ~county_code)
mod5 <- feols(crude_rate_20_64 ~ Treat:Post | county_code + year, data = short_data, 
              weights = ~set_wt, cluster = ~county_code)
mod6 <- feols(diff ~ Treat:Post, data = short_data2, weights = ~set_wt, cluster = ~county_code)

# this dictionary maps names to labels for the table
dict <- c("crude_rate_20_64" = "Crude Mortality Rate",
         "diff" = "\\Delta",
         "county_code" = "County", 
         "year" = "Year", 
         "Treat" = "Medicaid Expansion")

# output the results for Table 3
etable(mod1, mod2, mod3, mod4, mod5, mod6, dict = dict,
       title = "Regression 2 $\\times$ 2 DiD",
       file = paste0(file.loc.tab, "table3_R.tex"), 
       label = "tab:regdid_2x2", arraystretch = 0.8, adjustbox = 0.8,
       replace = TRUE, digits = "r1", digits.stats = "r3", depvar = FALSE, placement = "!h", fitstat = NA,
       signif.code = NA,
       headers = list("^:_:" = list("Unweighted" = 3, "Weighted" = 3), 
                      "-:_:" = list("Crude Mortality Rate" = 2, "$\\Delta$" = 1,
                                    "Crude Mortality Rate" = 2, "$\\Delta$" = 1)),
       notes = "This table reports the 
                  regression 2 $\\times$ 2 DiD estimate comparing counties that expand Medicaid in 2014 to counties that do 
                  not expand Medicaid by 2019, using only data for the years 2013 and 2014. Columns 1-3 report unweighted regression 
                  results, while columns 4-6 weight by county population aged 20-64 in 2013. Columns 1 and 4 report results from 
                  regressing the crude mortality rate for adults ages 20-64 on indicators for expansion states (Treat) and post-expansion year (Post), 
                  with the DiD estimate being the coefficient on the interaction term. Columns 2 and 5 report the corresponding 
                  results for the interaction term using county and year fixed effects. Finally, Columns 3 and 6 report the results
                  of the long difference in county mortality rates on a treatment indicator. Robust standard errors (in parentheses) are clustered at the county level.",
       coefstat = "se", tpt = TRUE, 
       style.tex = style.tex("aer",
                             yesNo = c('Yes', 'No'),
                             fixef.title = "\\midrule",
                             fixef.where = 'var',
                             stats.title = "\\midrule",
                             tabular = "*"))

# Now, make the covariate balance table (Table 4).
# unweighted - pre
unweighted <- short_data %>% 
  filter(year == 2013) %>% 
  select(Treat, all_of(covs)) %>% 
  group_by(Treat) %>% 
  # get mean and standard deviation
  summarize_all(list(mean, var)) %>%
  # pivot the data longer
  pivot_longer(cols = !Treat, 
               names_to = "variable", 
               values_to = "value") %>% 
  # now make separate columns for treated and untreated
  pivot_wider(names_from = "Treat", 
              values_from = "value",
              names_prefix = "group") %>% 
  # separate mean and standard deviations
  extract(variable, into = c("variable", "fx"), "(.*)_(.*)") %>% 
  pivot_wider(id_cols = variable,
              names_from = fx,
              values_from = c(group0, group1)) %>% 
  # make normalized difference
  mutate(norm_diff = (group1_fn1 - group0_fn1)/sqrt((group1_fn2 + group0_fn2)/2)) %>% 
  select(variable, group0_fn1, group1_fn1, norm_diff)

# make a weighted variance function
wtd.var <- function (x, weights = NULL, normwt = FALSE, na.rm = TRUE, 
                     method = c("unbiased", "ML")) 
{
  method <- match.arg(method)
  if (!length(weights)) {
    if (na.rm) 
      x <- x[!is.na(x)]
    return(var(x))
  }
  if (na.rm) {
    s <- !is.na(x + weights)
    x <- x[s]
    weights <- weights[s]
  }
  if (normwt) 
    weights <- weights * length(x)/sum(weights)
  if (normwt || method == "ML") 
    return(as.numeric(stats::cov.wt(cbind(x), weights, method = method)$cov))
  sw <- sum(weights)
  if (sw <= 1) 
    warning("only one effective observation; variance estimate undefined")
  xbar <- sum(weights * x)/sw
  sum(weights * ((x - xbar)^2))/(sw - 1)
}

# weighted  - pre
weighted <- short_data %>% 
  filter(year == 2013) %>% 
  select(Treat, all_of(covs), set_wt) %>% 
  group_by(Treat) %>% 
  # get mean and standard deviation
  summarize(across(all_of(covs), 
                   list(
                     ~weighted.mean(x = ., w = set_wt),
                     ~wtd.var(x = ., weights = set_wt, normwt = TRUE)))) %>%
  # pivot the data longer
  pivot_longer(cols = !Treat, 
               names_to = "variable", 
               values_to = "value") %>% 
  # now make separate columns for treated and untreated
  pivot_wider(names_from = "Treat", 
              values_from = "value",
              names_prefix = "group") %>% 
  # separate mean and standard deviations
  extract(variable, into = c("variable", "fx"), "(.*)_(.*)") %>% 
  pivot_wider(id_cols = variable,
              names_from = fx,
              values_from = c(group0, group1)) %>% 
  # make normalized difference
  mutate(norm_diff = (group1_1 - group0_1)/sqrt((group1_2 + group0_2)/2)) %>% 
  select(variable, group0_1, group1_1, norm_diff)

# make the top panel (weighted and unweighted Pre)
top_panel <- bind_cols(unweighted, weighted %>% select(-variable))

# make the bottom panel, which is the same thing but with the difference in X between 2014 and 2013.
# unweighted
unweighted <- short_data %>% 
  select(county_code, year, Treat, all_of(covs)) %>% 
  arrange(county_code, year) %>% 
  group_by(county_code, Treat) %>% 
  summarize(
    across(all_of(covs), function(x) x[2] - x[1])
  ) %>% 
  ungroup() %>% 
  select(-county_code) %>% 
  group_by(Treat) %>% 
  # get mean and standard deviation
  summarize_all(list(mean, var)) %>%
  # pivot the data longer
  pivot_longer(cols = !Treat, 
               names_to = "variable", 
               values_to = "value") %>% 
  # now make separate columns for treated and untreated
  pivot_wider(names_from = "Treat", 
              values_from = "value",
              names_prefix = "group") %>% 
  # separate mean and standard deviations
  extract(variable, into = c("variable", "fx"), "(.*)_(.*)") %>% 
  pivot_wider(id_cols = variable,
              names_from = fx,
              values_from = c(group0, group1)) %>% 
  # make normalized difference
  mutate(norm_diff = (group1_fn1 - group0_fn1)/sqrt((group1_fn2 + group0_fn2)/2)) %>% 
  select(variable, group0_fn1, group1_fn1, norm_diff)

# weighted
weighted <- short_data %>% 
  select(county_code, year, Treat, all_of(covs)) %>% 
  arrange(county_code, year) %>% 
  group_by(county_code, Treat) %>% 
  summarize(
    across(all_of(covs), function(x) x[2] - x[1])
  ) %>% 
  ungroup() %>% 
  left_join(short_data %>% filter(year == 2013) %>% select(county_code, set_wt),
            join_by(county_code)) %>% 
  select(-county_code) %>% 
  group_by(Treat) %>%
  # get mean and standard deviation
  summarize(across(all_of(covs), 
                   list(
                     ~weighted.mean(x = ., w = set_wt),
                     ~wtd.var(x = ., weights = set_wt, normwt = TRUE)))) %>%
  # pivot the data longer
  pivot_longer(cols = !Treat, 
               names_to = "variable", 
               values_to = "value") %>% 
  # now make separate columns for treated and untreated
  pivot_wider(names_from = "Treat", 
              values_from = "value",
              names_prefix = "group") %>% 
  # separate mean and standard deviations
  extract(variable, into = c("variable", "fx"), "(.*)_(.*)") %>% 
  pivot_wider(id_cols = variable,
              names_from = fx,
              values_from = c(group0, group1)) %>% 
  # make normalized difference
  mutate(norm_diff = (group1_1 - group0_1)/sqrt((group1_2 + group0_2)/2)) %>% 
  select(variable, group0_1, group1_1, norm_diff)

# make the bottom panel
bottom_panel <- bind_cols(unweighted, weighted %>% select(-variable))

# bind the two panels
table <- bind_rows(top_panel, bottom_panel) %>% 
  # reformat all columns to two digits
  mutate(across(-variable, \(x) scales::comma(x, accuracy = 0.01)))

# format Table 4 and export
latex_table <- table %>% 
  # change column names
  mutate(variable = 
           case_match(variable,
                      "perc_female" ~ "% Female",
                      "perc_white" ~ "% White",
                      "perc_hispanic" ~ "% Hispanic",
                      "unemp_rate" ~ "Unemployment Rate",
                      "poverty_rate" ~ "Poverty Rate",
                      "median_income" ~ "Median Income")) %>% 
  # format latex table
  kable(col.names = c("Variable", "Non-Adopt", "Adopt", "Norm. Diff.", "Non-Adopt", "Adopt", "Norm. Diff."),
        format = "latex",
        align = 'lcccccc',
        escape = T,
        booktabs = T,
        label = "cov_balance",
        caption = "Covariate Balance Statistics",
        linesep = "") %>% 
  kable_styling(latex_options = c("scale_down", "hold_position")) %>% 
  pack_rows("2013 Covariate Levels", 1, 6) %>% 
  pack_rows("2014 - 2013 Covariate Differences", 7, 12) %>% 
  add_header_above(c(" " = 1, "Unweighted" = 3, "Weighted" = 3))

# add footnote
latex_table <- footnote(latex_table,
                  general = "\\\\vspace{-4ex} \\\\singlespacing \\\\footnotesize{This table reports the 
                  covariate balance between adopting and non-adopting states.  In the top panel, we report the averages 
                  and standardized differences of each variable, measured in 2013, by adoption status. All variables are measured in 
                  percentage values, except for median household income, which is measured in thousands of U.S. dollars. In the bottom panel
                  we report the average and standardized differences of the county-level long differences between 2014 and 
                  2013 of each variable. We report both weighted and unweighted measures of the averages to correspond to the different
                  estimation methods of including covariates in a 2 $\\\\times$ 2 setting.}",
                  footnote_as_chunk = TRUE,
                  escape = FALSE,
                  threeparttable = TRUE,
                  general_title = "")

# save table
write_lines(latex_table, paste0(file.loc.tab, "table4_R.tex"))

# make a table that includes the model 1) without covariates, 2) long regression with 
# 2013 covariates values, 3) long regression with *difference* in covariate values.
reg_data_2013 <- short_data %>% 
  # make long diff in y
  group_by(county_code) %>% 
  summarize(long_y = crude_rate_20_64[which(year == 2014)] - crude_rate_20_64[which(year == 2013)]) %>% 
  # merge in 2013 covariates
  left_join(short_data %>% filter(year == 2013) %>% select(county_code, state, Treat, set_wt, all_of(covs)), 
            by = "county_code")

# this dataset has the change in X between 2014 and 2013 as controls
reg_data_change <- short_data %>% 
  # make long diff in y
  group_by(county_code) %>% 
  summarize(long_y = crude_rate_20_64[which(year == 2014)] - crude_rate_20_64[which(year == 2013)]) %>% 
  # merge in change in covariate values
  left_join(short_data %>% 
              group_by(county_code) %>% 
              mutate(set_wt = set_wt[which(year == 2013)]) %>% 
              group_by(county_code, state, Treat, set_wt) %>% 
              summarize(
                across(all_of(covs), function(x) x[which(year == 2014)] - x[which(year == 2013)])
              ), by = "county_code")

# run the six models
# first unweighted - long diff no covs, 2013 covs, then change in covs
mod1 <- feols(long_y ~ Treat, data = reg_data_2013, cluster = ~county_code)
mod2 <- feols(long_y ~ Treat + .[covs], data = reg_data_2013, cluster = ~county_code)
mod3 <- feols(long_y ~ Treat + .[covs], data = reg_data_change, cluster = ~county_code)

# same thing but weighted
mod4 <- feols(long_y ~ Treat, data = reg_data_2013, weights = ~set_wt, cluster = ~county_code)
mod5 <- feols(long_y ~ Treat + .[covs], data = reg_data_2013, weights = ~set_wt, cluster = ~county_code)
mod6 <- feols(long_y ~ Treat + .[covs], data = reg_data_change, weights = ~set_wt, cluster = ~county_code)

# save table 5 with the six model results
etable(mod1, mod2, mod3, mod4, mod5, mod6, dict = dict,
       title = "Regression 2 $\\times$ 2 DiD with Covariates", keep = "%Treat",
       file = paste0(file.loc.tab, "table5_R.tex"), 
       label = "tab:regdid_2x2_covs", arraystretch = 0.8, adjustbox = 0.8,
       replace = TRUE, digits = "r2", digits.stats = "r3", depvar = FALSE, placement = "H", fitstat = NA,
       signif.code = NA,
       headers = list("^:_:" = list("Unweighted" = 3, "Weighted" = 3), 
                      "-:_:" = list("No Covs" = 1, "$X_{i, t = 2013}$" = 1, "$X_{i, t}$" = 1,
                                    "No Covs" = 1, "$X_{i, t = 2013}$" = 1, "$X_{i, t}$" = 1)),
       notes = "This table reports the 
                  regression 2 $\\times$ 2 DiD estimate comparing counties that expand Medicaid in 2014 to counties that do 
                  not expand Medicaid, adjusting for the inclusion of covariates (percent female, percent white, percent hispanic,
                  the unemployment rate, the poverty rate, and median household income). Columns 1-3 report unweighted regression 
                  results, while columns 4-6 weight by county population aged 20-64 in 2013. Columns 1 and 4 report results for 
                  expansion states without covariates, columns 2 and 5 adjust for the baseline levels of the covariates in 2013, 
                  and columns 3 and 6 control for the time-varying covariate values in 2014 and 2013. 
       Robust standard errors (in parentheses) are clustered at the county level.",
       coefstat = "se", tpt = TRUE,
       style.tex = style.tex("aer",
                             yesNo = c('Yes', 'No'),
                             fixef.title = "\\midrule",
                             fixef.where = 'var',
                             stats.title = "\\midrule",
                             tabular = "*"))

## Next we make Table 6 which shows the pscore and outcome models that feed into CS.
# These are done by regressing long y on the covariates for the untreated units (the outcome model)
# and regressing the expansion indicator on the covariates for 2013 data (the propensity model) 
# We do it with and without weights
mod1 <- feols(long_y ~ .[covs], data = reg_data_2013 %>% filter(Treat == 0), cluster = ~county_code)
mod2 <- feglm(Treat ~ .[covs], data = short_data %>% filter(year == 2013), family = "binomial", vcov = "hetero")
mod3 <- feols(long_y ~ .[covs], data = reg_data_2013 %>% filter(Treat == 0), cluster = ~county_code, weights = ~set_wt)
mod4 <- feglm(Treat ~ .[covs], data = short_data %>% filter(year == 2013), family = "binomial", vcov = "hetero", weights = ~set_wt)

# This is the dictionary to map variables to data labels for the table
dict <- c("crude_rate_20_64" = "Crude Mortality Rate",
          "diff" = "\\Delta",
          "county_code" = "County", 
          "year" = "Year", 
          "Treat" = "Medicaid Expansion",
          "perc_female" = "% Female",
          "perc_white" = "% White",
          "perc_hispanic" = "% Hispanic",
          "unemp_rate" = "Unemployment Rate",
          "poverty_rate" = "Poverty Rate",
          "median_income" = "Median Income")

# output the table
etable(mod1, mod2, mod3, mod4,
       title = "Outcome Regression and Propensity Score Models", dict = dict,
       file = paste0(file.loc.tab, "table6_R.tex"), 
       label = "tab:reg_pscore_cs", arraystretch = 0.8, adjustbox = 0.8,
       replace = TRUE, digits = "r2", digits.stats = "r3", depvar = FALSE, placement = "H", fitstat = NA,
       signif.code = NA,
       headers = list("^:_:" = list("Unweighted" = 2, "Weighted" = 2), 
                      "-:_:" = list("Regression" = 1, "Propensity Score" = 1, 
                                    "Regression" = 1, "Propensity Score" = 1)),
       notes = "This table reports the outcome regression propensity score models that enter into the estimator 
       from \\citet{SantAnna2020} and \\citet{Callaway2021}. The first two columns report the results for unweighted regressions and the 
       second two report results from weighted regression models. The regression model predicts changes in the 
       outcome variable (mortality rates) on the 2013 covariate values for just the counties that do not expand 
       Medicaid in 2014. The propensity score model uses data for 2013 and estimates a logit model of an expansion
       indicator variable on the 2013 covariate levels. Robust standard errors (in parentheses) are clustered at the county 
       level for the outcome regression models.",
       coefstat = "se", tpt = TRUE,
       style.tex = style.tex("aer",
                             yesNo = c('Yes', 'No'),
                             fixef.title = "\\midrule",
                             fixef.where = 'var',
                             stats.title = "\\midrule",
                             tabular = "*"))

# finally, get the same estimates using Sant'Anna and Zhao (2020) and Callaway and Sant'Anna (2021) using the 
# three adjustment methods
# You need to reformat the group variable (untreated = 0) and the unit ID variable needs to be numeric
data_cs <- short_data %>% 
  mutate(treat_year = if_else(yaca == 2014 & !is.na(yaca), 2014, 0),
         county_code = as.numeric(county_code))

# create a function to run the CS estimator allowing the 
# estimation method to differ
run_cs <- function(method, wt) {
  
  # estimate the att_gt
  atts <- att_gt(
    yname = "crude_rate_20_64",
    tname = "year",
    idname = "county_code",
    gname = "treat_year",
    xformla =  as.formula(paste("~", paste(covs, collapse = "+"))),
    data = data_cs,
    panel = TRUE,
    control_group = "nevertreated",
    bstrap = TRUE,
    cband = TRUE,
    est_method = method,
    weightsname = wt,
    # faster_mode = TRUE,
    base_period = "universal",
    biters = 25000
  )
  
  # aggregate estimates 
  aggte(atts, na.rm = TRUE, biters = 25000) %>% 
    broom::tidy() %>% 
    filter(group == 2014) %>% 
    mutate(type = method)
  
}

# run it three ways - regression adjustment, IPW, and doubly robust
# these are unweighted
ests <- map_dfr(c("reg", "ipw", "dr"), run_cs, wt = NULL)

# make a table - Panel A is with unweighted models
tablea <- ests %>% 
  # reformat the data
  select(type, estimate, std.error) %>% 
  # format the estimate and std error
  mutate(estimate = scales::number(estimate, accuracy = 0.01),
         std.error = paste0("(", scales::number(std.error, accuracy = 0.01), ")")) %>% 
  # reshape the data
  pivot_longer(cols = -type,
               names_to = "statistic",
               values_to = "value") %>% 
  pivot_wider(id_cols = "statistic",
              names_from = "type",
              values_from = "value") %>% 
  mutate(statistic = if_else(statistic == "estimate", "Medicaid Expansion", " "))

# make weighted results for the three CS models.
ests_w <-  map_dfr(c("reg", "ipw", "dr"), run_cs, wt = "set_wt")

# Panel B is the same thing but with weighted results
tableb <- ests_w %>% 
  select(type, estimate, std.error) %>% 
  mutate(estimate = scales::number(estimate, accuracy = 0.01),
         std.error = paste0("(", scales::number(std.error, accuracy = 0.01), ")")) %>% 
  pivot_longer(cols = -type,
               names_to = "statistic",
               values_to = "value") %>% 
  pivot_wider(id_cols = "statistic",
              names_from = "type",
              values_from = "value") %>% 
  select(reg, ipw, dr)

# Combine Panels A and B together and format the table
table_out <- bind_cols(tablea, tableb) %>% 
  kable(col.names = c(" ", "Regression", "IPW", "Doubly Robust",
                      "Regression", "IPW", "Doubly Robust"),
        format = "latex",
        align = 'lcccccc',
        escape = FALSE,
        booktabs = TRUE,
        label = "2x2_csdid",
        caption = "DiD estimates with covariates",
        linesep = "") %>% 
  kable_styling(latex_options = c("hold_position")) %>% 
  add_header_above(c(" " = 1, "Unweighted" = 3, "Weighted" = 3))

# add footnote
table_out <- footnote(table_out,
                        general = "\\\\vspace{-4ex} \\\\singlespacing \\\\footnotesize{This table reports the 2 $\\\\times$ 2 DiD 
                        estimate comparing counties that expand Medicaid in 2014 to counties that do not expand Medicaid, adjusting for
                        the inclusion of 2013 covariate values using the methodologies discussed in \\\\citet{SantAnna2020} and \\\\citet{Callaway2021}. The first column
                        reports results using regression adjustment, the second column uses inverse probability weighting based on a 
                        propensity score model using the included covariates, and the third column uses the doubly robust combination of 
                        the two approaches. Standard errors (in parentheses) are clustered at the county level.}",
                        footnote_as_chunk = TRUE,
                        escape = FALSE,
                        threeparttable = TRUE,
                        general_title = "")

# save table
write_lines(table_out, paste0(file.loc.tab, "table7_R.tex"))

# Finally, we make Figure 1 which reports the distribution of the propensity scores between 
# expansion and non-expansion counties.
# first add in propensity scores to the data
plot_data <- bind_rows(
  short_data %>% 
    filter(year == 2013) %>% 
    mutate(propensity = predict(mod2, ., type = "response"),
           mod = "Unweighted",
           wt = 1),
  short_data %>% 
    filter(year == 2013) %>% 
    mutate(propensity = predict(mod4, ., type = "response"),
           mod = "Weighted", 
           wt = set_wt)
  )

# plot the propensity score distributions by group
plot_ps <- plot_data %>% 
  mutate(expand = if_else(Treat == 1, "Expansion Counties", "Non-Expansion Counties")) %>% 
  ggplot(aes(x = propensity, y = after_stat(density), group = expand, color = expand, weight = wt)) + 
  geom_histogram(fill = "white", position = "identity", linewidth = 1, alpha = 0.5) + 
  facet_wrap(~mod) + 
  scale_color_brewer(palette = 'Set1') + 
  labs(x = "Propensity Score", y = "Density") + 
  theme(legend.position = 'bottom',
        axis.title.y = element_text(hjust = 0.5, vjust = 0.5, angle = 360),
        strip.text = element_text(size = 14),
        panel.border = element_rect(color = "black", fill = NA, linewidth = 1),
        legend.title = element_blank(),
        axis.title = element_text(size = 12),
        axis.text = element_text(size = 10))

# save the figure 1
ggsave(plot_ps, filename = paste0(file.loc.fig, "figure1_R.pdf"),
       width = 10, height = 4, dpi = 500)
