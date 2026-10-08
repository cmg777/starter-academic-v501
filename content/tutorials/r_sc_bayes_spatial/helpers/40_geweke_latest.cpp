// 40_geweke_full.cpp
// Geweke (2004) Joint Distribution Test – FULL version with unified priors
//

// (I - rho * A) Yc_t = X_t beta + Eta * Gamma_t + eps_t,   eps_t ~ N(0, sigma2 I_N)



//   sigma2 ~ InvGamma(a0, b0)
//   beta ~ N(0, I_K)


//
// [[Rcpp::depends(RcppArmadillo)]]
// [[Rcpp::plugins(cpp17)]]

#include <RcppArmadillo.h>
using namespace Rcpp;
using namespace arma;

//-------------------- utilities --------------------
inline double rinvgamma1(double shape, double rate) {
  // InvGamma(shape, rate): density ∝ rate^shape x^{-(shape+1)} exp(-rate/x)
  double g = R::rgamma(shape, 1.0 / rate); // Gamma(shape, scale=1/rate)
  return 1.0 / g;
}
inline double clip1(double z, double lo=1e-12, double hi=1e12) {
  if (z < lo) z = lo; if (z > hi) z = hi; return z;
}



inline bool logdet_from_eigs(
  const arma::cx_vec& eigvals,
  double rho,
  double& out) {
  out = 0.0;
  for (uword i = 0; i < eigvals.n_elem; ++i) {
    double mag = std::abs(1.0 - rho * eigvals(i));
    if (!std::isfinite(mag) || mag <= 1e-18) {
      return false;
    }
    out += std::log(mag);
  }
  return std::isfinite(out);
}


inline double rho_bound_from_A(const arma::cx_vec& ev, double c_stab = 0.95) {
  double m = 0.0;
  for (uword i=0;i<ev.n_elem;++i) m = std::max(m, std::abs(ev(i)));
  if (!std::isfinite(m) || m < 1e-12) m = 1e-12;
  return c_stab / m;
}

//-------------------- Forward simulator --------------------
// [[Rcpp::export]]
arma::mat simulate_Yc_forward_cpp(
  int T0,
  const arma::mat& W_use,            // N x N
  const arma::vec& w_use,            // N
  const arma::vec& alpha_hat_scaled, // N
  double rho,
  double sigma2,
  const arma::cube& Xc_pre,
  const arma::vec& beta,
  const arma::mat& Eta,
  const arma::mat& Gamma
) {
  Rcpp::RNGScope scope;

  const int N = W_use.n_rows;
  const int K = Xc_pre.n_slices;
  const int p = Eta.n_cols;

  const arma::mat A = W_use + w_use * alpha_hat_scaled.t();
  const arma::mat I = arma::eye<arma::mat>(N,N);
  const arma::mat M = I - rho * A;
  const double sd = std::sqrt(std::max(1e-12, sigma2));

  arma::mat Mu(N, T0, arma::fill::zeros);
  if (K > 0 && static_cast<int>(beta.n_elem) == K) {
    for (int t = 0; t < T0; ++t) {
      for (int i = 0; i < N; ++i) {
        double s = 0.0;
        for (int k = 0; k < K; ++k) s += Xc_pre(t, i, k) * beta(k);
        Mu(i, t) = s;
      }
    }
  }
  if (p > 0 && static_cast<int>(Gamma.n_cols) == T0) {
    Mu += Eta * Gamma;
  }

  arma::mat rhs_mat = Mu + sd * arma::randn<arma::mat>(N, T0);
  arma::mat Ysol;
  bool ok = false;
  try {
    Ysol = arma::solve(M, rhs_mat, arma::solve_opts::fast);
    ok = Ysol.is_finite();
  } catch(...) {
    ok = false;
  }
  if (!ok) {
    arma::mat AtA = M.t() * M;
    AtA.diag() += 1e-10;
    arma::mat Atr = M.t() * rhs_mat;
    Ysol = arma::solve(AtA, Atr, arma::solve_opts::fast);
  }
  return Ysol.t();
}

