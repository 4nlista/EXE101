import axiosClient from '../utils/axiosClient';

/**
 * Gọi API Lấy danh sách dự án (Feed)
 * @param {Object} params - Các tham số query (page, limit, departmentId, status, search...)
 */
export const getProjects = async (params = {}) => {
  return await axiosClient.get('/projects', { params });
};
