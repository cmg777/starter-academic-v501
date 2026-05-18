# Clear environment
rm(list = ls())

# load the relevant packages
library(tidyverse)
library(kableExtra)
library(modelsummary)
library(did)
library(ggthemes)
library(fixest)
library(latex2exp)
library(HonestDiD)
library(patchwork)

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
  filter(!(state %in% c("DC", "DE", "MA", "NY", "VT"))) 

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

# make smaller dataset
mydata <- mydata %>% 
  mutate(Treat = if_else(!is.na(yaca) & yaca <= 2019, 1, 0),
         treat_year = if_else(!is.na(yaca) & yaca <= 2019, yaca, 0),
         Post = if_else(year >= 2014, 1, 0)) %>% 
  group_by(county_code) %>% 
  # make a variable with population weight in 2013
  mutate(set_wt = population_20_64[which(year == 2013)]) %>% 
  ungroup()

# make time series plot by timing group (Figure 5)
trends_plot <- mydata %>% 
  # identify the groups
  mutate(treat_year = if_else(treat_year == 0, "Non-Expansion Counties", as.character(treat_year))) %>% 
  # get weighted average mortality by gtiming-group and year
  group_by(treat_year, year) %>% 
  summarize(mortality = weighted.mean(crude_rate_20_64, set_wt)) %>% 
  ggplot(aes(x = year, y = mortality, group = as.factor(treat_year), color = as.factor(treat_year))) + 
  geom_point(size = 2) + geom_line(linewidth = 1) + 
  scale_color_manual(values = c("#7C7189", "#D04E59", "#BC8E7D", "#2F3D70", "#CABEE9")) + 
  scale_x_continuous(breaks = 2009:2019) + 
  labs(x = "", y = "Mortality (20-64) \n Per 100,000") + 
  theme(legend.position = 'bottom',
        axis.title.y = element_text(hjust = 0.5, vjust = 0.5, angle = 360),
        strip.text = element_text(size = 14),
        panel.border = element_rect(color = "black", fill = NA, linewidth = 1),
        legend.title = element_blank(),
        axis.title = element_text(size = 12),
        axis.text = element_text(size = 10))

# save Figure 5
ggsave(trends_plot, filename = paste0(file.loc.fig, "figure5_R.pdf"),
       width = 8, height = 5, dpi = 500)

# reclassify the county code as numeric for Callaway/Sant'Anna
mydata <- mydata %>% 
  mutate(county_code = as.numeric(county_code))

# get the ATT(g,t)'s
mod_no_x <- att_gt(
  yname = "crude_rate_20_64",
  tname = "year",
  idname = "county_code",
  gname = "treat_year",
  xformla =  NULL,
  data = mydata,
  panel = TRUE,
  control_group = "notyettreated",
  bstrap = TRUE,
  biters = 25000,
  cband = TRUE,
  weightsname = "set_wt",
  base_period = "universal"
)

# make plots in calendar time by timing group
plot_attgt <- mod_no_x %>% 
  # get the estimates and confidence intervals
  broom::tidy(conf.int = TRUE) %>% 
  mutate(group = as.character(group)) %>% 
  # plot the estimates and CIs
  ggplot(aes(x = time, y = estimate, color = group)) + 
  geom_point(size = 2) + geom_line(linewidth = 1) + 
  geom_linerange(aes(ymin = conf.low, ymax = conf.high)) + 
  scale_x_continuous(breaks = seq(2009, 2019, by = 2),
                     labels = seq(2009, 2019, by = 2)) + 
  scale_color_manual(values = c("#7C7189", "#D04E59", "#BC8E7D", "#2F3D70")) + 
  geom_vline(aes(xintercept = as.numeric(group) - 1), linetype = "dashed", linewidth = 1) + 
  labs(x = "", y = "Treatment Effect \n Mortality Per 100,000") + 
  facet_wrap(~group) + 
  theme(legend.position = 'bottom',
        axis.title.y = element_text(hjust = 0.5, vjust = 0.5, angle = 360),
        strip.text = element_text(size = 14),
        panel.border = element_rect(color = "black", fill = NA, linewidth = 1),
        legend.title = element_blank(),
        axis.title = element_text(size = 12),
        axis.text = element_text(size = 10))

# Save the ATT(g,t)'s by time (Figure 6)
ggsave(plot_attgt, filename = paste0(file.loc.fig, "figure6_R.pdf"),
       width = 10, height = 6, dpi = 500)

# Make a different plot that reports the ATT(g,t)s in relative time
plot2 <- mod_no_x %>% 
  # get the estimates and CIs
  broom::tidy() %>% 
  # define relative time for each group
  mutate(rel_time = time - group) %>% 
  # plot
  ggplot(aes(x = rel_time, y = estimate, group = as.factor(group), color = as.factor(group))) + 
  geom_point(size = 2) + geom_line(linewidth = 1) + 
  geom_vline(xintercept = -1, linetype = "dashed", linewidth = 1) + 
  scale_color_manual(values = c("#7C7189", "#D04E59", "#BC8E7D", "#2F3D70")) + 
  scale_x_continuous(breaks = -10:5) + 
  labs(x = "", y = "Treatment Effect \n Mortality Per 100,000") + 
  theme(legend.position = 'bottom',
        axis.title.y = element_text(hjust = 0.5, vjust = 0.5, angle = 360),
        strip.text = element_text(size = 14),
        panel.border = element_rect(color = "black", fill = NA, linewidth = 1),
        legend.title = element_blank(),
        axis.title = element_text(size = 12),
        axis.text = element_text(size = 10))

