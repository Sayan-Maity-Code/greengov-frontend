import api from "./api";

// Compliance lookup
export const getComplianceLookup = async () => {
  const res = await api.get("/api/compliance/lookup");
  return res.data;
};

// Create audit
export const createAudit = async (payload, auditorUserId) => {
  const res = await api.post("/api/audits", payload, {
    params: { auditorUserId },
  });
  return res.data;
};

// Get audits by status
export const getAuditsByStatus = async (status) => {
  const res = await api.get("/api/audits", { params: { status } });
  return res.data;
};

// Get audits by compliance (still valid)
export const getAuditsByComplianceId = async (complianceId) => {
  const res = await api.get(`/api/audits/by-compliance/${complianceId}`);
  return res.data;
};

// Close audit
export const closeAudit = async (auditId, status, auditorUserId) => {
  const res = await api.post(
    `/api/audits/${auditId}/close`,
    {},
    { params: { status, auditorUserId } }
  );
  return res.data;
};