## =============================================================================
## Spatial inequality and the Kuznets curve — a synthetic replication of
## Lessmann (2013), "Spatial inequality and development: Is there an inverted-U
## relationship?", Journal of Public Economics 106, 35-51.
##
## There is NO real data behind this tutorial. We SIMULATE regional GDP-per-capita
## micro-data for 56 synthetic countries (1980-2009), COMPUTE the population-
## weighted coefficient of variation (WCV) from those regions, and calibrate the
## data-generating process so that the regressions reproduce the paper's headline
## findings in direction, significance, and approximate magnitude.
##
## Outputs: r_kuznets_*.png figures, r_kuznets_table*.png regression tables,
##          data/sim_*.csv, results_*.csv, execution_log.txt
## Run:     Rscript analysis.R 2>&1 | tee execution_log.txt
## =============================================================================

set.seed(123)

if (!requireNamespace("pacman", quietly = TRUE))
  install.packages("pacman", repos = "https://cloud.r-project.org")
pacman::p_load(dplyr, tidyr, ggplot2, scales, patchwork, fixest, sandwich, lmtest,
               splines, np, modelsummary, gt, webshot2, gridExtra)
options(np.messages = FALSE)

## ---- site palette & dark theme ---------------------------------------------
STEEL <- "#6a9bcc"; ORANGE <- "#d97757"; TEAL <- "#00d4c8"; NEAR_BLACK <- "#141413"
DARK_BG <- "#0f1729"; DARK_PANEL <- "#1f2b5e"; LIGHT_TEXT <- "#c8d0e0"; LIGHTER <- "#e8ecf2"

theme_kuz <- function(base = 13) {
  theme_minimal(base_size = base) %+replace% theme(
    plot.background  = element_rect(fill = DARK_BG, colour = NA),
    panel.background = element_rect(fill = DARK_BG, colour = NA),
    panel.grid.major = element_line(colour = DARK_PANEL, linewidth = 0.3),
    panel.grid.minor = element_blank(),
    text   = element_text(colour = LIGHT_TEXT),
    title  = element_text(colour = LIGHTER),
    axis.text = element_text(colour = LIGHT_TEXT),
    plot.title    = element_text(colour = LIGHTER, face = "bold", size = base + 3, hjust = 0),
    plot.subtitle = element_text(colour = LIGHT_TEXT, size = base, hjust = 0),
    plot.caption  = element_text(colour = LIGHT_TEXT, size = base - 3, hjust = 1),
    legend.background = element_rect(fill = DARK_BG, colour = NA),
    legend.key = element_rect(fill = DARK_BG, colour = NA),
    plot.margin = margin(14, 16, 10, 12))
}
gg_save <- function(p, file, w = 8, h = 6) {
  ggsave(file, p, width = w, height = h, dpi = 300, bg = DARK_BG)
  cat("  saved", file, "\n")
}
dir.create("data", showWarnings = FALSE)

cat("============================================================\n")
cat(" Lessmann (2013) synthetic replication — analysis.R\n")
cat("============================================================\n\n")

## =============================================================================
## 1. COUNTRY SCAFFOLD  (region counts & areas hard-coded from Table A.1/A.2)
## =============================================================================
cty <- data.frame(
  name = c("Australia","Austria","Belgium","Bolivia","Brazil","Bulgaria","Canada",
           "Chile","China","Colombia","Croatia","Czech Rep.","Denmark","Estonia","Finland",
           "France","Georgia","Germany","Greece","Hungary","India","Indonesia","Iran",
           "Ireland","Italy","Japan","Kazakhstan","Korea","Latvia","Lithuania","Malta",
           "Mexico","Mongolia","Netherlands","New Zealand","Norway","Panama","Peru",
           "Philippines","Poland","Portugal","Romania","Russia","Slovak Rep.","Slovenia",
           "South Africa","Spain","Sweden","Switzerland","Tanzania","Thailand","Turkey",
           "Ukraine","United Kingdom","United States","Uzbekistan"),
  region = c("EAP","ECA","ECA","LAC","LAC","ECA","NA","LAC","EAP","LAC","ECA","ECA","ECA",
             "ECA","ECA","ECA","ECA","ECA","ECA","ECA","SA","EAP","MENA","ECA","ECA","EAP",
             "ECA","EAP","ECA","ECA","MENA","LAC","EAP","ECA","EAP","ECA","LAC","LAC","EAP",
             "ECA","ECA","ECA","ECA","ECA","ECA","SSA","ECA","ECA","ECA","SSA","EAP","ECA",
             "ECA","ECA","NA","ECA"),
  n_reg = c(8,9,11,9,27,6,12,13,30,33,3,8,3,5,6,22,9,30,13,7,28,33,28,2,20,10,16,7,6,
            10,2,32,22,12,2,7,9,24,17,16,7,8,7,4,2,9,18,8,7,21,7,26,27,37,51,14),
  area = c(7680000,82500,30300,1080000,8460000,109444,9090000,744000,9330000,1110000,
           54622,77300,42400,42400,304667,548000,69500,349000,129000,89600,2970000,
           1810000,1630000,68900,294000,365000,2700000,97044,62267,62700,320,1940000,
           1550000,33800,268000,304000,74300,1280000,298000,304667,91500,230000,16400000,
           48100,20100,1210000,499000,410000,40000,886000,511000,770000,579000,242000,
           9160000,425000),
  y2009 = c(10.9,10.8,10.7,7.8,9.2,8.9,10.8,9.5,8.4,8.8,9.4,9.9,11.0,9.6,10.8,10.7,8.0,
            10.8,10.2,9.5,6.8,8.0,8.9,10.9,10.5,10.7,9.0,10.0,9.4,9.5,9.8,9.3,7.8,10.9,
            10.3,11.4,9.0,8.7,7.8,9.4,10.1,8.9,9.3,9.6,10.0,8.9,10.4,10.9,11.2,6.0,8.6,
            9.2,8.2,10.7,11.1,7.5),
  stringsAsFactors = FALSE
)
cty$lnarea  <- log(cty$area)
cty$lnunits <- log(cty$n_reg)
cty$federal <- as.integer(cty$name %in% c("United States","Canada","Brazil","India",
  "Germany","Australia","Switzerland","Austria","Belgium","Mexico","Russia","South Africa"))
high_growth <- c("China","India","Kazakhstan","Russia","Estonia","Latvia","Lithuania",
  "Poland","Romania","Bulgaria","Ukraine","Uzbekistan","Mongolia","Georgia","Indonesia",
  "Czech Rep.","Slovak Rep.","Croatia","Turkey")
cty$g <- ifelse(cty$name %in% high_growth, 0.052, 0.022)
cty$g[cty$name == "China"] <- 0.090
cty$g[cty$name %in% c("India","Kazakhstan")] <- 0.060
rich <- cty$y2009 >= 10.2
mid  <- cty$y2009 >= 8.8 & cty$y2009 < 10.2
cty$start <- ifelse(rich, 1982, ifelse(mid, 1993, 2000))
cty$end   <- ifelse(rich, 2004, ifelse(mid, 2007, 2008))
cty$start[cty$name == "Uzbekistan"] <- 2008; cty$end[cty$name == "Uzbekistan"] <- 2008
cty$start[cty$name %in% c("New Zealand","Iran")] <- 2000
cty$end[cty$name %in% c("New Zealand","Iran")] <- 2003

