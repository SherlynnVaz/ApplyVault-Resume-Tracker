import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { login, logout } = useAuth();

    // Pre-select role if ?role=recruiter is in the URL
    const [roleChoice, setRoleChoice] = useState(
        searchParams.get("role") === "recruiter" ? "recruiter" : "candidate"
    );
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRoleSwitch = (role) => {
        setRoleChoice(role);
        setError("");
        setForm({ email: "", password: "" });
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const user = await login(form);

            // Validate the logged-in role matches what was selected
            if (roleChoice === "candidate" && user.role !== "candidate") {
                logout();
                setError(
                    "This is not a candidate account. Please switch to the Recruiter tab and try again."
                );
                setLoading(false);
                return;
            }

            if (roleChoice === "recruiter" && user.role === "candidate") {
                logout();
                setError(
                    "This is not a recruiter account. Please switch to the Candidate tab and try again."
                );
                setLoading(false);
                return;
            }

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
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <Link
                            to="/"
                            className="font-display text-xl font-bold text-slate-900 dark:text-slate-100"
                        >
                            ApplyVault
                        </Link>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Sign in to your account
                        </p>
                    </div>
                    <ThemeToggle />
                </div>

                {/* Role Toggle Tabs */}
                <div className="mb-6 flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
                    <button
                        type="button"
                        onClick={() => handleRoleSwitch("candidate")}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${roleChoice === "candidate"
                                ? "bg-white text-slate-900 shadow-soft dark:bg-slate-900 dark:text-white"
                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                    >
                        🎓 Candidate
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRoleSwitch("recruiter")}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${roleChoice === "recruiter"
                                ? "bg-white text-slate-900 shadow-soft dark:bg-slate-900 dark:text-white"
                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                    >
                        💼 Recruiter / Admin
                    </button>
                </div>

                {/* Context hint for recruiter */}
                {roleChoice === "recruiter" && (
                    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                            Recruiter / Admin Login
                        </p>
                        <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                            Sign in with your recruiter or admin account
                        </p>
                    </div>
                )}

                {/* Context hint for candidate */}
                {roleChoice === "candidate" && (
                    <div className="mb-4 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 dark:border-cyan-800 dark:bg-cyan-900/20">
                        <p className="text-sm text-cyan-700 dark:text-cyan-300">
                            New here?{" "}
                            <Link
                                to="/register"
                                className="font-semibold underline underline-offset-2"
                            >
                                Create a candidate account
                            </Link>
                        </p>
                    </div>
                )}

                {/* Login Form */}
                <form className="space-y-4" onSubmit={onSubmit}>
                    <input
                        type="email"
                        required
                        placeholder={
                            roleChoice === "candidate"
                                ? "Your email address"
                                : "Recruiter / Admin email"
                        }
                        value={form.email}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, email: event.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-cyan-400 focus:ring dark:border-slate-700 dark:bg-slate-950"
                    />

                    <input
                        type="password"
                        required
                        placeholder="Password"
                        value={form.password}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, password: event.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-cyan-400 focus:ring dark:border-slate-700 dark:bg-slate-950"
                    />

                    {error ? (
                        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
                            {error}
                        </p>
                    ) : null}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-70 dark:bg-cyan-500 dark:text-slate-950"
                    >
                        {loading
                            ? "Signing in..."
                            : `Sign In as ${roleChoice === "candidate" ? "Candidate" : "Recruiter"}`}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;