import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../services/api";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { user, login, register } = useAuth();
  const { notify } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate replace to="/" />;

  function update(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (isRegister) await register(form);
      else await login({ email: form.email, password: form.password });
      notify(isRegister ? "Welcome to ShopWithMe." : "Welcome back.");
      const destination = location.state?.from?.pathname || "/";
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not sign you in."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header />
      <main className="auth-page content-width">
        <Link className="back-link" to="/">
          <ArrowLeft size={15} /> Back to home
        </Link>
        <div className="auth-panel">
          <div className="auth-aside">
            <p className="eyebrow">SHOPWITHME ACCOUNT</p>
            <h1>
              {isRegister ? "A good place to begin." : "Good to see you again."}
            </h1>
            <p>Keep your bag, orders, and good finds all in one place.</p>
          </div>
          <form className="auth-form" onSubmit={submit}>
            <p className="eyebrow">
              {isRegister ? "CREATE AN ACCOUNT" : "WELCOME BACK"}
            </p>
            <h2>{isRegister ? "Join us." : "Sign in."}</h2>
            {isRegister && (
              <label>
                Your name
                <input
                  autoComplete="name"
                  name="name"
                  onChange={update}
                  required
                  value={form.name}
                />
              </label>
            )}
            <label>
              Email address
              <input
                autoComplete="email"
                name="email"
                onChange={update}
                required
                type="email"
                value={form.email}
              />
            </label>
            <label>
              Password
              <input
                autoComplete={isRegister ? "new-password" : "current-password"}
                minLength={8}
                name="password"
                onChange={update}
                required
                type="password"
                value={form.password}
              />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button
              className="button button-dark auth-submit"
              disabled={busy}
              type="submit"
            >
              {busy
                ? "One moment..."
                : isRegister
                  ? "Create account"
                  : "Sign in"}{" "}
              <ArrowRight size={16} />
            </button>
            <p className="auth-switch">
              {isRegister ? "Already have an account?" : "New to ShopWithMe?"}{" "}
              <Link to={isRegister ? "/login" : "/register"}>
                {isRegister ? "Sign in" : "Create one"}
              </Link>
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