## frozen calibration parameters (see execution log scoreboard at the end) -----
P <- list(theta0 = -11.11, h1 = 0.390, h2 = -0.020,
          c1 = 3.474, c2 = -0.431, c3 = 0.017,
          l_eth = 0.19, l_fed = -0.18, l_units = 0.090, l_area = 0.048,
          tb = 0.0032, ub = -0.003, tw = 0.0006, uw = -0.0025,
          na0 = 0.4, na1 = 0.9, sd_y = 0.03, sd_trade_w = 6, sd_urb_w = 1.0,
          sd_nu = 0.034, sd_eps = 0.060, sd_gini = 0.115, gini_a = 0.323, gini_b = 0.130)

## =============================================================================
## 2. SIMULATE REGIONAL MICRO-DATA  &  COMPUTE THE WCV
## =============================================================================
## Population-weighted coefficient of variation (Lessmann eq. 1).
wcv_fun <- function(y, p) { ybar <- sum(p * y); sqrt(sum(p * (ybar - y)^2)) / ybar }
cv_fun  <- function(y)     sd(y) / mean(y)                          # unweighted CV
gini_wt <- function(y, p) {                                         # pop-weighted Gini
  o <- order(y); y <- y[o]; p <- p[o]
  cum_yp <- cumsum(p * y); tot <- cum_yp[length(cum_yp)]
  1 - 2 * sum(p * (cum_yp - p * y / 2)) / tot
}

## persistent region structure (population shares + relative positions) --------
make_regions <- function(seed = 123) {
  set.seed(seed); out <- vector("list", nrow(cty))
  for (i in seq_len(nrow(cty))) {
    n <- cty$n_reg[i]
    p <- sort(rgamma(n, shape = 0.85), decreasing = TRUE); p <- p / sum(p)
    big <- cty$federal[i] == 1 || cty$y2009[i] >= 10.2
    wcap <- if (big) runif(1, 0.05, 0.18) else runif(1, 0.12, 0.32)
    p <- p * (1 - wcap); p[1] <- p[1] + wcap; p <- p / sum(p)
    z <- rnorm(n); z[1] <- z[1] + if (big) runif(1, .3, 1) else runif(1, .8, 2)
    z <- z - sum(p * z); z <- z / sqrt(sum(p * z^2))     # weighted mean 0, weighted sd 1
    out[[i]] <- list(p = p, z = z)
  }
  out
}

simulate <- function(P, seed = 123) {
  reg <- make_regions(seed); set.seed(seed + 1); C <- cty
  C$ethnic   <- pmin(0.75, pmax(0, 0.75 * rbeta(nrow(C), 1.0, 1.7)))
  C$urb_mean <- pmin(97, pmax(24, 42 + 6.8 * (C$y2009 - 5.8) + rnorm(nrow(C), 0, 7)))
  C$trade_mean <- pmin(171, pmax(25, 85 - 6.5 * (C$lnarea - 12.7) + rnorm(nrow(C), 0, 28)))
  C$area_units <- C$lnarea / C$lnunits

  ## pass 1: income & time-varying control paths
  paths <- vector("list", nrow(C))
  for (i in seq_len(nrow(C))) {
    yrs <- C$start[i]:C$end[i]; Tn <- length(yrs)
    Y <- C$y2009[i] - C$g[i] * (2009 - yrs) +
         as.numeric(arima.sim(list(ar = 0.6), n = Tn, sd = P$sd_y))
    tr <- pmin(171, pmax(15, C$trade_mean[i] + rnorm(Tn, 0, P$sd_trade_w)))
    ur <- pmin(99, pmax(20, C$urb_mean[i] + cumsum(rnorm(Tn, 0.15, P$sd_urb_w))))
    cs <- yrs >= 2000 & yrs <= 2009
    paths[[i]] <- list(yrs = yrs, Y = Y, tr = tr, ur = ur,
                       ybar = mean(Y[cs]), trbar = mean(tr[cs]), urbar = mean(ur[cs]))
  }
  ## pass 2: structural target WCV, then realize regions
  rows <- list(); rrows <- list()
  for (i in seq_len(nrow(C))) {
    pa <- paths[[i]]; yrs <- pa$yrs; Y <- pa$Y; Tn <- length(yrs)
    h   <- P$h1 * Y + P$h2 * Y^2                                   # within inverted-U
    phi <- P$c1 * pa$ybar + P$c2 * pa$ybar^2 + P$c3 * pa$ybar^3    # between cubic (FE-absorbed)
    Xc  <- P$l_eth*C$ethnic[i] + P$l_fed*C$federal[i] +
           P$l_units*C$lnunits[i] + P$l_area*C$lnarea[i]
    Wb  <- P$tb*pa$trbar + P$ub*pa$urbar
    Ww  <- P$tw*(pa$tr - pa$trbar) + P$uw*(pa$ur - pa$urbar)
    target <- pmin(1.10, pmax(0.04,
      P$theta0 + h + phi + Xc + Wb + Ww + rnorm(1, 0, P$sd_nu) + rnorm(Tn, 0, P$sd_eps)))
    p <- reg[[i]]$p; z <- reg[[i]]$z
    wcv <- cv <- gr <- wnc <- numeric(Tn)
    for (t in seq_len(Tn)) {
      delta <- sqrt(log(1 + target[t]^2))
      yreg  <- exp(Y[t]) * exp(delta * z - 0.5 * delta^2)
      wcv[t] <- wcv_fun(yreg, p); cv[t] <- cv_fun(yreg); gr[t] <- gini_wt(yreg, p)
      if (length(p) > 2) { pn <- p[-1]/sum(p[-1]); wnc[t] <- wcv_fun(yreg[-1], pn) }
      else wnc[t] <- wcv[t]
      if (t == 1) rrows[[length(rrows)+1]] <- data.frame(
        country = C$name[i], year = yrs[t], region = seq_along(p),
        pop_share = p, gdp_pc = yreg)
    }
    rows[[i]] <- data.frame(
      country = C$name[i], region_grp = C$region[i], year = yrs, lnGDP = Y,
      wcv = wcv, cv = cv, gini_reg = gr, wcv_nocap = wnc,
      trade_gdp = pa$tr, urbanization = pa$ur,
      nonag = 100 / (1 + exp(-(P$na0 + P$na1 * (Y - 8)))),
      ethnic = C$ethnic[i], federal = C$federal[i], lnunits = C$lnunits[i],
      lnarea = C$lnarea[i], area_units = C$area_units[i], stringsAsFactors = FALSE)
  }
  annual <- bind_rows(rows)
  annual$period5 <- cut(annual$year, c(1979,1984,1989,1994,1999,2004,2009), labels = 1:6)

  cs <- annual %>% filter(year >= 2000, year <= 2009) %>% group_by(country) %>%
    summarise(region_grp = first(region_grp),
      across(c(wcv,cv,gini_reg,wcv_nocap,lnGDP,trade_gdp,urbanization,nonag,
               ethnic,federal,lnunits,lnarea,area_units), mean), .groups = "drop")
  set.seed(seed + 7); cs$gini <- P$gini_a + P$gini_b * cs$wcv + rnorm(nrow(cs), 0, P$sd_gini)
  cs$gdp_pc <- exp(cs$lnGDP)

  p5 <- annual %>% group_by(country, period5) %>%
    summarise(across(c(wcv,cv,gini_reg,lnGDP,trade_gdp,urbanization,nonag,
                       ethnic,federal,lnunits,lnarea,area_units), mean),
              .groups = "drop") %>% filter(!is.na(period5))

  list(annual = annual, cs = cs, p5 = p5, regional = bind_rows(rrows))
}

