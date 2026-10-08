# Clear environment
rm(list = ls())

# load packages
library(tidyverse)
library(kableExtra)
library(readxl)
library(here)

# read in mortality data
# To generate this data - go to https://wonder.cdc.gov/deaths-by-underlying-cause.html. Click on 1999-2020 Underlying Cause of Death by
# Bridged-Race Categories. Group data by State, then County, then Year. Select All States in Category 2, For demographics select five-year
# age groups and the categories from 20-64. Keep all sex, all origins, and all races. In category 4 select 2009-2019, and click show zero
# values and export the results.
mortality_dt <- read_csv(here::here("data/cdc", "mortality.csv")) %>% 
  # drop the notes column that the CDC provides
  select(-Notes) %>% 
  # drop any missing observations
  drop_na() %>% 
  # set names for variables
  set_names(c("state", "stfips", "county", "county_code", "year", "year_code", "deaths", "population_20_64", "crude_rate_20_64")) %>% 
  # reclassify some variables as numeric and recalculate the crude rate for precision
  mutate(deaths = as.numeric(deaths),
         population_20_64 = as.numeric(population_20_64),
         crude_rate_20_64 = deaths / population_20_64*100000)

# get the *total* population by county
# To generate this data - go to https://wonder.cdc.gov/deaths-by-underlying-cause.html. Click on 1999-2020 Underlying Cause of Death by
# Bridged-Race Categories. Group data by State, then County, then Year. Select All States in Category 2, For demographics select All Ages.
# Keep all sex, all origins, and all races. In category 4 select 2009-2019, and click show zero
# values and export the results.
total_pop <- read_csv(here::here("data/cdc", "total_pop.csv")) %>% 
  # drop the notes column that the CDC provides and drop missing
  select(-Notes) %>% 
  drop_na() %>% 
  # set names 
  set_names(c("state", "stfips", "county", "county_code", "year", "year_code", "deaths", "population_total", "crude_rate")) %>% 
  # reclassify some variables as numeric and recalculate the crude rate for precision
  mutate(population_total = as.numeric(population_total)) %>% 
  select(county_code, year, population_total)

# get the hispanic, female, and white populations at the county-year level for ages 20-64.
# To generate this data - go to https://wonder.cdc.gov/deaths-by-underlying-cause.html. Click on 1999-2020 Underlying Cause of Death by
# Bridged-Race Categories. Group data by State, then County, then Year. Select All States in Category 2, For demographics select five-year
# age groups and the categories from 20-64. Keep all sex, Hispanic or Latino, and all races. In category 4 select 2009-2019, and click show zero
# values and export the results.
hispanic_pop <- read_csv(here::here("data/cdc", "hispanic_pop.csv")) %>% 
  select(-Notes) %>% 
  # set names 
  set_names(c("county", "county_code", "year", "year_code", "deaths", "population_20_64_hispanic", "crude_rate_20_64")) %>% 
  # we just need the population amount
  mutate(population_20_64_hispanic = as.numeric(population_20_64_hispanic)) %>% 
  select(county_code, year, population_20_64_hispanic) %>% 
  drop_na()

# To generate this data - go to https://wonder.cdc.gov/deaths-by-underlying-cause.html. Click on 1999-2020 Underlying Cause of Death by
# Bridged-Race Categories. Group data by State, then County, then Year. Select All States in Category 2, For demographics select five-year
# age groups and the categories from 20-64. Keep female, all origins, and all races. In category 4 select 2009-2019, and click show zero
# values and export the results.
female_pop <- read_csv(here::here("data/cdc", "female_pop.csv")) %>% 
  select(-Notes) %>% 
  # set names 
  set_names(c("county", "county_code", "year", "year_code", "deaths", "population_20_64_female", "crude_rate_20_64")) %>% 
  # we just need the population amount
  mutate(population_20_64_female = as.numeric(population_20_64_female)) %>% 
  select(county_code, year, population_20_64_female) %>% 
  drop_na()

