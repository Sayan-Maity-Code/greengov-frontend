import api from "./api";

// Create a new program
export const createProgram = async (payload) => {
  const res = await api.post("/api/programs/create", payload);
  return res.data;
};

// Fetch all programs
export const fetchAllPrograms = async () => {
  const res = await api.get("/api/programs/fetchAll");
  return res.data;
};

// Get program by ID
export const getProgramById = async (programId) => {
  const res = await api.get(`/api/programs/fetchById/${programId}`);
  return res.data;
};

// Update program (full update)
export const updateProgram = async (programId, payload) => {
  const res = await api.put(`/api/programs/updateProgramByID/${programId}`, payload);
  return res.data;
};

// Update program status
export const updateProgramStatus = async (programId, status) => {
  const res = await api.patch(
    `/api/programs/updateProgramStatus/${programId}/status`,
    null,
    { params: { status } }
  );
  return res.data;
};

// Delete program
export const deleteProgram = async (programId) => {
  const res = await api.delete(`/api/programs/deleteProgramById/${programId}`);
  return res.data;
};

// Deduct budget from program
export const deductBudget = async (programId, amount) => {
  const res = await api.put(`/api/programs/${programId}/deduct-budget`, {
    amount
  });
  return res.data;
};

// Check if program exists
export const programExists = async (programId) => {
  const res = await api.get(`/api/programs/${programId}/exists`);
  return res.data;
};

// Get program report metrics
export const getProgramReportMetrics = async () => {
  const res = await api.get("/api/programs/report-metrics");
  return res.data;
};

export const applyToProgram = async (applicationData) => {
  const res = await api.post("/api/applications/apply", applicationData);
  return res;
};
