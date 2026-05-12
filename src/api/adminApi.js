import api from "./api";

// Get all officers
export const getAllOfficers = async () => {
  const res = await api.get(`/api/admin/officers`);
  return res.data;
};

// Get officer by profile ID
export const getOfficerByProfileId = async (officerProfileId) => {
  const res = await api.get(`/api/admin/officers/${officerProfileId}`);
  return res.data;
};

// Approve officer by profile ID
export const approveOfficer = async (officerProfileId) => {
  const res = await api.post(`/api/admin/officers/${officerProfileId}/approve`);
  return res.data;
};

// Reject officer by profile ID
export const rejectOfficer = async (officerProfileId) => {
  const res = await api.post(`/api/admin/officers/${officerProfileId}/reject`);
  return res.data;
};

// Get pending officers
export const getPendingOfficers = async () => {
  const res = await api.get(`/api/admin/officers/status/pending`);
  return res.data;
};