cat("Simulating regional micro-data for 56 countries ...\n")
S <- simulate(P, 123)
annual <- S$annual; cs <- S$cs; p5 <- S$p5
annual$lnGDP2 <- annual$lnGDP^2; annual$lnGDP3 <- annual$lnGDP^3
p5$lnGDP2 <- p5$lnGDP^2; p5$lnGDP3 <- p5$lnGDP^3
cat(sprintf("  annual obs N=%d | 5-year obs N=%d | cross-section N=%d\n",
            nrow(annual), nrow(p5), nrow(cs)))
write.csv(S$regional, "data/sim_regional_gdp.csv", row.names = FALSE)
write.csv(annual,     "data/sim_country_panel.csv", row.names = FALSE)

## worked WCV example (two-region toy) ----------------------------------------
toy <- data.frame(region = c("Capital (rich)","Rest (poor)"),
                  gdp_pc = c(28000, 12000), pop_share = c(0.35, 0.65))
toy_wcv <- wcv_fun(toy$gdp_pc, toy$pop_share)
cat(sprintf("\nWorked WCV example: ybar=%.0f, WCV=%.3f\n",
            sum(toy$gdp_pc*toy$pop_share), toy_wcv))

## =============================================================================
## helpers for HC1 cross-section SE and star formatting
## =============================================================================
hc1  <- function(m) coeftest(m, vcov = vcovHC(m, "HC1"))
star <- function(t) ifelse(abs(t) > 2.58, "***",
                    ifelse(abs(t) > 1.96, "**", ifelse(abs(t) > 1.645, "*", "")))
cat("\n============================================================\n")

## =============================================================================
## 3. SPATIAL vs PERSONAL INEQUALITY  (Fig 3)
## =============================================================================
fig3_fit <- lm(gini ~ wcv, cs)
b3 <- coef(fig3_fit); t3 <- summary(fig3_fit)$coefficients[2, 3]
cat(sprintf("Fig 3: GINI = %.3f + %.3f * WCV (t = %.2f), corr = %.3f\n",
            b3[1], b3[2], t3, cor(cs$gini, cs$wcv)))
write.csv(data.frame(intercept = b3[1], slope = b3[2], t_slope = t3,
                     corr = cor(cs$gini, cs$wcv)),
          "results_gini_wcv_fit.csv", row.names = FALSE)
p3 <- ggplot(cs, aes(wcv, gini)) +
  geom_smooth(method = "lm", se = TRUE, colour = ORANGE, fill = ORANGE, alpha = 0.15) +
  geom_point(colour = STEEL, size = 2.6, alpha = 0.9) +
  annotate("text", x = min(cs$wcv), y = max(cs$gini),
           label = sprintf("GINI = %.3f + %.3f·WCV\n(t = %.2f, r = %.2f)",
                           b3[1], b3[2], t3, cor(cs$gini, cs$wcv)),
           hjust = 0, vjust = 1, colour = TEAL, size = 4) +
  labs(title = "Spatial inequality predicts personal inequality",
       subtitle = "Synthetic cross-section of 56 countries, period means 2000-2009",
       x = "Spatial inequality (WCV of regional GDP p.c.)",
       y = "Personal inequality (Gini of household income)",
       caption = "Replicating Lessmann (2013), Fig. 3") + theme_kuz()
gg_save(p3, "r_kuznets_03_gini_vs_wcv.png")

## WCV by World Bank region (context) -----------------------------------------
reg_lab <- c(ECA="Europe & C. Asia", EAP="East Asia & Pacific", LAC="Latin Am. & Carib.",
             SA="South Asia", SSA="Sub-Sahara Africa", MENA="Middle East & N. Africa",
             "NA"="North America")
reg_means <- cs %>% group_by(region_grp) %>% summarise(wcv = mean(wcv), .groups="drop") %>%
  mutate(label = reg_lab[region_grp]) %>% arrange(wcv)
p2 <- ggplot(reg_means, aes(reorder(label, wcv), wcv)) +
  geom_col(fill = STEEL, width = 0.7) +
  geom_text(aes(label = sprintf("%.2f", wcv)), hjust = -0.2, colour = LIGHTER, size = 3.6) +
  coord_flip(clip = "off") + ylim(0, max(reg_means$wcv) * 1.15) +
  labs(title = "Spatial inequality around the world",
       subtitle = "Mean synthetic WCV by World Bank region, 2000-2009",
       x = NULL, y = "WCV of regional GDP p.c.",
       caption = "Replicating Lessmann (2013), Table 1") + theme_kuz()
gg_save(p2, "r_kuznets_02_wcv_by_region.png")

## WCV explainer (two-region toy) ---------------------------------------------
p1 <- ggplot(toy, aes(region, gdp_pc, fill = region)) +
  geom_col(width = 0.6) +
  geom_hline(yintercept = sum(toy$gdp_pc*toy$pop_share), colour = TEAL,
             linetype = "dashed", linewidth = 0.9) +
  annotate("text", x = 1.5, y = sum(toy$gdp_pc*toy$pop_share) + 1200,
           label = sprintf("population-weighted mean = $%s", comma(round(sum(toy$gdp_pc*toy$pop_share)))),
           colour = TEAL, size = 3.8) +
  geom_text(aes(label = sprintf("$%s\n(pop %.0f%%)", comma(gdp_pc), pop_share*100)),
            vjust = -0.3, colour = LIGHTER, size = 3.6) +
  scale_fill_manual(values = c(ORANGE, STEEL), guide = "none") +
  ylim(0, 33000) +
  labs(title = sprintf("How the WCV is built (WCV = %.2f)", toy_wcv),
       subtitle = "A poorer but more populous region weighs more in the index",
       x = NULL, y = "Regional GDP per capita",
       caption = "WCV = (1/ȳ)·[Σ p_i (ȳ - y_i)²]^(1/2)") + theme_kuz()
gg_save(p1, "r_kuznets_01_wcv_explainer.png")

## =============================================================================
## 4. CROSS-SECTION PARAMETRIC OLS  (Table 2)
## =============================================================================
cat("\n== Table 2: cross-section parametric OLS (HC1 White SE) ==\n")
m1 <- lm(wcv ~ lnGDP, cs)
m2 <- lm(wcv ~ lnGDP + I(lnGDP^2), cs)
m3 <- lm(wcv ~ lnGDP + I(lnGDP^2) + lnunits + lnarea + area_units, cs)
m4 <- lm(wcv ~ lnGDP + I(lnGDP^2) + lnunits + lnarea + area_units +
              ethnic + trade_gdp + urbanization + federal, cs)
m5 <- lm(wcv ~ lnGDP + I(lnGDP^2) + I(lnGDP^3) + lnunits + lnarea + area_units +
              ethnic + trade_gdp + urbanization + federal, cs)
