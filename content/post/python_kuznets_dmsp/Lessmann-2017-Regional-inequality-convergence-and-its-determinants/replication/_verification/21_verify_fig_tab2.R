# ============================================================================
# 21_verify_fig_tab2.R
# ----------------------------------------------------------------------------
# (A) Table 2: reproduce the population-weighted inequality indices from first
#     principles (ineqdeco equivalents) and the predicted/observed/light
#     correlations -- these become the pinned numbers for Table_2/README.
# (B) Figure CSV-sufficiency: confirm each figure's trimmed CSV reproduces the
#     quantities/counts its .do will plot (incl. Fig 4 FE coefficients).
# All checks load ONLY the shipped trimmed CSVs.
# ============================================================================
suppressMessages({library(readr); library(fixest)})
options(width=120)
rep <- "/Users/carlosmendez/Documents/GitHub/00DS/hello-papers/Lessmann-2017-Regional-inequality-convergence-and-its-determinants/replication"

# ---- population-weighted inequality indices (match Stata `ineqdeco [aw=w]`) --
winq <- function(y, w) {
  ok <- is.finite(y) & is.finite(w) & y > 0 & w > 0
  y <- y[ok]; w <- w[ok]; if (length(y) < 2) return(c(gini=NA,gem1=NA,ge0=NA,ge1=NA,cov=NA))
  W <- sum(w); mu <- sum(w*y)/W; r <- y/mu; p <- w/W
  gini <- sum(outer(w,w) * abs(outer(y,y,"-"))) / (2*W^2*mu)   # weighted Gini (|y_i - y_j|)
  gem1 <- 0.5 * (sum(p * r^(-1)) - 1)                       # GE(-1)
  ge0  <- sum(p * -log(r))                                  # GE(0) = MLD
  ge1  <- sum(p * r*log(r))                                 # GE(1) = Theil
  ge2  <- 0.5 * (sum(p * r^2) - 1)                          # GE(2)
  c(gini=gini, gem1=gem1, ge0=ge0, ge1=ge1, cov=sqrt(2*ge2))
}

cat("######################## TABLE 2 ########################\n")
d2 <- read_csv(file.path(rep,"Table_2/data/Table_2_data.csv"), show_col_types=FALSE)
d2 <- d2[d2$year>2000 & d2$year<2013, ]
d2$light_pc <- d2$Light_Region / d2$Pop_Region
idx <- c("gini","gem1","ge0","ge1","cov")
grp <- split(seq_len(nrow(d2)), paste(d2$Country_ISO, d2$year))
mk <- function(val) t(sapply(grp, function(ix) winq(d2[[val]][ix], d2$Pop_Region[ix])))
P <- mk("pred_GDP_pc_Region"); O <- mk("GDP_pc_Region"); L <- mk("light_pc")
key <- sub(" [0-9]+$","", rownames(P))
cmean <- function(M){ ag <- aggregate(M, by=list(key), FUN=function(x) mean(x, na.rm=TRUE)); rownames(ag)<-ag[,1]; as.matrix(ag[,-1]) }
Pc<-cmean(P); Oc<-cmean(O); Lc<-cmean(L)
pin_po <- c(.50,.40,.45,.50,.52); pin_lo <- c(.21,.11,.21,.30,.29)
cat(sprintf("%-6s  pred~obs (pin)   light~obs (pin)\n",""))
for (j in seq_along(idx)) {
  po <- cor(Pc[,j], Oc[,j], use="complete.obs")
  lo <- cor(Lc[,j], Oc[,j], use="complete.obs")
  cat(sprintf("%-6s  %.2f (%.2f)       %.2f (%.2f)\n", toupper(idx[j]), po, pin_po[j], lo, pin_lo[j]))
}

cat("\n######################## FIGURE CSV-SUFFICIENCY ########################\n")
# Fig 4: partial-residual FE regression -> must match Table 3 col 3 literals
f4 <- read_csv(file.path(rep,"Figure_4/data/Figure_4_data.csv"), show_col_types=FALSE)
f4 <- f4[f4$year>=1990 & f4$year<=2014,]
f4$p5 <- with(f4, ifelse(year<=1994,1, ifelse(year<=1999,2, ifelse(year<=2004,3, ifelse(year<=2009,4,5)))))
a4 <- aggregate(cbind(GDP_pc_Country,GINIW_pred_GDP_pc) ~ Country_ISO+p5, f4, mean)
a4$lg<-log(a4$GDP_pc_Country); a4$lg2<-a4$lg^2; a4$lg3<-a4$lg^3
m <- feols(GINIW_pred_GDP_pc ~ lg+lg2+lg3 | Country_ISO+p5, a4)
cat(sprintf("Fig4 cubic [.2931/-.0320/.00112]: %.4f / %.4f / %.5f\n", coef(m)["lg"],coef(m)["lg2"],coef(m)["lg3"]))
cat("  Fig4b labels ITA/IRL present in data:", all(c("ITA","IRL") %in% f4$Country_ISO),
    "| original typos ITL/IRE present:", any(c("ITL","IRE") %in% f4$Country_ISO), "\n")

# Fig 5a: number of countries with both GINIW and Gini, 2001-2012
f5 <- read_csv(file.path(rep,"Figure_5/data/Figure_5_data.csv"), show_col_types=FALSE)
f5 <- f5[f5$year>2000 & f5$year<2013,]
a5 <- aggregate(cbind(GINIW_pred_GDP_pc, Giniall) ~ Country_ISO, f5, function(x) mean(x,na.rm=TRUE))
cat("Fig5a countries with Gini [pin ~144]:", sum(is.finite(a5$Giniall)), "\n")

# Fig A3: USA 2010 rows
fa3 <- read_csv(file.path(rep,"Figure_A3/data/Figure_A3_data.csv"), show_col_types=FALSE)
cat("FigA3 USA-2010 rows [pin 51]:", sum(fa3$Country_ISO=="USA" & fa3$year==2010), "\n")

# Fig B3: Germany 2000-2012 rows
fb3 <- read_csv(file.path(rep,"Figure_B3/data/Figure_B3_data.csv"), show_col_types=FALSE)
cat("FigB3 DEU 2000-2012 rows [pin 13]:", sum(fb3$Country_ISO=="DEU" & fb3$year>=2000 & fb3$year<=2012), "\n")

# Fig A4: countries with observed (Gennaioli) vs predicted-only
fa4 <- read_csv(file.path(rep,"Figure_A4/data/Figure_A4_data.csv"), show_col_types=FALSE)
fa4 <- fa4[fa4$year>2000 & fa4$year<2011,]
a4c <- aggregate(GDP_pc_Country_G ~ Country_ISO, fa4, function(x) mean(x,na.rm=TRUE), na.action=na.pass)
cat("FigA4 countries observed(Gennaioli):", sum(is.finite(a4c$GDP_pc_Country_G)),
    "| total:", length(unique(fa4$Country_ISO)), "\n")
cat("\nDONE figure/table-2 verification.\n")
