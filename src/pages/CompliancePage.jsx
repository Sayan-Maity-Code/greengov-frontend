import { useEffect, useState } from "react";
import {
  createCompliance,
  getComplianceBySubject,
  getProjectSubjects,
  getProgramSubjects,
  getIncentiveSubjects,
} from "../api/complianceApi";

import Loading from "../components/Loading";
import Alert from "../components/Alert";
import ContentGate from "../components/ContentGate";
import ActionButton from "../components/ActionButton";
import { useAuth } from "../auth/AuthContext";

export default function CompliancePage() {
  const { getUserId } = useAuth();

  /* ======================= STATE ======================= */
  const [records, setRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // For create form
  const [formData, setFormData] = useState({
    subjectType: "PROJECT",
    subjectId: "",
    result: "PASS",
    notes: "",
    evidenceURL: "",
  });

  // For filter
  const [filter, setFilter] = useState({
    subjectType: "",
    subjectId: "",
  });

  /* ======================= LOAD SUBJECTS ======================= */

  const loadSubjects = async (type) => {
    try {
      setSubjectsLoading(true);
      let data = [];

      if (type === "PROJECT") data = await getProjectSubjects();
      if (type === "PROGRAM") data = await getProgramSubjects();
      if (type === "INCENTIVE") data = await getIncentiveSubjects();

      setSubjects(data || []);
    } catch {
      setError("Failed to load subjects");
    } finally {
      setSubjectsLoading(false);
    }
  };

  // Load subjects for CREATE
  useEffect(() => {
    if (!showCreateForm) return;
    setFormData((p) => ({ ...p, subjectId: "" }));
    loadSubjects(formData.subjectType);
  }, [formData.subjectType, showCreateForm]);

  // Load subjects for FILTER
  useEffect(() => {
    if (!filter.subjectType) {
      setSubjects([]);
      return;
    }
    setFilter((p) => ({ ...p, subjectId: "" }));
    loadSubjects(filter.subjectType);
  }, [filter.subjectType]);

  /* ======================= HANDLERS ======================= */

  const handleFormChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFilterChange = (e) =>
    setFilter({ ...filter, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.subjectId) {
      setError("Please select a subject");
      return;
    }

    try {
      setLoading(true);
      await createCompliance(formData, getUserId());
      setSuccess("Compliance record created successfully");

      setFormData({
        subjectType: "PROJECT",
        subjectId: "",
        result: "PASS",
        notes: "",
        evidenceURL: "",
      });

      setShowCreateForm(false);
      setRecords([]);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create compliance record"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadCompliance = async () => {
    if (!filter.subjectType || !filter.subjectId) {
      setRecords([]);
      return;
    }
    try {
      setLoading(true);
      const data = await getComplianceBySubject(
        filter.subjectType,
        filter.subjectId
      );
      setRecords(data || []);
      setError("");
    } catch {
      setError("Failed to load compliance records");
    } finally {
      setLoading(false);
    }
  };

  const resultBadge = (result) =>
    result === "PASS"
      ? "bg-success"
      : result === "FAIL"
      ? "bg-danger"
      : "bg-warning text-dark";

  if (loading && records.length === 0) return <Loading />;

  /* ======================= UI ======================= */

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <div>
          <h4 className="fw-bold text-success">Compliance Management</h4>
          <p className="text-muted small mb-0">
            Create and review compliance records
          </p>
        </div>
        <ActionButton
          authority="COMPLIANCE_OFFICER"
          className="btn btn-success btn-sm"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? "Cancel" : "+ Create Record"}
        </ActionButton>
      </div>

      {error && <Alert message={error} type="danger" />}
      {success && <Alert message={success} type="success" />}

      {/* ================= CREATE FORM ================= */}
      <ContentGate authority="COMPLIANCE_OFFICER">
        {showCreateForm && (
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-success text-white">
              Create Compliance Record
            </div>
            <div className="card-body">
              <form onSubmit={handleCreate}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Subject Type</label>
                    <select
                      className="form-select"
                      name="subjectType"
                      value={formData.subjectType}
                      onChange={handleFormChange}
                    >
                      <option value="PROJECT">Project</option>
                      <option value="PROGRAM">Program</option>
                      <option value="INCENTIVE">Incentive</option>
                    </select>
                  </div>

                  <div className="col-md-8">
                    <label className="form-label">Subject</label>
                    <select
                      className="form-select"
                      name="subjectId"
                      value={formData.subjectId}
                      onChange={handleFormChange}
                      required
                      disabled={subjectsLoading}
                    >
                      <option value="">
                        {subjectsLoading
                          ? "Loading subjects..."
                          : "Select Subject"}
                      </option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Result</label>
                    <select
                      className="form-select"
                      name="result"
                      value={formData.result}
                      onChange={handleFormChange}
                    >
                      <option value="PASS">Pass</option>
                      <option value="FAIL">Fail</option>
                      <option value="PENDING">Pending</option>
                    </select>
                  </div>

                  <div className="col-md-8">
                    <label className="form-label">Evidence URL</label>
                    <input
                      type="url"
                      className="form-control"
                      name="evidenceURL"
                      value={formData.evidenceURL}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      name="notes"
                      value={formData.notes}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="mt-3 d-flex gap-2">
                  <button className="btn btn-success btn-sm" type="submit">
                    Create
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

      {/* ================= FILTER ================= */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">Filter Compliance</div>
        <div className="card-body row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label">Subject Type</label>
            <select
              className="form-select form-select-sm"
              name="subjectType"
              value={filter.subjectType}
              onChange={handleFilterChange}
            >
              <option value="">Select</option>
              <option value="PROJECT">Project</option>
              <option value="PROGRAM">Program</option>
              <option value="INCENTIVE">Incentive</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Subject</label>
            <select
              className="form-select form-select-sm"
              name="subjectId"
              value={filter.subjectId}
              onChange={handleFilterChange}
              disabled={!filter.subjectType || subjectsLoading}
            >
              <option value="">
                {subjectsLoading
                  ? "Loading subjects..."
                  : "Select Subject"}
              </option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <button
              className="btn btn-success btn-sm w-100"
              onClick={loadCompliance}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="card shadow-sm">
        <div className="card-header">Compliance Records</div>
        <div className="card-body p-0">
          {records.length === 0 ? (
            <p className="text-center text-muted py-4 mb-0">
              No records found
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Subject Type</th>
                    <th>Subject ID</th>
                    <th>Result</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td>{r.subjectType}</td>
                      <td>{r.subjectId}</td>
                      <td>
                        <span className={`badge ${resultBadge(r.result)}`}>
                          {r.result}
                        </span>
                      </td>
                      <td>{r.notes || "—"}</td>
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
