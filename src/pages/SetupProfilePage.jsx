import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerParticipant } from "../api/participantApi";
import Alert from "../components/Alert";

export default function SetupProfilePage() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("userData") || "{}");
    const token = localStorage.getItem("token") || "";
    const currentUserId = user.id || user.userId;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [derivedEntityType, setDerivedEntityType] = useState("CITIZEN");

    const [formData, setFormData] = useState({
        legalName: "",
        address: "",
        phone: "",
        email: user.email || "",
        otherContact: ""
    });

    useEffect(() => {
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const roles = payload.roles || [];
                const primaryRole = payload.primaryRole || "";
                
                if (roles.includes("ROLE_BUSINESS_OWNER") || primaryRole === "BUSINESS_OWNER") {
                    setDerivedEntityType("BUSINESS_OWNER");
                } else {
                    setDerivedEntityType("CITIZEN");
                }
            } catch (e) {
            }
        }
    }, [token]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!formData.phone && !formData.email) {
            setError("You must provide at least a Phone Number or an Email address.");
            setLoading(false);
            return;
        }

        const contactJson = JSON.stringify({
            phone: formData.phone,
            email: formData.email,
            other: formData.otherContact
        });

        try {
            await registerParticipant({
                userId: currentUserId,
                entityType: derivedEntityType,
                legalName: formData.legalName,
                address: formData.address,
                contactInfo: contactJson
            });

            navigate("/profile");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100 bg-light align-items-center justify-content-center p-3">
            <div className="w-100" style={{ maxWidth: "550px" }}>
                <div className="text-center mb-4">
                    <h2 className="fw-bold text-success mb-1">Welcome, {user.username}!</h2>
                    <p className="text-muted">Let's complete your GreenGov profile</p>
                </div>

                {error && <Alert type="danger" message={error} />}

                <div className="card shadow-sm border-0 rounded-3 p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold small">Legal Name <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control bg-light"
                                name="legalName"
                                value={formData.legalName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold small">Address <span className="text-danger">*</span></label>
                            <textarea
                                className="form-control bg-light"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="2"
                                required
                            />
                        </div>

                        <hr className="my-4 text-muted" />
                        <h6 className="fw-bold mb-3">Contact Information</h6>
                        <p className="small text-muted mb-3">Provide at least one method of contact.</p>

                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <label className="form-label fw-semibold small">Phone Number <span className="text-danger">*</span></label>
                                <input
                                    type="tel"
                                    className="form-control bg-light"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91-..."
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold small">Email Address <span className="text-danger">*</span></label>
                                <input
                                    type="email"
                                    className="form-control bg-light"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@example.com"
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label fw-semibold small">Alternate Contact</label>
                                <input
                                    type="text"
                                    className="form-control bg-light"
                                    name="otherContact"
                                    value={formData.otherContact}
                                    onChange={handleChange}
                                    placeholder="WhatsApp, Landline, etc."
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-success w-100 mt-2" 
                            disabled={loading}
                        >
                            {loading ? (
                                <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...</span>
                            ) : "Complete Profile"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}