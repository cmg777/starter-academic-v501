# Clear environment
rm(list = ls())

# load packages
library(tidyverse)
library(kableExtra)
library(modelsummary)
library(did)
library(here)

# set filepath locations for tables and figures
file.loc.tab <- here::here("tables/")

# load cleaned data
mydata <- read_csv(here::here("data", "county_mortality_data.csv")) %>% 
  # make state the abbreviation
  mutate(state = str_sub(county, nchar(county) - 1, nchar(county))) %>%
  # drop District of Columbia from the data
  filter(state != "DC") %>% 
  # make a second adoption variable for the table
  mutate(adopt = case_when(
    # missing is non-expansion
    is.na(yaca) ~ "Non-Expansion",
    # fix a couple pre-2014 adoptions from Miller, Johnson and Wherry
    state %in% c("DE", "MA", "NY", "VT") ~ "Pre-2014", 
    TRUE ~ as.character(yaca)
  ))
  
# get adoption year by state
adopts <- mydata %>% 
  select(state, adopt) %>% 
  distinct() %>% 
  arrange(state)

# first get the share of states, share of counties, and share of adults in 2013 by adoption category
# first the states and share of states
states <- adopts %>% 
  group_by(adopt) %>% 
  summarize(states = paste0(state, collapse = ", "),
            state_share = length(state) / 50)

# next get the county share and the population share
counties_pop <- mydata %>% 
  # just for year 2013
  filter(year == 2013) %>% 
  # get county and population totals
  mutate(total_counties = n(),
         total_pop = sum(population_20_64, na.rm = TRUE)) %>% 
  group_by(adopt) %>% 
  # make into shares
  summarize(county_share = n() / mean(total_counties),
            pop_share = sum(population_20_64, na.rm = TRUE) / mean(total_pop))
  
# make a table and export
table_out <- states %>% 
  left_join(counties_pop, by = "adopt") %>% 
  slice(9, 1:8) %>% 
  # format the numbers to two digits
  mutate(across(state_share:pop_share, ~ scales::number(., accuracy = 0.01))) %>%
  # format the table
  kable(
   "latex",
    col.names = c("Expansion \n Year", "States", "Share of States", "Share of Counties", 
                  "Share of Adults (2013)"),
    booktabs = T, caption = "Medicaid Expansion Under the Affordable Care Act",
    label = "adoptions",
    align = c("c"),
    escape = FALSE,
    linesep = ""
  ) %>% 
  kable_styling(latex_options = c("scale_down", "HOLD_position")) %>% 
  column_spec(2, width = "20em")


# add in footnote
table_out <- footnote(table_out,
                  general = "\\\\vspace{-4ex} \\\\singlespacing \\\\footnotesize{The table shows which states adopted 
                  the ACA's Medicaid expansion in each year as well as the share of all states, counties, and adults in 
                  each expansion year.}",
                  footnote_as_chunk = TRUE,
                  escape = FALSE,
                  threeparttable = TRUE,
                  general_title = "")

# save the table
write_lines(table_out, paste0(file.loc.tab, "table1_R.tex"))
