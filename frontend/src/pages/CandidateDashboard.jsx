import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import StatusBadge from "../components/StatusBadge";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

const CandidateDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const refreshApplications = useCallback(async () => {
        try {
            const { data } = await api.get("/candidate/applications");
            setApplications(data.applications || []);
        } catch (apiError) {
            setError(apiError.response?.data?.message || "Unable to refresh applications.");
        }
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [jobsResponse, applicationsResponse] = await Promise.all([
                api.get("/jobs", { params: { search } }),
                api.get("/candidate/applications")
            ]);

            setJobs(jobsResponse.data.jobs || []);
            setApplications(applicationsResponse.data.applications || []);
        } catch (apiError) {
            setError(apiError.response?.data?.message || "Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            refreshApplications();
        }, 20000);

        return () => clearInterval(intervalId);
    }, [refreshApplications]);

    const appliedJobIds = useMemo(
        () => new Set(applications.map((application) => Number(application.job_id))),
        [applications]
    );

    const summary = useMemo(() => {
        const counts = {
            Pending: 0,
            Shortlisted: 0,
            Interview: 0,
            Rejected: 0,
            Selected: 0
        };

        applications.forEach((application) => {
            if (counts[application.status] !== undefined) {
                counts[application.status] += 1;
            }
        });

        return counts;
    }, [applications]);

    return (
        <DashboardLayout role="candidate">
            <div className="space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100">Candidate Dashboard</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Discover roles, apply with your PDF resume, and track progress.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search title/company/location"
                            className="w-64 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none ring-cyan-400 focus:ring dark:border-slate-700 dark:bg-slate-950"
                        />
                        <button
                            type="button"
                            onClick={loadData}
                            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-cyan-500 dark:text-slate-950"
                        >
                            Search
                        </button>
                    </div>
                </div>

                <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {Object.entries(summary).map(([status, count]) => (
                        <article key={status} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{status}</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{count}</p>
                        </article>
                    ))}
                </section>

                {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

                <section>
                    <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-slate-100">Job Openings</h2>
                    {loading ? (
                        <p className="text-sm text-slate-500">Loading jobs...</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {jobs.map((job) => (
                                <article key={job.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{job.title}</h3>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        {job.company} - {job.location}
                                    </p>
                                    <p className="mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{job.description}</p>

                                    <div className="mt-4 flex items-center justify-between">
                                        {appliedJobIds.has(Number(job.id)) ? (
                                            <span className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                Already Applied
                                            </span>
                                        ) : (
                                            <Link
                                                to={`/candidate/apply/${job.id}`}
                                                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 dark:bg-cyan-500 dark:text-slate-950"
                                            >
                                                Apply Now
                                            </Link>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-slate-100">My Applications</h2>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Job</th>
                                    <th className="px-4 py-3 text-left font-semibold">Company</th>
                                    <th className="px-4 py-3 text-left font-semibold">Location</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
                                {applications.length ? (
                                    applications.map((application) => (
                                        <tr key={application.id}>
                                            <td className="px-4 py-3">{application.title}</td>
                                            <td className="px-4 py-3">{application.company}</td>
                                            <td className="px-4 py-3">{application.location}</td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={application.status} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="px-4 py-4 text-slate-500" colSpan={4}>
                                            No applications yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
};

export default CandidateDashboard;