cs_models <- list("(1)"=m1, "(2)"=m2, "(3)"=m3, "(4)"=m4, "(5)"=m5)
cs_vcov   <- lapply(cs_models, function(m) vcovHC(m, "HC1"))
tab2 <- do.call(rbind, lapply(names(cs_models), function(nm) {
  ct <- hc1(cs_models[[nm]]); data.frame(model = nm,
    term = rownames(ct), estimate = ct[,1], t = ct[,3],
    stars = star(ct[,3]), adj_r2 = summary(cs_models[[nm]])$adj.r.squared)
}))
write.csv(tab2, "results_table2_crosssection.csv", row.names = FALSE)
for (nm in c("(1)","(4)","(5)")) {
  ct <- hc1(cs_models[[nm]])
  cat(sprintf("  %s lnGDP=%.3f%s (t=%.2f)  adjR2=%.3f\n", nm, ct["lnGDP",1],
              star(ct["lnGDP",3]), ct["lnGDP",3], summary(cs_models[[nm]])$adj.r.squared))
}

## cross-section scatter with linear / quadratic / cubic fits (Fig 4-context)
grid <- data.frame(lnGDP = seq(min(cs$lnGDP), max(cs$lnGDP), length.out = 200))
ctrl_means <- cs %>% summarise(across(c(lnunits,lnarea,area_units,ethnic,trade_gdp,
                                        urbanization,federal), mean))
gridc <- cbind(grid, ctrl_means[rep(1, 200), ])
gridc$lin  <- predict(m1, gridc)
gridc$quad <- predict(lm(wcv ~ lnGDP + I(lnGDP^2), cs), gridc)
gridc$cub  <- predict(m5, gridc)
p4 <- ggplot(cs, aes(lnGDP, wcv)) +
  geom_point(colour = STEEL, size = 2.4, alpha = 0.85) +
  geom_line(data = gridc, aes(y = lin,  colour = "Linear"),    linewidth = 1) +
  geom_line(data = gridc, aes(y = quad, colour = "Quadratic"), linewidth = 1) +
  geom_line(data = gridc, aes(y = cub,  colour = "Cubic"),     linewidth = 1.1) +
  scale_colour_manual(values = c(Linear = LIGHT_TEXT, Quadratic = TEAL, Cubic = ORANGE),
                      name = NULL) +
  labs(title = "Cross-section: spatial inequality vs development",
       subtitle = "A line slopes down; the cubic reveals an inverted-U with a high-income upturn",
       x = "ln(GDP per capita)", y = "WCV (period mean 2000-2009)",
       caption = "Replicating Lessmann (2013), Table 2") +
  theme_kuz() + theme(legend.position = c(0.85, 0.85))
gg_save(p4, "r_kuznets_04_crosssection_polys.png")

## =============================================================================
## 5. PANEL TWO-WAY FIXED EFFECTS  (Table 3) via fixest::feols
## =============================================================================
cat("\n== Table 3: panel two-way FE (fixest, White/hetero SE) ==\n")
fa1 <- feols(wcv ~ lnGDP + trade_gdp + urbanization | country + year, annual, vcov = "hetero")
fa2 <- feols(wcv ~ lnGDP + lnGDP2 + trade_gdp + urbanization | country + year, annual, vcov = "hetero")
fa3 <- feols(wcv ~ lnGDP + lnGDP2 + lnGDP3 + trade_gdp + urbanization | country + year, annual, vcov = "hetero")
fb1 <- feols(wcv ~ lnGDP + trade_gdp + urbanization | country + period5, p5, vcov = "hetero")
fb2 <- feols(wcv ~ lnGDP + lnGDP2 + trade_gdp + urbanization | country + period5, p5, vcov = "hetero")
fb3 <- feols(wcv ~ lnGDP + lnGDP2 + lnGDP3 + trade_gdp + urbanization | country + period5, p5, vcov = "hetero")
panel_models <- list(fa1, fa2, fa3, fb1, fb2, fb3)
gf <- function(ct, nm) if (nm %in% rownames(ct)) ct[nm, c(1,3)] else c(NA, NA)
cat(sprintf("  annual (2): lnGDP=%.3f%s  lnGDP^2=%.4f%s\n",
            fa2$coeftable["lnGDP",1], star(fa2$coeftable["lnGDP",3]),
            fa2$coeftable["lnGDP2",1], star(fa2$coeftable["lnGDP2",3])))
cat(sprintf("  annual (3): lnGDP^3=%.4f%s (cubic should be n.s.)\n",
            fa3$coeftable["lnGDP3",1], star(fa3$coeftable["lnGDP3",3])))
cat(sprintf("  within-R2 annual: %.3f/%.3f/%.3f | 5-yr (2) lnGDP=%.3f%s lnGDP^2=%.4f%s\n",
            fitstat(fa1,"wr2")$wr2, fitstat(fa2,"wr2")$wr2, fitstat(fa3,"wr2")$wr2,
            fb2$coeftable["lnGDP",1], star(fb2$coeftable["lnGDP",3]),
            fb2$coeftable["lnGDP2",1], star(fb2$coeftable["lnGDP2",3])))
tab3 <- bind_rows(lapply(seq_along(panel_models), function(k) {
  ct <- panel_models[[k]]$coeftable
  data.frame(model = c("a1","a2","a3","b1","b2","b3")[k], term = rownames(ct),
             estimate = ct[,1], t = ct[,3], stars = star(ct[,3]),
             within_r2 = fitstat(panel_models[[k]], "wr2")$wr2,
             N = panel_models[[k]]$nobs)
}))
write.csv(tab3, "results_table3_panel.csv", row.names = FALSE)

## within-country spaghetti (why FE?) -----------------------------------------
hl <- c("China","India","Russia","Brazil","United States","Bolivia")
sp <- annual %>% filter(country %in% c(hl, sample(unique(country), 14)))
p5sp <- ggplot(sp, aes(lnGDP, wcv, group = country)) +
  geom_line(data = filter(sp, !country %in% hl), colour = DARK_PANEL, linewidth = 0.5) +
  geom_line(data = filter(sp, country %in% hl), aes(colour = country), linewidth = 1) +
  scale_colour_manual(values = c(STEEL, ORANGE, TEAL, "#e0b050", "#b07cc6", "#7ec97e"),
                      name = NULL) +
  labs(title = "Within-country trajectories motivate fixed effects",
       subtitle = "Each grey line is one country over time; coloured lines highlight six cases",
       x = "ln(GDP per capita)", y = "WCV of regional GDP p.c.",
       caption = "Country fixed effects absorb time-invariant heterogeneity") +
  theme_kuz() + theme(legend.position = "right")
gg_save(p5sp, "r_kuznets_05_panel_spaghetti.png")

