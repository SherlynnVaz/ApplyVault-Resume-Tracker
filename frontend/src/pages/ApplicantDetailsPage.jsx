import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import StatusBadge from "../components/StatusBadge";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

const buildResumeUrl = (uploadsBase, resumePath) => {
    if (!resumePath) return "";

    if (/^https?:\/\//i.test(resumePath)) {
        return resumePath;
    }

    const normalizedBase = (uploadsBase || "").replace(/\/+$/, "");
    const normalizedPath = resumePath.startsWith("/") ? resumePath : `/${resumePath}`;

    return `${normalizedBase}${normalizedPath}`;
};

const ApplicantDetailsPage = () => {
    const { applicationId } = useParams();
    const [application, setApplication] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadApplication = async () => {
            try {
                const { data } = await api.get(`/recruiter/applicants/${applicationId}`);
                setApplication(data.application);
            } catch (apiError) {
                setError(apiError.response?.data?.message || "Failed to load applicant details.");
            }
        };

        loadApplication();
    }, [applicationId]);

    const uploadsBase = import.meta.env.VITE_UPLOADS_BASE_URL || "http://localhost:5000";
    const resumeUrl = buildResumeUrl(uploadsBase, application?.resume_path);

    return (
        <DashboardLayout role="recruiter">
            <div className="mx-auto max-w-4xl space-y-5">
                <Link to="/recruiter" className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                    &larr; Back to recruiter dashboard
                </Link>

                <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100">Applicant Details</h1>

                {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

                {application ? (
                    <>
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-2xl font-bold">{application.candidate_name}</h2>
                                    <p className="text-sm text-slate-500">{application.candidate_email}</p>
                                </div>
                                <StatusBadge status={application.status} />
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Job</p>
                                    <p className="mt-1 font-semibold">{application.job_title}</p>
                                    <p className="text-sm text-slate-500">
                                        {application.company} - {application.location}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Extracted Contact</p>
                                    <p className="mt-1 text-sm">Name: {application.extracted_name || "-"}</p>
                                    <p className="text-sm">Email: {application.extracted_email || "-"}</p>
                                    <p className="text-sm">Phone: {application.extracted_phone || "-"}</p>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Skills</p>
                                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{application.skills || "-"}</p>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Education</p>
                                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{application.education || "-"}</p>
                                </div>
                            </div>

                            <a
                                href={resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-cyan-500 dark:text-slate-950"
                            >
                                Download Resume
                            </a>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                            <h3 className="text-lg font-bold">Extracted Resume Text</h3>
                            <p className="mt-3 max-h-80 overflow-y-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                {application.extracted_text || "No extracted text available."}
                            </p>
                        </section>
                    </>
                ) : null}
            </div>
        </DashboardLayout>
    );
};

export default ApplicantDetailsPage;
