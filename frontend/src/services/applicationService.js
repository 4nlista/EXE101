import axiosClient from '../utils/axiosClient';

/**
 * Gọi API Gửi hồ sơ ứng tuyển vào dự án
 * @param {string} projectId - ID dự án
 * @param {FormData} formData - Chứa file CV (cvFile) và note (ghi chú)
 */
export const applyProject = async (projectId, formData) => {
  return await axiosClient.post(`/projects/${projectId}/apply`, formData);
};

export const checkApplicationStatus = async (projectId) => {
  return await axiosClient.get(`/projects/${projectId}/application-status`);
};

export const getMyApplications = async (params = {}) => {
  return await axiosClient.get('/applications/my-applications', { params });
};

export const cancelApplication = async (applicationId) => {
  return await axiosClient.patch(`/applications/${applicationId}/cancel`);
};

export const acceptInvite = async (applicationId) => {
  return await axiosClient.patch(`/applications/${applicationId}/accept-invite`);
};

export const declineInvite = async (applicationId) => {
  return await axiosClient.patch(`/applications/${applicationId}/decline-invite`);
};