## TWFE quadratic fitted inverted-U -------------------------------------------
bq <- coef(fa2)
xg <- seq(quantile(annual$lnGDP,.02), quantile(annual$lnGDP,.98), length.out = 200)
fitq <- bq["lnGDP"]*xg + bq["lnGDP2"]*xg^2
fitq <- fitq - mean(fitq) + mean(annual$wcv)
p6 <- ggplot(data.frame(x = xg, y = fitq), aes(x, y)) +
  geom_line(colour = TEAL, linewidth = 1.3) +
  geom_vline(xintercept = -bq["lnGDP"]/(2*bq["lnGDP2"]), colour = ORANGE, linetype = "dashed") +
  annotate("text", x = -bq["lnGDP"]/(2*bq["lnGDP2"]), y = max(fitq),
           label = sprintf("peak at ln(GDP)=%.1f\n(~$%s)", -bq["lnGDP"]/(2*bq["lnGDP2"]),
                           comma(round(exp(-bq["lnGDP"]/(2*bq["lnGDP2"]))))),
           colour = ORANGE, hjust = -0.05, vjust = 1, size = 3.8) +
  labs(title = "Within-country inverted-U from two-way fixed effects",
       subtitle = "Fitted WCV from the quadratic TWFE model (annual panel)",
       x = "ln(GDP per capita)", y = "Fitted WCV",
       caption = "Replicating Lessmann (2013), Table 3, col. (2)") + theme_kuz()
gg_save(p6, "r_kuznets_06_twfe_fit.png")

## =============================================================================
## 6. TURNING POINTS OF THE CUBIC  (cross-section col. 5)
## =============================================================================
cat("\n== Turning points of the cross-section cubic ==\n")
bc <- coef(m5)
a3 <- 3*bc["I(lnGDP^3)"]; a2 <- 2*bc["I(lnGDP^2)"]; a1 <- bc["lnGDP"]
disc <- a2^2 - 4*a3*a1
roots <- sort(c((-a2 - sqrt(disc))/(2*a3), (-a2 + sqrt(disc))/(2*a3)))
tp <- data.frame(type = c("maximum (inequality peaks)", "minimum (inequality troughs)"),
                 ln_gdp = roots, gdp_usd = round(exp(roots)))
print(tp); write.csv(tp, "results_turning_points.csv", row.names = FALSE)
xg2 <- seq(min(cs$lnGDP), max(cs$lnGDP), length.out = 200)
deriv <- a1 + a2*xg2 + a3*xg2^2
p7 <- ggplot(data.frame(x = xg2, d = deriv), aes(x, d)) +
  geom_hline(yintercept = 0, colour = LIGHT_TEXT, linewidth = 0.4) +
  geom_line(colour = STEEL, linewidth = 1.2) +
  geom_vline(xintercept = roots, colour = ORANGE, linetype = "dashed") +
  annotate("point", x = roots, y = c(0,0), colour = TEAL, size = 3) +
  annotate("text", x = roots, y = max(deriv)*0.6,
           label = sprintf("ln=%.1f\n($%s)", roots, comma(round(exp(roots)))),
           colour = TEAL, size = 3.6) +
  labs(title = "Where does the spatial Kuznets curve turn?",
       subtitle = "Marginal effect ∂WCV/∂ln(GDP) = β₁ + 2β₂Y + 3β₃Y²",
       x = "ln(GDP per capita)", y = "Marginal effect on WCV",
       caption = "Roots mark the inverted-U peak and the high-income upturn") + theme_kuz()
gg_save(p7, "r_kuznets_07_turning_points.png")

## =============================================================================
## 6b. THE DISCRIMINANT TEST — does the cubic really bend, and in range?
## A cubic f(x)=b1 x + b2 x^2 + b3 x^3 has two real turning points iff the
## discriminant  D = b2^2 - 3 b1 b3 > 0.  (D=0 -> inflection only; D<0 -> monotone.)
## Significance of all three terms is necessary but NOT sufficient for an N-shape.
## =============================================================================
cat("\n== Discriminant test (D = b2^2 - 3 b1 b3) ==\n")
obs_lo <- min(exp(annual$lnGDP)); obs_hi <- max(exp(annual$lnGDP))
cat(sprintf("  observed income range: $%s - $%s\n", comma(round(obs_lo)), comma(round(obs_hi))))
cubic_disc <- function(b1, b2, b3) b2^2 - 3 * b1 * b3      # the note's discriminant
cubic_diag <- function(label, b1, b2, b3, lo = obs_lo, hi = obs_hi) {
  D <- cubic_disc(b1, b2, b3)
  if (D > 1e-9) {
    r   <- sort(c((-b2 - sqrt(D)) / (3 * b3), (-b2 + sqrt(D)) / (3 * b3)))  # ln turning pts
    usd <- exp(r)
    both_in <- all(usd >= lo & usd <= hi)
    regime  <- if (both_in) "2 turning points (both in range)"
               else "2 turning points (>=1 OUT of range)"
    data.frame(case = label, b1 = b1, b2 = b2, b3 = b3, D = D, regime = regime,
               tp_low = signif(usd[1], 4), tp_high = signif(usd[2], 4), in_range = both_in)
  } else {
    data.frame(case = label, b1 = b1, b2 = b2, b3 = b3, D = D,
               regime = if (abs(D) <= 1e-9) "inflection only (D=0)" else "monotonic (D<0)",
               tp_low = NA, tp_high = NA, in_range = FALSE)
  }
}
## (i) this project's own cubics
bc_cs <- coef(m5);  bc_pa <- coef(fa3)
disc_rows <- rbind(
  cubic_diag("Cross-section cubic (significant)",
             bc_cs["lnGDP"], bc_cs["I(lnGDP^2)"], bc_cs["I(lnGDP^3)"]),
  cubic_diag("Panel cubic (insignificant)",
             bc_pa["lnGDP"], bc_pa["lnGDP2"], bc_pa["lnGDP3"]),
  ## (ii) three synthetic cases, same N-shape sign pattern (b1>0, b2<0, b3>0)
  cubic_diag("Synthetic 5a: genuine N-shape", 4.4, -0.50, 0.018),
  cubic_diag("Synthetic 5b: monotonic trap",  4.4, -0.40, 0.018),
  cubic_diag("Synthetic 5c: turns out of range", 4.4, -0.50, 0.001)
)
rownames(disc_rows) <- NULL
print(disc_rows, digits = 4)
write.csv(disc_rows, "results_discriminant.csv", row.names = FALSE)

## three-regimes figure (vary only the squared term so the regime flips) ----
b1g <- as.numeric(bc_cs["lnGDP"]); b3g <- as.numeric(bc_cs["I(lnGDP^3)"])
reg_cases <- data.frame(
  lab = c("D < 0  (monotonic)", "D = 0  (inflection)", "D > 0  (genuine N-shape)"),
  b1 = b1g, b3 = b3g,
  b2 = c(-0.40, -sqrt(3 * b1g * b3g), as.numeric(bc_cs["I(lnGDP^2)"])))
