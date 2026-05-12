import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Alert from "../components/Alert";
import { loginUser, loginAdmin } from "../api/authApi";
import { useAuth } from "../auth/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getParticipantByUserId } from "../api/participantApi";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        
        try {
            const data = isAdmin
                ? await loginAdmin(username, password)
                : await loginUser(username, password);

            const token = data.token || data;

            let currentUserId = data.id || data.userId;
            let decodedUsername = data.username || username;
            let isOfficer = false; // 🚀 New flag to protect Officers

            if (typeof token === "string") {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    currentUserId = payload.userId || payload.id || currentUserId;
                    decodedUsername = payload.username || payload.sub || username;
                    
                    // 🚀 Check if the token belongs to an Officer
                    const roles = payload.roles || [];
                    if (roles.includes("ROLE_OFFICER") || roles.includes("OFFICER")) {
                        isOfficer = true;
                    }
                } catch (decodeErr) {
                    if (!isAdmin) throw new Error("Invalid token received from server.");
                }
            }

            if (isAdmin && !currentUserId) {
                currentUserId = "admin-sys-id"; 
            }

            if (!currentUserId && !isAdmin && !isOfficer) {
                throw new Error("Could not extract User ID. Please try logging in again.");
            }

            localStorage.setItem("token", token);
            localStorage.setItem("userData", JSON.stringify({
                id: currentUserId,
                username: decodedUsername,
                email: data.email || "",
                isAdmin: isAdmin 
            }));

            // 🚀 THE FIX: If they are Admin OR Officer, skip the DB check and go to profile!
            if (isAdmin || isOfficer) {
                login(token);
                navigate("/profile");
            } else {
                // 👤 Only Citizens and Businesses do the DB check
                try {
                    await getParticipantByUserId(currentUserId);
                    login(token);
                    navigate("/profile");
                } catch (profileError) {
                    if (profileError.response && profileError.response.status === 404) {
                        login(token);
                        navigate("/setup-profile");
                        return;
                    } else {
                        login(token);
                        navigate("/profile");
                    }
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Invalid credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <Navbar />
            <div className="flex-grow-1 d-flex align-items-center justify-content-center p-3">
                <div className="w-100" style={{ maxWidth: "400px" }}>
                    <div className="text-center mb-4">
                        <h2 className="fw-bold text-success mb-1">GreenGov</h2>
                        <p className="text-muted">Sign in to your account</p>
                    </div>

                    {error && <Alert type="danger" message={error} />}

                    <div className="card shadow-sm border-0 rounded-3 p-4">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="username" className="form-label fw-semibold small">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    className="form-control bg-light"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    autoComplete="username"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="password" className="form-label fw-semibold small mb-0">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    className="form-control bg-light mt-2"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                            </div>

                            <div className="form-check mb-4">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="adminCheck"
                                    checked={isAdmin}
                                    onChange={(e) => setIsAdmin(e.target.checked)}
                                />
                                <label className="form-check-label small text-muted" htmlFor="adminCheck">
                                    Sign in as Administrator
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-success w-100"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Signing in...</span>
                                ) : "Sign In"}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-muted small mt-3">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-success text-decoration-none fw-semibold">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
}