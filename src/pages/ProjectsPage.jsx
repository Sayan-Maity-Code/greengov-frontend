import { useState, useEffect } from "react";
import { fetchAllProjects, createProject, updateProjectStatus } from "../api/projectApi";
import { getParticipantByUserId } from "../api/participantApi";
import Loading from "../components/Loading";
import Alert from "../components/Alert";
import ContentGate from "../components/ContentGate";
import ActionButton from "../components/ActionButton";
import { toast } from 'react-toastify';
 
export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
 
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        budget: "",
        startDate: "",
        endDate: "",
        participantId: ""
    });
 
    const [fieldErrors, setFieldErrors] = useState({});
 
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
 
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error message as user starts typing
        if (fieldErrors[e.target.name]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
        }
    };
 
    // const validateForm = () => {
    //     let errors = {};
    //     if (!formData.title.trim()) errors.title = "Title is mandatory";
    //     if (!formData.participantId) errors.participantId = "Participant ID is required";
    //     if (!formData.startDate) errors.startDate = "Start date is mandatory";
    //     if (!formData.endDate) errors.endDate = "End date is mandatory";
    //     if (!formData.budget || formData.budget <= 0) errors.budget = "Valid budget is required";
 
    //     setFieldErrors(errors);
    //     return Object.keys(errors).length === 0;
    // };
    const validateForm = () => {
    let errors = {};
    if (!formData.title.trim()) errors.title = "Title is mandatory";
    // REMOVE THIS LINE: if (!formData.participantId) errors.participantId = "Participant ID is required";
    if (!formData.startDate) errors.startDate = "Start date is mandatory";
    if (!formData.endDate) errors.endDate = "End date is mandatory";
    if (!formData.budget || formData.budget <= 0) errors.budget = "Valid budget is required";
 
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
};
 
    // const handleCreateProject = async (e) => {
    //     e.preventDefault();
    //     setError(""); setSuccess("");
 
    //     // Perform manual validation check
    //     if (!validateForm()) return;
 
    //     try {
    //         setLoading(true);
    //         // const
    //         await createProject(formData);
    //         setSuccess("Project created successfully.");
    //         setFormData({ title: "", description: "", budget: "", startDate: "", endDate: "", participantId: "" });
    //         setShowCreateForm(false);
    //         loadProjects();
    //     } catch (err) {
    //         setError(err.response?.data?.message || "Failed to create project");
    //     } finally {
    //         setLoading(false);
    //     }
    // };
 
    const handleCreateProject = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
 
    // Manual validation check
    if (!validateForm()) return;
 
    try {
        setLoading(true);
        
        // 1. Get the logged-in user data from localStorage
        const userData = JSON.parse(localStorage.getItem("userData"));
        const userId = userData.id;
        
        // 2. Fetch participant ID using userId
        const participantData = await getParticipantByUserId(userId);
        const participantId = participantData.id || participantData.participantId;
        
        if (!participantId) {
            setError("Participant ID not found. Please ensure your profile is set up.");
            setLoading(false);
            return;
        }
        
        // 3. Prepare the payload with correct participantId
        const projectPayload = {
            ...formData,
            participantId: participantId
        };
        
        // 4. Create the project
        await createProject(projectPayload);
       
        setSuccess("Project created successfully.");
        setFormData({ title: "", description: "", budget: "", startDate: "", endDate: "", participantId: "" });
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
 
            {error && <Alert message={error} type="danger" />}
            {success && <Alert message={success} type="success" />}
 
            {/* Create Form — CITIZEN / BUSINESS_OWNER only */}
            <ContentGate roles={["CITIZEN", "BUSINESS_OWNER"]}>
                {showCreateForm && (
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-success text-white border-0">
                            <h6 className="mb-0">Create New Project</h6>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleCreateProject} noValidate>
                                <div className="row g-3">
                                    <div className="col-md-8">
                                        <label htmlFor="proj-name" className="form-label small fw-semibold">Project Title</label>
                                        <input id="proj-name" type="text" className="form-control" name="title"
                                            value={formData.title} onChange={handleInputChange} required />
                                        {fieldErrors.title && <div className="text-danger small mt-1">{fieldErrors.title}</div>}
                                    </div>
 
                                    {/* Added Participant ID input field */}
                                    {/* <div className="col-md-3">
                                        <label htmlFor="proj-participant" className="form-label small fw-semibold">Participant ID</label>
                                        <input
                                            id="proj-participant"
                                            type="number"
                                            className="form-control"
                                            name="participantId"
                                            value={formData.participantId}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        {fieldErrors.participantId && <div className="text-danger small mt-1">{fieldErrors.participantId}</div>}
                                    </div> */}
 
                                    {/* Added Start Date input field */}
                                    <div className="col-md-4">
                                        <label htmlFor="proj-start" className="form-label small fw-semibold">Start Date</label>
                                        <input
                                            id="proj-start"
                                            type="date"
                                            className="form-control"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        {fieldErrors.startDate && <div className="text-danger small mt-1">{fieldErrors.startDate}</div>}
                                    </div>
 
                                    {/* End Date Field */}
                                    <div className="col-md-6">
                                        <label htmlFor="proj-end" className="form-label small fw-semibold">End Date</label>
                                        <input id="proj-end" type="date" className="form-control" name="endDate"
                                            value={formData.endDate} onChange={handleInputChange} required />
                                        {fieldErrors.endDate && <div className="text-danger small mt-1">{fieldErrors.endDate}</div>}
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
                                        {fieldErrors.budget && <div className="text-danger small mt-1">{fieldErrors.budget}</div>}
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
                                <thead className="table-light text-nowrap">
                                    <tr>
                                        <th className="ps-4 small" style={{ width: "20%" }}>Project Name</th>
                                        <th className="small" style={{ width: "25%" }}>Description</th>
                                        <th className="small" style={{ width: "15%" }}>Start Date</th>
                                        <th className="small" style={{ width: "15%" }}>End Date</th>
                                        <th className="small" style={{ width: "15%" }}>Budget</th>
                                        <th className="small">Status</th>
                                        <ContentGate authority="PROGRAM_MANAGER">
                                            <th className="small text-end pe-4">Actions</th>
                                        </ContentGate>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.map((p) => (
                                        <tr key={p.porjectId || p.id}>
                                            <td className="ps-4 small fw-semibold text-success">{p.name || p.title}</td>
                                            <td className="small text-muted" style={{ maxWidth: "250px" }}>
                                                <details>
                                                    <summary
                                                        className="text-muted fw-semibold"
                                                        style={{ cursor: "pointer", listStyle: "none", outline: "none" }}
                                                    >
                                                        {p.description ? p.description.substring(0, 30) + "..." : "—"}
                                                    </summary>
                                                    <div className="mt-2 p-2 border-start border-3 border-success bg-light rounded-end text-dark">
                                                        {p.description}
                                                    </div>
                                                </details>
                                            </td>
                                            <td className="small text-nowrap">{p.startDate || "—"}</td>
                                            <td className="small text-nowrap">{p.endDate || "—"}</td>
                                            <td className="small fw-bold text-nowrap">₹{p.budget ? Number(p.budget).toLocaleString() : "0"}</td>
                                            <td>
                                                <span className={`badge ${statusBadge(p.status)}`}>{p.status || "PENDING"}</span>
                                            </td>
                                            <ContentGate authority="PROGRAM_MANAGER">
                                                <td className="text-end pe-4">
                                                    <select className="form-select form-select-sm" style={{ width: 130 }}
                                                        value={p.status || "Pending"}
                                                        onChange={(e) => {
                                                            updateProjectStatus(p.projectId || p.id, e.target.value)
                                                                .then(() => {
                                                                    setSuccess(`Status updated to ${e.target.value}`);
                                                                    loadProjects();
                                                                })
                                                                .catch((err) => setError(err.response?.data?.message || "Failed to update status"));
                                                        }}>
                                                       
                                                        <option value="APPROVED">Approved</option>
                                                        <option value="REJECTED">Rejected</option>
                                                       
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