//-------------------- One-step posterior kernel (unified priors) --------------------
// [[Rcpp::export]]
Rcpp::List scspill_one_step_cpp(
  const arma::mat& Yc_data,          // T0 x N
  const arma::mat& W_use,            // N x N
  const arma::vec& w_use,            // N
  const arma::vec& alpha_hat_scaled, // N
  int T0,
  int N,
  const arma::cube& Xc_pre,          // T0 x N x K
  int K,
  int p,
  Rcpp::List state_in,               // list(rho,sigma2,beta,Eta,Gamma)
  double a0,
  double b0,
  double step_rho,
  double rho_lo,
  double rho_hi
) {
  Rcpp::RNGScope scope;

  // unpack
  double rho    = as<double>(state_in["rho"]);
  double sigma2 = as<double>(state_in["sigma2"]);
  arma::vec beta = (K>0 ? as<arma::vec>(state_in["beta"]) : arma::vec());
  arma::mat Eta  = (p>0 ? as<arma::mat>(state_in["Eta"])  : arma::mat(N,0,arma::fill::zeros));
  arma::mat Gamma= (p>0 ? as<arma::mat>(state_in["Gamma"]): arma::mat(0,T0,arma::fill::zeros));

  const arma::mat A = W_use + w_use * alpha_hat_scaled.t();
  const arma::mat I = arma::eye<arma::mat>(N,N);
  const arma::cx_vec eig_A = arma::eig_gen(A);
  const arma::mat M_rho = I - rho * A;
  const double bnd  = rho_bound_from_A(eig_A);
  const double sigma2_clipped = clip1(sigma2);

  arma::mat MY = Yc_data * M_rho.t(); // T0 x N, row t = (M_rho * Y_t)^T
  arma::mat YA = Yc_data * A.t();
  arma::mat Xbeta(T0, N, arma::fill::zeros);
  if (K > 0) {
    for (int t = 0; t < T0; ++t) {
      for (int i = 0; i < N; ++i) {
        double s = 0.0;
        for (int k = 0; k < K; ++k) s += Xc_pre(t, i, k) * beta(k);
        Xbeta(t, i) = s;
      }
    }
  }
  arma::mat ystar_base = MY - Xbeta; // (I-rhoA)Y - Xbeta


  if (p>0) {
    arma::mat EtE = Eta.t() * Eta; // p x p
    arma::mat Vt  = arma::inv_sympd(EtE / sigma2_clipped + arma::eye<arma::mat>(p,p));
    arma::mat Lt  = arma::chol(0.5*(Vt+Vt.t()), "lower");

    for (int t=0; t<T0; ++t) {
      arma::vec ystar = ystar_base.row(t).t();
      arma::vec mt = Vt * (Eta.t() * ystar / sigma2_clipped);
      Gamma.col(t) = mt + Lt * arma::randn<arma::vec>(p);
    }
  }


  if (p>0) {
    arma::mat GtG = Gamma * Gamma.t(); // p x p
    arma::mat Vi  = arma::inv_sympd(GtG / sigma2_clipped + arma::eye<arma::mat>(p,p));
    arma::mat Li  = arma::chol(0.5*(Vi+Vi.t()), "lower");

    arma::mat ystar_tn = ystar_base.t(); // N x T0
    for (int i=0; i<N; ++i) {
      arma::vec rhs = Gamma * ystar_tn.row(i).t();
      arma::vec mi = Vi * (rhs / sigma2_clipped);
      Eta.row(i) = (mi + Li * arma::randn<arma::vec>(p)).t();
    }
  }


  if (K > 0) {
    arma::mat XtX_sum(K, K, arma::fill::zeros);
    arma::vec XtY_sum(K, arma::fill::zeros);

    for (int t = 0; t < T0; ++t) {
      arma::vec fac = (p > 0 ? Eta * Gamma.col(t) : arma::vec(N, arma::fill::zeros));
      arma::vec lhs = MY.row(t).t() - fac; // = X_t beta + eps

      arma::mat Xt(N, K, arma::fill::zeros);
      for (int i = 0; i < N; ++i) for (int k = 0; k < K; ++k) Xt(i, k) = Xc_pre(t, i, k);

      XtX_sum += Xt.t() * Xt;
      XtY_sum += Xt.t() * lhs;
    }


    // P_beta = (XtX_sum / sigma2) + I_K
    arma::mat P_beta = (XtX_sum / clip1(sigma2)) + arma::eye<arma::mat>(K, K);

    // V_beta = inv(P_beta)
    arma::mat V_beta = arma::inv_sympd(P_beta);

    // m_beta = V_beta * (XtY_sum / sigma2)
    arma::vec m_beta = V_beta * (XtY_sum / clip1(sigma2));


    beta = arma::mvnrnd(m_beta, 0.5 * (V_beta + V_beta.t()), 1);
  }

  // ---- 4) sigma2 | rest ----
  double ss = 0.0;
  for (int t=0; t<T0; ++t) {
    arma::vec muX(N, arma::fill::zeros);
    if (K>0) { for (int i=0;i<N;++i){ double s=0.0; for(int k=0;k<K;++k) s+=Xc_pre(t,i,k)*beta(k); muX(i)=s; } }
    arma::vec fac = (p>0 ? Eta * Gamma.col(t) : arma::vec(N, arma::fill::zeros));
    arma::vec resid = MY.row(t).t() - (muX + fac);
    ss += arma::dot(resid, resid);
  }
  sigma2 = rinvgamma1(a0 + 0.5*(T0*N), b0 + 0.5*ss);


  arma::mat mu_mat(T0, N, arma::fill::zeros);
  if (K > 0) {
    for (int t = 0; t < T0; ++t) {
      for (int i = 0; i < N; ++i) {
        double s = 0.0;
        for (int k = 0; k < K; ++k) s += Xc_pre(t, i, k) * beta(k);
        mu_mat(t, i) = s;
      }
    }
  }
  if (p > 0) {
    mu_mat += (Eta * Gamma).t();
  }

  auto logpost_rho = [&](double r) {
    if (r < rho_lo || r > rho_hi) {
    return -std::numeric_limits<double>::infinity();
    }
    if (std::abs(r) >= bnd) return -std::numeric_limits<double>::infinity();
    double ldet=0.0;
    if (!logdet_from_eigs(eig_A, r, ldet)) {
      return -std::numeric_limits<double>::infinity();
    }

    double ssum = 0.0;
    arma::mat MY_r = MY + (rho - r) * YA;
    arma::mat resid = MY_r - mu_mat;
    ssum = arma::accu(resid % resid);
    double ll = T0 * ldet - 0.5*(T0*N)*std::log(clip1(sigma2)) - 0.5*ssum/clip1(sigma2);

    return ll;
  };

  double rho_prop = rho + step_rho * R::rnorm(0.0, 1.0);
  double lcur = logpost_rho(rho);
  double lprp = logpost_rho(rho_prop);
  bool moved = false;
  if (std::log(R::runif(0.0,1.0)) < (lprp - lcur)) { rho = rho_prop; moved = true; }

  // return
  return Rcpp::List::create(
    _["rho"]    = rho,
    _["sigma2"] = sigma2,
    _["beta"]   = beta,
    _["Eta"]    = Eta,
    _["Gamma"]  = Gamma,
    _["moved_rho"] = moved
  );
}
