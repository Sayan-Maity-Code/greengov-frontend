import { useState, useEffect } from "react";
import {
  fetchAllIncentives,
  createIncentive,
  deleteIncentive,
  fetchParticipants,
} from "../api/incentiveApi";
import Loading from "../components/Loading";
import Alert from "../components/Alert";
import {
  createDisbursement,
  getDisbursementsByIncentiveId,
  getDisbursementByIds,
} from "../api/disbursementApi";
import ContentGate from "../components/ContentGate";
import { useAuth } from "../auth/AuthContext";

export default function IncentivesPage() {
  const { getUserId } = useAuth();
  const officerUserId = getUserId();

  const [activeTab, setActiveTab] = useState("list");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ===============================
  // LIST TAB
  // ===============================
  const [incentives, setIncentives] = useState([]);

  // ===============================
  // CREATE TAB
  // ===============================
  const [participants, setParticipants] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState("");
  const [createAmount, setCreateAmount] = useState("");

  // ===============================
  // DISBURSEMENT TAB
  // ===============================
  const [selectedIncentiveForDisb, setSelectedIncentiveForDisb] = useState("");
  const [disbAmount, setDisbAmount] = useState("");
  const [disbHistory, setDisbHistory] = useState([]);
  const [disbLookupIncentiveId, setDisbLookupIncentiveId] = useState("");
  const [disbLookupDisbId, setDisbLookupDisbId] = useState("");
  const [lookedUpDisb, setLookedUpDisb] = useState(null);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // ===============================
  // LOAD INCENTIVES
  // ===============================
  useEffect(() => {
    if (activeTab === "list") loadIncentives();
  }, [activeTab]);

  const loadIncentives = async () => {
    try {
      setLoading(true);
      const data = await fetchAllIncentives();
      setIncentives(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load incentives");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // LOAD PARTICIPANTS WHEN CREATE TAB OPENS
  // ===============================
  useEffect(() => {
    if (activeTab === "create") {
      setLoading(true);
      fetchParticipants()
        .then(setParticipants)
        .catch(() => setError("Failed to load participants"))
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  // ===============================
  // CREATE INCENTIVE
  // ===============================
  const handleCreateIncentive = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!selectedParticipant) {
      setError("Please select a participant");
      return;
    }

    if (!createAmount || Number(createAmount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);
      await createIncentive(
        {
          participantId: Number(selectedParticipant),
          amount: Number(createAmount),
        },
        officerUserId
      );
      setSuccess("Incentive created successfully");
      setCreateAmount("");
      setSelectedParticipant("");
      loadIncentives();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create incentive");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // DELETE INCENTIVE
  // ===============================
  const handleDelete = async (incentiveId) => {
    if (!window.confirm(`Delete incentive #${incentiveId}?`)) return;

    clearMessages();
    try {
      setLoading(true);
      await deleteIncentive(incentiveId);
      setSuccess("Incentive deleted successfully");
      loadIncentives();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete incentive");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // CREATE DISBURSEMENT
  // ===============================
  const handleCreateDisbursement = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!selectedIncentiveForDisb) {
      setError("Please select an incentive");
      return;
    }

    if (!disbAmount || Number(disbAmount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);
      await createDisbursement(
        {
          incentiveId: Number(selectedIncentiveForDisb),
          amount: Number(disbAmount),
        },
        officerUserId
      );
      setSuccess("Disbursement created successfully");
      setDisbAmount("");
      setSelectedIncentiveForDisb("");
      // Refresh disbursement history if available
      if (selectedIncentiveForDisb) {
        loadDisbursementHistory(selectedIncentiveForDisb);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create disbursement");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // GET DISBURSEMENT HISTORY
  // ===============================
  const loadDisbursementHistory = async (incentiveId) => {
    try {
      setLoading(true);
      const data = await getDisbursementsByIncentiveId(incentiveId);
      setDisbHistory(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load disbursement history");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDisbursementHistory = async (incentiveId) => {
    clearMessages();
    setSelectedIncentiveForDisb(incentiveId);
    await loadDisbursementHistory(incentiveId);
  };

  // ===============================
  // GET DISBURSEMENT BY IDS
  // ===============================
  const handleFetchDisbByIds = async () => {
    clearMessages();

    if (!disbLookupIncentiveId || !disbLookupDisbId) {
      setError("Please enter both incentive ID and disbursement ID");
      return;
    }

    try {
      setLoading(true);
      const data = await getDisbursementByIds(
        disbLookupIncentiveId,
        disbLookupDisbId,
        officerUserId
      );
      setLookedUpDisb(data);
    } catch (err) {
      setError(err.response?.data?.message || "Disbursement not found");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // RENDER UI
  // ===============================
  return (
    <div className="p-4">
      {error && <Alert message={error} type="danger" />}
      {success && <Alert message={success} type="success" />}

      {loading && <Loading />}

      <ul className="nav nav-tabs mb-4">
        {["list", "create", "disbursements"].map((tab) => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link ${
                activeTab === tab ? "active fw-semibold" : ""
              }`}
              onClick={() => {
                setActiveTab(tab);
                clearMessages();
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          </li>
        ))}
      </ul>

      {/* ========== LIST TAB ========== */}
      {activeTab === "list" && (
        <div>
          <h4 className="mb-3">All Incentives</h4>
          {incentives.length === 0 ? (
            <p className="text-muted">No incentives found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Application</th>
                    <th>Beneficiary</th>
                    <th>Program</th>
                    <th>Amount</th>
                    <th>Remaining</th>
                    <th>Status</th>
                    <th>Sanctioned Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incentives.map((incentive) => (
                    <tr key={incentive.incentiveId}>
                      <td className="fw-semibold">{incentive.incentiveId}</td>
                      <td>{incentive.applicationId}</td>
                      <td>{incentive.beneficiaryId}</td>
                      <td>{incentive.programId}</td>
                      <td>₹{incentive.amount.toLocaleString()}</td>
                      <td>₹{incentive.remainingAmount.toLocaleString()}</td>
                      <td>
                        <span
                          className={`badge ${
                            incentive.status === "COMPLETED"
                              ? "bg-success"
                              : incentive.status === "APPROVED"
                              ? "bg-info"
                              : incentive.status === "PARTIALLY_DISBURSED"
                              ? "bg-warning"
                              : "bg-secondary"
                          }`}
                        >
                          {incentive.status}
                        </span>
                      </td>
                      <td>{incentive.sanctionedDate}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-info me-2"
                          onClick={() =>
                            handleLoadDisbursementHistory(
                              incentive.incentiveId
                            )
                          }
                        >
                          View History
                        </button>
                        <ContentGate authority="DISBURSEMENT_OFFICER">
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              handleDelete(incentive.incentiveId)
                            }
                          >
                            Delete
                          </button>
                        </ContentGate>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========== CREATE TAB ========== */}
      {activeTab === "create" && (
        <ContentGate authority="DISBURSEMENT_OFFICER">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title mb-3">Create New Incentive</h4>
              <form onSubmit={handleCreateIncentive}>
                <div className="mb-3">
                  <label className="form-label">Select Participant</label>
                  <select
                    className="form-select"
                    value={selectedParticipant}
                    onChange={(e) => setSelectedParticipant(e.target.value)}
                    required
                  >
                    <option value="">-- Choose a participant --</option>
                    {participants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.legalName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Incentive Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter amount"
                    value={createAmount}
                    onChange={(e) => setCreateAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-success">
                  Create Incentive
                </button>
              </form>
            </div>
          </div>
        </ContentGate>
      )}

      {/* ========== DISBURSEMENTS TAB ========== */}
      {activeTab === "disbursements" && (
        <ContentGate authority="DISBURSEMENT_OFFICER">
          <div className="row">
            {/* Create Disbursement */}
            <div className="col-md-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Create Disbursement</h5>
                  <form onSubmit={handleCreateDisbursement}>
                    <div className="mb-3">
                      <label className="form-label">Select Incentive</label>
                      <select
                        className="form-select"
                        value={selectedIncentiveForDisb}
                        onChange={(e) =>
                          setSelectedIncentiveForDisb(e.target.value)
                        }
                        required
                      >
                        <option value="">
                          -- Choose an incentive --
                        </option>
                        {incentives.map((inc) => (
                          <option key={inc.incentiveId} value={inc.incentiveId}>
                            Incentive #{inc.incentiveId} (
                            ₹{inc.remainingAmount.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Disbursement Amount</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Enter amount"
                        value={disbAmount}
                        onChange={(e) => setDisbAmount(e.target.value)}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-success">
                      Create Disbursement
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Disbursement History */}
            <div className="col-md-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Disbursement History</h5>
                  {selectedIncentiveForDisb && (
                    <p className="text-muted">
                      Showing history for Incentive #{selectedIncentiveForDisb}
                    </p>
                  )}

                  {disbHistory.length === 0 ? (
                    <p className="text-muted">
                      {selectedIncentiveForDisb
                        ? "No disbursements found for this incentive."
                        : "Select an incentive to view history."}
                    </p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {disbHistory.map((disb) => (
                            <tr key={disb.disbursementId}>
                              <td>{disb.disbursementId}</td>
                              <td>₹{disb.amount.toLocaleString()}</td>
                              <td>{disb.paymentDate}</td>
                              <td>
                                <span className="badge bg-success">
                                  {disb.status}
                                </span>
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

            {/* Lookup Disbursement by IDs */}
            <div className="col-md-12 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">
                    Search Disbursement by ID
                  </h5>
                  <div className="row">
                    <div className="col-md-4">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Incentive ID"
                        value={disbLookupIncentiveId}
                        onChange={(e) =>
                          setDisbLookupIncentiveId(e.target.value)
                        }
                      />
                    </div>
                    <div className="col-md-4">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Disbursement ID"
                        value={disbLookupDisbId}
                        onChange={(e) => setDisbLookupDisbId(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <button
                        className="btn btn-primary w-100"
                        onClick={handleFetchDisbByIds}
                        disabled={!disbLookupIncentiveId || !disbLookupDisbId}
                      >
                        Search
                      </button>
                    </div>
                  </div>

                  {lookedUpDisb && (
                    <div className="mt-3 p-3 bg-light border rounded">
                      <h6>Result:</h6>
                      <dl className="row small">
                        <dt className="col-sm-4">Disbursement ID:</dt>
                        <dd className="col-sm-8">
                          {lookedUpDisb.disbursementId}
                        </dd>
                        <dt className="col-sm-4">Incentive ID:</dt>
                        <dd className="col-sm-8">
                          {lookedUpDisb.incentiveId}
                        </dd>
                        <dt className="col-sm-4">Amount:</dt>
                        <dd className="col-sm-8">
                          ₹{lookedUpDisb.amount.toLocaleString()}
                        </dd>
                        <dt className="col-sm-4">Officer ID:</dt>
                        <dd className="col-sm-8">
                          {lookedUpDisb.officerUserId}
                        </dd>
                        <dt className="col-sm-4">Payment Date:</dt>
                        <dd className="col-sm-8">
                          {lookedUpDisb.paymentDate}
                        </dd>
                        <dt className="col-sm-4">Status:</dt>
                        <dd className="col-sm-8">
                          <span className="badge bg-success">
                            {lookedUpDisb.status}
                          </span>
                        </dd>
                      </dl>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ContentGate>
      )}
    </div>
  );
}
 

