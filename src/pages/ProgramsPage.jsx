import { useState, useEffect } from "react";
import {
    fetchAllPrograms, createProgram, updateProgramStatus,
    updateProgram, deleteProgram, applyToProgram
} from "../api/programApi";
import { getParticipantByUserId } from "../api/participantApi";
import Loading from "../components/Loading";
import Alert from "../components/Alert";
import ActionButton from "../components/ActionButton";
import ContentGate from "../components/ContentGate";
import { useAuth } from "../auth/AuthContext";
import { toast } from 'react-toastify';
 
 
export default function ProgramsPage() {
    const { hasRole, getUserId } = useAuth();
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingProgram, setEditingProgram] = useState(null);

    // Add this with your other useState hooks (around line 20)
    const [applyingTo, setApplyingTo] = useState(null);    const emptyForm = {
        title: "", description: "", startDate: "", endDate: "",
        budget: "", status: "ACTIVE", ownerUserId: "",
    };
    const [formData, setFormData] = useState({ ...emptyForm });
 
    useEffect(() => { loadPrograms(); }, []);
 
    const loadPrograms = async () => {
        try {
            setLoading(true);
            const data = await fetchAllPrograms();
            console.log("API Response Data:", data);
            setPrograms(data || []);
            setError(""); }
        catch (err) { setError(err.response?.data?.message || "Failed to load programs"); }
        finally { setLoading(false); }
    };
 
    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const clearMessages = () => { setError(""); setSuccess(""); };
 
    /* ── Create ── */
    const handleCreateProgram = async (e) => {
        e.preventDefault(); clearMessages();
        try {
            setLoading(true);
            await createProgram(formData);
            setSuccess("Program created successfully.");
            setFormData({ ...emptyForm }); setShowCreateForm(false);
            loadPrograms();
        } catch (err) { setError(err.response?.data?.message || "Failed to create program"); }
        finally { setLoading(false); }
    };
 
    /* ── Status Change ── */
    const handleStatusChange = async (programId, newStatus) => {
        clearMessages();
        try { await updateProgramStatus(programId, newStatus); setSuccess(`Program #${programId} status updated to ${newStatus}.`); loadPrograms(); }
        catch (err) { setError(err.response?.data?.message || "Failed to update status"); }
    };
 
    /* ── Edit ── */
    const startEdit = (p) => {
        setEditingProgram(p.programId);
        setFormData({
            title: p.title || "",
            description: p.description || "",
            startDate: p.startDate ? p.startDate.split("T")[0] : "",
            endDate: p.endDate ? p.endDate.split("T")[0] : "",
            budget: p.budget || "", status: p.status || "ACTIVE",
            ownerUserId: p.ownerUserId || "",
        });
        setShowCreateForm(false); clearMessages();
    };
 
    const handleUpdateProgram = async (e) => {
        e.preventDefault(); clearMessages();
        try {
            setLoading(true);
            await updateProgram(editingProgram, formData);
            setSuccess("Program updated successfully.");
            setEditingProgram(null); loadPrograms();
        } catch (err) { setError(err.response?.data?.message || "Failed to update program"); }
        finally { setLoading(false); }
    };
 
    /* ── Delete ── */
    const handleDeleteProgram = async (programId) => {
        if (!window.confirm(`Delete program #${programId}? This cannot be undone.`)) return;
        clearMessages();
        try { await deleteProgram(programId); setSuccess("Program deleted successfully."); loadPrograms(); }
        catch (err) { setError(err.response?.data?.message || "Failed to delete program"); }
    };
 
    const statusBadge = (s) =>
        s === "ACTIVE" ? "bg-success" : s === "INACTIVE" ? "bg-secondary" : s === "PAUSED" ? "bg-warning text-dark" : "bg-secondary";
 
    if (loading && programs.length === 0) return <Loading />;
 
    /* ── Citizen Application Logic ── */
    const handleConfirmApplication = async () => {
        try {
            setLoading(true);

            // 1. Get the logged-in user ID from auth context
            const userId = getUserId();

            // 2. Fetch participant ID using userId
            const participantData = await getParticipantByUserId(userId);
            const participantId = participantData.id || participantData.participantId;

            if (!participantId) {
                setError("Participant ID not found. Please ensure your profile is set up.");
                setLoading(false);
                return;
            }

            // 3. Prepare the application request with correct participantId
            const applicationRequest = {
                applicantId: participantId,
                programId: applyingTo.programId
            };

            // 4. Call the API
            const response = await applyToProgram(applicationRequest);

            // 5. CHECK THE STATUS DIRECTLY
            // If status is 201 (Created) or 200 (OK), it was successful!
            if (response.status === 201 || response.status === 200) {
                toast.success(`Application for ${applyingTo.title} submitted!`);
                setApplyingTo(null); // Hide the form
                setSuccess("Application recorded in database.");
                loadPrograms();      // Refresh the table
            }

        } catch (error) {
            // This block will now ONLY run for actual failures (400, 500, etc.)
            console.error("Submission error:", error);

            const errorMessage = error.response?.data?.message || "Server error. Please try again.";
            toast.error("Submission failed: " + errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div>
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                <div>
                    <h4 className="fw-bold text-success mb-0">Programs</h4>
                    <p className="text-muted small mb-0">Create and manage green initiative programs</p>
                </div>
                <ActionButton authority="PROGRAM_MANAGER" className="btn btn-success btn-sm"
                    onClick={() => { setShowCreateForm(!showCreateForm); setEditingProgram(null); }}
                    title="Only Program Managers can create programs">
                    {showCreateForm ? "Cancel" : "+ New Program"}
                </ActionButton>
            </div>
 
            {error && <Alert message={error} type="danger" />}
            {success && <Alert message={success} type="success" />}
 
            {/* ── Create Form ── */}
            <ContentGate authority="PROGRAM_MANAGER">
                {showCreateForm && !editingProgram && (
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-success text-white border-0"><h6 className="mb-0">Create New Program</h6></div>
                        <div className="card-body p-4">
                            <form onSubmit={handleCreateProgram}>
                                <div className="row g-3">
                                    <div className="col-md-8">
                                        <label className="form-label small fw-semibold">Program Title</label>
                                        <input type="text" className="form-control" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Rooftop Solar Subsidy 2026" required />
                                    </div>
                                
                                    <div className="col-12">
                                        <label className="form-label small fw-semibold">Description</label>
                                        <textarea className="form-control" name="description" rows="2" value={formData.description} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-semibold">Start Date</label>
                                        <input type="date" className="form-control" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-semibold">End Date</label>
                                        <input type="date" className="form-control" name="endDate" value={formData.endDate} onChange={handleInputChange} required />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-semibold">Budget (INR)</label>
                                        <input type="number" className="form-control" name="budget" value={formData.budget} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="mt-3 d-flex gap-2">
                                    <button type="submit" className="btn btn-success btn-sm" disabled={loading}>{loading ? "Creating..." : "Create Program"}</button>
                                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowCreateForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
 
                {/* ── Edit Form ── */}
                {editingProgram && (
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-warning text-dark border-0"><h6 className="mb-0">Edit Program #{editingProgram}</h6></div>
                        <div className="card-body p-4">
                            <form onSubmit={handleUpdateProgram}>
                                <div className="row g-3">
                                    <div className="col-md-8">
                                        <label className="form-label small fw-semibold">Program Title</label>
                                        <input type="text" className="form-control" name="title" value={formData.title} onChange={handleInputChange} required />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-semibold">Owner User ID</label>
                                        <input type="number" className="form-control" name="ownerUserId" value={formData.ownerUserId} onChange={handleInputChange} required />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-semibold">Description</label>
                                        <textarea className="form-control" name="description" rows="2" value={formData.description} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label small fw-semibold">Start Date</label>
                                        <input type="date" className="form-control" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label small fw-semibold">End Date</label>
                                        <input type="date" className="form-control" name="endDate" value={formData.endDate} onChange={handleInputChange} required />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label small fw-semibold">Budget (INR)</label>
                                        <input type="number" className="form-control" name="budget" value={formData.budget} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label small fw-semibold">Status</label>
                                        <select className="form-select" name="status" value={formData.status} onChange={handleInputChange}>
                                            <option value="ACTIVE">Active</option>
                                            <option value="INACTIVE">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-3 d-flex gap-2">
                                    <button type="submit" className="btn btn-warning btn-sm" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</button>
                                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setEditingProgram(null)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </ContentGate>
 
            {/* ── Citizen Application Section ── */}
            {applyingTo && (
                <div className="card border-success shadow-sm mb-4">
                    <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Application Form: {applyingTo.title}</h6>
                        <button className="btn-close btn-close-white" onClick={() => setApplyingTo(null)}></button>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <p className="mb-1"><strong>Program:</strong> {applyingTo.title}</p>
                                <p className="mb-3"><strong>Applicant ID:</strong> {JSON.parse(localStorage.getItem("userData"))?.id}</p>
                            </div>
                            <div className="col-md-6 text-muted small">
                                <p>By clicking submit, your application for <b>{applyingTo.title}</b> will be recorded for review.</p>
                            </div>
                        </div>
 
                        <div className="d-flex gap-2 mt-2">
                            <button
                                className="btn btn-success me-2"
                                onClick={() => handleConfirmApplication()}
                            >
                                Submit Application
                            </button>
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => setApplyingTo(null)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ── Programs Table ── */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between">
                    <h6 className="mb-0 fw-semibold">All Programs</h6>
                    <button className="btn btn-outline-success btn-sm" onClick={loadPrograms}>Refresh</button>
                </div>
                <div className="card-body p-0">
                    {programs.length === 0 ? (
                        <p className="text-muted text-center py-5 mb-0">No programs found</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4 small">ID</th>
                                        <th className="small">Title</th>
                                        <th className="small">Description</th>
                                        <th className="small">Start</th>
                                        <th className="small">End</th>
                                        <th className="small">Budget</th>
                                        <th className="small">Remaining</th>
                                        <th className="small">Status</th>
 
                                        <th className="small text-end pe-4">Actions</th>
 
                                    </tr>
                                </thead>
                                <tbody>
                                    {programs.map((p) => (
                                        <tr key={p.programId}>
                                            <td className="ps-4 small text-muted">{p.programId}</td>
                                            <td className="small fw-semibold">{p.title || p.programTitle || "No Title"}</td>
                                            <td className="small text-muted" style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {p.description || "—"}
                                            </td>
                                            <td className="small">{p.startDate ? new Date(p.startDate).toLocaleDateString() : "—"}</td>
                                            <td className="small">{p.endDate ? new Date(p.endDate).toLocaleDateString() : "—"}</td>
                                            <td className="small">₹{p.budget ? Number(p.budget).toLocaleString() : "—"}</td>
                                            <td className="small">₹{p.remainingProgramBudget != null ? Number(p.remainingProgramBudget).toLocaleString() : "—"}</td>
                                            <td><span className={`badge ${statusBadge(p.status)}`}>{p.status}</span></td>
 
                                            {/* --- Updated Action Column --- */}
                                            <td className="text-end pe-4">
                                                <div className="d-flex gap-1 justify-content-end flex-nowrap">

                                                    {/* --- CITIZEN & BUSINESS OWNER VIEW --- */}
                                                    {(hasRole("CITIZEN") || hasRole("BUSINESS_OWNER")) && (
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            disabled={p.status !== "ACTIVE"}
                                                            onClick={() => setApplyingTo(p)}
                                                        >
                                                            {p.status === "ACTIVE" ? "Apply Now" : "Closed"}
                                                        </button>
                                                    )}                                                    {/* --- MANAGER VIEW --- */}
                                                    <ContentGate authority="PROGRAM_MANAGER">
                                                        <select className="form-select form-select-sm" style={{ width: 110 }}
                                                            value={p.status} onChange={(e) => handleStatusChange(p.programId, e.target.value)}>
                                                            <option value="ACTIVE">Active</option>
                                                            <option value="INACTIVE">Inactive</option>
                                                        </select>
                                                        <button className="btn btn-sm btn-outline-warning" title="Edit" onClick={() => startEdit(p)}>✏️</button>
                                                        <button className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => handleDeleteProgram(p.programId)}>🗑️</button>
                                                    </ContentGate>
 
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
 
            {/* ── Manager Tools ── */}
            <ContentGate authority="PROGRAM_MANAGER">
                <div className="row g-4 mb-4">
                   
                </div>
            </ContentGate>
        </div>
    );
}
 