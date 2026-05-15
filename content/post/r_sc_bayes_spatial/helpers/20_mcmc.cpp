// [[Rcpp::depends(RcppArmadillo)]]
// [[Rcpp::plugins(cpp17)]]
#include <RcppArmadillo.h>
#include <cmath>
using namespace Rcpp;
using namespace arma;

// =========================== Utilities ===========================
inline double rinvgamma(double shape, double scale) { return 1.0 / R::rgamma(shape, 1.0/scale); }

// stable log|det|
inline double logdet_stable(const arma::mat& A) {
  double sign = 0.0, val = 0.0;
  arma::log_det(val, sign, A);
  return val;
}

inline double clip1(double z, double lo = 1e-12, double hi = 1e12) {
  return std::min(std::max(z, lo), hi);
}
inline arma::vec clip_vec(const arma::vec& v, double lo = 1e-12, double hi = 1e12) {
  arma::vec out = v;
  for (arma::uword i = 0; i < out.n_elem; ++i) out(i) = clip1(out(i), lo, hi);
  return out;
}
inline void symmetrize_inplace(arma::mat& A) { A = 0.5 * (A + A.t()); }

inline bool robust_chol(arma::mat& R, arma::mat A, double base_eps=1e-10) {
  symmetrize_inplace(A);
  for (int k=0; k<6; ++k) {
    if (chol(R, A)) return true;
    A.diag() += base_eps * std::pow(10.0, k);
    symmetrize_inplace(A);
  }
  arma::vec d; arma::mat V;
  if (eig_sym(d, V, A)) {
    for (uword i=0;i<d.n_elem;++i) if (d(i) < base_eps) d(i) = base_eps;
    A = V * diagmat(d) * V.t();
    symmetrize_inplace(A);
  }
  return chol(R, A);
}

