import api from "./api";

// Create a new project
export const createProject = async (payload) => {
  const res = await api.post("/api/projects/create", payload);
  return res.data;
};

// Fetch all projects
export const fetchAllProjects = async () => {
  const res = await api.get("/api/projects/fetchAll");
  return res.data;
};

// Get project by ID
export const getProjectById = async (projectId) => {
  const res = await api.get(`/api/projects/${projectId}`);
  return res.data;
};

// Update project status (APPROVED / REJECTED)
export const updateProjectStatus = async (projectId, status) => {
  const res = await api.patch(
    `/api/projects/updateByStatus/${projectId}/status`,
    null,
    { params: { status } }
  );
  return res.data;
};

// Delete project by ID
export const deleteProject = async (projectId) => {
  const res = await api.delete(`/api/projects/deleteById/${projectId}`);
  return res.data;
};
