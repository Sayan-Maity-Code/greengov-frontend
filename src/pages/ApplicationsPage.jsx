import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { fetchAllApplications, applyForProgram, updateApplicationStatus } from "../api/applicationApi";
import { fetchAllPrograms } from "../api/programApi";
import Loading from "../components/Loading";
import Alert from "../components/Alert";
import ActionButton from "../components/ActionButton";
import ContentGate from "../components/ContentGate";
 
export default function ApplicationsPage() {
    const { userId } = useAuth();
    const [applications, setApplications] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
 
    const [formData, setFormData] = useState({
        programId: "",
    });
 
    useEffect(() => {
        loadApplications();
        loadPrograms();
    }, []);
 
    const loadApplications = async () => {
        try {
            setLoading(true);
            const data = await fetchAllApplications();
            setApplications(data || []);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load applications");
        } finally {
            setLoading(false);
        }
    };
 
    const loadPrograms = async () => {
        try {
            const data = await fetchAllPrograms();
            setPrograms(data || []);
        } catch (err) {
            console.error("Failed to load programs:", err);
        }
    };
 
    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
 
    const handleApplyForProgram = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
       
        if (!formData.programId) {
            setError("Please select a program");
            return;
        }
 
        try {
            setLoading(true);
            await applyForProgram(userId, Number.parseInt(formData.programId, 10));
            setSuccess("Application submitted successfully! Awaiting review.");
            setFormData({ programId: "" });
            setShowCreateForm(false);
            loadApplications();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit application. Make sure you are verified.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
 
    const handleApproveApplication = async (appId) => {
        setActionLoading(appId);
        setError("");
        setSuccess("");
        try {
            await updateApplicationStatus(appId, "approve");
            setSuccess("Application approved successfully!");
            loadApplications();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to approve application");
        } finally {
            setActionLoading(null);
        }
    };
 
    const handleRejectApplication = async (appId) => {
        setActionLoading(appId);
        setError("");
        setSuccess("");
        try {
            await updateApplicationStatus(appId, "reject");
            setSuccess("Application rejected successfully!");
            loadApplications();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reject application");
        } finally {
            setActionLoading(null);
        }
    };
 
    const statusBadge = (s) =>
        s === "APPROVED" ? "bg-success" : s === "REJECTED" ? "bg-danger" : "bg-warning text-dark";
 
    if (loading && applications.length === 0) return <Loading />;
 
    return (
        <div>
            {/* Page header */}
            <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                <div>
                    <h4 className="fw-bold text-success mb-0">Applications</h4>
                    <p className="text-muted small mb-0">Submit and track your program applications</p>
                </div>
                
            </div>
 
            {error   && <Alert message={error}   type="danger" />}
            {success && <Alert message={success} type="success" />}
 
            {/* Create Form — only for citizens/businesses */}
            <ContentGate roles={["CITIZEN", "BUSINESS_OWNER"]}>
                {showCreateForm && (
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-success text-white border-0">
                            <h6 className="mb-0">Submit Program Application</h6>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleApplyForProgram}>
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label htmlFor="app-programId" className="form-label small fw-semibold">
                                            Select Program to Apply
                                        </label>
                                        <select
                                            id="app-programId"
                                            className="form-control"
                                            name="programId"
                                            value={formData.programId}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">-- Choose a program --</option>
                                            {programs.map((p) => (
                                                <option key={p.programId} value={p.programId}>
                                                    {p.title} (₹{p.budget?.toLocaleString() || "N/A"})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-3 d-flex gap-2">
                                    <button type="submit" className="btn btn-success btn-sm" disabled={loading}>
                                        {loading ? "Submitting..." : "Submit Application"}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => setShowCreateForm(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </ContentGate>
 
            {/* Stats */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <p className="text-muted small mb-1">Total Applications</p>
                            <h3 className="fw-bold text-success">{applications.length}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <p className="text-muted small mb-1">Pending</p>
                            <h3 className="fw-bold text-warning">
                                {applications.filter(a => a.status === "PENDING").length}
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <p className="text-muted small mb-1">Approved</p>
                            <h3 className="fw-bold text-success">
                                {applications.filter(a => a.status === "APPROVED").length}
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <p className="text-muted small mb-1">Rejected</p>
                            <h3 className="fw-bold text-danger">
                                {applications.filter(a => a.status === "REJECTED").length}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
 
            {/* Table */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between">
                    <h6 className="mb-0 fw-semibold">All Applications</h6>
                    <button className="btn btn-outline-success btn-sm" onClick={loadApplications}>Refresh</button>
                </div>
                <div className="card-body p-0">
                    {applications.length === 0 ? (
                        <p className="text-muted text-center py-5 mb-0">No applications found</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4 small">Application ID</th>
                                        <th className="small">Program</th>
                                        <th className="small">Applicant ID</th>
                                        <th className="small">Submitted On</th>
                                        <th className="small">Status</th>
                                        <ContentGate authority="PROGRAM_MANAGER">
                                            <th className="small text-end pe-4">Actions</th>
                                        </ContentGate>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map((a) => (
                                        <tr key={a.applicationId}>
                                            <td className="ps-4 small fw-semibold">{a.applicationId}</td>
                                            <td className="small">{a.programTitle}</td>
                                            <td className="small">{a.applicantId}</td>
                                            <td className="small text-muted">
                                                {a.submittedDate ? new Date(a.submittedDate).toLocaleDateString() : "—"}
                                            </td>
                                            <td>
                                                <span className={`badge ${statusBadge(a.status)}`}>{a.status || "PENDING"}</span>
                                            </td>
                                            <ContentGate authority="PROGRAM_MANAGER">
                                                <td className="text-end pe-4">
                                                    {a.status === "PENDING" ? (
                                                        <div className="btn-group btn-group-sm" role="group">
                                                            <ActionButton
                                                                authority="PROGRAM_MANAGER"
                                                                className="btn btn-success btn-sm"
                                                                onClick={() => handleApproveApplication(a.applicationId)}
                                                                disabled={actionLoading === a.applicationId}
                                                                title="Approve this application"
                                                            >
                                                                {actionLoading === a.applicationId ? "..." : "✓ Approve"}
                                                            </ActionButton>
                                                            <ActionButton
                                                                authority="PROGRAM_MANAGER"
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleRejectApplication(a.applicationId)}
                                                                disabled={actionLoading === a.applicationId}
                                                                title="Reject this application"
                                                            >
                                                                {actionLoading === a.applicationId ? "..." : "✕ Reject"}
                                                            </ActionButton>
                                                        </div>
                                                    ) : (
                                                        <span className="badge bg-secondary">
                                                            {a.status === "APPROVED" ? "Approved" : "Rejected"}
                                                        </span>
                                                    )}
                                                </td>
                                            </ContentGate>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
 
 