import axiosClient from '../utils/axiosClient';

/**
 * Gọi API Lấy danh sách dự án (Feed)
 * @param {Object} params - Các tham số query (page, limit, departmentId, status, search...)
 */
export const getProjects = async (params = {}) => {
  return await axiosClient.get('/projects', { params });
};

/**
 * Gọi API Tạo dự án mới
 * @param {Object} data - Payload của dự án mới
 */
export const createProject = async (data) => {
  return await axiosClient.post('/projects', data);
};

export const checkProjectLimit = async () => {
  return await axiosClient.get('/projects/check-limit');
};

export const getMyProjects = async (params = {}) => {
  return await axiosClient.get('/projects/my-projects', { params });
};

export const getMyProjectStats = async () => {
  return await axiosClient.get('/projects/my-projects/stats');
};

export const getProjectDetail = async (projectId) => {
  return await axiosClient.get(`/projects/${projectId}`);
};

export const updateProject = async (projectId, data) => {
  return await axiosClient.patch(`/projects/${projectId}`, data);
};

export const deleteProject = async (projectId) => {
  return await axiosClient.delete(`/projects/${projectId}`);
};

export const getProjectApplicants = async (projectId, params = {}) => {
  return await axiosClient.get(`/projects/${projectId}/applicants`, { params });
};

export const approveApplicant = async (projectId, applicationId) => {
  return await axiosClient.patch(`/projects/${projectId}/applicants/${applicationId}/approve`);
};

export const rejectApplicant = async (projectId, applicationId) => {
  return await axiosClient.patch(`/projects/${projectId}/applicants/${applicationId}/reject`);
};

export const inviteApplicant = async (projectId, applicationId) => {
  return await axiosClient.post(`/projects/${projectId}/applicants/${applicationId}/invite`);
};

export const kickMember = async (projectId, userId) => {
  return await axiosClient.delete(`/projects/${projectId}/members/${userId}`);
};
