import api from "./api";


//Citizen/Officer login (/api/auth/login?username=&password=)
export const loginUser = async (username, password) => {
    const res = await api.post("/api/auth/login", null,
        { params: { username, password } })
    return res.data;
};

//Admin login (/api/admin/auth/login?username=&password=)

export const loginAdmin = async (username, password) => {
    const res = await api.post("/api/admin/auth/login", null, { params: { username, password } })
    return res.data;
}

// Citizen/Business registration
export const registerUser = async (payload) => {
    const res = await api.post("/api/auth/register", payload);
    return res.data;
}

// Officer registration (requires admin approval)
export const registerOfficer = async (payload) => {
    const res = await api.post("/api/auth/register", {
        ...payload,
        primaryRole: "OFFICER"
    });
    return res.data;
};

// Forgot Password - Send OTP
export const sendForgotPasswordOtp = async (email) => {
    const res = await api.post("/api/auth/forgot-password/send-otp", null, {
        params: { email }
    });
    return res.data;
};

// Forgot Password - Verify OTP
export const verifyForgotPasswordOtp = async (email, otp) => {
    const res = await api.post("/api/auth/forgot-password/verify-otp", null, {
        params: { email, otp }
    });
    return res.data;
};

// Forgot Password - Reset Password
export const resetPassword = async (email, newPassword) => {
    const res = await api.post("/api/auth/forgot-password/reset", null, {
        params: { email, newPassword }
    });
    return res.data;
};