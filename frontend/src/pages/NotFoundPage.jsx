import { Link } from "react-router-dom";

const NotFoundPage = () => {
    return (
        <div className="gradient-shell grid min-h-screen place-items-center p-4">
            <div className="rounded-2xl bg-white/90 p-8 text-center shadow-soft dark:bg-slate-900/80">
                <h1 className="font-display text-5xl font-bold text-slate-900 dark:text-slate-100">404</h1>
                <p className="mt-3 text-slate-600 dark:text-slate-300">Page not found.</p>
                <Link
                    to="/"
                    className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-cyan-500 dark:text-slate-950"
                >
                    Back Home
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
