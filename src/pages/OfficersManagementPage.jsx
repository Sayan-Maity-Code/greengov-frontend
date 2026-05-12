import { useState, useEffect } from "react";
import {
  getAllOfficers,
  getPendingOfficers,
  approveOfficer,
  rejectOfficer,
} from "../api/adminApi";
import Alert from "../components/Alert";
import Loading from "../components/Loading";
import ContentGate from "../components/ContentGate";

export default function OfficersManagementPage() {
  const [officers, setOfficers] = useState([]);
  const [filteredOfficers, setFilteredOfficers] = useState([]);
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOfficerId, setExpandedOfficerId] = useState(null);

  useEffect(() => {
    fetchOfficers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [officers, filter, searchTerm]);

  const fetchOfficers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllOfficers();
      setOfficers(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch officers"
      );
      setOfficers([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = officers;

    // Apply status filter
    if (filter === "pending") {
      filtered = filtered.filter((o) => o.status === "PENDING");
    } else if (filter === "approved") {
      filtered = filtered.filter((o) => o.status === "APPROVED");
    } else if (filter === "rejected") {
      filtered = filtered.filter((o) => o.status === "REJECTED");
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          (o.email && o.email.toLowerCase().includes(term)) ||
          (o.username && o.username.toLowerCase().includes(term)) ||
          (o.userId && o.userId.toString().includes(term))
      );
    }

    setFilteredOfficers(filtered);
  };

  const handleApprove = async (officerProfileId) => {
    setActionLoading(officerProfileId);
    setSuccess("");
    setError("");
    try {
      await approveOfficer(officerProfileId);
      setSuccess(`Officer approved successfully!`);
      await fetchOfficers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          `Failed to approve officer`
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (officerProfileId) => {
    setActionLoading(officerProfileId);
    setSuccess("");
    setError("");
    try {
      await rejectOfficer(officerProfileId);
      setSuccess(`Officer rejected successfully!`);
      await fetchOfficers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          `Failed to reject officer`
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <span className="badge bg-warning text-dark">Pending</span>;
      case "APPROVED":
        return <span className="badge bg-success">Approved</span>;
      case "REJECTED":
        return <span className="badge bg-danger">Rejected</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const pendingCount = officers.filter((o) => o.status === "PENDING").length;
  const approvedCount = officers.filter((o) => o.status === "APPROVED").length;
  const rejectedCount = officers.filter((o) => o.status === "REJECTED").length;

  if (loading) return <Loading />;

  return (
    <div>
      {/* Page header */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
        <div>
          <h4 className="fw-bold mb-0 text-success">Officers Management</h4>
          <p className="text-muted small mb-0">
            Verify and manage officer accounts
          </p>
        </div>
      </div>

      {/* Alerts */}
      {success && <Alert type="success" message={success} />}
      {error && <Alert type="danger" message={error} />}

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Total Officers</p>
                  <h3 className="fw-bold mb-0">{officers.length}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 50, height: 50 }}>
                  <svg width="24" height="24" fill="#0d6efd" viewBox="0 0 16 16">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm.078-10a8.01 8.01 0 0 1 5.478 4.013 8 8 0 0 1-4.038 4.01h.002H4.612h-.005a8 8 0 0 1-.396-4.012A8.01 8.01 0 0 1 7.922 1zm-5.844 9.667C3.584 11.283 5.062 12 8 12s4.416-.717 5.844-2.333A5.451 5.451 0 0 1 12 13c1.656 0 3.028-.584 4.064-1.539a8 8 0 0 0-8.064-8.064 8 8 0 0 0-3.864 7.126l.001.001z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Pending</p>
                  <h3 className="fw-bold mb-0">{pendingCount}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 50, height: 50 }}>
                  <svg width="24" height="24" fill="#ffc107" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Approved</p>
                  <h3 className="fw-bold mb-0">{approvedCount}</h3>
                </div>
                <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 50, height: 50 }}>
                  <svg width="24" height="24" fill="#198754" viewBox="0 0 16 16">
                    <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Rejected</p>
                  <h3 className="fw-bold mb-0">{rejectedCount}</h3>
                </div>
                <div className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 50, height: 50 }}>
                  <svg width="24" height="24" fill="#dc3545" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708l2.647-2.646-2.647-2.646a.5.5 0 0 1 0-.708z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search by username, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <div className="btn-group w-100" role="group">
                <input
                  type="radio"
                  className="btn-check"
                  name="filter"
                  id="filterAll"
                  value="all"
                  checked={filter === "all"}
                  onChange={(e) => setFilter(e.target.value)}
                />
                <label className="btn btn-outline-success" htmlFor="filterAll">
                  All ({officers.length})
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="filter"
                  id="filterPending"
                  value="pending"
                  checked={filter === "pending"}
                  onChange={(e) => setFilter(e.target.value)}
                />
                <label className="btn btn-outline-warning" htmlFor="filterPending">
                  Pending ({pendingCount})
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="filter"
                  id="filterApproved"
                  value="approved"
                  checked={filter === "approved"}
                  onChange={(e) => setFilter(e.target.value)}
                />
                <label className="btn btn-outline-success" htmlFor="filterApproved">
                  Approved ({approvedCount})
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="filter"
                  id="filterRejected"
                  value="rejected"
                  checked={filter === "rejected"}
                  onChange={(e) => setFilter(e.target.value)}
                />
                <label className="btn btn-outline-danger" htmlFor="filterRejected">
                  Rejected ({rejectedCount})
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Officers List */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-light border-bottom">
          <h6 className="fw-bold mb-0">
            {filter === "all"
              ? "All Officers"
              : filter === "pending"
              ? "Pending Officers"
              : filter === "approved"
              ? "Approved Officers"
              : "Rejected Officers"}
            ({filteredOfficers.length})
          </h6>
        </div>
        <div className="card-body p-0">
          {filteredOfficers.length === 0 ? (
            <div className="p-5 text-center">
              <p className="text-muted mb-0">
                {searchTerm.trim()
                  ? "No officers found matching your search."
                  : `No ${filter} officers available.`}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="border-0 fw-bold text-success">Officer Profile ID</th>
                    <th className="border-0 fw-bold text-success">Username</th>
                    <th className="border-0 fw-bold text-success">Email</th>
                    <th className="border-0 fw-bold text-success">Status</th>
                    <th className="border-0 fw-bold text-success">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOfficers.map((officer) => (
                    <tr key={officer.officerProfileId}>
                      <td className="align-middle">
                        <strong>#{officer.officerProfileId}</strong>
                      </td>
                      <td className="align-middle">{officer.username || "N/A"}</td>
                      <td className="align-middle">{officer.email || "N/A"}</td>
                      <td className="align-middle">
                        {getStatusBadge(officer.status)}
                      </td>
                      <td className="align-middle">
                        {officer.status === "PENDING" && (
                          <ContentGate authority="ADMIN">
                            <div className="btn-group btn-group-sm" role="group">
                              <button
                                className="btn btn-success"
                                onClick={() => handleApprove(officer.officerProfileId)}
                                disabled={actionLoading === officer.officerProfileId}
                                title="Approve this officer"
                              >
                                {actionLoading === officer.officerProfileId ? (
                                  <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...</>
                                ) : (
                                  <><svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" /></svg> Approve</>
                                )}
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={() => handleReject(officer.officerProfileId)}
                                disabled={actionLoading === officer.officerProfileId}
                                title="Reject this officer"
                              >
                                {actionLoading === officer.officerProfileId ? (
                                  <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...</>
                                ) : (
                                  <><svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708l2.647-2.646-2.647-2.646a.5.5 0 0 1 0-.708z" /></svg> Reject</>
                                )}
                              </button>
                            </div>
                          </ContentGate>
                        )}
                        {officer.status === "APPROVED" && (
                          <span className="badge bg-success">Approved</span>
                        )}
                        {officer.status === "REJECTED" && (
                          <span className="badge bg-danger">Rejected</span>
                        )}
                      </td>
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
