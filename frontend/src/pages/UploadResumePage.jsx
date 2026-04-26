import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

const UploadResumePage = () => {
    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const { data } = await api.get("/jobs");
                setJobs(data.jobs || []);
            } catch (apiError) {
                setError(apiError.response?.data?.message || "Unable to load jobs.");
            }
        };

        fetchJobs();
    }, []);

    const submitUpload = async (event) => {
        event.preventDefault();

        if (!selectedJobId || !file) {
            setError("Please select a job and choose a PDF resume.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const formData = new FormData();
            formData.append("resume", file);

            const { data } = await api.post(`/candidate/apply/${selectedJobId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            setMessage(data.message || "Resume uploaded successfully.");
        } catch (apiError) {
            setError(apiError.response?.data?.message || "Upload failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout role="candidate">
            <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100">Upload Resume</h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Pick a job and upload your resume PDF. Parsed details are stored automatically.
                </p>

                <form onSubmit={submitUpload} className="mt-6 space-y-4">
                    <select
                        value={selectedJobId}
                        onChange={(event) => setSelectedJobId(event.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                    >
                        <option value="">Select a job posting</option>
                        {jobs.map((job) => (
                            <option key={job.id} value={job.id}>
                                {job.title} - {job.company}
                            </option>
                        ))}
                    </select>

                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(event) => setFile(event.target.files?.[0] || null)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                    />

                    {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
                    {message ? <p className="text-sm font-medium text-emerald-600">{message}</p> : null}

                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-70 dark:bg-cyan-500 dark:text-slate-950"
                    >
                        {loading ? "Uploading..." : "Upload and Apply"}
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default UploadResumePage;
