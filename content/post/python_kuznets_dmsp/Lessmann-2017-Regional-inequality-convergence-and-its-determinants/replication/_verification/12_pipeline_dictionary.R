# Build a combined data_dictionary.csv for 00_Main_Dataset (3 input files).
suppressMessages({library(haven); library(readr)})
repo <- "/Users/carlosmendez/Documents/GitHub/00DS/hello-papers/Lessmann-2017-Regional-inequality-convergence-and-its-determinants"
src  <- file.path(repo, "Data")
out  <- file.path(repo, "replication/00_Main_Dataset/data_dictionary.csv")
lab <- function(x){ l <- attr(x,"label"); if (is.null(l)) "" else paste(as.character(l), collapse=" ") }
typ <- function(x) if (is.character(x)) "string" else "numeric"
mk <- function(f, cols){
  d <- read_dta(file.path(src,f), n_max=1); d <- d[,cols,drop=FALSE]
  data.frame(file = sub("[.]dta$", ".csv", f),
             variable = sub("^_","",cols),
             label = vapply(d,lab,character(1)),
             stata_type = vapply(d,typ,character(1)), row.names=NULL)
}
train <- c("Region_NAME","Country_NAME","Country_ISO","id_t_j","code_Coutry_Region","year",
           "Pop_Region","Pop_Country","GDP_pc_Region","log_GDP_pc_Region","log_Light_ppix_Region",
           "log_GDP_pc_Country","log_N_pix_top_cod_1_ppix","log_N_pix_low_cod_1_ppix","log_area",
           "log_region","log_region_X_log_area","eap","eca","lac","mena","sa","ssa", paste0("_satyear_",1:7))
world <- names(read_dta(file.path(src,"Regional_Data_SL.dta"), n_max=1))
ctry  <- names(read_dta(file.path(src,"Country_DATA.dta"), n_max=1))
d <- rbind(mk("Prediction_Data.dta", train),
           mk("Regional_Data_SL.dta", world),
           mk("Country_DATA.dta", ctry))
write_csv(d, out, na="")
cat("wrote", out, "with", nrow(d), "rows across 3 input files\n")
