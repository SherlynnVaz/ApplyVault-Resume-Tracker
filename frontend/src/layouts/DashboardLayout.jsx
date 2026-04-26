import { BriefcaseBusiness, LayoutDashboard, LogOut, UserSearch } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

const linkBase =
    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition hover:bg-slate-200/70 dark:hover:bg-slate-800";

const DashboardLayout = ({ children, role }) => {
    const { user, logout } = useAuth();

    const links =
        role === "candidate"
            ? [
                { to: "/candidate", label: "Dashboard", icon: LayoutDashboard },
                { to: "/candidate/upload", label: "Upload Resume", icon: BriefcaseBusiness }
            ]
            : [
                { to: "/recruiter", label: "Dashboard", icon: LayoutDashboard },
                { to: "/recruiter/jobs", label: "Manage Jobs", icon: BriefcaseBusiness },
                { to: "/recruiter", label: "Applicants", icon: UserSearch }
            ];

    return (
        <div className="min-h-screen gradient-shell">
            <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-4 p-4 md:grid-cols-[250px_1fr]">
                <aside className="soft-panel grid-dots">
                    <Link to="/" className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                        ApplyVault
                    </Link>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{role.toUpperCase()} PORTAL</p>

                    <nav className="mt-6 space-y-2">
                        {links.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to + label}
                                to={to}
                                className={({ isActive }) => `${linkBase} ${isActive ? "bg-slate-200 dark:bg-slate-800" : ""}`}
                                end={to === "/candidate" || to === "/recruiter"}
                            >
                                <Icon size={16} />
                                {label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="mt-8 rounded-xl bg-slate-900 p-4 text-sm text-slate-100 dark:bg-slate-800">
                        <p className="font-semibold">Signed in as</p>
                        <p className="truncate text-slate-300">{user?.email}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <ThemeToggle />
                        <button
                            type="button"
                            onClick={logout}
                            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </aside>

                <main className="soft-panel overflow-hidden">{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;
