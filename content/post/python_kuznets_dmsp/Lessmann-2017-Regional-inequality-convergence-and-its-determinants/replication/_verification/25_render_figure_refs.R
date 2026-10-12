# ============================================================================
# 25_render_figure_refs.R
# R/ggplot reference previews for the NON-MAP figures (4, 5, A1-A4, B3), saved
# to each folder's expected/ as a VISUAL TARGET. The official output is produced
# by the Stata .do; these only confirm the shipped CSV draws the right picture.
# (Map references are produced by 15_build_maps.R.)
# ============================================================================
suppressMessages({library(readr); library(ggplot2); library(fixest)})
rep <- "/Users/carlosmendez/Documents/GitHub/00DS/hello-papers/Lessmann-2017-Regional-inequality-convergence-and-its-determinants/replication"
th  <- theme_bw(base_size=10) + theme(plot.title=element_text(size=10))
save_ref <- function(p, folder, name, w=5, h=4.2){
  f <- file.path(rep, folder, "expected", name); dir.create(dirname(f), showWarnings=FALSE, recursive=TRUE)
  ggsave(f, p, width=w, height=h, dpi=120); cat("ref:", folder, name, "\n")
}
cmean <- function(df, id, vars) aggregate(df[vars], by=df[id], FUN=function(x) mean(x, na.rm=TRUE))

## ---- Figure 4: partial-residual Kuznets scatter + cubic ----
d <- read_csv(file.path(rep,"Figure_4/data/Figure_4_data.csv"), show_col_types=FALSE)
d <- d[d$year>=1990 & d$year<=2014,]
d$p5 <- with(d, ifelse(year<=1994,1,ifelse(year<=1999,2,ifelse(year<=2004,3,ifelse(year<=2009,4,5)))))
a <- cmean(d, c("Country_ISO","p5"), c("GINIW_pred_GDP_pc","GDP_pc_Country"))
a$lg<-log(a$GDP_pc_Country); a$lg2<-a$lg^2; a$lg3<-a$lg^3
m <- feols(GINIW_pred_GDP_pc ~ lg+lg2+lg3 | Country_ISO + p5, a)
b <- coef(m); fe <- fixef(m)
a$partial <- a$GINIW_pred_GDP_pc - fe$p5[as.character(a$p5)]    # remove period FE only
cons <- mean(a$partial - (b["lg"]*a$lg+b["lg2"]*a$lg2+b["lg3"]*a$lg3), na.rm=TRUE)
curve <- function(x) cons + b["lg"]*x + b["lg2"]*x^2 + b["lg3"]*x^3
save_ref(ggplot(a, aes(lg, partial)) + geom_point(shape=1) +
  geom_function(fun=curve, color="black") + xlim(5,12) + ylim(0,0.16) +
  labs(title="Figure 4a (R reference): regional inequality vs development",
       x="log (GDP per capita)", y="Partial regional inequality (GINIW)") + th,
  "Figure_4","Figure_4_R_reference.png")

## ---- Figure 5a: interregional vs interpersonal inequality ----
d <- read_csv(file.path(rep,"Figure_5/data/Figure_5_data.csv"), show_col_types=FALSE)
d <- d[d$year>2000 & d$year<2013,]
a <- cmean(d, "Country_ISO", c("GINIW_pred_GDP_pc","Giniall")); a$g100 <- a$Giniall/100
save_ref(ggplot(a, aes(GINIW_pred_GDP_pc, g100)) + geom_point(shape=2) +
  geom_smooth(method="lm", se=FALSE, color="blue", formula=y~x) +
  labs(title="Figure 5a (R reference): interregional vs interpersonal inequality",
       x="Interregional inequality: GINIW", y="Interpersonal inequality: GINI") + th,
  "Figure_5","Figure_5_R_reference.png")

## ---- Figures A1/A2: predicted vs observed regional GDP (2001-2010) ----
g <- read_csv(file.path(rep,"Figure_A1/data/Figure_A1_data.csv"), show_col_types=FALSE)
g <- g[g$year>=2001 & g$year<=2010,]
ga <- cmean(g, "code_Coutry_Region",
            c("GDP_pc_Country","GDP_pc_Region","log_GDP_pc_Region","pred_log_GDP_pc_Region","Pix_Region","Pop_Region"))
