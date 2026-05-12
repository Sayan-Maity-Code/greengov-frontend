import { useState, useEffect } from "react";
import { getAllParticipants, updateParticipantVerificationStatus, updateDocumentStatus } from "../api/participantApi";
import Loading from "../components/Loading";
import Alert from "../components/Alert";

export default function EnvironmentalDashboard() {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    
    // 🚀 New State for Tab Filtering
    const [activeTab, setActiveTab] = useState("PENDING");

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getAllParticipants();
            setParticipants(data || []);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load verification queue.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDocumentStatus = async (profileId, docId, newStatus) => {
        try {
            await updateDocumentStatus(profileId, docId, newStatus);

            if (newStatus === "VERIFIED") {
                await updateParticipantVerificationStatus(profileId, "VERIFIED");
                setSuccessMessage("Document and Profile Auto-Verified Successfully!");
            } else if (newStatus === "REJECTED") {
                await updateParticipantVerificationStatus(profileId, "REJECTED");
                setSuccessMessage("Document and Profile Rejected.");
            }
            
            setTimeout(() => setSuccessMessage(""), 4000);
            loadData(); 
        } catch (err) {
            setError("Failed to process the verification.");
        }
    };

    const handleViewDocument = (base64Data) => {
        if (!base64Data) {
            alert("Document data is missing from the database.");
            return;
        }
        
        let fileSource = base64Data;
        if (!base64Data.startsWith("data:")) {
            const isPdf = base64Data.startsWith("JVBERi"); 
            const mimeType = isPdf ? "application/pdf" : "image/png";
            fileSource = `data:${mimeType};base64,${base64Data}`;
        }

        const newWindow = window.open();
        if (newWindow) {
            newWindow.document.write(`<iframe src="${fileSource}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        } else {
            alert("Please allow popups to view the documents.");
        }
    };

    // 🚀 Filter the data based on the selected tab
    const filteredParticipants = participants.filter(p => {
        if (activeTab === "ALL") return true;
        return p.status === activeTab;
    });

    if (loading) return <Loading />;

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">Verification Desk</h2>
                    <p className="text-muted small mb-0">Review and approve Citizen & Business registrations</p>
                </div>
                <button className="btn btn-outline-secondary btn-sm shadow-sm" onClick={loadData}>
                    <i className="bi bi-arrow-clockwise me-1"></i> Refresh Data
                </button>
            </div>

            {error && <Alert message={error} type="danger" onClose={() => setError("")} />}
            {successMessage && <Alert message={successMessage} type="success" onClose={() => setSuccessMessage("")} />}

            {/* 🚀 The Navigation Tabs */}
            <ul className="nav nav-tabs mb-4 border-bottom-0">
                <li className="nav-item">
                    <button 
                        className={`nav-link fw-semibold ${activeTab === "PENDING" ? "active border-bottom-0 bg-white text-warning" : "text-muted"}`}
                        onClick={() => setActiveTab("PENDING")}
                    >
                        Pending Review
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link fw-semibold ${activeTab === "VERIFIED" ? "active border-bottom-0 bg-white text-success" : "text-muted"}`}
                        onClick={() => setActiveTab("VERIFIED")}
                    >
                        Verified
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link fw-semibold ${activeTab === "REJECTED" ? "active border-bottom-0 bg-white text-danger" : "text-muted"}`}
                        onClick={() => setActiveTab("REJECTED")}
                    >
                        Rejected
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link fw-semibold ${activeTab === "ALL" ? "active border-bottom-0 bg-white text-dark" : "text-muted"}`}
                        onClick={() => setActiveTab("ALL")}
                    >
                        All Records
                    </button>
                </li>
            </ul>

            <div className="card shadow-sm border-0 rounded-3">
                <div className="card-body p-0">
                    {filteredParticipants.length === 0 ? (
                        <div className="p-5 text-center text-muted">
                            <i className="bi bi-inbox fs-1 text-light mb-2"></i>
                            <p className="mb-0 fs-5">No {activeTab.toLowerCase()} profiles found.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">Applicant Profile</th>
                                        <th>Entity Type</th>
                                        <th>Attached Documents</th>
                                        <th>Master Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredParticipants.map((p) => (
                                        <tr key={p.id}>
                                            <td className="ps-4">
                                                <div className="fw-bold text-dark">{p.legalName}</div>
                                                <small className="text-muted">{p.address}</small>
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-secondary border">
                                                    {p.entityType}
                                                </span>
                                            </td>
                                            <td>
                                                {p.documents && p.documents.length > 0 ? (
                                                    p.documents.map((doc) => (
                                                        <div key={doc.id} className="d-flex align-items-center py-2 border-bottom border-light">
                                                            <button 
                                                                className="btn btn-sm btn-outline-primary py-0 px-2 me-3" 
                                                                onClick={() => handleViewDocument(doc.fileUri || doc.fileData)}
                                                            >
                                                                View {doc.documentType}
                                                            </button>

                                                            {doc.verificationStatus === "PENDING" ? (
                                                                <div className="btn-group btn-group-sm shadow-sm">
                                                                    <button className="btn btn-success px-3" onClick={() => handleDocumentStatus(p.id, doc.id, "VERIFIED")}>
                                                                        Approve
                                                                    </button>
                                                                    <button className="btn btn-danger px-3" onClick={() => handleDocumentStatus(p.id, doc.id, "REJECTED")}>
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className={`badge bg-${doc.verificationStatus === "VERIFIED" ? "success" : "danger"}`}>
                                                                    {doc.verificationStatus}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-muted small fst-italic">Awaiting Upload</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge bg-${p.status === "VERIFIED" ? "success" : p.status === "REJECTED" ? "danger" : "warning"} fs-6 shadow-sm`}>
                                                    {p.status}
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
    );
}