xg3 <- seq(min(cs$lnGDP), max(cs$lnGDP), length.out = 200)
reg_df <- do.call(rbind, lapply(seq_len(nrow(reg_cases)), function(i) {
  b1 <- reg_cases$b1[i]; b2 <- reg_cases$b2[i]; b3 <- reg_cases$b3[i]
  f  <- b1 * xg3 + b2 * xg3^2 + b3 * xg3^3
  D  <- cubic_disc(b1, b2, b3)
  data.frame(x = xg3, f = f - mean(f),
             facet = sprintf("%s\nD = %+.3f", reg_cases$lab[i], D))
}))
reg_df$facet <- factor(reg_df$facet, levels = unique(reg_df$facet))
p14 <- ggplot(reg_df, aes(x, f)) +
  geom_line(colour = ORANGE, linewidth = 1.3) +
  facet_wrap(~ facet, nrow = 1, scales = "free_y") +
  labs(title = "Same significant terms, three different shapes",
       subtitle = "The discriminant D = β₂² - 3β₁β₃ decides whether the cubic actually bends",
       x = "ln(GDP per capita)", y = "Partial fit, centred",
       caption = "Only the squared-term magnitude changes across panels") +
  theme_kuz() + theme(strip.text = element_text(colour = LIGHTER, face = "bold"))
ggsave("r_kuznets_14_discriminant_regimes.png", p14, width = 11, height = 4.2,
       dpi = 300, bg = DARK_BG)
cat("  saved r_kuznets_14_discriminant_regimes.png\n")

## =============================================================================
## 7. SEMIPARAMETRIC CROSS-SECTION — ROBINSON (1988)  (Table 4, Fig 4)
## =============================================================================
cat("\n== Table 4: semiparametric cross-section (Robinson double-residual) ==\n")
Xnames <- c("lnunits","lnarea","area_units","ethnic","trade_gdp","urbanization","federal")
bw_cache <- "np_cs_bw.rds"
resid_np <- function(v, z) residuals(npreg(v ~ z, regtype = "ll",
                                           ckertype = "gaussian", bws = sd(z) * 0.6))
ey <- resid_np(cs$wcv, cs$lnGDP)
eX <- sapply(Xnames, function(nm) resid_np(cs[[nm]], cs$lnGDP))
rob <- lm(ey ~ eX - 1); rs <- summary(rob)$coefficients; rownames(rs) <- Xnames
## confirm np::npplreg gives the same point estimates (cache the bandwidth object)
if (file.exists(bw_cache)) bwpl <- readRDS(bw_cache) else {
  bwpl <- npplregbw(as.formula(paste("wcv ~", paste(Xnames, collapse = " + "), "| lnGDP")),
                    data = cs, regtype = "ll", ckertype = "gaussian", nmulti = 1)
  saveRDS(bwpl, bw_cache)
}
npfit <- npplreg(bws = bwpl)
tab4 <- data.frame(term = Xnames, robinson_coef = rs[,1], se = rs[,2], t = rs[,3],
                   stars = star(rs[,3]), npplreg_coef = as.numeric(coef(npfit)))
print(round(tab4[,c("robinson_coef","t","npplreg_coef")], 4))
write.csv(tab4, "results_table4_semipar_cs.csv", row.names = FALSE)
## partial fit f(Y) with 90% bands
fY <- cs$wcv - as.matrix(cs[Xnames]) %*% rs[,1]
fgrid <- npreg(fY ~ cs$lnGDP, regtype = "ll", ckertype = "gaussian",
               bws = sd(cs$lnGDP)*0.55,
               exdat = data.frame(`cs$lnGDP` = xg2, check.names = FALSE))
fdf <- data.frame(x = xg2, f = fitted(fgrid), se = fgrid$merr)
ptsdf <- data.frame(x = cs$lnGDP, f = fY)
p8 <- ggplot(fdf, aes(x, f)) +
  geom_ribbon(aes(ymin = f - 1.645*se, ymax = f + 1.645*se), fill = STEEL, alpha = 0.2) +
  geom_point(data = ptsdf, colour = STEEL, alpha = 0.5, size = 1.8) +
  geom_line(colour = ORANGE, linewidth = 1.3) +
  labs(title = "Semiparametric cross-section: the Robinson estimator",
       subtitle = "Flexible partial fit f(ln GDP); points are partial residuals, band is 90%",
       x = "ln(GDP per capita)", y = "Spatial inequality (partial residual)",
       caption = "Replicating Lessmann (2013), Fig. 4 (Robinson 1988)") + theme_kuz()
gg_save(p8, "r_kuznets_08_robinson_partial.png")

## =============================================================================
## 8. SEMIPARAMETRIC PANEL — BALTAGI & LI (2002) B-spline series  (Table 5, Fig 5)
## =============================================================================
cat("\n== Table 5: semiparametric panel (Baltagi-Li B-spline, order k=4) ==\n")
bl_fit <- function(dat, fe) {
  B <- bs(dat$lnGDP, degree = 3, df = 5); colnames(B) <- paste0("bs", 1:5)
  dd <- cbind(dat, B)
  f  <- as.formula(paste("wcv ~", paste0("bs", 1:5, collapse = "+"),
                         "+ trade_gdp + urbanization |", fe))
  list(fit = feols(f, dd, vcov = "hetero"), B = B, dd = dd)
}
bla <- bl_fit(annual, "country + year")
blb <- bl_fit(p5,     "country + period5")
tab5 <- bind_rows(
  data.frame(spec = "annual", term = c("trade_gdp","urbanization"),
             estimate = bla$fit$coeftable[c("trade_gdp","urbanization"),1],
             t = bla$fit$coeftable[c("trade_gdp","urbanization"),3],
             stars = star(bla$fit$coeftable[c("trade_gdp","urbanization"),3]),
             N = bla$fit$nobs, within_r2 = fitstat(bla$fit,"wr2")$wr2),
  data.frame(spec = "5-year", term = c("trade_gdp","urbanization"),
             estimate = blb$fit$coeftable[c("trade_gdp","urbanization"),1],
             t = blb$fit$coeftable[c("trade_gdp","urbanization"),3],
             stars = star(blb$fit$coeftable[c("trade_gdp","urbanization"),3]),
             N = blb$fit$nobs, within_r2 = fitstat(blb$fit,"wr2")$wr2))
print(round(tab5[,c("estimate","t","within_r2")], 4))
write.csv(tab5, "results_table5_semipar_panel.csv", row.names = FALSE)
## recover f(Y) from the spline contribution + 90% band
spline_curve <- function(obj, dat) {
  cf <- coef(obj$fit); sb <- cf[paste0("bs",1:5)]
  Bg <- predict(obj$B, newx = seq(quantile(dat$lnGDP,.02), quantile(dat$lnGDP,.98), length.out = 200))
  pe <- as.numeric(Bg %*% sb)
  V  <- vcov(obj$fit)[paste0("bs",1:5), paste0("bs",1:5)]
  se <- sqrt(pmax(0, rowSums((Bg %*% V) * Bg)))
  data.frame(x = seq(quantile(dat$lnGDP,.02), quantile(dat$lnGDP,.98), length.out = 200),
             f = pe - mean(pe), se = se)
}
ca <- spline_curve(bla, annual); cb <- spline_curve(blb, p5)
mk_bl <- function(df, ttl, sub) ggplot(df, aes(x, f)) +
  geom_ribbon(aes(ymin = f - 1.645*se, ymax = f + 1.645*se), fill = TEAL, alpha = 0.18) +
  geom_line(colour = TEAL, linewidth = 1.3) +
  labs(title = ttl, subtitle = sub, x = "ln(GDP per capita)",
       y = "f(ln GDP), centred", caption = "Baltagi & Li (2002), cubic B-spline series") +
  theme_kuz()