ga$tier <- cut(ga$GDP_pc_Country, c(-Inf,4089,12615,Inf), labels=c("LIC","MIC","HIC"))
save_ref(ggplot(ga, aes(pred_log_GDP_pc_Region, log_GDP_pc_Region, color=tier, shape=tier)) +
  geom_point(size=.8) + geom_abline(slope=1, intercept=0) + xlim(5.5,12)+ylim(5.5,12) +
  labs(title="Figure A.1 (R reference): pred vs observed by income tier",
       x="log (predicted regional GDP pc)", y="log (observed regional GDP pc)") + th,
  "Figure_A1","Figure_A1_R_reference.png")
ga$dens <- (ga$GDP_pc_Region*ga$Pop_Region)/ga$Pix_Region
ga$dtier <- cut(ga$dens, c(-Inf,168071.5,1478853,Inf), labels=c("LDIR","MDIR","HDIR"))
save_ref(ggplot(ga, aes(pred_log_GDP_pc_Region, log_GDP_pc_Region, color=dtier, shape=dtier)) +
  geom_point(size=.8) + geom_abline(slope=1, intercept=0) + xlim(5.5,12)+ylim(5.5,12) +
  labs(title="Figure A.2 (R reference): pred vs observed by output density",
       x="log (predicted regional GDP pc)", y="log (observed regional GDP pc)") + th,
  "Figure_A2","Figure_A2_R_reference.png")

## ---- Figure A3: USA 2010 by Regional Price Parity ----
u <- read_csv(file.path(rep,"Figure_A3/data/Figure_A3_data.csv"), show_col_types=FALSE)
u <- u[u$Country_ISO=="USA" & u$year==2010,]
u$rtier <- cut(u$RPP, c(-Inf,90.2,102.8,Inf), labels=c("LRPP","MRPP","HRPP"))
save_ref(ggplot(u, aes(pred_log_GDP_pc_Region, log_GDP_pc_Region, color=rtier)) +
  geom_point() + geom_abline(slope=1,intercept=0) +
  labs(title="Figure A.3 (R reference): USA 2010 by regional price parity",
       x="log (predicted regional GDP pc)", y="log (observed regional GDP pc)") + th,
  "Figure_A3","Figure_A3_R_reference.png")

## ---- Figure A4: national predicted vs observed ----
c <- read_csv(file.path(rep,"Figure_A4/data/Figure_A4_data.csv"), show_col_types=FALSE)
c <- c[c$year>=2001 & c$year<=2010,]
ca <- cmean(c, "Country_ISO", c("GDP_pc_Country","pred_GDP_pc_Country","GDP_pc_Country_G"))
ca$grp <- ifelse(is.finite(ca$GDP_pc_Country_G) & ca$GDP_pc_Country_G>0, "observed data","predicted data")
ca$lo <- log(ca$GDP_pc_Country); ca$lp <- log(ca$pred_GDP_pc_Country)
save_ref(ggplot(ca, aes(lp, lo, color=grp)) + geom_point(size=.9) +
  geom_abline(slope=1,intercept=0) + xlim(5.5,12)+ylim(5.5,12) +
  labs(title="Figure A.4 (R reference): national predicted vs observed GDP pc",
       x="log (predicted national GDP pc)", y="log (observed national GDP pc)") + th,
  "Figure_A4","Figure_A4_R_reference.png")

## ---- Figure B3: Germany GINIW time series ----
de <- read_csv(file.path(rep,"Figure_B3/data/Figure_B3_data.csv"), show_col_types=FALSE)
de <- de[de$Country_ISO=="DEU" & de$year>=2000 & de$year<=2012,]
save_ref(ggplot(de, aes(year, GINIW_pred_GDP_pc)) + geom_line() + geom_point(shape=2) +
  scale_x_continuous(breaks=seq(2000,2012,2)) +
  labs(title="Figure B.3 (R reference): regional inequality in Germany, 2000-2012",
       x="Year", y="Partial regional inequality (GINIW)") + th,
  "Figure_B3","Figure_B3_R_reference.png", w=5, h=3.6)

cat("DONE figure references.\n")