# save the relative time plots (Figure 7)
ggsave(plot2, filename = paste0(file.loc.fig, "figure7_R.pdf"),
       width = 8, height = 4, dpi = 500)

# Make a full -5 to + 5 event study plot for no covariates 
# using Callaway/Sant'Anna with not-yet-treated

# get the aggregate value for e = 0:5
agg <- mod_no_x %>% 
  aggte(type = "dynamic", min_e = 0, max_e = 5,
        bstrap = TRUE, biters = 25000)

# make labels for the estimate, std error, and confidence intervals
label1 <-  paste0("Estimate~(e %in% '{0, 5}')~'='~'", 
                  scales::number(agg$overall.att, accuracy = 0.01), "'")

label2 <- paste0("Std. Error = ", scales::number(agg$overall.se, 0.01), " \n",
                 "Conf. Int = [", scales::number(agg$overall.att - 1.96*agg$overall.se, 0.01), ", ", 
                 scales::number(agg$overall.att + 1.96*agg$overall.se, 0.01), "]")

# make G*T event study plot without covariates
event_study_plot <- mod_no_x %>% 
  # aggregate into relative time (dynamic)
  aggte(type = "dynamic", biters = 25000) %>% 
  broom::tidy(conf.int = TRUE) %>% 
  # keep just -5 to + 5
  filter(event.time %>% between(-5, 5)) %>% 
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

# save the G&T no covariate event study plot (Figure 8)
ggsave(event_study_plot, filename = paste0(file.loc.fig, "figure8_R.pdf"),
       width = 8, height = 4, dpi = 500)

# Now re-estimate and plot the same GXT estimates with covariates
# set.seed(20240924)
mod_with_x <- att_gt(
  yname = "crude_rate_20_64",
  tname = "year",
  idname = "county_code",
  gname = "treat_year",
  xformla =  as.formula(paste("~", paste(covs, collapse = "+"))),
  data = mydata,
  panel = TRUE,
  control_group = "notyettreated",
  bstrap = TRUE,
  biters = 25000,
  cband = TRUE,
  est_method = "dr",
  weightsname = "set_wt",
  base_period = "universal"

)

# get the aggregate value for e = 0:5
agg <- mod_with_x %>% 
  aggte(type = "dynamic", min_e = 0, max_e = 5,
        bstrap = TRUE, biters = 25000)

# make labels for the estimate, std error, and confidence intervals
label1 <-  paste0("Estimate~(e %in% '{0, 5}')~'='~'", 
                  scales::number(agg$overall.att, accuracy = 0.01), "'")

label2 <- paste0("Std. Error = ", scales::number(agg$overall.se, 0.01), " \n",
                 "Conf. Int = [", scales::number(agg$overall.att - 1.96*agg$overall.se, 0.01), ", ", 
                 scales::number(agg$overall.att + 1.96*agg$overall.se, 0.01), "]")

# make event study plot for GXT with covariates
event_study_plot_with_x <- mod_with_x %>% 
  # aggregate to event time (dynamic)
  aggte(type = "dynamic", biters = 25000) %>% 
  broom::tidy(conf.int = TRUE) %>% 
  # filter years
  filter(event.time %>% between(-5, 5)) %>% 
  # plot
  ggplot(aes(x = event.time, y = estimate)) + 
  geom_linerange(aes(ymin = conf.low, ymax = conf.high), color = "darkred") + 
  geom_linerange(aes(ymin = point.conf.low, ymax = point.conf.high)) + 
  geom_point() + 
  geom_vline(xintercept = -1, linetype = "dashed") + 
  geom_hline(yintercept = 0, linetype = "dashed") + 
  scale_x_continuous(breaks = -5:5) + 
  annotate("text", x = 3, y = 19, label = label1, parse = TRUE) + 
  annotate("text", x = 3, y = 15, label = label2) + 
  labs(x = "Event Time", y = "Treatment Effect \n Mortality Per 100,000") + 
  theme(axis.title.y = element_text(hjust = 0.5, vjust = 0.5, angle = 360),
        strip.text = element_text(size = 14),
        panel.border = element_rect(color = "black", fill = NA, linewidth = 1),
        legend.title = element_blank(),
        axis.title = element_text(size = 12),
        axis.text = element_text(size = 10))

# save GXT plot with covariates (Figure 9)
ggsave(event_study_plot_with_x, filename = paste0(file.loc.fig, "figure9_R.pdf"),
       width = 8, height = 4, dpi = 500)
