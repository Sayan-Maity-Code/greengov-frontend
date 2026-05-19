import { useState, useEffect } from "react";
import * as api from "../api/resourceApi";
import { fetchAllProjects } from "../api/projectApi";
import Loading from "../components/Loading";
import ContentGate from "../components/ContentGate";
import ActionButton from "../components/ActionButton";
 
/* ✅ Toast */
const Toast = ({ msg, type }) => {
  if (!msg) return null;
  return (
    <div
      className={`position-fixed top-0 end-0 m-3 alert alert-${type}`}
      style={{ zIndex: 9999 }}
    >
      {msg}
    </div>
  );
};
 
export default function ResourcesPage() {
  /* ───────────────── STATE ───────────────── */
  const [tab, setTab] = useState("resources");
  const [resources, setResources] = useState([]);
  const [infra, setInfra] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selected, setSelected] = useState({});
  const [mode, setMode] = useState(""); // add | edit | delete
  const [section, setSection] = useState(""); // resource | infra
  const [showModal, setShowModal] = useState(false);
 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
 
  /* ───────────────── LOAD DATA ───────────────── */
  useEffect(() => {
    fetchAllProjects()
      .then(setProjects)
      .catch(() => setError("Failed to load projects"));
  }, []);
 
  useEffect(() => {
    tab === "resources" ? loadResources() : loadInfra();
  }, [tab]);
 
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000); // disappears after 3 sec
 
      return () => clearTimeout(timer);
    }
  }, [error, success]);
 
  const loadResources = async () => {
    setLoading(true);
    try {
      setResources(await api.getAllResources());
    } catch {
      setError("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };
 
  const loadInfra = async () => {
    setLoading(true);
    try {
      setInfra(await api.getAllInfrastructure());
    } catch {
      setError("Failed to load infrastructure");
    } finally {
      setLoading(false);
    }
  };
 
  /* ───────────────── MODAL ───────────────── */
  const openModal = (item = {}, m, sec) => {
    setSelected(item);
    setMode(m);
    setSection(sec);
    setShowModal(true);
  };
 
  /* ───────────────── SAVE ───────────────── */
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
 
      setSuccess("Saved Successfully");
    }
 
    catch (err) {
      const backendMsg =
        err?.response?.data?.message || "Something went wrong ❌";
      setError(backendMsg);
    }
 
    finally {
      setShowModal(false);
    }
  };
 
  /* ───────────────── DELETE ───────────────── */
  const handleDelete = async () => {
    try {
      section === "resource"
        ? await api.deleteResource(selected.resourceId)
        : await api.deleteInfrastructure(selected.infraId);
 
      section === "resource" ? loadResources() : loadInfra();
      setSuccess("Deleted Successfully");
    } catch (err) {
      const backendMsg =
        err?.response?.data?.message || "Something went wrong ❌";
      setError(backendMsg);
    }
    finally {
      setShowModal(false);
    }
  };
 
  /* ───────────────── STATUS ───────────────── */
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
        status,
      });
      loadInfra();
      setSuccess("Status updated ✅");
    } catch {
      setError("Status update failed ❌");
    }
  };
 
  const getStatusStyle = (status) => {
    switch (status) {
      case "Allocated":
      case "Approved":
      case "Operational":
        return "bg-success";
 
      case "Available":
        return "bg-primary";
 
      case "Planned":
      case "Under Construction":
        return "bg-warning text-dark";
 
      case "Depleted":
        return "bg-danger";
 
      default:
        return "bg-secondary";
    }
  };
 
 
  const allRows = tab === "resources" ? resources : infra;
 
  const rows = allRows.filter((item) => {
    const search = searchText.toLowerCase();
 
    return (
      item.projectTitle?.toLowerCase().includes(search) ||
      item.type?.toLowerCase().includes(search) ||
      item.status?.toLowerCase().includes(search)
    );
  });
 
  const resourceStatusOptions = ["Available", "Allocated", "Depleted"];
  const infraStatusOptions = ["Planned", "Under Construction", "Operational"];
 
  /* ───────────────── RENDER ───────────────── */
  return (
    <div className="container py-4">
      <Toast msg={error} type="danger" />
      <Toast msg={success} type="success" />
 
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="text-success mb-0">Resource & Infrastructure</h4>
        <ActionButton
          authority="PROGRAM_MANAGER"
          className="btn btn-success px-4 py-2 fw-semibold"
          onClick={() =>
            openModal({}, "add", tab === "resources" ? "resource" : "infra")
          }
        >
 
          + Add
        </ActionButton>
      </div>
 
      {/* Tabs */}
      <div className="border-bottom mb-3">
 
        <ul className="nav nav-tabs border-0">
 
          {/* ✅ RESOURCES TAB */}
          <li className="nav-item">
            <button
              className={`nav-link ${tab === "resources" ? "active text-success fw-semibold border-success border-bottom border-2" : "text-muted"
                }`}
              style={{ border: "none", background: "none" }}
              onClick={() => setTab("resources")}
            >
              Resources
            </button>
          </li>
 
          {/* ✅ INFRA TAB */}
          <li className="nav-item">
            <button
              className={`nav-link ${tab === "infrastructure" ? "active text-success fw-semibold border-success border-bottom border-2" : "text-muted"
                }`}
              style={{ border: "none", background: "none" }}
              onClick={() => setTab("infrastructure")}
            >
              Infrastructure
            </button>
          </li>
 
        </ul>
      </div>
 
 
      <div className="d-flex justify-content-end mb-3">
        <input
          type="text"
          className="form-control w-25"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
 
      {loading && <Loading />}
 
      {/* Table */}
      {!loading && (
        <table className="table table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Project</th>
              <th>Type</th>
              {tab === "resources" ? (
                <th>Quantity</th>
              ) : (
                <>
                  <th>Location</th>
                  <th>Capacity</th>
                </>
              )}
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
 
          <tbody>
            {rows.map((item) => (
              <tr key={item.resourceId || item.infraId}>
                <td>{item.resourceId || item.infraId}</td>
                <td>{item.projectTitle}</td>
                <td>{item.type}</td>
 
                {tab === "resources" ? (
                  <td>{item.quantity}</td>
                ) : (
                  <>
                    <td>{item.location}</td>
                    <td>{item.capacity}</td>
                  </>
                )}
 
 
                <td>
                  <span
                    className={`badge ${getStatusStyle(item.status)} px-3 py-2 text-uppercase`}
                    style={{
                      borderRadius: "20px",
                      fontWeight: "600",
                      letterSpacing: "0.5px"
                    }}
                  >
                    {item.status}
                  </span>
                </td>
 
 
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <ActionButton
                      authority="PROGRAM_MANAGER"
                      className="btn btn-sm btn-outline-warning"
                      onClick={() =>
                        openModal(
                          item,
                          "edit",
                          tab === "resources" ? "resource" : "infra"
                        )
                      }
                    >
                      ✏️
                    </ActionButton>
 
                    <ContentGate authority="PROGRAM_MANAGER">
                      <select
                        className="form-select form-select-sm w-auto"
                        onChange={(e) =>
                          tab === "resources"
                            ? handleStatus(item, e.target.value)
                            : handleInfraStatus(item, e.target.value)
                        }
                      >
                        <option>Status</option>
                        {(tab === "resources"
                          ? resourceStatusOptions
                          : infraStatusOptions
                        ).map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </ContentGate>
 
                    <ActionButton
                      authority="PROGRAM_MANAGER"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() =>
                        openModal(
                          item,
                          "delete",
                          tab === "resources" ? "resource" : "infra"
                        )
                      }
                    >
                      🗑️
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
 
      {/* Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop show" />
          <div className="modal d-block">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h6 className="mb-0">
                    {mode.toUpperCase()} {section.toUpperCase()}
                  </h6>
                  <button
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>
 
                <div className="modal-body">
                  {mode === "delete" ? (
                    <p>Are you sure you want to delete?</p>
                  ) : (
                    <>
                      <select
                        className="form-control mb-2"
                        value={selected.projectId || ""}
                        onChange={(e) =>
                          setSelected({
                            ...selected,
                            projectId: e.target.value,
                          })
                        }
                      >
                        <option>Select Project</option>
                        {projects.map((p) => (
                          <option key={p.projectId} value={p.projectId}>
                            {p.title}
                          </option>
                        ))}
                      </select>
 
 
                      <select
                        className="form-control mb-2"
                        value={selected.type || ""}
                        onChange={(e) =>
                          setSelected({ ...selected, type: e.target.value })
                        }
                      >
                        <option value="">Select Type</option>
 
                        {/* ✅ RESOURCE TYPES */}
                        {section === "resource" ? (
                          <>
                            <option value="Funds">Funds</option>
                            <option value="Equipment">Equipment</option>
                          </>
                        ) : (
                          /* ✅ INFRA TYPES */
                          <>
                            <option value="SolarPlant">SolarPlant</option>
                            <option value="WindFarm">WindFarm</option>
                            <option value="RecyclingUnit">RecyclingUnit</option>
                          </>
                        )}
 
                      </select>
 
 
                      {section === "resource" ? (
                        <input
                          className="form-control"
                          placeholder="Quantity"
                          value={selected.quantity || ""}
                          onChange={(e) =>
                            setSelected({
                              ...selected,
                              quantity: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <>
                          <input
                            className="form-control mb-2"
                            placeholder="Location"
                            value={selected.location || ""}
                            onChange={(e) =>
                              setSelected({
                                ...selected,
                                location: e.target.value,
                              })
                            }
                          />
                          <input
                            className="form-control"
                            placeholder="Capacity"
                            value={selected.capacity || ""}
                            onChange={(e) =>
                              setSelected({
                                ...selected,
                                capacity: e.target.value,
                              })
                            }
                          />
                        </>
                      )}
                    </>
                  )}
                </div>
 
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
 
                  {mode === "delete" ? (
                    <button className="btn btn-danger" onClick={handleDelete}>
                      Delete
                    </button>
                  ) : (
                    <button className="btn btn-success" onClick={handleSave}>
                      Save
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
 