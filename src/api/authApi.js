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