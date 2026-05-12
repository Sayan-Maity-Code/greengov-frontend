import { useState, useEffect } from "react";
import {
  createAudit,
  getAuditsByStatus,
  getAuditsByComplianceId,
  closeAudit,
  getComplianceLookup,
} from "../api/auditApi";

import Loading from "../components/Loading";
import Alert from "../components/Alert";
import ContentGate from "../components/ContentGate";
import ActionButton from "../components/ActionButton";
import { useAuth } from "../auth/AuthContext";

export default function AuditPage() {
  const { getUserId } = useAuth();

  /* ================= STATE ================= */
  const [audits, setAudits] = useState([]);
  const [compliances, setCompliances] = useState([]);

  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    complianceId: "",
  });

  const [filter, setFilter] = useState({
    type: "all", // all | status | compliance
    value: "",
  });

  /* ================= LOAD COMPLIANCE LOOKUP ================= */

  const loadComplianceLookup = async () => {
    try {
      setLookupLoading(true);
      const data = await getComplianceLookup();
      setCompliances(data || []);
    } catch {
      setError("Failed to load compliance list");
    } finally {
      setLookupLoading(false);
    }
  };

  useEffect(() => {
    if (showCreateForm || filter.type === "compliance") {
      loadComplianceLookup();
    }
  }, [showCreateForm, filter.type]);

  /* ================= LOAD AUDITS ================= */

  const loadAudits = async () => {
    try {
      setLoading(true);
      let data = [];

      if (filter.type === "status" && filter.value) {
        data = await getAuditsByStatus(filter.value);
      } else if (filter.type === "compliance" && filter.value) {
        data = await getAuditsByComplianceId(filter.value);
      }

      setAudits(data || []);
      setError("");
    } catch {
      setError("Failed to load audits");
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLERS ================= */

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.complianceId) {
      setError("Please select a compliance record");
      return;
    }

    try {
      setLoading(true);
      await createAudit(
        { complianceId: formData.complianceId },
        getUserId()
      );
      setSuccess("Audit created successfully");
      setFormData({ complianceId: "" });
      setShowCreateForm(false);
      loadAudits();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create audit");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async (auditId) => {
    try {
      setLoading(true);
      await closeAudit(auditId, "COMPLETED", getUserId());
      setSuccess("Audit closed successfully");
      loadAudits();
    } catch {
      setError("Failed to close audit");
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) =>
    status === "COMPLETED"
      ? "bg-success"
      : status === "IN_PROGRESS"
      ? "bg-info text-dark"
      : "bg-secondary";

  if (loading && audits.length === 0) return <Loading />;

  /* ================= UI ================= */

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <div>
          <h4 className="fw-bold text-success">Audit Management</h4>
          <p className="text-muted small mb-0">
            Create and manage compliance audits
          </p>
        </div>
        <ActionButton
          authority="AUDIT_MANAGER"
          className="btn btn-success btn-sm"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? "Cancel" : "+ Create Audit"}
        </ActionButton>
      </div>

      {error && <Alert message={error} type="danger" />}
      {success && <Alert message={success} type="success" />}

      {/* ================= CREATE AUDIT ================= */}
      <ContentGate authority="AUDIT_MANAGER">
        {showCreateForm && (
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-success text-white">
              Create Audit
            </div>
            <div className="card-body">
              <form onSubmit={handleCreate}>
                <label className="form-label">Compliance</label>
                <select
                  className="form-select"
                  value={formData.complianceId}
                  onChange={(e) =>
                    setFormData({ complianceId: e.target.value })
                  }
                  required
                  disabled={lookupLoading}
                >
                  <option value="">
                    {lookupLoading
                      ? "Loading compliances..."
                      : "Select Compliance"}
                  </option>
                  {compliances.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <div className="mt-3">
                  <button className="btn btn-success btn-sm" type="submit">
                    Create Audit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </ContentGate>

      {/* ================= FILTER ================= */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">Filter Audits</div>
        <div className="card-body row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label">Filter By</label>
            <select
              className="form-select form-select-sm"
              value={filter.type}
              onChange={(e) =>
                setFilter({ type: e.target.value, value: "" })
              }
            >
              <option value="all">All</option>
              <option value="status">Status</option>
              <option value="compliance">Compliance</option>
            </select>
          </div>

          {filter.type === "status" && (
            <div className="col-md-4">
              <label className="form-label">Status</label>
              <select
                className="form-select form-select-sm"
                value={filter.value}
                onChange={(e) =>
                  setFilter({ ...filter, value: e.target.value })
                }
              >
                <option value="">Select</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          )}

          {filter.type === "compliance" && (
            <div className="col-md-4">
              <label className="form-label">Compliance</label>
              <select
                className="form-select form-select-sm"
                value={filter.value}
                onChange={(e) =>
                  setFilter({ ...filter, value: e.target.value })
                }
              >
                <option value="">Select</option>
                {compliances.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="col-md-2">
            <button
              className="btn btn-success btn-sm w-100"
              onClick={loadAudits}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="card shadow-sm">
        <div className="card-header">Audit Records</div>
        <div className="card-body p-0">
          {audits.length === 0 ? (
            <p className="text-center text-muted py-4 mb-0">
              No audits found
            </p>
          ) : (
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Audit ID</th>
                  <th>Compliance ID</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {audits.map((a) => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.complianceId}</td>
                    <td>
                      <span className={`badge ${statusBadge(a.status)}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      {a.status !== "COMPLETED" && (
                        <ActionButton
                          authority="AUDIT_MANAGER"
                          className="btn btn-success btn-sm"
                          onClick={() => handleClose(a.id)}
                        >
                          Close
                        </ActionButton>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
