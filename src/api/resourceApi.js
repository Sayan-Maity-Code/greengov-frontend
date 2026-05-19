import api from "./api";

// ── Resources ──────────────────────────────────────────────

// Allocate (create) a resource
export const allocateResource = async (payload) => {
  const res = await api.post("/api/resources/allocate", payload);
  return res.data;
};

// Update a resource by ID
export const updateResource = async (resourceId, payload) => {
  const res = await api.put(`/api/resources/${resourceId}`, payload);
  return res.data;
};

// Get a resource by ID
export const getResourceById = async (resourceId) => {
  const res = await api.get(`/api/resources/${resourceId}`);
  return res.data;
};

// Delete a resource by ID
export const deleteResource = async (resourceId) => {
  const res = await api.delete(`/api/resources/${resourceId}`);
  return res.data;
};

// Update resource status
export const updateResourceStatus = async (resourceId, status) => {
  const res = await api.patch(`/api/resources/${resourceId}/status?status=${status}`);
  return res.data;
};

export const getAllResources = async () => {
  const res = await api.get("/api/resources/get-all");
  return res.data;
}

// ── Infrastructure ──────────────────────────────────────────

// Create infrastructure
export const createInfrastructure = async (payload) => {
  const res = await api.post("/api/infrastructure/create", payload);
  return res.data;
};

// Get all infrastructure
export const getAllInfrastructure = async () => {
  const res = await api.get("/api/infrastructure/get-all");
  return res.data;
};

// Get infrastructure by ID
export const getInfrastructureById = async (infraId) => {
  const res = await api.get(`/api/infrastructure/${infraId}`);
  return res.data;
};

// Delete infrastructure by ID
export const deleteInfrastructure = async (infraId) => {
  const res = await api.delete(`/api/infrastructure/${infraId}`);
  return res.data;
};


export const updateInfrastructure = async (infraId, payload) => {
  const res = await api.put(`/api/infrastructure/${infraId}`, payload);
  return res.data;
};


export const updateInfrastructureStatus = async (payload) => {
  const res = await api.patch("/api/infrastructure/status", payload);
  return res.data;
};