# To generate this data - go to https://wonder.cdc.gov/deaths-by-underlying-cause.html. Click on 1999-2020 Underlying Cause of Death by
# Bridged-Race Categories. Group data by State, then County, then Year. Select All States in Category 2, For demographics select five-year
# age groups and the categories from 20-64. Keep all sex, all origins, and white race. In category 4 select 2009-2019, and click show zero
# values and export the results.
white_pop <- read_csv(here::here("data/cdc", "white_pop.csv")) %>% 
  select(-Notes) %>% 
  # set names 
  set_names(c("county", "county_code", "year", "year_code", "deaths", "population_20_64_white", "crude_rate_20_64")) %>% 
  # we just need the population amount
  mutate(population_20_64_white = as.numeric(population_20_64_white)) %>% 
  select(county_code, year, population_20_64_white) %>% 
  drop_na()

# merge all of the datasets together at the county-year level
final_dt <- mortality_dt %>% 
  left_join(total_pop, by = c("county_code", "year")) %>% 
  left_join(hispanic_pop, by = c("county_code", "year")) %>% 
  left_join(female_pop, by = c("county_code", "year")) %>% 
  left_join(white_pop, by = c("county_code", "year"))

# function to read in county level unemployment data. These data are all downloaded from here:
# https://www.bls.gov/lau/tables.htm, Click on the County-year data halfway down the page. BLS prevents you 
# from scraping this so we download each file from 2009-2019 individually and clean with the function below.
read_unemp <- function(yr) {
  
  # read in the data from excel by year
  read_excel(here::here("data/bls", paste0("laucnty", yr, ".xlsx")), 
             # skip empty rows
                   skip = 6, col_names = FALSE) %>% 
    # select just the columns we need and rename the variables
    select(...2, ...3, ...5, ...7, ...9) %>% 
    set_names(c("stfips", "fipscode", "year", "labor_force", "unemployed")) %>% 
    # make a county code variable for merging
    mutate(county_code = as.numeric(paste0(stfips, fipscode)),
           # unemployment rate is unemployed over the labor force
           unemp_rate = unemployed / labor_force,
           # make sure that year is numeric
           year = as.numeric(year)) %>% 
    # keep just the variables that we need
    select(county_code, year, unemployed, labor_force, unemp_rate)
}

# vectorize function over years 09-19
years <- str_pad(9:19, 2, pad = "0")
unemp_data <- map_dfr(years, read_unemp)

# merge in to final data
final_dt <- final_dt %>% 
  left_join(unemp_data, by = c("county_code", "year"))

# get poverty rate and median income from the census. We read this directly from their website (which you can see below)
# and just change the year for the data.
read_pov_income <- function(yr) {
  
  # Define the URL and local file path based on the year of the data
  url <- paste0("https://www2.census.gov/programs-surveys/saipe/datasets/20",
                yr, 
                "/20",
                yr,
                "-state-and-county/est",
                yr,
                "all.xls")
  
  # generate a temporary file to read in
  file_path <- tempfile(fileext = ".xls") 
  
  # Download the file
  download.file(url, file_path, mode = "wb")
  
  # Read the Excel file from the download, skip unnecessary rows
  read_xls(file_path, skip = 5, col_names = FALSE) %>% 
    # select just the columns we need and rename the variables
    select(...1, ...2, ...8, ...23) %>% 
    set_names(c("stfips", "fipscode", "poverty_rate", "median_income")) %>% 
    # make a county code variable for merging
    mutate(county_code = as.numeric(paste0(stfips, str_pad(fipscode, 3, pad = "0"))),
           # poverty rate as numeric
           poverty_rate = as.numeric(poverty_rate),
           # parse the median income value and remove commas if present
           median_income = parse_number(as.character(median_income)),
           # identify the year in the data
           year = as.numeric(paste0("20", yr))) %>% 
    # keep just the variables that we need
    select(county_code, year, poverty_rate, median_income)
}

# vectorize function over years 09-19
years <- str_pad(9:19, 2, pad = "0")
pov_income_data <- map_dfr(years, read_pov_income)

# merge in to final data
final_dt <- final_dt %>% 
  left_join(pov_income_data, by = c("county_code", "year"))

# load in the expansion data - this comes from the Kaiser Family Foundation - See https://www.kff.org/status-of-state-medicaid-expansion-decisions/
# click on the "Get data" link underneath the map. Required some cleaning to get the year from the notes.
expansion <- read_csv(here::here("data/kff", "expansion_status.csv"))
  
# merge in to final data on state
final_dt <- final_dt %>% 
  left_join(expansion, by = c("state" = "State"))

# save this data
write_csv(final_dt, here::here("data", "county_mortality_data.csv"))