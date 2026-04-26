import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import ApplicantDetailsPage from "./pages/ApplicantDetailsPage";
import ApplyJobPage from "./pages/ApplyJobPage";
import CandidateDashboard from "./pages/CandidateDashboard";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ManageJobsPage from "./pages/ManageJobsPage";
import NotFoundPage from "./pages/NotFoundPage";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import RegisterPage from "./pages/RegisterPage";
import UploadResumePage from "./pages/UploadResumePage";

const HomeRedirect = () => {
    const { user } = useAuth();

    if (!user) {
        return <LandingPage />;
    }

    if (user.role === "candidate") {
        return <Navigate to="/candidate" replace />;
    }

    return <Navigate to="/recruiter" replace />;
};

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
                path="/candidate"
                element={
                    <ProtectedRoute allowedRoles={["candidate"]}>
                        <CandidateDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/candidate/apply/:jobId"
                element={
                    <ProtectedRoute allowedRoles={["candidate"]}>
                        <ApplyJobPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/candidate/upload"
                element={
                    <ProtectedRoute allowedRoles={["candidate"]}>
                        <UploadResumePage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/recruiter"
                element={
                    <ProtectedRoute allowedRoles={["recruiter", "admin"]}>
                        <RecruiterDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/recruiter/jobs"
                element={
                    <ProtectedRoute allowedRoles={["recruiter", "admin"]}>
                        <ManageJobsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/recruiter/applicants/:applicationId"
                element={
                    <ProtectedRoute allowedRoles={["recruiter", "admin"]}>
                        <ApplicantDetailsPage />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default App;
