import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import StatusBadge from "../components/StatusBadge";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

const COLORS = ["#f59e0b", "#0ea5e9", "#8b5cf6", "#f43f5e", "#10b981"];
const STATUSES = ["Pending", "Shortlisted", "Interview", "Rejected", "Selected"];

const RecruiterDashboard = () => {
    const [applicants, setApplicants] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [stats, setStats] = useState({ summary: {}, statusBreakdown: [] });
    const [filters, setFilters] = useState({ search: "", status: "", jobId: "" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showJobForm, setShowJobForm] = useState(false);
    const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    description: ""
});
    const [jobError, setJobError] = useState("");
    const [jobMessage, setJobMessage] = useState("");
    const loadData = async () => {
        setLoading(true);
        setError("");

        try {
            const [appResponse, statsResponse, jobsResponse] = await Promise.all([
                api.get("/recruiter/applicants", { params: filters }),
                api.get("/recruiter/dashboard-stats"),
                api.get("/jobs")
            ]);

            setApplicants(appResponse.data.applicants || []);
            setStats(statsResponse.data || { summary: {}, statusBreakdown: [] });
            setJobs(jobsResponse.data.jobs || []);
        } catch (apiError) {
            setError(apiError.response?.data?.message || "Failed to load recruiter data.");
        } finally {
            setLoading(false);
        }
    };
    const createJob = async (event) => {
    event.preventDefault();
    setJobError("");
    setJobMessage("");

    try {
        await api.post("/jobs", jobForm);
        setJobMessage("Job posted successfully! Candidates can now apply.");
        setJobForm({ title: "", company: "", location: "", description: "" });
        setShowJobForm(false);
        // Refresh stats so total_jobs count updates
        loadData();
    } catch (apiError) {
        setJobError(apiError.response?.data?.message || "Failed to create job.");
    }
};
    useEffect(() => {
        loadData();
    }, []);

    const chartData = useMemo(() => {
        const map = new Map((stats.statusBreakdown || []).map((item) => [item.status, Number(item.count)]));
        return STATUSES.map((status) => ({ name: status, value: map.get(status) || 0 }));
    }, [stats.statusBreakdown]);

    const updateStatus = async (applicationId, status) => {
        try {
            await api.patch(`/recruiter/applications/${applicationId}/status`, { status });
            loadData();
        } catch (apiError) {
            setError(apiError.response?.data?.message || "Unable to update status.");
        }
    };

    return (
        <DashboardLayout role="recruiter">
            <div className="space-y-6">
            <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 dark:border-cyan-800 dark:bg-cyan-900/20">
    <div className="flex items-center justify-between">
        <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Create Job Listing
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Post a new role for candidates to apply to
            </p>
        </div>
        <button
            type="button"
            onClick={() => setShowJobForm((prev) => !prev)}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-cyan-500 dark:text-slate-950"
        >
            {showJobForm ? "Cancel" : "+ New Job"}
        </button>
    </div>

    {showJobForm && (
        <form onSubmit={createJob} className="mt-4 grid gap-3 md:grid-cols-2">
            <input
                required
                placeholder="Job Title"
                value={jobForm.title}
                onChange={(e) => setJobForm((prev) => ({ ...prev, title: e.target.value }))}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <input
                required
                placeholder="Company"
                value={jobForm.company}
                onChange={(e) => setJobForm((prev) => ({ ...prev, company: e.target.value }))}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <input
                required
                placeholder="Location"
                value={jobForm.location}
                onChange={(e) => setJobForm((prev) => ({ ...prev, location: e.target.value }))}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <input
                required
                placeholder="Description"
                value={jobForm.description}
                onChange={(e) => setJobForm((prev) => ({ ...prev, description: e.target.value }))}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            {jobError ? (
                <p className="col-span-2 text-sm font-medium text-rose-600">{jobError}</p>
            ) : null}
            {jobMessage ? (
                <p className="col-span-2 text-sm font-medium text-emerald-600">{jobMessage}</p>
            ) : null}
            <button
                type="submit"
                className="col-span-2 rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-cyan-500 dark:text-slate-950"
            >
                Post Job
            </button>
        </form>
    )}
</section>
                <div>
                    <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100">Recruiter Dashboard</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Review applicants, update statuses, and monitor hiring pipeline.
                    </p>
                </div>

                <section className="grid gap-4 md:grid-cols-3">
                    <article className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Total Candidates</p>
                        <p className="mt-2 text-3xl font-bold">{stats.summary?.total_candidates || 0}</p>
                    </article>
                    <article className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Total Jobs</p>
                        <p className="mt-2 text-3xl font-bold">{stats.summary?.total_jobs || 0}</p>
                    </article>
                    <article className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Applications</p>
                        <p className="mt-2 text-3xl font-bold">{stats.summary?.total_applications || 0}</p>
                    </article>
                </section>

                <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                        <h2 className="text-lg font-bold">Pipeline Chart</h2>
                        <div className="h-72">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={110} innerRadius={65}>
                                        {chartData.map((item, index) => (
                                            <Cell key={item.name} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                        <h2 className="text-lg font-bold">Filters</h2>
                        <div className="mt-3 space-y-3">
                            <input
                                value={filters.search}
                                onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                                placeholder="Search name/email/skills"
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                            />

                            <select
                                value={filters.status}
                                onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                            >
                                <option value="">All Statuses</option>
                                {STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={filters.jobId}
                                onChange={(event) => setFilters((prev) => ({ ...prev, jobId: event.target.value }))}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                            >
                                <option value="">All Jobs</option>
                                {jobs.map((job) => (
                                    <option key={job.id} value={job.id}>
                                        {job.title}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                onClick={loadData}
                                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-cyan-500 dark:text-slate-950"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </section>

                {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-xl font-bold">Applicants</h2>
                        {loading ? <span className="text-sm text-slate-500">Refreshing...</span> : null}
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Candidate</th>
                                    <th className="px-4 py-3 text-left font-semibold">Job</th>
                                    <th className="px-4 py-3 text-left font-semibold">Skills</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
                                {applicants.length ? (
                                    applicants.map((applicant) => (
                                        <tr key={applicant.id}>
                                            <td className="px-4 py-3">
                                                <p className="font-semibold">{applicant.name}</p>
                                                <p className="text-xs text-slate-500">{applicant.email}</p>
                                            </td>
                                            <td className="px-4 py-3">{applicant.job_title}</td>
                                            <td className="max-w-xs truncate px-4 py-3 text-xs">{applicant.skills || "-"}</td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={applicant.status} />
                                            </td>
                                            <td className="space-x-2 px-4 py-3">
                                                <select
                                                    value={applicant.status}
                                                    onChange={(event) => updateStatus(applicant.id, event.target.value)}
                                                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950"
                                                >
                                                    {STATUSES.map((status) => (
                                                        <option key={status} value={status}>
                                                            {status}
                                                        </option>
                                                    ))}
                                                </select>
                                                <Link
                                                    to={`/recruiter/applicants/${applicant.id}`}
                                                    className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-100"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="px-4 py-4 text-slate-500" colSpan={5}>
                                            No applicants found.
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

export default RecruiterDashboard;
