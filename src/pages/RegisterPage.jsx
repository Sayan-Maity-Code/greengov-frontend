import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Alert from "../components/Alert";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { registerUser, registerOfficer } from "../api/authApi";

export default function RegisterPage() {
    const [activeTab, setActiveTab] = useState("citizen");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const [citizenForm, setCitizenForm] = useState({
        username: "", email: "", password: "", confirmPassword: "", primaryRole: "CITIZEN"
    });

    const [officerForm, setOfficerForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        primaryRole: "OFFICER",
        officerType: "PROGRAM_MANAGER",
        department: "",
        designation: ""
    });

    const handleCitizenChange = (e) => setCitizenForm({ ...citizenForm, [e.target.name]: e.target.value });
    const handleOfficerChange = (e) => setOfficerForm({ ...officerForm, [e.target.name]: e.target.value });

    const validate = (form) => {
        if (!form.username || !form.email || !form.password || !form.confirmPassword) {
            return "All basic fields are required.";
        }
        if (form.password !== form.confirmPassword) {
            return "Passwords do not match.";
        }
        return null;
    };

    const handleCitizenSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        const validationError = validate(citizenForm);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);
            await registerUser({
                username: citizenForm.username,
                email: citizenForm.email,
                password: citizenForm.password,
                primaryRole: citizenForm.primaryRole
            });
            
            setSuccess("Account created successfully! Redirecting to login...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleOfficerSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        const validationError = validate(officerForm);
        if (validationError) {
            setError(validationError);
            return;
        }

        if (!officerForm.department || !officerForm.designation) {
            setError("Officer type, department, and designation are required.");
            return;
        }

        try {
            setLoading(true);
            
            await registerOfficer({
                username: officerForm.username,
                email: officerForm.email,
                password: officerForm.password,
                primaryRole: "OFFICER",
                officerType: officerForm.officerType,
                department: officerForm.department,
                designation: officerForm.designation
            });
            
            setSuccess("Officer registration successful! Awaiting admin approval. Redirecting to login...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Officer registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "form-control bg-light";
    const labelClass = "form-label fw-semibold small";

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <Navbar />
            <div className="flex-grow-1 d-flex align-items-center justify-content-center p-3">
                <div className="w-100" style={{ maxWidth: "600px" }}>
                    <div className="text-center mb-4">
                        <h2 className="fw-bold text-success mb-1">Join GreenGov</h2>
                        <p className="text-muted">Create your account to get started</p>
                    </div>

                    {error && <Alert type="danger" message={error} />}
                    {success && <Alert type="success" message={success} />}

                    <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
                        <div className="d-flex border-bottom bg-white">
                            <button
                                className={`btn flex-grow-1 py-3 rounded-0 fw-semibold ${activeTab === "citizen" ? "btn-success" : "btn-light text-muted border-end"}`}
                                onClick={() => setActiveTab("citizen")}
                            >
                                Citizen / Business
                            </button>
                            <button
                                className={`btn flex-grow-1 py-3 rounded-0 fw-semibold ${activeTab === "officer" ? "btn-success" : "btn-light text-muted"}`}
                                onClick={() => setActiveTab("officer")}
                            >
                                Government Officer
                            </button>
                        </div>

                        <div className="p-4">
                            {activeTab === "citizen" ? (
                                <form onSubmit={handleCitizenSubmit}>
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label htmlFor="primaryRole" className={labelClass}>Register As</label>
                                            <select id="primaryRole" className={inputClass} name="primaryRole"
                                                value={citizenForm.primaryRole} onChange={handleCitizenChange} required>
                                                <option value="CITIZEN">Citizen</option>
                                                <option value="BUSINESS_OWNER">Business Owner</option>
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <label htmlFor="cUsername" className={labelClass}>Username</label>
                                            <input id="cUsername" type="text" className={inputClass} name="username"
                                                value={citizenForm.username} onChange={handleCitizenChange} required />
                                        </div>
                                        <div className="col-12">
                                            <label htmlFor="cEmail" className={labelClass}>Email Address</label>
                                            <input id="cEmail" type="email" className={inputClass} name="email"
                                                value={citizenForm.email} onChange={handleCitizenChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="cPassword" className={labelClass}>Password</label>
                                            <input id="cPassword" type="password" className={inputClass} name="password"
                                                value={citizenForm.password} onChange={handleCitizenChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="cConfirmPassword" className={labelClass}>Confirm Password</label>
                                            <input id="cConfirmPassword" type="password" className={inputClass} name="confirmPassword"
                                                value={citizenForm.confirmPassword} onChange={handleCitizenChange} required />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-success w-100 mt-4" disabled={loading}>
                                        {loading ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Submitting...</> : "Create Account"}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleOfficerSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label htmlFor="oUsername" className={labelClass}>Username</label>
                                            <input id="oUsername" type="text" className={inputClass} name="username"
                                                value={officerForm.username} onChange={handleOfficerChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="oEmail" className={labelClass}>Email Address</label>
                                            <input id="oEmail" type="email" className={inputClass} name="email"
                                                value={officerForm.email} onChange={handleOfficerChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="officerType" className={labelClass}>Officer Type</label>
                                            <select id="officerType" className={inputClass} name="officerType"
                                                value={officerForm.officerType} onChange={handleOfficerChange} required>
                                                <option value="PROGRAM_MANAGER">Program Manager</option>
                                                <option value="COMPLIANCE_OFFICER">Compliance Officer</option>
                                                <option value="ENVIRONMENT_OFFICER">Environment Officer</option>
                                                <option value="DISBURSEMENT_OFFICER">Disbursement Officer</option>
                                                <option value="AUDIT_MANAGER">Audit Manager</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="department" className={labelClass}>Department</label>
                                            <input id="department" type="text" className={inputClass} name="department"
                                                value={officerForm.department} onChange={handleOfficerChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="designation" className={labelClass}>Designation</label>
                                            <input id="designation" type="text" className={inputClass} name="designation"
                                                value={officerForm.designation} onChange={handleOfficerChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="oPassword" className={labelClass}>Password</label>
                                            <input id="oPassword" type="password" className={inputClass} name="password"
                                                value={officerForm.password} onChange={handleOfficerChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="oConfirmPassword" className={labelClass}>Confirm Password</label>
                                            <input id="oConfirmPassword" type="password" className={inputClass} name="confirmPassword"
                                                value={officerForm.confirmPassword} onChange={handleOfficerChange} required />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-success w-100 mt-4" disabled={loading}>
                                        {loading ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Submitting...</> : "Submit Registration"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    <p className="text-center text-muted small mt-3">
                        Already have an account?{" "}
                        <Link to="/login" className="text-success text-decoration-none fw-semibold">Sign in</Link>
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
}