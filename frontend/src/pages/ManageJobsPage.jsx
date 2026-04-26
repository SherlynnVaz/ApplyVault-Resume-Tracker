import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

const initialForm = {
    title: "",
    company: "",
    location: "",
    description: ""
};

const ManageJobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fetchJobs = async () => {
        try {
            const { data } = await api.get("/jobs");
            setJobs(data.jobs || []);
        } catch (apiError) {
            setError(apiError.response?.data?.message || "Unable to load jobs.");
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const createJob = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        try {
            await api.post("/jobs", form);
            setMessage("Job created successfully.");
            setForm(initialForm);
            fetchJobs();
        } catch (apiError) {
            setError(apiError.response?.data?.message || "Failed to create job.");
        }
    };

    const removeJob = async (id) => {
        setError("");
        setMessage("");

        try {
            await api.delete(`/jobs/${id}`);
            setMessage("Job deleted successfully.");
            fetchJobs();
        } catch (apiError) {
            setError(apiError.response?.data?.message || "Failed to delete job.");
        }
    };

    return (
        <DashboardLayout role="recruiter">
            <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                    <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100">Manage Jobs</h1>

                    <form onSubmit={createJob} className="mt-5 space-y-3">
                        <input
                            required
                            placeholder="Job Title"
                            value={form.title}
                            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                        />
                        <input
                            required
                            placeholder="Company"
                            value={form.company}
                            onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                        />
                        <input
                            required
                            placeholder="Location"
                            value={form.location}
                            onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                        />
                        <textarea
                            required
                            rows={5}
                            placeholder="Description"
                            value={form.description}
                            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                        />

                        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
                        {message ? <p className="text-sm font-medium text-emerald-600">{message}</p> : null}

                        <button
                            type="submit"
                            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-cyan-500 dark:text-slate-950"
                        >
                            Create Job
                        </button>
                    </form>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                    <h2 className="text-xl font-bold">All Job Postings</h2>

                    <div className="mt-4 space-y-3">
                        {jobs.length ? (
                            jobs.map((job) => (
                                <article key={job.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{job.title}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {job.company} - {job.location}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeJob(job.id)}
                                            className="rounded-lg bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500">No jobs available.</p>
                        )}
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
};

export default ManageJobsPage;
