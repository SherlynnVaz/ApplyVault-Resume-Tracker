import { ArrowRight, BriefcaseBusiness, FileSearch, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import ThemeToggle from "../components/ThemeToggle";

const features = [
    {
        title: "Application Tracking",
        description: "Candidates monitor each job stage with clear ATS-style status updates.",
        icon: BriefcaseBusiness
    },
    {
        title: "Resume Intelligence",
        description: "Upload PDF resumes and auto-extract key profile details for recruiters.",
        icon: FileSearch
    },
    {
        title: "Role-Based Access",
        description: "Secure candidate and recruiter experiences with JWT authentication.",
        icon: ShieldCheck
    }
];

const LandingPage = () => {
    return (
        <div className="gradient-shell min-h-screen grid-dots">
            <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6">
                <header className="flex items-center justify-between">
                    <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100">ApplyVault</h1>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Link
                            to="/login"
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                            Login
                        </Link>
                    </div>
                </header>

                <section className="mt-14 grid flex-1 items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
                    <div>
                        <p className="inline-flex items-center rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
                            Recruitment Portal
                        </p>
                        <h2 className="mt-5 font-display text-5xl font-bold leading-tight text-slate-900 dark:text-slate-100">
                            Resume Tracking that feels modern and decisive.
                        </h2>
                        <p className="mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-300">
                            ApplyVault helps candidates apply confidently while giving recruiters a clean cockpit for job
                            management, applicant review, and hiring decisions.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 dark:bg-cyan-500 dark:text-slate-950"
                            >
                                Candidate Register
                                <ArrowRight size={16} />
                            </Link>
                            <Link
                            to="/login?role=recruiter"
                            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            >
                            Recruiter Login
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/50 bg-white/70 p-6 shadow-soft backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
                        <div className="grid gap-4 md:grid-cols-1">
                            {features.map(({ title, description, icon: Icon }) => (
                                <article key={title} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                                    <div className="inline-flex rounded-lg bg-cyan-100 p-2 text-cyan-700 dark:bg-cyan-400/20 dark:text-cyan-300">
                                        <Icon size={18} />
                                    </div>
                                    <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
                                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default LandingPage;
