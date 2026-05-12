import api from "./api";

// ===============================
// CREATE INCENTIVE (participant-based)
// ===============================
export const createIncentive = async (payload, officerUserId) => {
  const res = await api.post(
    "/api/incentives/create",
    payload,
    {
      headers: {
        "X-Officer-User-Id": officerUserId,
      },
    }
  );
  return res.data;
};

// ===============================
// FETCH INCENTIVES
// ===============================
export const fetchAllIncentives = async () => {
  const res = await api.get("/api/incentives/fetchAllIncentives");
  return res.data;
};

export const getIncentiveById = async (incentiveId) => {
  const res = await api.get(`/api/incentives/fetchById/${incentiveId}`);
  return res.data;
};

export const getIncentivesByBeneficiaryId = async (beneficiaryId) => {
  const res = await api.get(`/api/incentives/beneficiary/${beneficiaryId}`);
  return res.data;
};

// ===============================
// DELETE
// ===============================
export const deleteIncentive = async (incentiveId) => {
  const res = await api.delete(`/api/incentives/deleteById/${incentiveId}`);
  return res.data;
};

// ===============================
// PARTICIPANT LOOKUP (PROXIED VIA INCENTIVE SERVICE)
// ===============================
export const fetchParticipants = async () => {
  const res = await api.get("/api/incentives/participants/lookup");
  return res.data;
};