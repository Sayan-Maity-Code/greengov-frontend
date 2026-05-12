import api from "./api";


export const getUserNotifications = async (userId) => {
  const res = await api.get(`/api/notifications/user/${userId}`);
  return res.data;
};

export const markNotificationRead = async (id) => {
  const res = await api.patch(`/api/notifications/${id}/read`);
  return res.data;
};


export const markAllRead = async (userId) => {
  await api.patch(`/api/notifications/user/${userId}/mark-all-read`);
};


export const deleteNotification = async (id) => {
  await api.delete(`/api/notifications/${id}`);
};