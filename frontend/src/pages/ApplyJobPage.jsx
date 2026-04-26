import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

const ApplyJobPage = () => {
    const { jobId } = useParams();

    const [job, setJob] = useState(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const loadJob = async () => {
            try {
                const response = await api.get(`/jobs/${jobId}`);
                setJob(response.data.job || null);
            } catch (apiError) {
                setError(apiError.response?.data?.message || "Unable to fetch job details.");
            }
        };

        loadJob();
    }, [jobId]);

    const onSubmit = async (event) => {
        event.preventDefault();

        if (!file) {
            setError("Please choose a PDF resume.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const formData = new FormData();
            formData.append("resume", file);

            const response = await api.post(`/candidate/apply/${jobId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            setMessage(response.data.message || "Applied successfully.");
        } catch (apiError) {
            setError(apiError.response?.data?.message || "Failed to apply.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout role="candidate">
            <div className="mx-auto max-w-3xl space-y-5">
                <Link to="/candidate" className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                    &larr; Back to dashboard
                </Link>

                <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100">Apply to Job</h1>

                {job ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{job.title}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {job.company} - {job.location}
                        </p>
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{job.description}</p>
                    </div>
                ) : null}

                <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Upload Resume (PDF)</label>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(event) => setFile(event.target.files?.[0] || null)}
                        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                    />

                    {error ? <p className="mt-3 text-sm font-medium text-rose-600">{error}</p> : null}
                    {message ? <p className="mt-3 text-sm font-medium text-emerald-600">{message}</p> : null}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-70 dark:bg-cyan-500 dark:text-slate-950"
                    >
                        {loading ? "Submitting..." : "Submit Application"}
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default ApplyJobPage;