// ================================================================
// Step 1: BSCM  (y0 = Yc * alpha + eps), Horseshoe prior on alpha
// Returns M x N matrix of alpha draws (post-burn)
// ================================================================
// [[Rcpp::export]]
arma::mat hs_alpha_gibbs_cpp(const arma::vec& Y0_pre,
                                           const arma::mat& control_outcome_pre,
                                           const int iteration,
                                           const int burn,
                                           const bool verbose=false) {
  Rcpp::RNGScope scope;

  const int T0 = (int)Y0_pre.n_elem;
  const int N  = (int)control_outcome_pre.n_cols;
  const int iters = iteration;

  const double FLO = 1e-12, FHI = 1e12;


  vec alpha_curr = 1e-4 * randn<vec>(N);

  arma::vec sx(N);
  for (int j=0; j<N; ++j){
    double sdj = std::sqrt(arma::var(control_outcome_pre.col(j)));
    if(!arma::is_finite(sdj) || sdj < 1e-8) sdj = 1e-8;
    sx(j) = sdj;
  }

  double sy = std::sqrt(arma::var(Y0_pre));
  if(!arma::is_finite(sy) || sy < 1e-8) sy = 1e-8;

  arma::mat X = control_outcome_pre;
  for (int j=0; j<N; ++j) X.col(j) /= sx(j);
  arma::vec y = Y0_pre / sy;

  vec sigma2_i_curr(N, fill::ones);
  vec nu_sigma_i_curr(N, fill::ones);
  double tau2_curr   = 1.0;
  double nu_tau_curr = 1.0;
  double sigma2_curr = as_scalar(var(y));
  if (!arma::is_finite(sigma2_curr) || sigma2_curr <= 0.0) sigma2_curr = 1.0;
  double nu_sigma_curr = 1.0;

  mat XtX = X.t() * X;
  vec Xty = X.t() * y;

  const int M = std::max(0, iters - burn);
  mat draws(M, N, fill::none);

  for (int iter = 1; iter <= iters; ++iter) {
    if (verbose && (iter % 2000 == 0)) {
      Rcpp::checkUserInterrupt();
    }

    // ===== D = D_temp + sigma2 * Diagonal(1 ./ sigma2_i) =====
    vec inv_sigma2_i = 1.0 / clamp(sigma2_i_curr, FLO, FHI);
    double sig2 = std::min(std::max(sigma2_curr, FLO), FHI);
    double tau2 = std::min(std::max(tau2_curr, FLO), FHI);
    // Rcpp::Rcout << sig2 << '\n';
    mat D = XtX;
    D.diag() += sig2 * (inv_sigma2_i);

    // cholesky(D)
    mat R;
    bool ok = robust_chol(R, D);
    if (!ok) Rcpp::stop("chol(D) failed even after stabilization.");

    // ===== D_inv = Symmetric( D_chol \ I ) =====
    mat I_N = eye<mat>(N, N);
    // mat D_inv = solve(trimatu(R), I_N, solve_opts::fast);
    // D_inv = solve(trimatl(R.t()), D_inv, solve_opts::fast);
    mat D_inv = solve(D, I_N, solve_opts::fast);
    symmetrize_inplace(D_inv);

    // ===== alpha_mean = D_inv * X' * Y0,  alpha_cov = sigma2 * D_inv =====
    vec alpha_mean = D_inv * Xty;

    arma::mat Sigma = std::max(sig2, 1e-12) * D_inv;
    arma::vec alpha_new = arma::mvnrnd(alpha_mean, Sigma, 1);
    alpha_curr = alpha_new;

    // sigma2_i[i] ~ IG(1, 0.5*alpha[i]^2 + 1/nu_sigma_i[i])
    vec sigma2_i_next(N);
    for (int i=0;i<N;++i) {
      double sc = 0.5 * alpha_curr[i]*alpha_curr[i] + 1.0 / std::max(nu_sigma_i_curr[i], FLO);
      double draw = rinvgamma(1.0, sc);
      sigma2_i_next[i] = std::min(std::max(draw, FLO), FHI);
    }
    sigma2_i_curr = sigma2_i_next;

    // nu_sigma_i[i] ~ IG(1, 1/sigma2_i[i] + 1/tau2)
    vec nu_sigma_i_next(N);
    for (int i=0;i<N;++i) {
      double sc = 1.0 / std::max(sigma2_i_curr[i], FLO) + 1.0 / std::max(tau2_curr, FLO);
      double draw = rinvgamma(1.0, sc);
      nu_sigma_i_next[i] = std::min(std::max(draw, FLO), FHI);
    }
    nu_sigma_i_curr = nu_sigma_i_next;

    // tau2 ~ IG((N+1)/2, sum(1./nu_sigma_i) + 1/nu_tau)
    double sc_tau = accu(1.0 / clamp(nu_sigma_i_curr, FLO, FHI)) + 1.0 / std::max(nu_tau_curr, FLO);
    tau2_curr = std::min(std::max(rinvgamma(0.5 * (N + 1.0), sc_tau), FLO), FHI);

    // nu_tau ~ IG(1, 1/tau2 + 1/sigma2)
    double sc_nutau = 1.0 / std::max(tau2_curr, FLO) + 1.0 / std::max(sigma2_curr, FLO);
    nu_tau_curr = std::min(std::max(rinvgamma(1.0, sc_nutau), FLO), FHI);

    // sigma2 ~ IG(1 + T0/2, 1/nu_tau + 1/nu_sigma + 0.5 * SSE)
    vec res = y - X * alpha_curr;
    double sse = dot(res, res);
    double shape_sig = 1.0 + 0.5 * T0;
    double sc_sig = 1.0 / std::max(nu_tau_curr, FLO) + 1.0 / std::max(nu_sigma_curr, FLO) + 0.5 * sse;
    sigma2_curr = std::min(std::max(rinvgamma(shape_sig, sc_sig), FLO), FHI);

    // nu_sigma ~ IG(1, 1/sigma2 + 1/10^2)
    double sc_nus = 1.0 / std::max(sigma2_curr, FLO) + 1.0 / (10.0 * 10.0);
    nu_sigma_curr = std::min(std::max(rinvgamma(1.0, sc_nus), FLO), FHI);

    // keep
    if (iter > burn){
      for (int j=0; j<N; ++j) draws(iter - burn - 1, j) = (sy / sx(j)) * alpha_curr[j];
    }
  }

  return draws;
}

// ================================================================
// Step 2: SAR with fixed alpha_hat
//  (I - rho W - rho w alpha^T) Yc_t = X_t beta + Lambda F_t + u_t
//  alpha is fixed at alpha_hat (from Step 1 posterior mean)
//  p: number of latent factors (if 0, no factors)
// ================================================================

