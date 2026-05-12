import api from "./api";

// Create compliance record
export const createCompliance = async (payload, officerUserId) => {
  const res = await api.post("/api/compliance", payload, {
    params: { officerUserId },
  });
  return res.data;
};

// Get compliance by subject (PROJECT,PROGRAM,INCENTIVE)
export const getComplianceBySubject = async (subjectType, subjectId) => {
  const res = await api.get("/api/compliance/subject", {
    params: { subjectType, subjectId },
  });
  return res.data;
};


// Subject lookups
export const getProjectSubjects = async () => {
  const res = await api.get("/api/compliance/subjects/projects");
  return res.data;
};

export const getProgramSubjects = async () => {
  const res = await api.get("/api/compliance/subjects/programs");
  return res.data;
};

export const getIncentiveSubjects = async () => {
  const res = await api.get("/api/compliance/subjects/incentives");
  return res.data;
};