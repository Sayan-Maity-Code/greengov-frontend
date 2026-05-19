import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import { sendForgotPasswordOtp, verifyForgotPasswordOtp, resetPassword } from "../api/authApi";
import { toast } from "react-toastify";

/**
 * Forgot Password Page
 * 3-step process:
 * 1. Send OTP to email
 * 2. Verify OTP
 * 3. Reset password
 * 
 * ⚠️ WARNING: OTP is stored in memory on backend. Don't refresh during the process!
 */

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Step 1: Email
  const [email, setEmail] = useState("");

  // Step 2: OTP
  const [otp, setOtp] = useState("");

  // Step 3: Reset Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      await sendForgotPasswordOtp(email);
      setSuccess("✅ OTP sent to your email. Please check your inbox.");
      setStep(2);
      toast.info("OTP sent! Don't refresh the page.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
      console.error("Send OTP error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp.trim()) {
      setError("Please enter the OTP");
      return;
    }

    try {
      setLoading(true);
      await verifyForgotPasswordOtp(email, otp);
      setSuccess("✅ OTP verified successfully!");
      setStep(3);
      toast.info("Moving to password reset. Don't refresh!");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
      console.error("Verify OTP error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword.trim()) {
      setError("Please enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email, newPassword);
      setSuccess("✅ Password reset successfully! Redirecting to login...");
      toast.success("Password updated! Please login with your new password.");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Please try again.");
      console.error("Reset password error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light py-5">
      <div className="card border-0 shadow" style={{ maxWidth: "420px", width: "100%" }}>
        {/* Header */}
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h3 className="fw-bold text-success mb-1">Reset Password</h3>
            <p className="text-muted small mb-0">Recover your account access securely</p>
          </div>

          {/* Warning Message */}
          {(step === 2 || step === 3) && (
            <div className="alert alert-warning d-flex align-items-start gap-2 mb-4" role="alert">
              <span className="fs-5 flex-shrink-0">⚠️</span>
              <div className="small">
                <strong>Important:</strong> Please don't refresh this page during the password reset process. Your OTP is stored in memory and will be lost if you refresh.
              </div>
            </div>
          )}

          {error && <Alert message={error} type="danger" />}
          {success && <Alert message={success} type="success" />}

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
                <small className="text-muted d-block mt-2">
                  We'll send a one-time password (OTP) to this email
                </small>
              </div>

              <button
                type="submit"
                className="btn btn-success w-100"
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>

              <div className="text-center mt-3">
                <p className="text-muted small mb-0">
                  Remember your password?{" "}
                  <a href="/login" className="text-success text-decoration-none fw-semibold">
                    Back to Login
                  </a>
                </p>
              </div>
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <div className="mb-3">
                <label htmlFor="otp" className="form-label fw-semibold">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  className="form-control text-center fs-5 font-monospace"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={loading}
                  maxLength="6"
                  required
                />
                <small className="text-muted d-block mt-2">
                  Check your email ({email}) for the 6-digit OTP
                </small>
              </div>

              <button
                type="submit"
                className="btn btn-success w-100"
                disabled={loading}
              >
                {loading ? "Verifying OTP..." : "Verify OTP"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary w-100 mt-2"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setSuccess("");
                  setError("");
                }}
                disabled={loading}
              >
                Use Different Email
              </button>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label fw-semibold">
                  New Password
                </label>
                <div className="input-group">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <small className="text-muted d-block mt-2">
                  Minimum 6 characters
                </small>
              </div>

              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label fw-semibold">
                  Confirm Password
                </label>
                <div className="input-group">
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-success w-100"
                disabled={loading}
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>

              <div className="text-center mt-3">
                <p className="text-muted small mb-0">
                  <a href="/login" className="text-success text-decoration-none fw-semibold">
                    Back to Login
                  </a>
                </p>
              </div>
            </form>
          )}

          {/* Progress Indicator */}
          <div className="mt-4 pt-3 border-top">
            <div className="d-flex justify-content-between text-muted small">
              <span className={`badge ${step >= 1 ? "bg-success" : "bg-light text-muted"}`}>
                1. Email
              </span>
              <span className={`badge ${step >= 2 ? "bg-success" : "bg-light text-muted"}`}>
                2. OTP
              </span>
              <span className={`badge ${step >= 3 ? "bg-success" : "bg-light text-muted"}`}>
                3. Reset
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
