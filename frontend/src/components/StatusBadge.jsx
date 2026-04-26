const styles = {
    Pending: "bg-amber-100 text-amber-800 border-amber-200",
    Shortlisted: "bg-sky-100 text-sky-800 border-sky-200",
    Interview: "bg-violet-100 text-violet-800 border-violet-200",
    Rejected: "bg-rose-100 text-rose-800 border-rose-200",
    Selected: "bg-emerald-100 text-emerald-800 border-emerald-200"
};

const StatusBadge = ({ status }) => {
    return (
        <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles[status] || "bg-slate-100 text-slate-700 border-slate-200"
                }`}
        >
            {status}
        </span>
    );
};

export default StatusBadge;
