import { useState, useEffect } from "react";
import * as api from "../api/resourceApi";
import { fetchAllProjects } from "../api/projectApi";
import { RequiredPermission } from "../components/PermissionGate";
import Loading from "../components/Loading";
import Alert from "../components/Alert";
import ContentGate from "../components/ContentGate";


/* ✅ Toast */
const Toast = ({ msg, type }) => {
    if (!msg) return null;
    return (
        <div className={`position-fixed top-0 end-0 m-3 alert alert-${type}`} style={{ zIndex: 9999 }}>
            {msg}
        </div>
    );
};

export default function ResourcesPage() {

    const [tab, setTab] = useState("resources");
    const [resources, setResources] = useState([]);
    const [infra, setInfra] = useState([]);
    const [projects, setProjects] = useState([]);

    const [selected, setSelected] = useState({});
    const [mode, setMode] = useState("");
    const [section, setSection] = useState("");
    const [showModal, setShowModal] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /* ✅ Load Projects */
    useEffect(() => {
        fetchAllProjects().then(setProjects).catch(() => setError("Failed to load projects"));
    }, []);

    /* ✅ Load data */
    useEffect(() => {
        tab === "resources" ? loadResources() : loadInfra();
    }, [tab]);

    const loadResources = async () => setResources(await api.getAllResources());
    const loadInfra = async () => setInfra(await api.getAllInfrastructure());

    /* ✅ Modal */
    const openModal = (item = {}, m, sec) => {
        setSelected(item);
        setMode(m);
        setSection(sec);
        setShowModal(true);
    };

    /* ✅ SAVE */
    const handleSave = async () => {
        try {
            if (section === "resource") {
                const payload = {
                    projectId: Number(selected.projectId),
                    type: selected.type,
                    quantity: Number(selected.quantity),
                };

                mode === "add"
                    ? await api.allocateResource(payload)
                    : await api.updateResource(selected.resourceId, payload);

                loadResources();

            } else {
                const payload = {
                    projectId: Number(selected.projectId),
                    type: selected.type,
                    location: selected.location,
                    capacity: Number(selected.capacity),
                };

                mode === "add"
                    ? await api.createInfrastructure(payload)
                    : await api.updateInfrastructure(selected.infraId, payload);

                loadInfra();
            }

            setSuccess("Saved ✅");

        } catch {
            setError("Save failed ❌");
        } finally {
            setShowModal(false);
        }
    };

    /* ✅ DELETE */
    const handleDelete = async () => {
        try {
            if (section === "resource") {
                await api.deleteResource(selected.resourceId);
                loadResources();
            } else {
                await api.deleteInfrastructure(selected.infraId);
                loadInfra();
            }
            setSuccess("Deleted ✅");
        } catch {
            setError("Delete failed ❌");
        } finally {
            setShowModal(false);
        }
    };

    /* ✅ STATUS */
    const handleStatus = async (item, status) => {
        try {
            await api.updateResourceStatus(item.resourceId, status);
            loadResources();
            setSuccess("Status updated ✅");
        } catch {
            setError("Status update failed ❌");
        }
    };

    const handleInfraStatus = async (item, status) => {
        try {
            await api.updateInfrastructureStatus({
                infraId: item.infraId,
                status: status,
            });
            loadInfra();
            setSuccess("Status updated ✅");
        } catch {
            setError("Status update failed ❌");
        }
    const [activeTab, setActiveTab] = useState("resources");
    const [infrastructure, setInfrastructure] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [resourceForm, setResourceForm] = useState({ projectId: "", type: "Equipment", quantity: "" });
    const [updateResourceId, setUpdateResourceId] = useState("");
    const [updateResourceForm, setUpdateResourceForm] = useState({ projectId: "", type: "Funds", quantity: "" });
    const [viewResourceId, setViewResourceId] = useState("");
    const [viewedResource, setViewedResource] = useState(null);
    const [deleteResourceId, setDeleteResourceId] = useState("");
    const [statusResourceId, setStatusResourceId] = useState("");
    const [newStatus, setNewStatus] = useState("Allocated");
    const [infraForm, setInfraForm] = useState({ projectId: "", type: "Solar Plant", location: "", capacity: "" });
    const [viewInfraId, setViewInfraId] = useState("");
    const [viewedInfra, setViewedInfra] = useState(null);
    const [deleteInfraId, setDeleteInfraId] = useState("");
    const clearMessages = () => { setError(""); setSuccess(""); };

    useEffect(() => { if (activeTab === "infrastructure") loadAllInfra(); }, [activeTab]);

    const loadAllInfra = async () => {
        try { setLoading(true); const data = await getAllInfrastructure(); setInfrastructure(Array.isArray(data) ? data : []); }
        catch (err) { setError(err.response?.data?.message || "Failed to load infrastructure"); }
        finally { setLoading(false); }
    };
    const handleAllocate = async (e) => {
        e.preventDefault(); clearMessages();
        try { setLoading(true); await allocateResource({ ...resourceForm, quantity: Number(resourceForm.quantity), projectId: Number(resourceForm.projectId) }); setSuccess("Resource allocated!"); setResourceForm({ projectId: "", type: "Equipment", quantity: "" }); }
        catch (err) { setError(err.response?.data?.message || "Failed to allocate resource"); } finally { setLoading(false); }
    };
    const handleUpdateResource = async (e) => {
        e.preventDefault(); clearMessages(); if (!updateResourceId) { setError("Enter resource ID"); return; }
        try { setLoading(true); await updateResource(updateResourceId, { ...updateResourceForm, quantity: Number(updateResourceForm.quantity), projectId: Number(updateResourceForm.projectId) }); setSuccess("Resource updated!"); }
        catch (err) { setError(err.response?.data?.message || "Failed to update resource"); } finally { setLoading(false); }
    };
    const handleGetResource = async () => {
        if (!viewResourceId) { setError("Enter resource ID"); return; } clearMessages();
        try { setLoading(true); setViewedResource(await getResourceById(viewResourceId)); }
        catch (err) { setError(err.response?.data?.message || "Resource not found"); } finally { setLoading(false); }
    };
    const handleDeleteResource = async () => {
        if (!deleteResourceId) { setError("Enter resource ID"); return; } if (!window.confirm(`Delete resource #${deleteResourceId}?`)) return; clearMessages();
        try { setLoading(true); await deleteResource(deleteResourceId); setSuccess("Resource deleted!"); setDeleteResourceId(""); }
        catch (err) { setError(err.response?.data?.message || "Failed to delete"); } finally { setLoading(false); }
    };
    const handleUpdateStatus = async () => {
        if (!statusResourceId) { setError("Enter resource ID"); return; } clearMessages();
        try { setLoading(true); await updateResourceStatus(statusResourceId, newStatus); setSuccess(`Status updated to ${newStatus}`); setStatusResourceId(""); }
        catch (err) { setError(err.response?.data?.message || "Failed to update status"); } finally { setLoading(false); }
    };
    const handleCreateInfra = async (e) => {
        e.preventDefault(); clearMessages();
        try { setLoading(true); await createInfrastructure({ ...infraForm, projectId: Number(infraForm.projectId), capacity: Number(infraForm.capacity) }); setSuccess("Infrastructure created!"); setInfraForm({ projectId: "", type: "Solar Plant", location: "", capacity: "" }); loadAllInfra(); }
        catch (err) { setError(err.response?.data?.message || "Failed to create infrastructure"); } finally { setLoading(false); }
    };
    const handleGetInfra = async () => {
        if (!viewInfraId) { setError("Enter infrastructure ID"); return; } clearMessages();
        try { setLoading(true); setViewedInfra(await getInfrastructureById(viewInfraId)); }
        catch (err) { setError(err.response?.data?.message || "Infrastructure not found"); } finally { setLoading(false); }
    };
    const handleDeleteInfra = async () => {
        if (!deleteInfraId) { setError("Enter infrastructure ID"); return; } if (!window.confirm(`Delete infrastructure #${deleteInfraId}?`)) return; clearMessages();
        try { setLoading(true); await deleteInfrastructure(deleteInfraId); setSuccess("Infrastructure deleted!"); setDeleteInfraId(""); loadAllInfra(); }
        catch (err) { setError(err.response?.data?.message || "Failed to delete infrastructure"); } finally { setLoading(false); }
    };

    const rows = tab === "resources" ? resources : infra;
    const resourceStatusOptions = ["Available", "Allocated", "Depleted"];
    const infraStatusOptions = ["Planned", "Under Construction", "Operational"];

    return (
        <RequiredPermission authority="PROGRAM_MANAGER">
            <div className="container py-4">

                <Toast msg={error} type="danger" />
                <Toast msg={success} type="success" />

                <h4 className="text-success">Resource & Infrastructure</h4>

                {/* ✅ Tabs */}
                <div className="btn-group mb-3">
                    <button className={`btn ${tab === "resources" ? "btn-success" : "btn-outline-success"}`}
                        onClick={() => setTab("resources")}>
                        Resources
                    </button>

                    <button className={`btn ${tab === "infrastructure" ? "btn-success" : "btn-outline-success"}`}
                        onClick={() => setTab("infrastructure")}>
                        Infrastructure
                    </button>
                </div>

                {/* ✅ TABLE */}
                <div className="card mb-3">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 text-capitalize">{tab}</h6>

                        <button
                            className="btn btn-success btn-sm px-3"
                            onClick={() =>
                                openModal({}, "add", tab === "resources" ? "resource" : "infra")
                            }
                        >
                            <i className="bi bi-plus-lg"></i> Add
                        </button>
                    </div>
                </div>

                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Project</th>
                            <th>Type</th>

                            {/* ✅ NEW COLUMNS */}
                            {tab === "resources"
                                ? <th>Quantity</th>
                                : <>
                                    <th>Location</th>
                                    <th>Capacity</th>
                                </>
                            }

                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map(item => (
                            <tr key={item.resourceId || item.infraId}>
                                <td>{item.resourceId || item.infraId}</td>
                                <td>{item.projectTitle}</td>
                                <td>{item.type}</td>

                                {/* ✅ NEW DATA */}
                                {tab === "resources"
                                    ? <td>{item.quantity}</td>
                                    : <>
                                        <td>{item.location}</td>
                                        <td>{item.capacity}</td>
                                      </>
                                }

                                <td>{item.status}</td>

                                <td>
                                    <div className="d-flex align-items-center gap-2">

                                        {/* ✅ EDIT */}
                                        <button
                                            className="btn btn-outline-warning btn-sm d-flex align-items-center justify-content-center"
                                            style={{ width: "34px", height: "34px" }}
                                            onClick={() => openModal(item, "edit", tab === "resources" ? "resource" : "infra")}
                                        >
                                            <i className="fa-regular fa-pen-to-square"></i>
                                        </button>

                                        {/* ✅ STATUS */}
                                        {tab === "resources"
                                            ? (
                                                <select
                                                    className="form-select form-select-sm w-auto"
                                                    onChange={(e) => handleStatus(item, e.target.value)}
                                                >
                                                    <option value="">Status</option>
                                                    {resourceStatusOptions.map(opt => (
                                                        <option key={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            )
                                            : (
                                                <select
                                                    className="form-select form-select-sm w-auto"
                                                    onChange={(e) => handleInfraStatus(item, e.target.value)}
                                                >
                                                    <option value="">Status</option>
                                                    {infraStatusOptions.map(opt => (
                                                        <option key={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            )
                                        }

                                        {/* ✅ DELETE */}
                                        <button
                                            className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
                                            style={{ width: "34px", height: "34px" }}
                                            onClick={() => openModal(item, "delete", tab === "resources" ? "resource" : "infra")}
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>

                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* ✅ MODAL */}
                {showModal && (
                    <>
                        <div className="modal-backdrop show"></div>

                        <div className="modal d-block">
                            <div className="modal-dialog">
                                <div className="modal-content">

                                    <div className="modal-header">
                                        <h6>{mode} {section}</h6>
                                        <button className="btn-close" onClick={() => setShowModal(false)}></button>
                                    </div>

                                    <div className="modal-body">

                                        {mode === "delete" ? (
                                            <p>Do you want to delete this {section}?</p>
                                        ) : section === "resource" ? (
                                            <>
                                                <select className="form-control mb-2"
                                                    value={selected.projectId || ""}
                                                    onChange={(e) =>
                                                        setSelected({ ...selected, projectId: e.target.value })}>
                                                    <option>Select Project</option>
                                                    {projects.map(p => (
                                                        <option key={p.projectId} value={p.projectId}>
                                                            {p.title}
                                                        </option>
                                                    ))}
                                                </select>

                                                <select className="form-control mb-2"
                                                    value={selected.type || ""}
                                                    onChange={(e) =>
                                                        setSelected({ ...selected, type: e.target.value })}>
                                                    <option>Select Type</option>
                                                    <option>Funds</option>
                                                    <option>Equipment</option>
                                                </select>

                                                <input className="form-control"
                                                    placeholder="Quantity"
                                                    value={selected.quantity || ""}
                                                    onChange={(e) =>
                                                        setSelected({ ...selected, quantity: e.target.value })} />
                                            </>
                                        ) : (
                                            <>
                                                <select className="form-control mb-2"
                                                    value={selected.projectId || ""}
                                                    onChange={(e) =>
                                                        setSelected({ ...selected, projectId: e.target.value })}>
                                                    <option>Select Project</option>
                                                    {projects.map(p => (
                                                        <option key={p.projectId} value={p.projectId}>
                                                            {p.title}
                                                        </option>
                                                    ))}
                                                </select>

                                                <input className="form-control mb-2"
                                                    placeholder="Type"
                                                    value={selected.type || ""}
                                                    onChange={(e) =>
                                                        setSelected({ ...selected, type: e.target.value })} />

                                                <input className="form-control mb-2"
                                                    placeholder="Location"
                                                    value={selected.location || ""}
                                                    onChange={(e) =>
                                                        setSelected({ ...selected, location: e.target.value })} />

                                                <input className="form-control"
                                                    placeholder="Capacity"
                                                    value={selected.capacity || ""}
                                                    onChange={(e) =>
                                                        setSelected({ ...selected, capacity: e.target.value })} />
                                            </>
                                        )}

                                    </div>

                                    <div className="modal-footer">
                                        <button className="btn btn-secondary"
                                            onClick={() => setShowModal(false)}>Cancel</button>

                                        {mode === "delete"
                                            ? <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
                                            : <button className="btn btn-success" onClick={handleSave}>Save</button>}
                                    </div>

                                </div>
                            </div>
                        </div>
                    </>
                )}

            </div>
        </RequiredPermission>
        <div>
            <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                <div>
                    <h4 className="fw-bold text-success mb-0">Resource & Infrastructure</h4>
                    <p className="text-muted small mb-0">Allocate resources and manage infrastructure assets</p>
                </div>
            </div>
            {error && <Alert message={error} type="danger" />}
            {success && <Alert message={success} type="success" />}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === "resources" ? "active fw-semibold" : "text-muted"}`}
                        onClick={() => { setActiveTab("resources"); clearMessages(); }}
                        style={activeTab === "resources" ? { color: '#198754', borderBottomColor: '#198754' } : {}}>Resources</button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === "infrastructure" ? "active fw-semibold" : "text-muted"}`}
                        onClick={() => { setActiveTab("infrastructure"); clearMessages(); }}
                        style={activeTab === "infrastructure" ? { color: '#198754', borderBottomColor: '#198754' } : {}}>Infrastructure</button>
                </li>
            </ul>
            {loading && <Loading />}

            {/* RESOURCES TAB */}
            {!loading && activeTab === "resources" && (
                <div className="row g-4">
                    {/* View Resource — visible to all */}
                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-success text-white"><h6 className="mb-0">Get Resource by ID</h6></div>
                            <div className="card-body">
                                <div className="d-flex gap-2 mb-3">
                                    <input type="number" className="form-control" placeholder="Resource ID" value={viewResourceId} onChange={e => setViewResourceId(e.target.value)} />
                                    <button className="btn btn-success" onClick={handleGetResource}>Fetch</button>
                                </div>
                                {viewedResource && (<div className="bg-light p-3 rounded">{Object.entries(viewedResource).map(([k, v]) => (<div key={k} className="mb-1"><span className="text-muted">{k}: </span><strong>{String(v)}</strong></div>))}</div>)}
                            </div>
                        </div>
                    </div>
                    {/* Allocate — PROGRAM_MANAGER only */}
                    <ContentGate authority="PROGRAM_MANAGER">
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-success text-white"><h6 className="mb-0">Allocate Resource</h6></div>
                                <div className="card-body">
                                    <form onSubmit={handleAllocate}>
                                        <div className="mb-3"><label className="form-label">Project ID</label><input type="number" className="form-control" value={resourceForm.projectId} onChange={e => setResourceForm({ ...resourceForm, projectId: e.target.value })} required /></div>
                                        <div className="mb-3"><label className="form-label">Type</label><select className="form-select" value={resourceForm.type} onChange={e => setResourceForm({ ...resourceForm, type: e.target.value })}><option>Equipment</option><option>Funds</option><option>Personnel</option><option>Land</option></select></div>
                                        <div className="mb-3"><label className="form-label">Quantity</label><input type="number" className="form-control" value={resourceForm.quantity} onChange={e => setResourceForm({ ...resourceForm, quantity: e.target.value })} required /></div>
                                        <button type="submit" className="btn btn-success w-100">Allocate</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </ContentGate>
                    {/* Update — PROGRAM_MANAGER only */}
                    <ContentGate authority="PROGRAM_MANAGER">
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-success text-white"><h6 className="mb-0">Update Resource</h6></div>
                                <div className="card-body">
                                    <form onSubmit={handleUpdateResource}>
                                        <div className="mb-3"><label className="form-label">Resource ID</label><input type="number" className="form-control" value={updateResourceId} onChange={e => setUpdateResourceId(e.target.value)} required /></div>
                                        <div className="mb-3"><label className="form-label">Project ID</label><input type="number" className="form-control" value={updateResourceForm.projectId} onChange={e => setUpdateResourceForm({ ...updateResourceForm, projectId: e.target.value })} /></div>
                                        <div className="mb-3"><label className="form-label">Type</label><select className="form-select" value={updateResourceForm.type} onChange={e => setUpdateResourceForm({ ...updateResourceForm, type: e.target.value })}><option>Equipment</option><option>Funds</option><option>Personnel</option><option>Land</option></select></div>
                                        <div className="mb-3"><label className="form-label">Quantity</label><input type="number" className="form-control" value={updateResourceForm.quantity} onChange={e => setUpdateResourceForm({ ...updateResourceForm, quantity: e.target.value })} /></div>
                                        <button type="submit" className="btn btn-success w-100">Update</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </ContentGate>
                    {/* Delete & Status — PROGRAM_MANAGER only */}
                    <ContentGate authority="PROGRAM_MANAGER">
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-danger text-white"><h6 className="mb-0">Delete & Update Status</h6></div>
                                <div className="card-body">
                                    <p className="fw-semibold small text-muted">Delete Resource</p>
                                    <div className="d-flex gap-2 mb-4"><input type="number" className="form-control" placeholder="Resource ID" value={deleteResourceId} onChange={e => setDeleteResourceId(e.target.value)} /><button className="btn btn-danger" onClick={handleDeleteResource}>Delete</button></div>
                                    <hr />
                                    <p className="fw-semibold small text-muted">Update Resource Status</p>
                                    <input type="number" className="form-control mb-2" placeholder="Resource ID" value={statusResourceId} onChange={e => setStatusResourceId(e.target.value)} />
                                    <select className="form-select mb-2" value={newStatus} onChange={e => setNewStatus(e.target.value)}><option>Allocated</option><option>Available</option><option>Maintenance</option><option>Decommissioned</option></select>
                                    <button className="btn btn-success w-100" onClick={handleUpdateStatus}>Update Status</button>
                                </div>
                            </div>
                        </div>
                    </ContentGate>
                </div>
            )}

            {/* INFRASTRUCTURE TAB */}
            {!loading && activeTab === "infrastructure" && (
                <div className="row g-4">
                    <ContentGate authority="PROGRAM_MANAGER">
                        <div className="col-md-5">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-success text-white"><h6 className="mb-0">Create Infrastructure</h6></div>
                                <div className="card-body">
                                    <form onSubmit={handleCreateInfra}>
                                        <div className="mb-3"><label className="form-label">Project ID</label><input type="number" className="form-control" value={infraForm.projectId} onChange={e => setInfraForm({ ...infraForm, projectId: e.target.value })} required /></div>
                                        <div className="mb-3"><label className="form-label">Type</label><input type="text" className="form-control" value={infraForm.type} onChange={e => setInfraForm({ ...infraForm, type: e.target.value })} placeholder="Solar Plant" required /></div>
                                        <div className="mb-3"><label className="form-label">Location</label><input type="text" className="form-control" value={infraForm.location} onChange={e => setInfraForm({ ...infraForm, location: e.target.value })} placeholder="Sector 5, Bengaluru" required /></div>
                                        <div className="mb-3"><label className="form-label">Capacity (kW)</label><input type="number" className="form-control" value={infraForm.capacity} onChange={e => setInfraForm({ ...infraForm, capacity: e.target.value })} required /></div>
                                        <button type="submit" className="btn btn-success w-100">Create Infrastructure</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </ContentGate>
                    <div className="col-md-5">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-success text-white"><h6 className="mb-0">Lookup Infrastructure</h6></div>
                            <div className="card-body">
                                <div className="d-flex gap-2 mb-3"><input type="number" className="form-control" placeholder="Infra ID" value={viewInfraId} onChange={e => setViewInfraId(e.target.value)} /><button className="btn btn-success" onClick={handleGetInfra}>Fetch</button></div>
                                {viewedInfra && (<div className="bg-light p-3 rounded mb-3">{Object.entries(viewedInfra).map(([k, v]) => (<div key={k} className="mb-1"><span className="text-muted">{k}: </span><strong>{String(v)}</strong></div>))}</div>)}
                                <ContentGate authority="PROGRAM_MANAGER">
                                    <hr /><p className="small text-muted fw-semibold">Delete by ID</p>
                                    <div className="d-flex gap-2"><input type="number" className="form-control" placeholder="Infra ID" value={deleteInfraId} onChange={e => setDeleteInfraId(e.target.value)} /><button className="btn btn-danger" onClick={handleDeleteInfra}>Delete</button></div>
                                </ContentGate>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-7">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">All Infrastructure</h6>
                                <button className="btn btn-sm btn-light text-success" onClick={loadAllInfra}>↻ Refresh</button>
                            </div>
                            <div className="card-body">
                                {infrastructure.length === 0 ? (<p className="text-muted text-center py-4">No infrastructure records found</p>) : (
                                    <div className="table-responsive">
                                        <table className="table table-striped table-hover">
                                            <thead className="table-success"><tr><th>ID</th><th>Type</th><th>Location</th><th>Capacity</th><th>Project ID</th></tr></thead>
                                            <tbody>{infrastructure.map((infra) => (<tr key={infra.id}><td>{infra.id}</td><td><span className="badge bg-success">{infra.type}</span></td><td>{infra.location}</td><td>{infra.capacity} kW</td><td>{infra.projectId}</td></tr>))}</tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