// [[Rcpp::export]]
Rcpp::List sar_full_sampler_cpp_step2(const arma::mat& Yc_pre,           // T0 x N
                                      const arma::vec& alpha_hat_in,     // N (unscaled, matches Yc_pre)
                                      Rcpp::Nullable<Rcpp::NumericVector> Xc_pre_, // (T0*N*K)
                                      int T0, int N, int K, int p,
                                      const arma::vec& w,             // N
                                      const arma::mat& W,                // N x N
                                      int iteration, int burn,
                                      double step_rho = 0.01,
                                      double a0 = 1.0, double b0 = 1.0,
                                      bool verbose=false) {
  Rcpp::RNGScope scope;

  const int M = std::max(0, iteration - burn);

  // // ---------- scale Yc columns by SD ----------
  // arma::mat Yc_orig = Yc_pre; // T0 x N
  // arma::vec sds_Yc(N);
  // arma::mat Yc = Yc_orig;
  // for (int j = 0; j < N; ++j) {
  //   double sdj = arma::stddev(Yc_orig.col(j));
  //   if (!arma::is_finite(sdj) || sdj < 1e-8) sdj = 1.0;
  //   sds_Yc(j) = sdj;
  //   Yc.col(j) = Yc_orig.col(j) / sdj;
  // }
  // arma::vec alpha = alpha_hat_in / sds_Yc; // N
  const arma::mat& Yc = Yc_pre;
  const arma::vec& alpha = alpha_hat_in;

  // X accessor
  const bool useX = (K > 0) && Xc_pre_.isNotNull();
  Rcpp::NumericVector Xvec;
  if (useX) Xvec = Xc_pre_.get();
  auto X_get_row = [&](int t)->arma::mat {
    arma::mat Xt(N, K, arma::fill::zeros);
    if (!useX) return Xt;
    for (int i=0;i<N;++i)
      for (int k=0;k<K;++k)
        Xt(i,k) = Xvec[(t * N + i) * K + k];
    return Xt;
  };

  // spectral bound for rho
  arma::cx_vec evals = arma::eig_gen(W);
  double maxabs = 0.0;
  for (uword i=0; i<evals.n_elem; ++i) maxabs = std::max(maxabs, std::abs(evals[i]));
  double bnd = 0.95 / std::max(1.0, maxabs);

  // storage
  arma::vec rho_draws(M, arma::fill::none);
  arma::vec s2_draws(M, arma::fill::none);
  arma::mat beta_draws(M, K, arma::fill::zeros);
  arma::cube Lambda_draws(N, p, M, arma::fill::zeros); // Eta
  arma::cube F_draws(p, T0, M, arma::fill::zeros);     // Gamma

  // states
  double rho = 0.0;
  double s2  = 1.0;
  arma::vec beta = (K>0 ? arma::zeros<arma::vec>(K) : arma::vec());
  arma::mat Eta   = (p>0 ? arma::zeros<arma::mat>(N,p) : arma::mat());
  arma::mat Gamma = (p>0 ? arma::zeros<arma::mat>(p,T0) : arma::mat());
  double phi_g = 0.0, s2_g = 1.0, nu_s2_g = 1.0;
  arma::vec omega_k    = (p>0 ? arma::ones<arma::vec>(p) : arma::vec());
  arma::vec nu_omega_k = (p>0 ? arma::ones<arma::vec>(p) : arma::vec());
  double s2_eta = 1.0, nu_s2_eta = 1.0;
  double nu_sigma2 = 1.0;

  arma::mat I_N = arma::eye(N,N);
  arma::mat I_K = (K>0 ? arma::eye(K,K) : arma::mat());
  arma::mat I_p = (p>0 ? arma::eye(p,p) : arma::mat());

  // ------------------------------------------------------------------

  // ------------------------------------------------------------------


  // M = I - rho * A
  arma::mat A_const = W + w * alpha.t();


  arma::cx_vec evals_A;
  if (!arma::eig_gen(evals_A, A_const)) {
      Rcpp::stop("Eigenvalue calculation failed for A_const.");
  }


  std::vector<arma::vec> AYc_vec(T0);
  for(int t=0; t<T0; ++t) {
      AYc_vec[t] = A_const * Yc.row(t).t();
  }
  // ------------------------------------------------------------------
  auto loglik_core_pair = [&](double r)->std::pair<double,double> {
    if (std::abs(r) >= bnd) return {-std::numeric_limits<double>::infinity(), 0.0};

    double ldetM = 0.0;
    for (arma::uword i = 0; i < evals_A.n_elem; ++i) {
        ldetM += std::log(std::complex<double>(1.0, 0.0) - r * evals_A(i)).real();
    }
    if (!std::isfinite(ldetM)) return {-std::numeric_limits<double>::infinity(), 0.0};

    double ss = 0.0;
    for (int t=0; t<T0; ++t) {
      arma::vec u = Yc.row(t).t() - r * AYc_vec[t];
      if (useX)  u -= X_get_row(t) * beta;
      if (p>0)   u -= Eta * Gamma.col(t);
      ss += arma::dot(u,u);
    }

    double ll = T0 * ldetM - 0.5 * (N*T0) * std::log(s2) - 0.5 * ss / s2;
    return {ll, ss};
  };

  // RWMH adaptation for rho
  int acc_rho = 0;
  double log_step_rho = std::log(step_rho);
  const double target_accept_rho = 0.234;
  const double adapt_gamma = 0.6;

  for (int it=0; it<iteration; ++it) {

    // (1) Gamma | rest (FFBS) when p>0
    if (p > 0) {
      arma::mat Phi   = I_p * phi_g;
      arma::mat Q_mat = I_p * s2_g;
      arma::mat H_mat = Eta;
      arma::mat HtH_s2_inv = (H_mat.t() * H_mat) / clip1(s2);
      arma::mat Ht_s2_inv  = H_mat.t() / clip1(s2);

      std::vector<arma::vec> gamma_t_t(T0);
      std::vector<arma::mat> P_t_t(T0);
      std::vector<arma::vec> gamma_t_t1(T0);
      std::vector<arma::mat> P_t_t1(T0);

      arma::vec gamma_prev = arma::zeros<arma::vec>(p);
      arma::mat P_prev = (clip1(s2_g) / std::max(1e-6, 1.0 - phi_g*phi_g)) * I_p;

      for (int t = 0; t < T0; ++t) {

        arma::vec Y_star_t = Yc.row(t).t() - rho * AYc_vec[t];
        if (useX) Y_star_t -= X_get_row(t) * beta;

        arma::vec pred = Phi * gamma_prev;
        arma::mat P_pred = Phi * P_prev * Phi.t() + Q_mat;

        arma::mat P_inv_pred = arma::inv_sympd(P_pred);
        arma::mat V_inv_t = P_inv_pred + HtH_s2_inv;
        arma::mat V_t = arma::inv_sympd(V_inv_t);

        arma::vec m_t = V_t * (P_inv_pred * pred + Ht_s2_inv * Y_star_t);

        gamma_t_t[t]  = m_t; P_t_t[t] = V_t;
        gamma_t_t1[t] = pred; P_t_t1[t] = P_pred;
        gamma_prev = m_t; P_prev = V_t;
      }


      arma::vec m_T = gamma_t_t[T0 - 1];
      arma::mat V_T = P_t_t[T0 - 1];
      arma::mat L_T = arma::chol(0.5 * (V_T + V_T.t()), "lower");
      Gamma.col(T0 - 1) = m_T + L_T * arma::randn<arma::vec>(p);

      for (int t = T0 - 2; t >= 0; --t) {
        arma::vec g_next = Gamma.col(t + 1);
        arma::mat P_inv_next_pred = arma::inv_sympd(P_t_t1[t + 1]);
        arma::mat J_t = P_t_t[t] * Phi.t() * P_inv_next_pred;
        arma::vec m_s = gamma_t_t[t] + J_t * (g_next - gamma_t_t1[t + 1]);
        arma::mat V_s = P_t_t[t] - J_t * Phi * P_t_t[t];
        arma::mat Ls = arma::chol(0.5 * (V_s + V_s.t()), "lower");
        Gamma.col(t) = m_s + Ls * arma::randn<arma::vec>(p);
      }
      double den = 0.0, num = 0.0;
      for (int t=0; t<T0; ++t) {
        arma::vec gl = (t==0) ? arma::zeros<arma::vec>(p) : arma::vec(Gamma.col(t-1));
        den += arma::dot(gl, gl); num += arma::dot(gl, Gamma.col(t));
      }
      double mean_phi = (den > 0 ? num / den : 0.0);
      double var_phi  = (den > 0 ? s2_g / den : 1.0);
      double cand_phi;
      do { cand_phi = R::rnorm(mean_phi, std::sqrt(var_phi)); } while (std::abs(cand_phi) > 1.0);
      phi_g = cand_phi;
      double sc_g = 0.0;
      for (int t=0; t<T0; ++t) {
        arma::vec gl = (t==0) ? arma::zeros<arma::vec>(p) : arma::vec(Gamma.col(t-1));
        arma::vec diff = Gamma.col(t) - phi_g * gl;
        sc_g += 0.5 * arma::dot(diff, diff);
      }
      s2_g     = rinvgamma(0.5 + 0.5 * p * T0, sc_g + 1.0/clip1(nu_s2_g));
      nu_s2_g  = rinvgamma(1.0, 1.0/clip1(s2_g) + 1.0/100.0);
    }

    // (2) Eta | rest
    if (p>0) {
      arma::mat GtG = Gamma * Gamma.t();
      arma::mat Domega = diagmat(omega_k);

      arma::mat Vrow = arma::inv_sympd( GtG / s2 + Domega / clip1(s2_eta) );
      arma::mat Lrow = chol(Vrow, "lower");

      for (int i=0; i<N; ++i) {
        arma::vec rhs = arma::zeros<arma::vec>(p);
        for (int t=0; t<T0; ++t) {

          arma::vec r = Yc.row(t).t() - rho * AYc_vec[t];
          if (useX) r -= X_get_row(t) * beta;
          rhs += Gamma.col(t) * r(i);
        }
        arma::vec m = Vrow * (rhs / s2);
        arma::vec z = arma::randn<arma::vec>(p);
        Eta.row(i) = (m + Lrow * z).t();
      }

      double sc_eta = 0.0;
      for (int i=0;i<N;++i) {
        arma::vec ei = Eta.row(i).t();
        sc_eta += arma::dot(ei, Domega * ei);
      }
      s2_eta    = rinvgamma(0.5 + 0.5 * p * N, 0.5*sc_eta + 1.0/clip1(nu_s2_eta));
      nu_s2_eta = rinvgamma(1.0, 1.0/clip1(s2_eta) + 1.0/100.0);
      for (int k_idx=0;k_idx<p;++k_idx) {
        double tmp = 0.0;
        for (int i=0;i<N;++i) tmp += 0.5 * Eta(i,k_idx)*Eta(i,k_idx) / clip1(s2_eta);
        double rate_ok = 1.0/clip1(nu_omega_k(k_idx)) + tmp;
        omega_k(k_idx)     = rinvgamma(0.5*(N+1.0), rate_ok);
        nu_omega_k(k_idx)  = rinvgamma(1.0, 1.0 + 1.0/clip1(omega_k(k_idx)));
      }
    }

    // (3) beta | rest
    if (useX) {
      arma::mat Ab = arma::zeros<arma::mat>(K,K);
      arma::vec Bb = arma::zeros<arma::vec>(K);

      for (int t=0; t<T0; ++t) {
        arma::mat Xt = X_get_row(t);
        Ab += Xt.t() * Xt;

        arma::vec Btmp = Yc.row(t).t() - rho * AYc_vec[t];
        if (p>0) Btmp -= Eta * Gamma.col(t);
        Bb += Xt.t() * Btmp;
      }
      Ab += (s2 * 1e-6) * I_K; // ridge

      arma::mat Ainv = arma::inv_sympd(Ab);
      arma::vec m_b  = Ainv * Bb;
      arma::mat S_b  = clip1(s2) * Ainv;

      beta = arma::mvnrnd(m_b, 0.5*(S_b+S_b.t()), 1);
    }

    // (4) sigma^2 | rest
    double ss = 0.0;
    for (int t=0; t<T0; ++t) {

      arma::vec u = Yc.row(t).t() - rho * AYc_vec[t];
      if (useX) u -= X_get_row(t) * beta;
      if (p>0)  u -= Eta * Gamma.col(t);
      ss += arma::dot(u,u);
    }
    s2 = rinvgamma(a0 + 0.5 * (T0 * N), b0 + 0.5 * ss);
    nu_sigma2 = rinvgamma(1.0, 1.0/clip1(s2) + 1.0/100.0);

    // (5) rho | rest (Adaptive RWMH)
        {
    const double lcur = loglik_core_pair(rho).first;


    const double prop_rho = rho + step_rho * R::rnorm(0.0, 1.0);

    double lprp = loglik_core_pair(prop_rho).first;
    if (!std::isfinite(lprp)) {
        lprp = -std::numeric_limits<double>::infinity();
    }


    // const double loga = (lprp + logprior_rho(prop_rho)) - (lcur + logprior_rho(rho));
    const double loga = lprp - lcur;

    if (std::log(R::runif(0.0, 1.0)) < loga) {
        rho = prop_rho;
        if (it >= burn) acc_rho++;
    }
    }

    // store
    if (it >= burn) {
      int m = it - burn;
      rho_draws[m] = rho;
      s2_draws[m]  = s2;
      if (K>0) beta_draws.row(m) = beta.t();
      if (p>0) { Lambda_draws.slice(m) = Eta; F_draws.slice(m) = Gamma; }
      if (verbose && (((m+1) % 2000) == 0)) Rcpp::checkUserInterrupt();
    }
  }

  return Rcpp::List::create(
    _["rho"]        = rho_draws,
    _["sigma2"]     = s2_draws,
    _["beta"]       = beta_draws,
    _["Lambda"]     = Lambda_draws,
    _["F"]          = F_draws,
    _["acc_rho"]    = (double)acc_rho / std::max(1.0, (double)M),
    _["final_log_step_rho"] = log_step_rho
    // _["sds_Yc"]     = sds_Yc
  );
}