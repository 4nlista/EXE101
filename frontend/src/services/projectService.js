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
