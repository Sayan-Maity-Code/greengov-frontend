import { useState, useEffect } from "react";
import { fetchAllProjects, createProject, updateProjectStatus } from "../api/projectApi";
import Loading from "../components/Loading";
import Alert from "../components/Alert";
import ContentGate from "../components/ContentGate";
import ActionButton from "../components/ActionButton";

export default function ProjectsPage() {
    const [projects, setProjects]             = useState([]);
    const [loading, setLoading]               = useState(true);
    const [error, setError]                   = useState("");
    const [success, setSuccess]               = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);

    const [formData, setFormData] = useState({
        programId: "", name: "", description: "", budget: "",
    });

    useEffect(() => { loadProjects(); }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const data = await fetchAllProjects();
            setProjects(data || []);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleCreateProject = async (e) => {
        e.preventDefault();
        setError(""); setSuccess("");
        try {
            setLoading(true);
            await createProject(formData);
            setSuccess("Project created successfully.");
            setFormData({ programId: "", name: "", description: "", budget: "" });
            setShowCreateForm(false);
            loadProjects();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create project");
        } finally {
            setLoading(false);
        }
    };

    const statusBadge = (status) => {
        if (status === "APPROVED" || status === "ACTIVE") return "bg-success";
        if (status === "PENDING" || status === "Pending") return "bg-warning text-dark";
        if (status === "REJECTED") return "bg-danger";
        return "bg-secondary";
    };

    if (loading && projects.length === 0) return <Loading />;

    return (
        <div>
            {/* Page header */}
            <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                <div>
                    <h4 className="fw-bold text-success mb-0">Projects</h4>
                    <p className="text-muted small mb-0">Manage sustainability projects</p>
                </div>
                <ActionButton
                    roles={["CITIZEN", "BUSINESS_OWNER"]}
                    className="btn btn-success btn-sm"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    title="Citizens and Business Owners can create projects"
                >
                    {showCreateForm ? "Cancel" : "+ New Project"}
                </ActionButton>
            </div>

            {error   && <Alert message={error}   type="danger" />}
            {success && <Alert message={success} type="success" />}

            {/* Create Form — CITIZEN / BUSINESS_OWNER only */}
            <ContentGate roles={["CITIZEN", "BUSINESS_OWNER"]}>
                {showCreateForm && (
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-success text-white border-0">
                            <h6 className="mb-0">Create New Project</h6>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleCreateProject}>
                                <div className="row g-3">
                                    <div className="col-md-8">
                                        <label htmlFor="proj-name" className="form-label small fw-semibold">Project Name</label>
                                        <input id="proj-name" type="text" className="form-control" name="name"
                                            value={formData.name} onChange={handleInputChange} required />
                                    </div>
                                    <div className="col-md-4">
                                        <label htmlFor="proj-program" className="form-label small fw-semibold">Program ID</label>
                                        <input id="proj-program" type="number" className="form-control" name="programId"
                                            value={formData.programId} onChange={handleInputChange} required />
                                    </div>
                                    <div className="col-12">
                                        <label htmlFor="proj-desc" className="form-label small fw-semibold">Description</label>
                                        <textarea id="proj-desc" className="form-control" name="description" rows="2"
                                            value={formData.description} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-md-4">
                                        <label htmlFor="proj-budget" className="form-label small fw-semibold">Budget (INR)</label>
                                        <input id="proj-budget" type="number" className="form-control" name="budget"
                                            value={formData.budget} onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="mt-3 d-flex gap-2">
                                    <button type="submit" className="btn btn-success btn-sm" disabled={loading}>
                                        {loading ? "Creating..." : "Create Project"}
                                    </button>
                                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowCreateForm(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </ContentGate>

            {/* Projects Table */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between">
                    <h6 className="mb-0 fw-semibold">All Projects</h6>
                    <button className="btn btn-outline-success btn-sm" onClick={loadProjects}>Refresh</button>
                </div>
                <div className="card-body p-0">
                    {projects.length === 0 ? (
                        <p className="text-muted text-center py-5 mb-0">No projects found</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4 small">Project Name</th>
                                        <th className="small">Description</th>
                                        <th className="small">Budget</th>
                                        <th className="small">Program ID</th>
                                        <th className="small">Status</th>
                                        <ContentGate authority="PROGRAM_MANAGER">
                                            <th className="small text-end pe-4">Actions</th>
                                        </ContentGate>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.map((p) => (
                                        <tr key={p.id}>
                                            <td className="ps-4 small fw-semibold">{p.name || p.title}</td>
                                            <td className="small text-muted">{p.description || "—"}</td>
                                            <td className="small">₹{p.budget ? Number(p.budget).toLocaleString() : "—"}</td>
                                            <td className="small">{p.programId || "—"}</td>
                                            <td>
                                                <span className={`badge ${statusBadge(p.status)}`}>{p.status || "PENDING"}</span>
                                            </td>
                                            <ContentGate authority="PROGRAM_MANAGER">
                                                <td className="text-end pe-4">
                                                    <select className="form-select form-select-sm" style={{ width: 130 }}
                                                        value={p.status || "Pending"}
                                                        onChange={(e) => {
                                                            updateProjectStatus(p.id, e.target.value)
                                                                .then(() => { setSuccess(`Project status updated.`); loadProjects(); })
                                                                .catch((err) => setError(err.response?.data?.message || "Failed to update status"));
                                                        }}>
                                                        <option value="Pending">Pending</option>
                                                        <option value="APPROVED">Approved</option>
                                                        <option value="REJECTED">Rejected</option>
                                                        <option value="ACTIVE">Active</option>
                                                    </select>
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