gg_save(mk_bl(ca, "Semiparametric panel (annual)", "Cubic B-spline within-country fit, country & year FE"),
        "r_kuznets_09_baltagili_annual.png")
gg_save(mk_bl(cb, "Semiparametric panel (5-year averages)", "Cubic B-spline within-country fit, country & period FE"),
        "r_kuznets_10_baltagili_5yr.png")

## =============================================================================
## 9. SECTORAL CHANNEL  (Table 6)
## =============================================================================
cat("\n== Table 6: sectoral data (non-agricultural GVA / GDP) ==\n")
s1 <- lm(wcv ~ nonag, cs)
s4 <- lm(wcv ~ nonag + I(nonag^2) + lnunits + lnarea + area_units +
              ethnic + trade_gdp + urbanization + federal, cs)
s5 <- lm(wcv ~ nonag + I(nonag^2) + I(nonag^3) + lnunits + lnarea + area_units +
              ethnic + trade_gdp + urbanization + federal, cs)
cs6 <- hc1(s4)
cat(sprintf("  nonag=%.4f%s  nonag^2=%.5f%s\n", cs6["nonag",1], star(cs6["nonag",3]),
            cs6["I(nonag^2)",1], star(cs6["I(nonag^2)",3])))
tab6 <- do.call(rbind, lapply(list("(1)"=s1,"(4)"=s4,"(5)"=s5), function(m) {
  ct <- hc1(m); data.frame(term = rownames(ct), estimate = ct[,1], t = ct[,3],
                           stars = star(ct[,3]), adj_r2 = summary(m)$adj.r.squared) }))
write.csv(tab6, "results_table6_sectoral.csv", row.names = FALSE)
ng <- data.frame(nonag = seq(min(cs$nonag), max(cs$nonag), length.out = 200))
ngc <- cbind(ng, ctrl_means[rep(1,200),]); ngc$fit <- predict(s4, ngc)
p11 <- ggplot(cs, aes(nonag, wcv)) +
  geom_point(colour = STEEL, size = 2.4, alpha = 0.85) +
  geom_line(data = ngc, aes(y = fit), colour = ORANGE, linewidth = 1.2) +
  labs(title = "The sectoral channel behind the Kuznets curve",
       subtitle = "Inequality rises then falls with the non-agricultural share of GVA",
       x = "Non-agricultural GVA / GDP (%)", y = "WCV (period mean)",
       caption = "Replicating Lessmann (2013), Table 6") + theme_kuz()
gg_save(p11, "r_kuznets_11_sectoral.png")

## =============================================================================
## 10. ROBUSTNESS  (Table A.5/A.6, Fig 7)
## =============================================================================
cat("\n== Robustness: exclude poorest, exclude capitals, alt measures, log vs level ==\n")
## (a) exclude poorest (GDP p.c. < $1000): inverted-U weakens, cubic dominates
poor_cut <- log(1000)
cs_rich <- filter(cs, lnGDP >= poor_cut)
r_full <- hc1(m5)["I(lnGDP^3)", c(1,3)]
m5r <- lm(wcv ~ lnGDP + I(lnGDP^2) + I(lnGDP^3) + lnunits + lnarea + area_units +
               ethnic + trade_gdp + urbanization + federal, cs_rich)
r_excl <- hc1(m5r)["I(lnGDP^3)", c(1,3)]
## (b) exclude capital regions: correlation of WCV with/without capital
cap_corr <- cor(cs$wcv, cs$wcv_nocap)
## (c) alternative measures
mcv  <- lm(cv ~ lnGDP + I(lnGDP^2) + I(lnGDP^3) + lnunits + lnarea + area_units +
                ethnic + trade_gdp + urbanization + federal, cs)
mgr  <- lm(gini_reg ~ lnGDP + I(lnGDP^2) + I(lnGDP^3) + lnunits + lnarea + area_units +
                ethnic + trade_gdp + urbanization + federal, cs)
rob_summary <- data.frame(
  test = c("cubic (full sample)", "cubic (exclude GDP<$1000)", "WCV vs WCV-no-capital corr",
           "CV cubic", "regional-Gini cubic"),
  estimate = c(r_full[1], r_excl[1], cap_corr,
               hc1(mcv)["I(lnGDP^3)",1], hc1(mgr)["I(lnGDP^3)",1]),
  t_or_note = c(r_full[2], r_excl[2], NA, hc1(mcv)["I(lnGDP^3)",3], hc1(mgr)["I(lnGDP^3)",3]))
print(rob_summary); write.csv(rob_summary, "results_robustness_subset.csv", row.names = FALSE)
p13 <- ggplot(cs, aes(lnGDP, wcv)) +
  geom_point(aes(colour = lnGDP < poor_cut), size = 2.3, alpha = 0.85) +
  geom_smooth(method = "lm", formula = y ~ poly(x,3), se = FALSE, colour = STEEL, linewidth = 1) +
  geom_smooth(data = cs_rich, method = "lm", formula = y ~ poly(x,3), se = FALSE,
              colour = ORANGE, linewidth = 1) +
  scale_colour_manual(values = c(`FALSE` = STEEL, `TRUE` = ORANGE),
                      labels = c("kept","GDP < $1000 (dropped)"), name = NULL) +
  labs(title = "Robustness: excluding the poorest countries",
       subtitle = "Blue cubic = full sample; orange cubic = richer subsample",
       x = "ln(GDP per capita)", y = "WCV (period mean)",
       caption = "Replicating Lessmann (2013), Table A.6") +
  theme_kuz() + theme(legend.position = c(0.8, 0.85))
gg_save(p13, "r_kuznets_13_exclude_poorest.png")

## (d) log vs level of income (Fig 7) — level shows the high-income upturn
cs$gdp_k <- exp(cs$lnGDP) / 1000
lvl_curve <- spline_curve(bl_fit(transform(annual, lnGDP = exp(lnGDP)/1000), "country + year"),
                          transform(annual, lnGDP = exp(lnGDP)/1000))
log_df <- ca; log_df$panel <- "ln(GDP) — no upturn"
lvl_df <- lvl_curve; lvl_df$panel <- "GDP level — slight upturn at top"
pL <- ggplot(log_df, aes(x, f)) +
  geom_ribbon(aes(ymin=f-1.645*se, ymax=f+1.645*se), fill = TEAL, alpha=.15) +
  geom_line(colour = TEAL, linewidth = 1.2) +
  labs(title="(a) Income in logs", x="ln(GDP per capita)", y="f, centred") + theme_kuz()
pR <- ggplot(lvl_df, aes(x, f)) +
  geom_ribbon(aes(ymin=f-1.645*se, ymax=f+1.645*se), fill = ORANGE, alpha=.15) +
  geom_line(colour = ORANGE, linewidth = 1.2) +
  labs(title="(b) Income in levels", x="GDP per capita ($000s)", y=NULL) + theme_kuz()
p12 <- (pL | pR) + plot_annotation(
  title = "Why the high-income upturn is fragile: logs vs levels",
  subtitle = "Replicating Lessmann (2013), Fig. 7 — the upturn appears only without the log transform",
  theme = theme_kuz())
ggsave("r_kuznets_12_log_vs_level.png", p12, width = 11, height = 5, dpi = 300, bg = DARK_BG)
cat("  saved r_kuznets_12_log_vs_level.png\n")

