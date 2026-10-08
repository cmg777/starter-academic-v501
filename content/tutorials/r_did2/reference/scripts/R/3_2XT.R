# Clear environment
rm(list = ls())

# load packages
library(tidyverse)
library(kableExtra)
library(modelsummary)
library(did)
library(ggthemes)
library(fixest)
library(latex2exp)
library(HonestDiD)
library(here)
library(scales)

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
covs <- c("perc_female","perc_white", "perc_hispanic", 
          "unemp_rate", "poverty_rate", "median_income")

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

# make ACA and post variables, as well as the weighting variable which is the relevant county 
# population in 2013
mydata <- mydata %>% 
  mutate(Treat = if_else(yaca == 2014 & !is.na(yaca), 1, 0),
         Post = if_else(year >= 2014, 1, 0)) %>% 
  group_by(county_code) %>% 
  # make a variable with population weight in 2013
  mutate(set_wt = population_20_64[which(year == 2013)]) %>% 
  ungroup()

# make time series plot
trends_plot <- mydata %>% 
  mutate(expand = if_else(Treat == 1, "Expansion Counties", "Non-Expansion Counties")) %>% 
  # get the weighted averages by expansion type and year
  group_by(expand, year) %>% 
  summarize(mortality = weighted.mean(crude_rate_20_64, set_wt)) %>% 
  # plot
  ggplot(aes(x = year, y = mortality, group = expand, color = expand)) + 
  geom_point(size = 2) + geom_line(linewidth = 1) + 
  geom_vline(xintercept = 2014, linetype = "dashed") + 
  scale_color_brewer(palette = 'Set1') + 
  scale_x_continuous(breaks = 2009:2019) + 
  labs(x = "", y = "Mortality (20-64) \n Per 100,000") + 
  theme(legend.position = 'bottom',
        axis.title.y = element_text(hjust = 0.5, vjust = 0.5, angle = 360),
        strip.text = element_text(size = 14),
        panel.border = element_rect(color = "black", fill = NA, linewidth = 1),
        legend.title = element_blank(),
        axis.title = element_text(size = 12),
        axis.text = element_text(size = 10))

# save Figure 2
ggsave(trends_plot, filename = paste0(file.loc.fig, "figure2_R.pdf"),
       width = 8, height = 5, dpi = 500)

# Make event study plots
# first add in the variables needed to run the CS model - timing group variable (treat_year)
# and county code needs to be numeric
mydata <- mydata %>% 
  mutate(treat_year = if_else(yaca == 2014 & !is.na(yaca), 2014, 0),
         county_code = as.numeric(county_code),
         time_to_treat = if_else(Treat == 1, year - treat_year, 0))

# estimate CS models

# get the individual ATT(g,t) estimates
mod <- did::att_gt(
  yname = "crude_rate_20_64",
  tname = "year",
  idname = "county_code",
  gname = "treat_year",
  xformla =  NULL,
  data = mydata,
  panel = TRUE,
  control_group = "nevertreated",
  bstrap = TRUE,
  cband = TRUE,
  est_method = "reg",
  weightsname = "set_wt",
  base_period = "universal",
  biters = 25000
)

# confirm you get the same with OLS (standard errors differ because of bootstrap only)
cs_out <- mod

ols_out <- feols(crude_rate_20_64 ~ i(time_to_treat, Treat, ref = -1) | county_code + year, 
      data = mydata, 
      cluster = ~county_code, 
      weights = ~set_wt)


# get the Rambachan/Roth confidence interval
# first save our aggregate event study estimates
es <- did::aggte(
  mod,
  type = "dynamic",
  min_e = -5,
  max_e = 0,
  bstrap = TRUE,
  biters = 25000
)

# source the honest_did code made to fit our estimates
source(here::here('scripts/R/5_honestdid.R'))

# get robust CI
robust_ci <- honest_did(es = es, type = "relative_magnitude")$robust_ci

# get the aggregate value for e = 0:5
agg <- mod %>% 
  aggte(type = "dynamic", min_e = 0, max_e = 5,
        bstrap = TRUE, biters = 25000)

# make labels for the estimate, std error, and confidence intervals
label1 <-  paste0("Estimate~(e %in% '{0, 5}')~'='~'", scales::number(agg$overall.att, accuracy = 0.01), "'")

