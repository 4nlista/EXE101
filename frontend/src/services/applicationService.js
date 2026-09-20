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