## =============================================================================
## 11. SUMMARY STATISTICS  (Table A.3)
## =============================================================================
cat("\n== Table A.3: summary statistics ==\n")
sumvars <- cs %>% transmute(WCV = wcv, CV = cv, `Regional Gini` = gini_reg,
  `ln(units)` = lnunits, `ln(area)` = lnarea, `Ethnic frac.` = ethnic,
  `Trade/GDP` = trade_gdp, Urbanization = urbanization, `Federal` = federal,
  `ln(GDP p.c.)` = lnGDP)
tabA3 <- data.frame(Variable = names(sumvars),
  Mean = sapply(sumvars, mean), SD = sapply(sumvars, sd),
  Min = sapply(sumvars, min), Max = sapply(sumvars, max))
print(round(tabA3[,-1], 2)); write.csv(tabA3, "results_tableA3_summary.csv", row.names = FALSE)

## =============================================================================
## 12. PUBLICATION-QUALITY REGRESSION-TABLE IMAGES (modelsummary + gt)
## =============================================================================
cat("\n== Rendering regression-table images ==\n")
gt_dark <- function(g) g |>
  gt::tab_options(table.background.color = DARK_PANEL, table.font.color = LIGHTER,
                  column_labels.background.color = "#16224d", heading.background.color = "#16224d",
                  table.border.top.color = STEEL, table.border.bottom.color = STEEL,
                  table_body.hlines.color = "#324", table.font.size = px(13))
save_tbl <- function(g, file) {
  ok <- tryCatch({ gt::gtsave(gt_dark(g), file, vwidth = 1100, vheight = 800); TRUE },
                 error = function(e) { message("  gtsave failed: ", conditionMessage(e)); FALSE })
  if (ok) cat("  saved", file, "\n")
}
cm2 <- c("lnGDP"="ln(GDP p.c.)","I(lnGDP^2)"="ln(GDP p.c.)²","I(lnGDP^3)"="ln(GDP p.c.)³",
  "lnunits"="ln(units)","lnarea"="ln(area)","area_units"="ln(area)/ln(units)","ethnic"="Ethnic frac.",
  "trade_gdp"="Trade/GDP","urbanization"="Urbanization","federal"="Federal dummy","(Intercept)"="Constant")
g2 <- modelsummary(cs_models, vcov = cs_vcov, coef_map = cm2,
        gof_map = c("nobs","adj.r.squared"), stars = c('*'=.1,'**'=.05,'***'=.01),
        output = "gt", title = "Table 2 — Cross-section parametric estimates (synthetic)")
save_tbl(g2, "r_kuznets_table2_crosssection.png")
g3 <- modelsummary(setNames(panel_models, c("Annual (1)","Annual (2)","Annual (3)",
        "5-yr (4)","5-yr (5)","5-yr (6)")),
        coef_map = c("lnGDP"="ln(GDP p.c.)","lnGDP2"="ln(GDP p.c.)²","lnGDP3"="ln(GDP p.c.)³",
                     "trade_gdp"="Trade/GDP","urbanization"="Urbanization"),
        gof_map = c("nobs","wr2"), stars = c('*'=.1,'**'=.05,'***'=.01),
        output = "gt", title = "Table 3 — Panel two-way fixed-effects estimates (synthetic)")
save_tbl(g3, "r_kuznets_table3_panel.png")
g45 <- tab4 |> select(Term = term, `Robinson coef.` = robinson_coef, `t` = t,
                      Sig = stars, `np::npplreg` = npplreg_coef) |>
  gt::gt() |> gt::fmt_number(columns = c(`Robinson coef.`, t, `np::npplreg`), decimals = 3) |>
  gt::tab_header(title = "Tables 4 & 5 — Semiparametric linear part (Robinson, cross-section)")
save_tbl(g45, "r_kuznets_table4_5_semipar.png")
gA3 <- tabA3 |> gt::gt() |> gt::fmt_number(columns = c(Mean,SD,Min,Max), decimals = 2) |>
  gt::tab_header(title = "Table A.3 — Summary statistics (synthetic cross-section, N=56)")
save_tbl(gA3, "r_kuznets_tableA3_summary.png")

## =============================================================================
## 13. CALIBRATION SCOREBOARD  (paper targets vs synthetic)
## =============================================================================
cat("\n============================================================\n")
cat(" CALIBRATION SCOREBOARD (paper target -> synthetic)\n")
cat("============================================================\n")
c1t <- hc1(m1); c4t <- hc1(m4); c5t <- hc1(m5)
cat(sprintf(" CS  (1) lnGDP       -0.098*** -> %.3f%s\n", c1t["lnGDP",1], star(c1t["lnGDP",3])))
cat(sprintf(" CS  (4) lnGDP/^2  +0.33*/-0.021* -> %.3f%s / %.3f%s\n",
   c4t["lnGDP",1],star(c4t["lnGDP",3]), c4t["I(lnGDP^2)",1],star(c4t["I(lnGDP^2)",3])))
cat(sprintf(" CS  (5) cubic 3.86**/-0.45**/0.017** -> %.2f%s/%.3f%s/%.4f%s\n",
   c5t["lnGDP",1],star(c5t["lnGDP",3]), c5t["I(lnGDP^2)",1],star(c5t["I(lnGDP^2)",3]),
   c5t["I(lnGDP^3)",1],star(c5t["I(lnGDP^3)",3])))
cat(sprintf(" CS  adjR2 0.43/0.66/0.69 -> %.2f/%.2f/%.2f\n",
   summary(m1)$adj.r.squared, summary(m4)$adj.r.squared, summary(m5)$adj.r.squared))
cat(sprintf(" CS  turning points 7.5/10.1 -> %.1f/%.1f ($%s/$%s)\n",
   roots[1], roots[2], comma(round(exp(roots[1]))), comma(round(exp(roots[2])))))
cat(sprintf(" DISC CS cubic D=%+.4f (%s) ; panel cubic D=%+.4f (%s)\n",
   disc_rows$D[1], disc_rows$regime[1], disc_rows$D[2], disc_rows$regime[2]))
cat(sprintf(" PAN (2) lnGDP/^2 0.345**/-0.018** -> %.3f%s/%.4f%s ; cubic n.s. -> %.4f%s\n",
   fa2$coeftable["lnGDP",1],star(fa2$coeftable["lnGDP",3]),
   fa2$coeftable["lnGDP2",1],star(fa2$coeftable["lnGDP2",3]),
   fa3$coeftable["lnGDP3",1],star(fa3$coeftable["lnGDP3",3])))
cat(sprintf(" FIG3 slope 0.152 (t2.97) -> %.3f (t%.2f) ; Tab6 nonag inverted-U -> %.4f%s/%.5f%s\n",
   b3[2], t3, cs6["nonag",1], star(cs6["nonag",3]),
   cs6["I(nonag^2)",1], star(cs6["I(nonag^2)",3])))
cat(sprintf(" N annual/5yr/cs 915/207/56 -> %d/%d/%d\n", nrow(annual), nrow(p5), nrow(cs)))

## clean up the stray base-graphics file R may leave behind
if (file.exists("Rplots.pdf")) file.remove("Rplots.pdf")
cat("\n=== Script completed successfully ===\n")