label2 <- paste0("Std. Error = ", scales::number(agg$overall.se, 0.01), " \n",
                 "Conf. Int = [", scales::number(agg$overall.att - 1.96*agg$overall.se, 0.01), ", ", 
                 scales::number(agg$overall.att + 1.96*agg$overall.se, 0.01), "]")

# make event study plot for Figure 3
event_study_plot <- mod %>% 
  # Aggregate in event time ("dynamic")
  aggte(type = "dynamic", biters = 25000) %>% 
  # get the two confidence intervals
  broom::tidy(conf.int = TRUE) %>% 
  # plot
  ggplot(aes(x = event.time, y = estimate)) + 
  geom_linerange(aes(ymin = conf.low, ymax = conf.high), color = "darkred") + 
  geom_linerange(aes(ymin = point.conf.low, ymax = point.conf.high)) + 
  geom_point() + 
  geom_vline(xintercept = -1, linetype = "dashed") + 
  geom_hline(yintercept = 0, linetype = "dashed") + 
  scale_x_continuous(breaks = -5:5) + 
  annotate("text", x = 3, y = 11, label = label1, parse = TRUE) + 
  annotate("text", x = 3, y = 9, label = label2) + 
  labs(x = "Event Time", y = "Treatment Effect \n Mortality Per 100,000") + 
  theme(axis.title.y = element_text(hjust = 0.5, vjust = 0.5, angle = 360),
        strip.text = element_text(size = 14),
        panel.border = element_rect(color = "black", fill = NA, linewidth = 1),
        legend.title = element_blank(),
        axis.title = element_text(size = 12),
        axis.text = element_text(size = 10))

# save Figure 3
ggsave(event_study_plot, filename = paste0(file.loc.fig, "figure3_R.pdf"),
       width = 8, height = 4, dpi = 500)


# Estimate the CS Model 3 ways with the three estimation types
# make a function to run CS, varying the estimation type
run_cs <- function(method) {
  
  # get the ATT(g, t) estimates
  att_gt(
    yname = "crude_rate_20_64",
    tname = "year",
    idname = "county_code",
    gname = "treat_year",
    xformla =  as.formula(paste("~", paste(covs, collapse = "+"))),
    data = mydata,
    panel = TRUE,
    control_group = "nevertreated",
    bstrap = TRUE,
    cband = TRUE,
    est_method = method,
    weightsname = "set_wt",
    base_period = "universal", 
    biters = 25000
  ) %>% 
    # aggregate to event time (dynamic)
    aggte(type = "dynamic", na.rm = TRUE, biters = 25000) %>% 
    broom::tidy(conf.int = TRUE) %>% 
    mutate(type = method)
}

# estimate it for 3 methods 
out <- map_dfr(c("reg", "ipw", "dr"), run_cs)

# make plot for Figure 4 - 2XT Event Study with Covariates
event_study_covs_plot <- out %>% 
  # refactor labels for plot
  mutate(type = case_match(type,
                           "reg" ~ "Regression",
                           "ipw" ~ "IPW",
                           "dr" ~ "Doubly Robust")) %>% 
  mutate(type = factor(type, levels = c("Regression", "IPW", "Doubly Robust"))) %>% 
  # plot the esti mates and confidence intervals
  ggplot(aes(x = event.time, y = estimate)) + 
  geom_linerange(aes(ymin = conf.low, ymax = conf.high), color = "darkred") + 
  geom_linerange(aes(ymin = point.conf.low, ymax = point.conf.high)) + 
  geom_point() + 
  geom_vline(xintercept = -1, linetype = "dashed") + 
  geom_hline(yintercept = 0, linetype = "dashed") + 
  facet_wrap(~type) + 
  scale_x_continuous(breaks = -5:5) + 
  labs(x = "Event Time", y = "Treatment Effect \n Mortality Per 100,000") + 
  theme(axis.title.y = element_text(hjust = 0.5, vjust = 0.5, angle = 360),
        strip.text = element_text(size = 14),
        panel.border = element_rect(color = "black", fill = NA, linewidth = 1),
        legend.title = element_blank(),
        axis.title = element_text(size = 12),
        axis.text = element_text(size = 10))

# save Figure 4
ggsave(event_study_covs_plot, filename = paste0(file.loc.fig, "figure4_R.pdf"),
       width = 10, height = 3, dpi = 500)
