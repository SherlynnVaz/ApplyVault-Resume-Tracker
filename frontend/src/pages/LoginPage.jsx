import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const user = await login(form);
            const redirectPath = location.state?.from?.pathname;

            if (redirectPath) {
                navigate(redirectPath, { replace: true });
                return;
            }

            navigate(user.role === "candidate" ? "/candidate" : "/recruiter", { replace: true });
        } catch (apiError) {
            setError(apiError.response?.data?.message || "Login failed. Check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="gradient-shell grid min-h-screen place-items-center p-4">
            <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/85 p-8 shadow-soft backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                <div className="mb-5 flex items-center justify-between">
                    <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100">Login</h1>
                    <ThemeToggle />
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Candidate, Recruiter, and Admin accounts use the same login form.
                </p>

                <form className="mt-6 space-y-4" onSubmit={onSubmit}>
                    <input
                        type="email"
                        required
                        placeholder="Email"
                        value={form.email}
                        onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-cyan-400 focus:ring dark:border-slate-700 dark:bg-slate-950"
                    />

                    <input
                        type="password"
                        required
                        placeholder="Password"
                        value={form.password}
                        onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-cyan-400 focus:ring dark:border-slate-700 dark:bg-slate-950"
                    />

                    {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-70 dark:bg-cyan-500 dark:text-slate-950"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="mt-5 text-sm text-slate-600 dark:text-slate-300">
                    New candidate?{" "}
                    <Link to="/register" className="font-semibold text-cyan-700 dark:text-cyan-300">
                        Create account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
