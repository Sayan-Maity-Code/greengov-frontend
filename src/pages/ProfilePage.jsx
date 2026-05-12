import { useState, useEffect, useCallback } from "react";
import { getParticipantByUserId, updateParticipant, getParticipantDocuments } from "../api/participantApi";
import Loading from "../components/Loading";
import Alert from "../components/Alert";
import DocumentUploadModal from "../components/DocumentUploadModal";

export default function ProfilePage() {
    const user = JSON.parse(localStorage.getItem("userData") || "{}");
    const token = localStorage.getItem("token") || "";
    const currentUserId = user.id || user.userId;

    const [profileType, setProfileType] = useState("CITIZEN");
    const [profile, setProfile] = useState({});
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [showModal, setShowModal] = useState(false);

    const loadParticipantProfile = useCallback(async () => {
        try {
            const profileData = await getParticipantByUserId(currentUserId);
            setProfile(profileData);

            let parsedPhone = "";
            let parsedEmail = "";
            let parsedOther = "";

            if (profileData.contactInfo) {
                try {
                    const parsedContact = JSON.parse(profileData.contactInfo);
                    parsedPhone = parsedContact.phone || "";
                    parsedEmail = parsedContact.email || "";
                    parsedOther = parsedContact.other || "";
                } catch (e) {
                    parsedPhone = profileData.contactInfo;
                }
            }

            setFormData({
                legalName: profileData.legalName || "",
                address: profileData.address || "",
                phone: parsedPhone,
                email: parsedEmail,
                otherContact: parsedOther
            });

            const actualParticipantId = profileData.id || profileData.participantId;
            if (actualParticipantId) {
                const docsData = await getParticipantDocuments(actualParticipantId);
                setDocuments(docsData || []);
            }
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load participant profile.");
        } finally {
            setLoading(false);
        }
    }, [currentUserId]);

    useEffect(() => {
        if (!token) {
            setError("User data not found. Please log in again.");
            setLoading(false);
            return;
        }

        if (user.isAdmin) {
            setProfileType("ADMIN");
            setProfile({
                legalName: user.username || "System Admin",
                entityType: "ADMIN",
                designation: "SYSTEM ADMINISTRATOR",
                status: "ACTIVE_STAFF"
            });
            setLoading(false);
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const roles = payload.roles || [];
            const authorities = payload.authorities || [];
            const tokenUsername = payload.sub || user.username;

            if (roles.includes("ROLE_OFFICER") || roles.includes("OFFICER")) {
                setProfileType("OFFICER");
                setProfile({
                    legalName: tokenUsername,
                    entityType: "OFFICER",
                    designation: authorities.length > 0 ? authorities.join(", ") : "GOVERNMENT OFFICER",
                    status: "ACTIVE_STAFF"
                });
                setLoading(false);
            } else {
                setProfileType("CITIZEN");
                loadParticipantProfile();
            }
        } catch (e) {
            setProfileType("CITIZEN");
            loadParticipantProfile();
        }
    }, [token, user.isAdmin, user.username, loadParticipantProfile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSaveProfile = async () => {
        if (!formData.legalName || !formData.address || (!formData.phone && !formData.email)) {
            setError("Please fill in all mandatory fields.");
            return;
        }

        try {
            const contactJson = JSON.stringify({
                phone: formData.phone,
                email: formData.email,
                other: formData.otherContact
            });

            await updateParticipant(profile.id, {
                legalName: formData.legalName,
                address: formData.address,
                contactInfo: contactJson 
            });
            setEditMode(false);
            loadParticipantProfile();
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update profile");
        }
    };

    const handleViewDocument = (base64Data) => {
        if (!base64Data) return;
        let fileSource = base64Data;
        if (!base64Data.startsWith("data:")) {
            const isPdf = base64Data.startsWith("JVBERi"); 
            const mimeType = isPdf ? "application/pdf" : "image/png";
            fileSource = `data:${mimeType};base64,${base64Data}`;
        }
        const newWindow = window.open();
        if (newWindow) {
            newWindow.document.write(`<iframe src="${fileSource}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        }
    };

    if (loading) return <Loading />;

    const isInternalUser = profileType === "ADMIN" || profileType === "OFFICER";

    return (
        <div>
            <h2 className="mb-4">My Profile</h2>

            {error && <Alert message={error} type="danger" />}

            <div className="row">
                <div className={`col-md-${isInternalUser ? '12' : '6'} mb-4`}>
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-success text-white">
                            <h5 className="mb-0">Profile Information</h5>
                        </div>
                        <div className="card-body">
                            {editMode && !isInternalUser ? (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Legal Name <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="legalName"
                                            value={formData.legalName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Address <span className="text-danger">*</span></label>
                                        <textarea
                                            className="form-control"
                                            name="address"
                                            rows="3"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    
                                    <hr className="my-3 text-muted" />
                                    <h6 className="fw-bold mb-3">Contact Information</h6>
                                    
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Phone Number <span className="text-danger">*</span></label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Email Address <span className="text-danger">*</span></label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Alternate Contact</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="otherContact"
                                            value={formData.otherContact}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <button className="btn btn-success me-2" onClick={handleSaveProfile}>
                                            Save Changes
                                        </button>
                                        <button className="btn btn-secondary" onClick={() => setEditMode(false)}>
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small mb-0">Role</label>
                                        <p className="fw-semibold">{profile.entityType || profileType}</p>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small mb-0">{isInternalUser ? "Username" : "Legal Name"}</label>
                                        <p className="fw-semibold">{profile.legalName || "N/A"}</p>
                                    </div>
                                    
                                    {isInternalUser && (
                                        <div className="mb-3">
                                            <label className="form-label text-muted small mb-0">Designation / Authorities</label>
                                            <p className="fw-semibold text-primary">{profile.designation || "N/A"}</p>
                                        </div>
                                    )}

                                    {!isInternalUser && (
                                        <>
                                            <div className="mb-3">
                                                <label className="form-label text-muted small mb-0">Phone Number</label>
                                                <p className="fw-semibold">{formData.phone || "N/A"}</p>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label text-muted small mb-0">Email</label>
                                                <p className="fw-semibold">{formData.email || "N/A"}</p>
                                            </div>
                                            {formData.otherContact && (
                                                <div className="mb-3">
                                                    <label className="form-label text-muted small mb-0">Alternate Contact</label>
                                                    <p className="fw-semibold">{formData.otherContact}</p>
                                                </div>
                                            )}
                                            <div className="mb-3">
                                                <label className="form-label text-muted small mb-0">Address</label>
                                                <p className="fw-semibold">{profile.address || "N/A"}</p>
                                            </div>
                                        </>
                                    )}

                                    <div className="mb-4">
                                        <label className="form-label text-muted small mb-0">Account Status</label>
                                        <div>
                                            <span className={`badge bg-${profile.status === "VERIFIED" || profile.status === "ACTIVE_STAFF" ? "success" : profile.status === "REJECTED" ? "danger" : "warning"}`}>
                                                {profile.status || "PENDING"}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {!isInternalUser && (
                                        <button className="btn btn-outline-success w-100" onClick={() => setEditMode(true)}>
                                            Edit Profile
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {!isInternalUser && (
                    <div className="col-md-6 mb-4">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">My Documents</h5>
                                <button className="btn btn-sm btn-success" onClick={() => setShowModal(true)}>
                                    + Upload
                                </button>
                            </div>
                            <div className="card-body p-0">
                                {documents.length === 0 ? (
                                    <div className="p-4 text-center text-muted">
                                        <p className="mb-0">No documents uploaded yet.</p>
                                        <small>Upload an ID Proof or License to get verified.</small>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="ps-3">Type</th>
                                                    <th>Status</th>
                                                    <th className="text-end pe-3">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {documents.map((doc) => (
                                                    <tr key={doc.id}>
                                                        <td className="ps-3 fw-semibold">{doc.documentType}</td>
                                                        <td>
                                                            <span className={`badge bg-${doc.verificationStatus === "VERIFIED" ? "success" : doc.verificationStatus === "REJECTED" ? "danger" : "warning"}`}>
                                                                {doc.verificationStatus || doc.status}
                                                            </span>
                                                        </td>
                                                        <td className="text-end pe-3">
                                                            <button 
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() => handleViewDocument(doc.fileUri || doc.fileData)}
                                                            >
                                                                View
                                                            </button>
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
                )}
            </div>

            {!isInternalUser && (
                <DocumentUploadModal 
                    show={showModal} 
                    handleClose={() => setShowModal(false)} 
                    profileId={profile.id} 
                    onUploadSuccess={loadParticipantProfile} 
                />
            )}
        </div>
    );
}