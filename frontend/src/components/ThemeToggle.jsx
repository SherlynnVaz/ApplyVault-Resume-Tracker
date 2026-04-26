import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
    const [dark, setDark] = useState(() => localStorage.getItem("applyvault_theme") === "dark");

    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("applyvault_theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("applyvault_theme", "light");
        }
    }, [dark]);

    return (
        <button
            type="button"
            onClick={() => setDark((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            {dark ? "Light" : "Dark"}
        </button>
    );
};

export default ThemeToggle;
